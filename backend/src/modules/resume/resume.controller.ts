import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { extractTextFromPdf } from '../../utils/pdfExtractor';
import { analyzeResume } from '../../services/ai/resumeAnalyzer.agent';
import { analyzeSkillGapForCompany } from '../../services/ai/skillGap.agent';

export async function uploadAndAnalyzeResume(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can upload resumes' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid PDF resume file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const rawText = await extractTextFromPdf(req.file.path);

    const analysis = await analyzeResume(rawText);

    const resume = await prisma.resume.upsert({
      where: { userId: req.user.id },
      update: {
        fileUrl,
        fileName: req.file.originalname,
        parsedData: JSON.stringify(analysis.parsedData),
        atsScore: analysis.atsScore,
        qualityReport: JSON.stringify(analysis.qualityReport),
        skillGaps: JSON.stringify([]),
      },
      create: {
        userId: req.user.id,
        fileUrl,
        fileName: req.file.originalname,
        parsedData: JSON.stringify(analysis.parsedData),
        atsScore: analysis.atsScore,
        qualityReport: JSON.stringify(analysis.qualityReport),
        skillGaps: JSON.stringify([]),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'RESUME_UPLOAD',
        details: `Uploaded resume '${req.file.originalname}' with ATS score ${analysis.atsScore}/100`,
      },
    });

    return res.json({
      message: 'Resume uploaded and analyzed dynamically',
      resumeId: resume.id,
      atsScore: analysis.atsScore,
      parsedData: analysis.parsedData,
      qualityReport: analysis.qualityReport,
    });
  } catch (error: any) {
    console.error('Resume Upload Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getStudentResume(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const resume = await prisma.resume.findUnique({
      where: { userId: req.user.id },
    });

    if (!resume) return res.json({ resume: null });

    return res.json({
      resume: {
        id: resume.id,
        fileUrl: resume.fileUrl,
        fileName: resume.fileName,
        atsScore: resume.atsScore,
        parsedData: JSON.parse(resume.parsedData),
        qualityReport: JSON.parse(resume.qualityReport),
        skillGaps: JSON.parse(resume.skillGaps || '[]'),
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSkillGapForCompany(req: Request, res: Response) {
  try {
    const { companyName } = req.body;
    if (!companyName) return res.status(400).json({ error: 'companyName is required' });

    const resume = await prisma.resume.findUnique({
      where: { userId: req.user?.id },
    });

    const parsedData = resume ? JSON.parse(resume.parsedData) : { skills: ['DSA', 'Java', 'React'], projects: [] };

    const gapResult = await analyzeSkillGapForCompany(
      parsedData.skills || [],
      parsedData.projects || [],
      companyName
    );

    return res.json(gapResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
