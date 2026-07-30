import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { predictPlacementReadiness } from '../../services/ai/readinessPredictor.agent';
import { generatePersonalizedRoadmap } from '../../services/ai/learningRoadmap.agent';
import { recommendCareers } from '../../services/ai/careerRecommender.agent';
import { askCompanyPrepAgentConversational } from '../../services/ai/companyPrep.agent';

export async function getStudentDashboard(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Student access required' });
    }

    const userId = req.user.id;

    const [user, resume, submissions, mockInterviews, materialsCount, activityLogs, hackathons, placementDrives, notifications, dbAnnouncements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { department: true },
      }),
      prisma.resume.findUnique({ where: { userId } }),
      prisma.assessmentSubmission.findMany({
        where: { studentId: userId, isEvaluated: true },
      }),
      prisma.mockInterview.findMany({
        where: { studentId: userId, status: 'COMPLETED' },
        include: { evaluation: true },
      }),
      prisma.placementMaterial.count(),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
      prisma.hackathon.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.placementOpportunity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.announcement.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    if (!user) return res.status(404).json({ error: 'Student not found' });

    const resumeScore = resume ? resume.atsScore : null;

    const assessmentScores = submissions.map(s => s.obtainedMarks);
    const avgAssessmentScore = assessmentScores.length > 0
      ? assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length
      : null;

    const interviewScores = mockInterviews
      .map(m => m.evaluation?.overallScore)
      .filter((s): s is number => s !== undefined && s !== null);

    const mockInterviewScore = interviewScores.length > 0
      ? interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length
      : null;

    const codingProfileData = user.codingProfileData ? JSON.parse(user.codingProfileData) : null;

    const readiness = predictPlacementReadiness({
      resumeScore,
      avgAssessmentScore,
      mockInterviewScore,
      codingPracticeScore: codingProfileData?.leetcode?.totalSolved ? Math.min(100, Math.round(codingProfileData.leetcode.totalSolved / 2)) : (submissions.length > 0 ? 75 : null),
    });

    const parsedData = resume ? JSON.parse(resume.parsedData) : null;
    const parsedSkills = parsedData?.skills || [];

    const roadmap = generatePersonalizedRoadmap(
      user.department?.name || 'Information Technology',
      parsedSkills,
      avgAssessmentScore ? Math.round(avgAssessmentScore) : 0
    );

    const careerTracks = recommendCareers(
      user.department?.name || 'IT',
      parsedSkills
    );

    // Build Unified Dynamic Campus Announcements Array from database models exclusively
    const announcements = [
      ...dbAnnouncements.map(a => ({
        id: a.id,
        title: a.title,
        message: a.summary || a.description.slice(0, 160),
        description: a.description,
        category: a.category,
        priority: a.priorityLevel,
        coverImageUrl: a.coverImageUrl,
        videoUrl: a.videoUrl,
        documentUrl: a.documentUrl,
        documentName: a.documentName,
        link: `/student/announcements/${a.id}`,
        createdAt: a.createdAt.toISOString(),
      })),
      ...placementDrives.map(p => ({
        id: `ann_placement_${p.id}`,
        title: `📢 Placement Drive: ${p.companyName} (${p.jobTitle})`,
        message: `Package: ${p.salaryStipend || 'Competitive'} | Location: ${p.jobLocation}. Apply before ${p.registrationDeadline}.`,
        description: p.jobDescription,
        category: 'PLACEMENT_DRIVE',
        priority: 'HIGH',
        coverImageUrl: p.companyLogoUrl,
        link: '/student/placements',
        createdAt: p.createdAt.toISOString(),
      })),
      ...hackathons.map(h => ({
        id: `ann_hackathon_${h.id}`,
        title: `🏆 Hackathon Alert: ${h.title}`,
        message: `Organized by ${h.organizingCompany}. Prize Pool: ${h.prizeInfo || 'Exciting Rewards'}. Deadline: ${h.registrationDeadline}.`,
        description: h.description,
        category: 'HACKATHON',
        priority: 'MEDIUM',
        coverImageUrl: h.bannerUrl,
        link: '/student/hackathons',
        createdAt: h.createdAt.toISOString(),
      })),
    ];

    return res.json({
      studentInfo: {
        fullName: user.fullName,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department?.name || 'N/A',
        deptCode: user.department?.code || 'N/A',
        admissionYear: user.admissionYear,
        isOnline: user.isOnline,
        lastLoginAt: user.lastLoginAt,
        githubUsername: user.githubUsername,
        leetcodeUsername: user.leetcodeUsername,
      },
      codingProfileData,
      readiness,
      metrics: {
        hasResume: !!resume,
        resumeAtsScore: resumeScore,
        completedAssessments: submissions.length,
        avgAssessmentScore: avgAssessmentScore !== null ? Math.round(avgAssessmentScore) : null,
        completedInterviews: mockInterviews.length,
        avgInterviewScore: mockInterviewScore !== null ? Math.round(mockInterviewScore) : null,
        totalMaterialsAvailable: materialsCount,
      },
      recentActivity: activityLogs,
      hackathons,
      announcements,
      notifications,
      roadmap,
      careerTracks,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getNotifications(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.json({ notifications });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function askCompanyPrep(req: Request, res: Response) {
  try {
    const { query, history, company } = req.body;
    if (!query) return res.status(400).json({ error: 'Query prompt is required' });

    const result = await askCompanyPrepAgentConversational(query, history || [], company);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
