import { geminiClient } from './gemini.client';
import { Turn } from './mockInterview.agent';

export interface EvaluationReport {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  fluencyScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  personalizedLearningPlan: {
    phase: string;
    action: string;
  }[];
}

export async function evaluateInterviewTranscript(targetRole: string, targetCompany: string, history: Turn[]): Promise<EvaluationReport> {
  const studentTurns = history.filter(t => t.speaker === 'STUDENT');
  const totalStudentWords = studentTurns.reduce((acc, t) => acc + t.text.split(' ').length, 0);
  const avgAnswerLength = studentTurns.length > 0 ? Math.round(totalStudentWords / studentTurns.length) : 0;

  const transcriptText = history.map(t => `${t.speaker} [${t.roundType || ''}]: ${t.text}`).join('\n');

  const prompt = `You are an expert AI Interview Evaluator. Evaluate this ACTUAL interview transcript for a candidate applying for "${targetRole}" at "${targetCompany}".

Transcript:
${transcriptText}

Evaluation context:
- Total student responses: ${studentTurns.length}
- Average answer length: ${avgAnswerLength} words
- Interview rounds covered: ${[...new Set(history.map(t => t.roundType).filter(Boolean))].join(', ')}

CRITICAL RULES:
1. Base ALL scores EXCLUSIVELY on what the candidate actually said in the transcript above.
2. If the candidate gave short/incomplete answers, scores MUST be lower (40-65 range).
3. If the candidate gave detailed, technical, well-structured answers, scores can be higher (75-95 range).
4. Scores must be DIFFERENT from each other — not all the same value.
5. Strengths must quote or reference SPECIFIC things the candidate said.
6. Weaknesses must identify SPECIFIC gaps visible in the transcript.
7. Suggested improvements must be PERSONALIZED to this candidate's actual performance.
8. Do NOT use template scores like 82, 84, 85, 86 — compute from actual content.

Output clean JSON:
{
  "overallScore": <integer 30-97 based on actual performance>,
  "communicationScore": <integer based on clarity and articulation in transcript>,
  "technicalScore": <integer based on technical accuracy of answers>,
  "confidenceScore": <integer based on answer completeness and directness>,
  "problemSolvingScore": <integer based on logical reasoning shown>,
  "fluencyScore": <integer based on language quality and flow>,
  "strengths": ["<specific strength with reference to what candidate said>"],
  "weaknesses": ["<specific weakness observed in transcript>"],
  "suggestedImprovements": ["<personalized improvement based on actual gaps>"],
  "personalizedLearningPlan": [
    { "phase": "Week 1", "action": "<specific action based on identified weaknesses>" },
    { "phase": "Week 2", "action": "<specific action>" }
  ]
}`;

  const aiText = await geminiClient.generateText(
    prompt,
    'You are a VP of Engineering evaluating a real interview transcript. Base every score and comment on the actual transcript content. Return valid clean JSON only.'
  );

  if (aiText) {
    try {
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as EvaluationReport;
    } catch (e) {
      console.warn('Failed to parse Interview Evaluator JSON:', e);
    }
  }

  // Fallback: compute scores from actual transcript signals
  const hasDetailedAnswers = avgAnswerLength > 40;
  const hasTechnicalContent = studentTurns.some(t =>
    /algorithm|complexity|o\(n\)|database|api|design|implement|optimize/i.test(t.text)
  );
  const hasShortAnswers = studentTurns.some(t => t.text.split(' ').length < 10);

  const baseScore = hasDetailedAnswers ? 75 : hasShortAnswers ? 52 : 63;
  const techBonus = hasTechnicalContent ? 8 : 0;

  return {
    overallScore: Math.min(95, baseScore + techBonus),
    communicationScore: Math.min(95, baseScore + (hasDetailedAnswers ? 5 : -5)),
    technicalScore: Math.min(95, baseScore + techBonus + (hasTechnicalContent ? 5 : -8)),
    confidenceScore: Math.min(95, baseScore + (hasShortAnswers ? -10 : 3)),
    problemSolvingScore: Math.min(95, baseScore + (hasTechnicalContent ? 7 : -5)),
    fluencyScore: Math.min(95, baseScore + (hasDetailedAnswers ? 8 : -3)),
    strengths: [
      studentTurns.length >= 5 ? 'Completed all interview rounds and engaged consistently' : 'Participated in the interview session',
      hasTechnicalContent ? 'Demonstrated technical knowledge in responses' : 'Showed willingness to attempt technical questions',
    ].filter(Boolean),
    weaknesses: [
      !hasDetailedAnswers ? 'Answers were brief — need more elaboration and depth' : null,
      !hasTechnicalContent ? 'Limited technical terminology and concepts in responses' : null,
      hasShortAnswers ? 'Some responses were too short to demonstrate full understanding' : null,
    ].filter(Boolean) as string[],
    suggestedImprovements: [
      'Practice the STAR method (Situation, Task, Action, Result) for structured answers',
      'Aim for 3-5 sentence minimum responses to demonstrate depth of knowledge',
      `Review ${targetCompany}-specific interview patterns and practice out loud`,
    ],
    personalizedLearningPlan: [
      { phase: 'Week 1', action: hasTechnicalContent ? 'Deepen system design knowledge with mock architecture sessions' : 'Study core DSA and practice explaining solutions verbally' },
      { phase: 'Week 2', action: 'Conduct 2 more AI Mock Interviews focusing on answer elaboration' },
    ],
  };
}
