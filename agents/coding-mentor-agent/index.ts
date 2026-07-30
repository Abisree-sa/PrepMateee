/**
 * Coding Mentor Agent — Standalone Micro-Package
 * Pair-programming mentor providing algorithmic hints, Big-O complexity analysis, and strategy advice.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface MentorAdvice {
  hint: string;
  suggestedApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export async function getCodingMentorAdvice(
  problemTitle: string,
  userCode: string
): Promise<MentorAdvice> {
  const prompt = `
Act as an Expert Algorithmic Mentor assisting a student solving "${problemTitle}".
Student Code:
\`\`\`
${userCode}
\`\`\`

Return strictly valid JSON:
{
  "hint": "Consider using a Hash Map for O(1) lookup instead of nested loops.",
  "suggestedApproach": "Single pass Hash Map pairing strategy",
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(N)"
}
`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const cleanJson = (res.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {}
  }

  return {
    hint: 'Use a Hash Map to store complement values for single-pass lookup.',
    suggestedApproach: 'Hash Map Lookup Strategy',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  };
}
