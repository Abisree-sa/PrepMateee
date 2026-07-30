import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import path from 'path';

export async function uploadMaterial(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only coordinators can upload placement materials' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Material file is required' });
    }

    const { title, description, category, topic } = req.body;

    if (!title || !category || !topic) {
      return res.status(400).json({ error: 'Title, category, and topic are required' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : ext === 'doc' || ext === 'docx' ? 'docx' : ext === 'ppt' || ext === 'pptx' ? 'ppt' : 'txt';

    const material = await prisma.placementMaterial.create({
      data: {
        title,
        description: description || '',
        category,
        topic,
        fileType,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        uploadedById: req.user.id,
      },
      include: {
        uploadedBy: {
          select: { fullName: true, email: true },
        },
      },
    });

    // Send notifications to all students
    const allStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    for (const student of allStudents) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          title: `New Learning Resource: ${material.title}`,
          message: `Coordinator ${req.user.fullName} published a new ${material.category} resource on topic '${material.topic}'.`,
          type: 'MATERIAL',
        },
      });
    }

    return res.status(201).json({
      message: 'Placement material published successfully',
      material,
    });
  } catch (error: any) {
    console.error('Upload Material Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload material' });
  }
}

export async function getMaterials(req: Request, res: Response) {
  try {
    const { category, search } = req.query;

    const whereClause: any = {};
    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search } },
        { topic: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const materials = await prisma.placementMaterial.findMany({
      where: whereClause,
      include: {
        uploadedBy: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ materials });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMaterialById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const material = await prisma.placementMaterial.findUnique({
      where: { id },
      include: { uploadedBy: { select: { fullName: true, email: true } } },
    });

    if (!material) return res.status(404).json({ error: 'Material not found' });
    return res.json({ material });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
