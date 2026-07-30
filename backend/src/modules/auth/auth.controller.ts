import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { parseStudentEmail } from '../../utils/emailParser';

export async function registerStudent(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const parsedInfo = parseStudentEmail(email);
    if (!parsedInfo || !parsedInfo.isValidDomain) {
      return res.status(400).json({
        error: `Invalid email domain. Only official college email addresses ending with @${ENV.COLLEGE_DOMAIN} (e.g. abisree.tm2024it@sece.ac.in) are allowed.`,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: parsedInfo.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this official college email already exists. Please log in.' });
    }

    // Find or create Department
    let department = await prisma.department.findUnique({ where: { code: parsedInfo.deptCode } });
    if (!department) {
      department = await prisma.department.create({
        data: {
          code: parsedInfo.deptCode,
          name: parsedInfo.deptName,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const registerNumber = `REG${parsedInfo.admissionYear}${parsedInfo.deptCode}${Math.floor(100 + Math.random() * 900)}`;

    const user = await prisma.user.create({
      data: {
        email: parsedInfo.email,
        passwordHash,
        fullName: parsedInfo.fullName,
        registerNumber,
        role: 'STUDENT',
        admissionYear: parsedInfo.admissionYear,
        departmentId: department.id,
        isOnline: true,
        lastLoginAt: new Date(),
      },
      include: {
        department: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
        admissionYear: user.admissionYear,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        registerNumber: user.registerNumber,
        role: user.role,
        admissionYear: user.admissionYear,
        department: user.department,
      },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { department: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({ error: `Access denied. This account is registered as a ${user.role}.` });
    }

    // Update login status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastLoginAt: new Date(),
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
        admissionYear: user.admissionYear,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        registerNumber: user.registerNumber,
        role: user.role,
        admissionYear: user.admissionYear,
        department: user.department,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { isOnline: false },
      });
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: true,
        resume: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        registerNumber: user.registerNumber,
        role: user.role,
        admissionYear: user.admissionYear,
        department: user.department,
        resume: user.resume,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
