import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { generateNextInterviewTurn, Turn } from '../../services/ai/mockInterview.agent';
import { evaluateInterviewTranscript } from '../../services/ai/interviewEvaluator.agent';

export async function startMockInterview(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can attend mock interviews' });
    }

    const { targetRole, targetCompany } = req.body;
    const role = targetRole || 'Software Development Engineer (SDE-1)';
    const company = targetCompany || 'Amazon';

    // Check student resume summary
    const resume = await prisma.resume.findUnique({ where: { userId: req.user.id } });
    const studentSummary = resume ? `Skills: ${JSON.parse(resume.parsedData).skills?.join(', ')}` : 'Computer Science Student';

    const firstTurn = await generateNextInterviewTurn(role, company, [], studentSummary);

    const initialTranscript: Turn[] = [
      {
        speaker: 'INTERVIEWER',
        text: firstTurn.nextQuestion,
        roundType: firstTurn.roundType,
        timestamp: new Date().toISOString(),
      },
    ];

    const interview = await prisma.mockInterview.create({
      data: {
        studentId: req.user.id,
        targetRole: role,
        targetCompany: company,
        status: 'IN_PROGRESS',
        transcript: JSON.stringify(initialTranscript),
      },
    });

    return res.status(201).json({
      interviewId: interview.id,
      targetRole: role,
      targetCompany: company,
      nextQuestion: firstTurn.nextQuestion,
      roundType: firstTurn.roundType,
    });
  } catch (error: any) {
    console.error('Start Interview Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function processInterviewTurn(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { interviewId, studentResponse } = req.body;

    const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
    if (!interview) return res.status(404).json({ error: 'Interview session not found' });

    const history: Turn[] = JSON.parse(interview.transcript);

    // Append student response turn
    history.push({
      speaker: 'STUDENT',
      text: studentResponse,
      timestamp: new Date().toISOString(),
    });

    // Generate AI follow-up response
    const nextStep = await generateNextInterviewTurn(interview.targetRole, interview.targetCompany || 'Top Tech', history);

    history.push({
      speaker: 'INTERVIEWER',
      text: nextStep.nextQuestion,
      roundType: nextStep.roundType,
      timestamp: new Date().toISOString(),
    });

    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        transcript: JSON.stringify(history),
        status: nextStep.isInterviewComplete ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });

    return res.json({
      nextQuestion: nextStep.nextQuestion,
      roundType: nextStep.roundType,
      isInterviewComplete: nextStep.isInterviewComplete,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function evaluateInterview(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { interviewId } = req.body;
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: { evaluation: true },
    });

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const history: Turn[] = JSON.parse(interview.transcript);

    // AI Evaluation Agent
    const report = await evaluateInterviewTranscript(interview.targetRole, interview.targetCompany || 'Top Tech', history);

    const evaluation = interview.evaluation
      ? await prisma.interviewEvaluation.update({
          where: { interviewId },
          data: {
            overallScore: report.overallScore,
            communicationScore: report.communicationScore,
            technicalScore: report.technicalScore,
            confidenceScore: report.confidenceScore,
            problemSolvingScore: report.problemSolvingScore,
            feedbackJson: JSON.stringify({
              strengths: report.strengths,
              weaknesses: report.weaknesses,
              suggestedImprovements: report.suggestedImprovements,
              fluencyScore: report.fluencyScore,
            }),
            learningRoadmap: JSON.stringify(report.personalizedLearningPlan),
          },
        })
      : await prisma.interviewEvaluation.create({
          data: {
            interviewId,
            overallScore: report.overallScore,
            communicationScore: report.communicationScore,
            technicalScore: report.technicalScore,
            confidenceScore: report.confidenceScore,
            problemSolvingScore: report.problemSolvingScore,
            feedbackJson: JSON.stringify({
              strengths: report.strengths,
              weaknesses: report.weaknesses,
              suggestedImprovements: report.suggestedImprovements,
              fluencyScore: report.fluencyScore,
            }),
            learningRoadmap: JSON.stringify(report.personalizedLearningPlan),
          },
        });

    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: { status: 'COMPLETED' },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'INTERVIEW_COMPLETE',
        details: `Completed AI Mock Interview for ${interview.targetRole}. Overall Score: ${report.overallScore}/100`,
      },
    });

    return res.json({
      message: 'Interview evaluated successfully',
      evaluation: {
        id: evaluation.id,
        overallScore: evaluation.overallScore,
        communicationScore: evaluation.communicationScore,
        technicalScore: evaluation.technicalScore,
        confidenceScore: evaluation.confidenceScore,
        problemSolvingScore: evaluation.problemSolvingScore,
        feedback: JSON.parse(evaluation.feedbackJson),
        learningRoadmap: JSON.parse(evaluation.learningRoadmap),
      },
    });
  } catch (error: any) {
    console.error('Evaluate Interview Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getStudentInterviewHistory(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const interviews = await prisma.mockInterview.findMany({
      where: { studentId: req.user.id },
      include: { evaluation: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = interviews.map(i => ({
      id: i.id,
      targetRole: i.targetRole,
      targetCompany: i.targetCompany,
      status: i.status,
      createdAt: i.createdAt,
      overallScore: i.evaluation?.overallScore || null,
      evaluation: i.evaluation
        ? {
            communicationScore: i.evaluation.communicationScore,
            technicalScore: i.evaluation.technicalScore,
            confidenceScore: i.evaluation.confidenceScore,
            problemSolvingScore: i.evaluation.problemSolvingScore,
            feedback: JSON.parse(i.evaluation.feedbackJson),
            roadmap: JSON.parse(i.evaluation.learningRoadmap),
          }
        : null,
    }));

    return res.json({ interviews: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
