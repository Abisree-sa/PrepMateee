import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

export async function createAnnouncement(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const {
      title,
      category,
      description,
      summary,
      priorityLevel,
      targetDepartments,
      targetBatches,
      publishDate,
      expiryDate,
      status,
      documentName,
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Title, category, and description are required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let coverImageUrl: string | null = null;
    let videoUrl: string | null = null;
    let documentUrl: string | null = null;
    const galleryImageUrls: string[] = [];

    if (files) {
      if (files['coverImage'] && files['coverImage'][0]) {
        coverImageUrl = `/uploads/${files['coverImage'][0].filename}`;
      }
      if (files['video'] && files['video'][0]) {
        videoUrl = `/uploads/${files['video'][0].filename}`;
      }
      if (files['document'] && files['document'][0]) {
        documentUrl = `/uploads/${files['document'][0].filename}`;
      }
      if (files['images'] && files['images'].length > 0) {
        files['images'].forEach((f) => {
          galleryImageUrls.push(`/uploads/${f.filename}`);
        });
      }
    }

    const announcementStatus = status || 'PUBLISHED';
    const deptsJson = typeof targetDepartments === 'string' ? targetDepartments : JSON.stringify(targetDepartments || ['ALL']);
    const batchesJson = typeof targetBatches === 'string' ? targetBatches : JSON.stringify(targetBatches || ['ALL']);

    const announcement = await prisma.announcement.create({
      data: {
        title,
        category: category || 'GENERAL_NOTICE',
        description,
        summary: summary || description.slice(0, 160),
        coverImageUrl: coverImageUrl || req.body.coverImageUrl || null,
        imageUrls: galleryImageUrls.length > 0 ? JSON.stringify(galleryImageUrls) : (req.body.imageUrls || null),
        videoUrl: videoUrl || req.body.videoUrl || null,
        documentUrl: documentUrl || req.body.documentUrl || null,
        documentName: documentName || (files && files['document'] ? files['document'][0].originalname : null),
        publishDate: publishDate || new Date().toISOString(),
        expiryDate: expiryDate || null,
        priorityLevel: priorityLevel || 'NORMAL',
        targetDepartments: deptsJson,
        targetBatches: batchesJson,
        status: announcementStatus,
        createdById: req.user.id,
      },
    });

    // If published, automatically push dynamic real Notifications to eligible active students
    if (announcementStatus === 'PUBLISHED') {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT', isActive: true },
        select: { id: true },
      });

      const notifData = students.map((s) => ({
        userId: s.id,
        title: `📢 Announcement: ${announcement.title}`,
        message: announcement.summary || announcement.description.slice(0, 150),
        type: 'ANNOUNCEMENT',
      }));

      if (notifData.length > 0) {
        await prisma.notification.createMany({ data: notifData });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ANNOUNCEMENT_CREATED',
        details: `Published Announcement: "${announcement.title}" (${announcement.category})`,
      },
    });

    return res.status(201).json({
      message: 'Announcement published successfully',
      announcement,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAnnouncementsForStudent(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const announcements = await prisma.announcement.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ announcements });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAnnouncementById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    return res.json({ announcement });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAnnouncementsForCoordinator(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ announcements });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateAnnouncement(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const { id } = req.params;
    const {
      title,
      category,
      description,
      summary,
      priorityLevel,
      targetDepartments,
      targetBatches,
      publishDate,
      expiryDate,
      status,
      documentName,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Announcement not found' });

    let coverImageUrl = existing.coverImageUrl;
    let videoUrl = existing.videoUrl;
    let documentUrl = existing.documentUrl;
    let galleryImageUrls = existing.imageUrls ? JSON.parse(existing.imageUrls) : [];

    if (files) {
      if (files['coverImage'] && files['coverImage'][0]) {
        coverImageUrl = `/uploads/${files['coverImage'][0].filename}`;
      }
      if (files['video'] && files['video'][0]) {
        videoUrl = `/uploads/${files['video'][0].filename}`;
      }
      if (files['document'] && files['document'][0]) {
        documentUrl = `/uploads/${files['document'][0].filename}`;
      }
      if (files['images'] && files['images'].length > 0) {
        galleryImageUrls = files['images'].map((f) => `/uploads/${f.filename}`);
      }
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: title || existing.title,
        category: category || existing.category,
        description: description || existing.description,
        summary: summary || existing.summary,
        coverImageUrl,
        imageUrls: JSON.stringify(galleryImageUrls),
        videoUrl,
        documentUrl,
        documentName: documentName || (files && files['document'] ? files['document'][0].originalname : existing.documentName),
        publishDate: publishDate || existing.publishDate,
        expiryDate: expiryDate !== undefined ? expiryDate : existing.expiryDate,
        priorityLevel: priorityLevel || existing.priorityLevel,
        targetDepartments: targetDepartments ? (typeof targetDepartments === 'string' ? targetDepartments : JSON.stringify(targetDepartments)) : existing.targetDepartments,
        targetBatches: targetBatches ? (typeof targetBatches === 'string' ? targetBatches : JSON.stringify(targetBatches)) : existing.targetBatches,
        status: status || existing.status,
      },
    });

    return res.json({ message: 'Announcement updated successfully', announcement: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const { id } = req.params;
    await prisma.announcement.delete({ where: { id } });

    return res.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function unpublishAnnouncement(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const { id } = req.params;
    const updated = await prisma.announcement.update({
      where: { id },
      data: { status: 'UNPUBLISHED' },
    });

    return res.json({ message: 'Announcement unpublished successfully', announcement: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
