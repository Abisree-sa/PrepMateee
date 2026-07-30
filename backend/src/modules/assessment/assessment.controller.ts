import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { reviewStudentCode } from '../../services/ai/codingMentor.agent';
import { generateCodingQuestionAI, getHeuristicCodingQuestionPreset } from '../../services/ai/codingQuestionGenerator.agent';
import { evaluateStudentCode } from '../../services/ai/codingEvaluator.agent';

export async function createAssessment(req: Request, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'COORDINATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only coordinators can create assessments' });
    }

    const {
      title,
      description,
      totalMarks,
      durationMinutes,
      randomize,
      negativeMarking,
      departmentIds, // string array
      questions,     // array of Question objects
    } = req.body;

    if (!title || !departmentIds || !Array.isArray(departmentIds) || departmentIds.length === 0) {
      return res.status(400).json({ error: 'Title and at least one department are required' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        totalMarks: totalMarks || 100,
        durationMinutes: durationMinutes || 60,
        randomize: !!randomize,
        negativeMarking: negativeMarking ? parseFloat(negativeMarking) : 0.0,
        createdById: req.user.id,
        status: 'PUBLISHED',
        departments: {
          create: departmentIds.map((deptId: string) => ({
            departmentId: deptId,
          })),
        },
        questions: {
          create: (questions || []).map((q: any, idx: number) => ({
            type: q.type || 'CODING',
            title: q.title || q.questionText?.substring(0, 40) || 'Coding Challenge',
            difficulty: q.difficulty || 'Medium',
            topic: q.topic || 'Arrays',
            questionText: q.questionText,
            constraints: q.constraints || '1 <= N <= 10^5',
            inputFormat: q.inputFormat || 'Standard Input Format',
            outputFormat: q.outputFormat || 'Standard Output Format',
            sampleInput: q.sampleInput || '',
            sampleOutput: q.sampleOutput || '',
            starterTemplates: q.starterTemplates ? JSON.stringify(q.starterTemplates) : null,
            testCases: q.testCases ? JSON.stringify(q.testCases) : null,
            timeLimitMs: q.timeLimitMs || 2000,
            memoryLimitMb: q.memoryLimitMb || 256,
            codeTemplate: q.codeTemplate || null,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null,
            explanation: q.explanation || null,
            marks: q.marks || 10,
            orderIndex: idx,
          })),
        },
      },
      include: {
        departments: { include: { department: true } },
        questions: true,
      },
    });

    // Create notifications for all students in target departments
    const studentsInDepts = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        departmentId: { in: departmentIds },
      },
    });

    for (const student of studentsInDepts) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          title: `New Coding Assessment: ${assessment.title}`,
          message: `A new LeetCode-style coding assessment with ${assessment.durationMinutes} mins duration has been assigned to your department.`,
          type: 'ASSESSMENT',
        },
      });
    }

    return res.status(201).json({
      message: 'Assessment created and published successfully',
      assessment,
    });
  } catch (error: any) {
    console.error('Create Assessment Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function generateCodingQuestionApi(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const question = await generateCodingQuestionAI(prompt);
    return res.json({ question });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getCodingPresetApi(req: Request, res: Response) {
  try {
    const { presetKey } = req.body;
    const question = getHeuristicCodingQuestionPreset(presetKey || 'two sum');
    return res.json({ question });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function runStudentCodeApi(req: Request, res: Response) {
  try {
    const { code, language, testCases, customInput } = req.body;
    const result = await evaluateStudentCode(code, language, testCases || [], customInput);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAssignedAssessmentsForStudent(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Access restricted to students' });
    }

    const studentDeptId = req.user.departmentId;
    if (!studentDeptId) {
      return res.json({ assessments: [] });
    }

    const assigned = await prisma.assessmentDepartment.findMany({
      where: { departmentId: studentDeptId },
      include: {
        assessment: {
          include: {
            questions: true,
            submissions: {
              where: { studentId: req.user.id },
            },
          },
        },
      },
    });

    const assessments = assigned.map(item => {
      const a = item.assessment;
      const submission = a.submissions[0] || null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        totalMarks: a.totalMarks,
        durationMinutes: a.durationMinutes,
        status: a.status,
        questionCount: a.questions.length,
        isCompleted: !!submission?.submittedAt,
        obtainedMarks: submission?.obtainedMarks || 0,
        malpracticeScore: submission?.malpracticeScore || 0,
        submissionId: submission?.id || null,
        createdAt: a.createdAt,
      };
    });

    return res.json({ assessments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAssessmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: true,
        departments: { include: { department: true } },
      },
    });

    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    if (req.user && req.user.role === 'STUDENT') {
      const existingSub = await prisma.assessmentSubmission.findFirst({
        where: { assessmentId: id, studentId: req.user.id },
      });

      if (!existingSub) {
        await prisma.assessmentSubmission.create({
          data: {
            assessmentId: id,
            studentId: req.user.id,
            answers: JSON.stringify({}),
            cameraStatus: true,
            micStatus: true,
            fullscreenStatus: true,
            networkStatus: 'ONLINE',
            progressPercentage: 0,
            startedAt: new Date(),
          },
        });
      }
    }

    const questions = assessment.questions.map(q => ({
      id: q.id,
      type: q.type,
      title: q.title || 'Coding Challenge',
      difficulty: q.difficulty || 'Medium',
      topic: q.topic || 'Arrays',
      questionText: q.questionText,
      constraints: q.constraints || '1 <= N <= 10^5',
      inputFormat: q.inputFormat || 'Standard Input',
      outputFormat: q.outputFormat || 'Standard Output',
      sampleInput: q.sampleInput || '',
      sampleOutput: q.sampleOutput || '',
      starterTemplates: q.starterTemplates ? JSON.parse(q.starterTemplates) : null,
      testCases: q.testCases ? JSON.parse(q.testCases) : [],
      timeLimitMs: q.timeLimitMs || 2000,
      memoryLimitMb: q.memoryLimitMb || 256,
      codeTemplate: q.codeTemplate,
      options: q.options ? JSON.parse(q.options) : [],
      marks: q.marks,
      orderIndex: q.orderIndex,
    }));

    return res.json({
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      totalMarks: assessment.totalMarks,
      durationMinutes: assessment.durationMinutes,
      randomize: assessment.randomize,
      negativeMarking: assessment.negativeMarking,
      questions,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateAssessmentHeartbeat(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { cameraStatus, micStatus, fullscreenStatus, networkStatus, currentQuestionIndex, totalQuestions } = req.body;

    const submission = await prisma.assessmentSubmission.findFirst({
      where: { assessmentId: id, studentId: req.user.id, submittedAt: null },
    });

    if (submission) {
      const progressPercentage = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

      await prisma.assessmentSubmission.update({
        where: { id: submission.id },
        data: {
          cameraStatus: cameraStatus !== undefined ? !!cameraStatus : true,
          micStatus: micStatus !== undefined ? !!micStatus : true,
          fullscreenStatus: fullscreenStatus !== undefined ? !!fullscreenStatus : true,
          networkStatus: networkStatus || 'ONLINE',
          currentQuestionIndex: currentQuestionIndex || 0,
          progressPercentage,
        },
      });
    }

    return res.json({ status: 'OK' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function submitAssessment(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can submit assessments' });
    }

    const { id } = req.params;
    const { answers, proctoringLogs } = req.body;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    let obtainedMarks = 0;
    const studentAnswers = answers || {};

    for (const q of assessment.questions) {
      const studentAns = studentAnswers[q.id];
      if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
        const correct = q.correctAnswer ? JSON.parse(q.correctAnswer) : null;

        if (q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'FILL_IN_BLANK') {
          if (String(studentAns).trim().toLowerCase() === String(correct).trim().toLowerCase()) {
            obtainedMarks += q.marks;
          } else if (assessment.negativeMarking > 0) {
            obtainedMarks = Math.max(0, obtainedMarks - assessment.negativeMarking);
          }
        } else if (q.type === 'CODING') {
          const testCases = q.testCases ? JSON.parse(q.testCases) : [];
          const evalResult = await evaluateStudentCode(String(studentAns), 'javascript', testCases);
          if (evalResult.verdict === 'Accepted') {
            obtainedMarks += q.marks;
          } else {
            const ratio = evalResult.totalTestCases > 0 ? evalResult.passedTestCases / evalResult.totalTestCases : 0;
            obtainedMarks += q.marks * ratio;
          }
        } else {
          obtainedMarks += q.marks * 0.8;
        }
      }
    }

    const logList = proctoringLogs || [];
    let malpracticeScore = 0;
    for (const log of logList) {
      if (log.event === 'TAB_SWITCH') malpracticeScore += 15;
      if (log.event === 'NO_FACE') malpracticeScore += 10;
      if (log.event === 'MULTIPLE_FACES') malpracticeScore += 25;
      if (log.event === 'MOBILE_DETECTED') malpracticeScore += 35;
      if (log.event === 'TALKING_BACKGROUND_VOICE') malpracticeScore += 15;
      if (log.event === 'CAMERA_OFF' || log.event === 'CAMERA_BLOCKED') malpracticeScore += 30;
      if (log.event === 'MIC_MUTED') malpracticeScore += 20;
      if (log.event === 'FULLSCREEN_EXIT') malpracticeScore += 15;
      if (log.event === 'COPY_PASTE') malpracticeScore += 20;
    }
    malpracticeScore = Math.min(100, malpracticeScore);

    const existingSub = await prisma.assessmentSubmission.findFirst({
      where: { assessmentId: id, studentId: req.user.id },
    });

    const submission = existingSub
      ? await prisma.assessmentSubmission.update({
          where: { id: existingSub.id },
          data: {
            answers: JSON.stringify(studentAnswers),
            obtainedMarks: Math.round(obtainedMarks * 10) / 10,
            isEvaluated: true,
            malpracticeScore,
            progressPercentage: 100,
            submittedAt: new Date(),
          },
        })
      : await prisma.assessmentSubmission.create({
          data: {
            assessmentId: id,
            studentId: req.user.id,
            answers: JSON.stringify(studentAnswers),
            obtainedMarks: Math.round(obtainedMarks * 10) / 10,
            isEvaluated: true,
            malpracticeScore,
            progressPercentage: 100,
            submittedAt: new Date(),
          },
        });

    if (logList.length > 0) {
      for (const log of logList) {
        await prisma.proctoringLog.create({
          data: {
            submissionId: submission.id,
            studentId: req.user.id,
            event: log.event || 'TAB_SWITCH',
            description: log.description || 'Proctoring alert triggered during exam',
            severity: log.severity || 'MEDIUM',
            confidenceScore: log.confidenceScore || 92,
            aiExplanation: log.aiExplanation || `AI Vision/Audio processor flagged ${log.event} with 92% confidence score.`,
            snapshotUrl: log.snapshotUrl || null,
          },
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ASSESSMENT_SUBMIT',
        details: `Submitted assessment '${assessment.title}' with score ${submission.obtainedMarks}/${assessment.totalMarks}`,
      },
    });

    return res.json({
      message: 'Assessment submitted and evaluated successfully',
      submissionId: submission.id,
      obtainedMarks: submission.obtainedMarks,
      totalMarks: assessment.totalMarks,
      malpracticeScore: submission.malpracticeScore,
    });
  } catch (error: any) {
    console.error('Submit Assessment Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
