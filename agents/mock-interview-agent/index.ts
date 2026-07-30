/**
 * Mock Interview Agent — Standalone Micro-Package
 * Generates dynamic technical and HR interview turns using Google Gemini 2.0.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface InterviewTurn {
  question: string;
  roleContext: string;
  hints?: string[];
}

export async function generateInterviewQuestion(
  targetRole: string,
  targetCompany: string,
  turnNumber: number,
  previousAnswer?: string
): Promise<InterviewTurn> {
  const prompt = `
Act as an Lead Interviewer for "${targetCompany}" interviewing a candidate for "${targetRole}".
Turn Number: ${turnNumber}.
${previousAnswer ? `Previous Candidate Answer: "${previousAnswer}"` : 'This is the start of the interview.'}

Generate the next technical or STAR-behavioral interview question.
Return strictly valid JSON:
{
  "question": "Walk me through how you optimize a SQL query with 1 million records.",
  "roleContext": "SDE-1 Database Systems",
  "hints": ["Consider indexing", "Execution plan analysis"]
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {}
  }

  return {
    question: `Welcome to your ${targetCompany} ${targetRole} technical interview. Could you explain a challenging technical problem you recently solved?`,
    roleContext: `${targetRole} Evaluation`,
    hints: ['Focus on problem statement, solution approach, and trade-offs'],
  };
}
