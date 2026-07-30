import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

export async function createPlacementOpportunity(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only placement coordinators can publish opportunities' });
    }

    const {
      companyName,
      companyLogoUrl,
      jobTitle,
      roleType,
      jobDescription,
      requiredSkills,
      eligibilityCriteria,
      eligibleDepartments,
      minCgpa,
      batchYear,
      applicationLink,
      registrationDeadline,
      interviewDate,
      selectionProcess,
      salaryStipend,
      jobLocation,
      additionalNotes,
    } = req.body;

    if (!companyName || !jobTitle || !applicationLink || !jobDescription) {
      return res.status(400).json({ error: 'Company Name, Job Title, Application Link, and Job Description are required' });
    }

    const opportunity = await prisma.placementOpportunity.create({
      data: {
        companyName,
        companyLogoUrl: companyLogoUrl || null,
        jobTitle,
        roleType: roleType || 'Full-Time',
        jobDescription,
        requiredSkills: Array.isArray(requiredSkills) ? JSON.stringify(requiredSkills) : (requiredSkills ? JSON.stringify([requiredSkills]) : '[]'),
        eligibilityCriteria: eligibilityCriteria || 'Minimum 60% in B.E / B.Tech',
        eligibleDepartments: Array.isArray(eligibleDepartments) ? JSON.stringify(eligibleDepartments) : '["ALL"]',
        minCgpa: minCgpa ? parseFloat(minCgpa) : 0.0,
        batchYear: batchYear ? parseInt(batchYear, 10) : 2026,
        applicationLink,
        registrationDeadline: registrationDeadline || 'TBA',
        interviewDate: interviewDate || null,
        selectionProcess: selectionProcess || 'Online Test -> Technical Interview -> HR Round',
        salaryStipend: salaryStipend || 'Competitive Package',
        jobLocation: jobLocation || 'Pan India / Hybrid',
        additionalNotes: additionalNotes || null,
        createdById: req.user.id,
      },
    });

    // Notify students
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
    for (const s of students) {
      await prisma.notification.create({
        data: {
          userId: s.id,
          title: `💼 New Placement Drive: ${companyName} (${jobTitle})`,
          message: `${companyName} is recruiting for ${jobTitle} (${roleType}). Registration Deadline: ${opportunity.registrationDeadline}. Click to view details and apply.`,
          type: 'PLACEMENT_OPPORTUNITY',
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'PLACEMENT_OPPORTUNITY_PUBLISHED',
        details: `Published Placement Notice: ${companyName} - ${jobTitle}`,
      },
    });

    return res.status(201).json({
      message: 'Placement opportunity published and notifications sent successfully!',
      opportunity,
    });
  } catch (error: any) {
    console.error('Create Placement Opportunity Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getPlacementOpportunities(req: Request, res: Response) {
  try {
    const { search, roleType, dept } = req.query;

    const opportunities = await prisma.placementOpportunity.findMany({
      orderBy: { createdAt: 'desc' },
    });

    let filtered = opportunities.map(o => ({
      ...o,
      requiredSkills: o.requiredSkills ? JSON.parse(o.requiredSkills) : [],
      eligibleDepartments: o.eligibleDepartments ? JSON.parse(o.eligibleDepartments) : ['ALL'],
    }));

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(o => o.companyName.toLowerCase().includes(q) || o.jobTitle.toLowerCase().includes(q));
    }

    if (roleType && roleType !== 'ALL') {
      filtered = filtered.filter(o => o.roleType === String(roleType));
    }

    return res.json({ opportunities: filtered });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function logPlacementApply(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const opp = await prisma.placementOpportunity.findUnique({ where: { id } });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'PLACEMENT_APPLIED',
        details: `Applied to ${opp.companyName} (${opp.jobTitle}) via external portal link`,
      },
    });

    return res.json({ message: 'Application logged to placement activity timeline' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deletePlacementOpportunity(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await prisma.placementOpportunity.delete({ where: { id } });
    return res.json({ message: 'Opportunity deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
