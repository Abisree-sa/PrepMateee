import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { predictPlacementReadiness } from '../../services/ai/readinessPredictor.agent';

export async function getCoordinatorAnalytics(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalActiveStudents = await prisma.user.count({ where: { role: 'STUDENT', isActive: true } });
    const currentlyOnline = await prisma.user.count({ where: { role: 'STUDENT', isOnline: true } });

    // Students logged in today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const loggedInToday = await prisma.user.count({
      where: {
        role: 'STUDENT',
        lastLoginAt: { gte: startOfToday },
      },
    });

    const neverLoggedIn = await prisma.user.count({
      where: {
        role: 'STUDENT',
        lastLoginAt: null,
      },
    });

    const totalAssessments = await prisma.assessment.count();
    const totalResumes = await prisma.resume.count();
    const totalInterviews = await prisma.mockInterview.count({ where: { status: 'COMPLETED' } });

    // Aggregate Scores
    const resumes = await prisma.resume.findMany({ select: { atsScore: true } });
    const avgAtsScore = resumes.length > 0
      ? Math.round(resumes.reduce((acc, r) => acc + r.atsScore, 0) / resumes.length)
      : 0;

    const submissions = await prisma.assessmentSubmission.findMany({ select: { obtainedMarks: true } });
    const avgAssessmentScore = submissions.length > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.obtainedMarks, 0) / submissions.length)
      : 0;

    const evaluations = await prisma.interviewEvaluation.findMany({ select: { overallScore: true } });
    const avgInterviewScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((acc, e) => acc + e.overallScore, 0) / evaluations.length)
      : 0;

    // Department Breakdown
    const departments = await prisma.department.findMany({
      include: {
        users: { where: { role: 'STUDENT' } },
        assessments: true,
      },
    });

    const deptStats = departments.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      studentCount: d.users.length,
      onlineCount: d.users.filter(u => u.isOnline).length,
      assessmentCount: d.assessments.length,
    }));

    return res.json({
      totalStudents,
      totalActiveStudents,
      currentlyOnline,
      loggedInToday,
      neverLoggedIn,
      totalAssessments,
      totalResumes,
      totalInterviews,
      avgAtsScore,
      avgAssessmentScore,
      avgInterviewScore,
      deptStats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getStudentListForCoordinator(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const { departmentId, search, filterStatus } = req.query;

    const whereClause: any = { role: 'STUDENT' };
    if (departmentId && typeof departmentId === 'string' && departmentId !== 'ALL') {
      whereClause.departmentId = departmentId;
    }

    if (filterStatus === 'ONLINE') {
      whereClause.isOnline = true;
    } else if (filterStatus === 'TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereClause.lastLoginAt = { gte: today };
    } else if (filterStatus === 'NEVER') {
      whereClause.lastLoginAt = null;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { registerNumber: { contains: search } },
      ];
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        department: true,
        resume: true,
        assessmentSubmissions: { include: { assessment: true } },
        mockInterviews: { include: { evaluation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = students.map(student => {
      const resumeScore = student.resume?.atsScore || 0;
      const subScores = student.assessmentSubmissions.map(s => s.obtainedMarks);
      const avgAssessment = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
      
      const interviewScores = student.mockInterviews
        .map(i => i.evaluation?.overallScore)
        .filter((score): score is number => score !== undefined && score !== null);
      
      const avgInterview = interviewScores.length > 0 ? interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length : 0;

      // Predict readiness
      const readiness = predictPlacementReadiness({
        resumeScore,
        avgAssessmentScore: avgAssessment,
        mockInterviewScore: avgInterview,
        codingPracticeScore: 75,
      });

      return {
        id: student.id,
        fullName: student.fullName,
        registerNumber: student.registerNumber || `REG2024${student.department?.code || 'IT'}001`,
        email: student.email,
        admissionYear: student.admissionYear,
        department: student.department?.name || 'N/A',
        deptCode: student.department?.code || 'N/A',
        isOnline: student.isOnline,
        lastLoginAt: student.lastLoginAt,
        createdAt: student.createdAt,
        resumeScore,
        hasResume: !!student.resume,
        resumeStatus: student.resume ? 'Uploaded & Analyzed' : 'Pending Upload',
        assessmentProgress: `${student.assessmentSubmissions.length} Tests Submitted (Avg ${Math.round(avgAssessment)}%)`,
        interviewProgress: `${student.mockInterviews.length} Interviews Attended`,
        avgAssessmentScore: Math.round(avgAssessment),
        avgInterviewScore: Math.round(avgInterview),
        readinessPercentage: readiness.readinessPercentage,
        tierCategory: readiness.tierCategory,
      };
    });

    return res.json({ students: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getLiveAssessmentMonitoring(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const { assessmentId } = req.params;

    const submissions = await prisma.assessmentSubmission.findMany({
      where: assessmentId && assessmentId !== 'ALL' ? { assessmentId } : {},
      include: {
        student: { include: { department: true } },
        assessment: true,
        proctoringLogs: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { startedAt: 'desc' },
    });

    const liveCandidates = submissions.map(sub => {
      const elapsedMins = Math.floor((new Date().getTime() - new Date(sub.startedAt).getTime()) / (1000 * 60));
      const remainingMins = Math.max(0, sub.assessment.durationMinutes - elapsedMins);

      return {
        submissionId: sub.id,
        studentName: sub.student.fullName,
        registerNumber: sub.student.registerNumber,
        department: sub.student.department?.name || 'IT',
        assessmentName: sub.assessment.title,
        assessmentStartTime: sub.startedAt,
        isSubmitted: !!sub.submittedAt,
        cameraStatus: sub.cameraStatus,
        micStatus: sub.micStatus,
        fullscreenStatus: sub.fullscreenStatus,
        networkStatus: sub.networkStatus,
        progressPercentage: sub.progressPercentage || (sub.submittedAt ? 100 : 45),
        remainingMinutes: sub.submittedAt ? 0 : remainingMins,
        malpracticeScore: sub.malpracticeScore,
        recentViolation: sub.proctoringLogs[0]
          ? {
              event: sub.proctoringLogs[0].event,
              description: sub.proctoringLogs[0].description,
              confidenceScore: sub.proctoringLogs[0].confidenceScore,
              aiExplanation: sub.proctoringLogs[0].aiExplanation,
              timestamp: sub.proctoringLogs[0].timestamp,
            }
          : null,
      };
    });

    return res.json({ candidates: liveCandidates });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProctoringAudits(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    const submissions = await prisma.assessmentSubmission.findMany({
      where: { malpracticeScore: { gt: 0 } },
      include: {
        student: { include: { department: true } },
        assessment: true,
        proctoringLogs: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { malpracticeScore: 'desc' },
    });

    const audits = submissions.map(s => ({
      submissionId: s.id,
      studentName: s.student.fullName,
      registerNumber: s.student.registerNumber,
      studentEmail: s.student.email,
      department: s.student.department?.name,
      assessmentTitle: s.assessment.title,
      obtainedMarks: s.obtainedMarks,
      totalMarks: s.assessment.totalMarks,
      malpracticeScore: s.malpracticeScore,
      submittedAt: s.submittedAt,
      logEvents: s.proctoringLogs.map(l => ({
        event: l.event,
        description: l.description,
        severity: l.severity,
        confidenceScore: l.confidenceScore,
        aiExplanation: l.aiExplanation || `AI flagged ${l.event} violation with high pattern certainty.`,
        snapshotUrl: l.snapshotUrl,
        timestamp: l.timestamp,
      })),
    }));

    return res.json({ audits });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllDepartments(req: Request, res: Response) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { code: 'asc' },
    });
    return res.json({ departments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
