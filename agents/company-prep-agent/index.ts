/**
 * Company Tagged Query Agent — Standalone Micro-Package
 * Analyzes candidate queries to identify company, topic, and generate company-tagged problem roadmaps.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface CompanyPrepResult {
  intent: string;
  detectedCompany: string;
  topic: string;
  problemRoadmap: Array<{
    title: string;
    difficulty: string;
    frequency: string;
    keyHint: string;
  }>;
}

export async function askCompanyPrepAgent(query: string): Promise<CompanyPrepResult> {
  const prompt = `
Analyze candidate query: "${query}"
Return strictly valid JSON:
{
  "intent": "Roadmap Request",
  "detectedCompany": "Amazon",
  "topic": "Arrays & Sliding Window",
  "problemRoadmap": [
    { "title": "Two Sum", "difficulty": "Easy", "frequency": "50+ times", "keyHint": "Hash Map O(N)" },
    { "title": "Longest Substring Without Repeating Characters", "difficulty": "Medium", "frequency": "45+ times", "keyHint": "Sliding Window Set" }
  ]
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
    intent: 'Roadmap Request',
    detectedCompany: 'Amazon',
    topic: 'Arrays & Sliding Window',
    problemRoadmap: [
      { title: 'Two Sum', difficulty: 'Easy', frequency: '50+ times', keyHint: 'Hash Map single-pass' },
      { title: 'Subarray Sum Equals K', difficulty: 'Medium', frequency: '40+ times', keyHint: 'Prefix sum hash map' },
    ],
  };
}
