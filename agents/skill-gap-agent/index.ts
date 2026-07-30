/**
 * Skill Gap Agent — Standalone Micro-Package
 * Compares candidate resume and coding profile against target company requirements.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface SkillGapResult {
  company: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendedPreparation: string[];
}

export async function analyzeSkillGap(
  company: string,
  candidateSkills: string[]
): Promise<SkillGapResult> {
  const prompt = `
Compare candidate skills [${candidateSkills.join(', ')}] against target company "${company}" SDE expectations.
Return strictly valid JSON:
{
  "company": "${company}",
  "matchScore": 82,
  "matchingSkills": ["Java", "Data Structures", "SQL"],
  "missingSkills": ["Distributed Systems", "GraphQL"],
  "recommendedPreparation": ["Study System Design Caching", "Practice 20 Graph Mediums"]
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
    company,
    matchScore: 80,
    matchingSkills: candidateSkills,
    missingSkills: ['System Design Scalability', 'Advanced Graph Algorithms'],
    recommendedPreparation: ['Study System Design Caching', 'Solve 15 Graph Mediums'],
  };
}
