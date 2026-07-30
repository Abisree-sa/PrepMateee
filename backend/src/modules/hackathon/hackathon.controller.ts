import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

export async function createHackathon(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only coordinators can publish hackathons' });
    }

    const {
      title,
      description,
      organizingCompany,
      registrationLink,
      registrationDeadline,
      eventDate,
      eligibility,
      prizeInfo,
      bannerUrl,
      targetDepartments, // array of department codes or IDs
    } = req.body;

    if (!title || !registrationLink || !organizingCompany) {
      return res.status(400).json({ error: 'Title, organizing company, and registration link are required' });
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        title,
        description: description || '',
        organizingCompany,
        registrationLink,
        registrationDeadline: registrationDeadline || 'TBA',
        eventDate: eventDate || 'TBA',
        eligibility: eligibility || 'All B.E / B.Tech Students',
        prizeInfo: prizeInfo || null,
        bannerUrl: bannerUrl || null,
        targetDepartments: targetDepartments ? JSON.stringify(targetDepartments) : null,
        createdById: req.user.id,
      },
    });

    // Notify all active students
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
    for (const s of students) {
      await prisma.notification.create({
        data: {
          userId: s.id,
          title: `🏆 New Hackathon Announced: ${hackathon.title}`,
          message: `${organizingCompany} is hosting a national hackathon! Registration Deadline: ${hackathon.registrationDeadline}. Click to apply.`,
          type: 'HACKATHON',
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'HACKATHON_PUBLISHED',
        details: `Published Hackathon '${hackathon.title}' organized by ${organizingCompany}`,
      },
    });

    return res.status(201).json({
      message: 'Hackathon opportunity published and student notifications sent!',
      hackathon,
    });
  } catch (error: any) {
    console.error('Create Hackathon Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getHackathons(req: Request, res: Response) {
  try {
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = hackathons.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      organizingCompany: h.organizingCompany,
      registrationLink: h.registrationLink,
      registrationDeadline: h.registrationDeadline,
      eventDate: h.eventDate,
      eligibility: h.eligibility,
      prizeInfo: h.prizeInfo,
      bannerUrl: h.bannerUrl,
      createdAt: h.createdAt,
    }));

    return res.json({ hackathons: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getHackathonById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const hackathon = await prisma.hackathon.findUnique({ where: { id } });
    if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });

    return res.json({ hackathon });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
