import { geminiClient } from './gemini.client';

export interface Turn {
  speaker: 'INTERVIEWER' | 'STUDENT';
  text: string;
  roundType?: 'HR' | 'TECHNICAL' | 'PROJECT' | 'SYSTEM_DESIGN' | 'CODING';
  timestamp?: string;
}

export interface InterviewTurnResult {
  nextQuestion: string;
  roundType: 'HR' | 'TECHNICAL' | 'PROJECT' | 'SYSTEM_DESIGN' | 'CODING';
  isInterviewComplete: boolean;
  aiInterviewerTone?: 'ENCOURAGING_HINT' | 'DEEP_PROBE' | 'TRANSITION' | 'STANDARD';
}

export async function generateNextInterviewTurn(
  targetRole: string,
  targetCompany: string,
  history: Turn[] = [],
  studentSummary?: string
): Promise<InterviewTurnResult> {
  const turnCount = Math.floor(history.length / 2) + 1;
  const lastTurn = history.length > 0 ? history[history.length - 1] : null;
  const lastAnswer = lastTurn && lastTurn.speaker === 'STUDENT' ? lastTurn.text : '';

  // Initial Question
  if (history.length === 0) {
    return {
      nextQuestion: `Welcome to your ${targetCompany} ${targetRole} interview! Please introduce yourself and walk me through a technical project you're most proud of building.`,
      roundType: 'HR',
      isInterviewComplete: false,
      aiInterviewerTone: 'STANDARD',
    };
  }

  const historyText = history
    .map((t) => `${t.speaker === 'INTERVIEWER' ? 'AI Interviewer' : 'Candidate'}: "${t.text}"`)
    .join('\n');

  const prompt = `
You are an expert AI Technical & HR Interviewer conducting a live campus placement interview for the position of "${targetRole}" at "${targetCompany}".

STUDENT PROFILE CONTEXT: ${studentSummary || 'Computer Science Student'}
TURN COUNT: ${turnCount} of 6

INTERVIEW HISTORY:
${historyText}

LATEST CANDIDATE RESPONSE: "${lastAnswer}"

CRITICAL INTERVIEWER BEHAVIOR DIRECTIVES:
1. READ AND ANALYZE THE CANDIDATE'S LATEST RESPONSE CAREFULLY.
2. IF THE CANDIDATE SAYS "i dont know", "pass", "not sure", OR GIVES A VAGUE/EMPTY ANSWER:
   - DO NOT SAY "Great introduction!", "Awesome explanation!", OR GIVE FAKE PRAISE!
   - DO SAY: "No problem at all! Let me help pivot..." or "That's completely fine. Let me rephrase..." or "No worries! Let me ask a foundational question..."
   - Gently encourage them, offer a simplified hint, or transition smoothly to a different topic without breaking interviewer professionalism.
3. IF THE CANDIDATE GIVES A STRONG/TECHNICAL ANSWER:
   - Reference a specific detail from their response.
   - Ask a logical, probing follow-up question (e.g. "Why did you choose PostgreSQL over MongoDB for that schema?", "How did you handle race conditions?").
4. Format your response strictly as JSON:
{
  "nextQuestion": "Your next conversational question or encouraging pivot",
  "roundType": "TECHNICAL",
  "isInterviewComplete": ${turnCount >= 6}
}
`;

  const aiText = await geminiClient.generateText(
    prompt,
    'You are a senior tech interviewer at a FAANG company. Be natural, intelligent, and context-aware. Never output fake praise for empty answers.'
  );

  if (aiText) {
    try {
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        nextQuestion: parsed.nextQuestion,
        roundType: parsed.roundType || 'TECHNICAL',
        isInterviewComplete: !!parsed.isInterviewComplete,
        aiInterviewerTone: 'STANDARD',
      };
    } catch (e) {
      console.warn('Failed to parse Gemini mock interview response, using intelligent fallback:', e);
    }
  }

  // Intelligent Context-Aware Heuristic Interview Engine
  return generateIntelligentTurnFallback(targetRole, targetCompany, turnCount, lastAnswer);
}

function generateIntelligentTurnFallback(
  role: string,
  company: string,
  turnCount: number,
  lastAnswer: string
): InterviewTurnResult {
  const ansLower = lastAnswer.trim().toLowerCase();
  const isDonotKnow =
    ansLower === 'i dont know' ||
    ansLower === 'i don\'t know' ||
    ansLower === 'dont know' ||
    ansLower === 'pass' ||
    ansLower === 'not sure' ||
    ansLower === 'no idea' ||
    (ansLower.length < 4 && ansLower.length > 0);

  let roundType: 'HR' | 'TECHNICAL' | 'PROJECT' | 'SYSTEM_DESIGN' | 'CODING' = 'TECHNICAL';
  let nextQuestion = '';

  if (turnCount <= 1) roundType = 'HR';
  else if (turnCount === 2) roundType = 'PROJECT';
  else if (turnCount === 3) roundType = 'TECHNICAL';
  else if (turnCount === 4) roundType = 'CODING';
  else roundType = 'SYSTEM_DESIGN';

  if (isDonotKnow) {
    if (turnCount <= 2) {
      nextQuestion = `No problem at all! Let's pivot to something else. Tell me about any programming language or technology stack you feel most comfortable working with.`;
      roundType = 'TECHNICAL';
    } else if (roundType === 'TECHNICAL') {
      nextQuestion = `That's completely fine! Let's break it down simpler. In Data Structures, how do you usually decide between using an Array vs a Linked List?`;
    } else if (roundType === 'CODING') {
      nextQuestion = `No worries! Let's take a simpler core problem. How would you check if a given string is a Palindrome or reverse an Array in-place?`;
    } else {
      nextQuestion = `No problem. To wrap up our technical discussion, what is one technical skill or technology you are actively learning right now?`;
    }
  } else {
    if (turnCount <= 1) {
      nextQuestion = `Thank you for sharing that! Moving into your project background: What was the core architectural design of your most complex project, and why did you choose that specific tech stack?`;
      roundType = 'PROJECT';
    } else if (turnCount === 2) {
      nextQuestion = `That's a solid technical approach. In that architecture, how did you handle data consistency, performance bottlenecks, or high concurrency user loads?`;
      roundType = 'TECHNICAL';
    } else if (turnCount === 3) {
      nextQuestion = `Good reasoning. Let me test your problem-solving under interview conditions. Given an unsorted array of integers, how would you find the contiguous subarray with the largest sum in O(N) time?`;
      roundType = 'CODING';
    } else if (turnCount === 4) {
      nextQuestion = `Great coding logic! To close out our technical rounds: How would you design a distributed Rate Limiter service at ${company} scale to prevent API abuse?`;
      roundType = 'SYSTEM_DESIGN';
    } else {
      nextQuestion = `Excellent discussion throughout the interview panel. Do you have any questions for me regarding the ${role} position or engineering culture at ${company}?`;
    }
  }

  const isInterviewComplete = turnCount >= 6;

  return {
    nextQuestion,
    roundType,
    isInterviewComplete,
    aiInterviewerTone: isDonotKnow ? 'ENCOURAGING_HINT' : 'DEEP_PROBE',
  };
}
