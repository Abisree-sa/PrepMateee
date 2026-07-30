/**
 * LeetCode Question Builder Agent — Standalone Micro-Package
 * Generates coding assessment problems with starter templates (Java, Python, C++, JS) and hidden test cases.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface GeneratedCodingQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  questionText: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  starterTemplates: {
    java: string;
    python: string;
    cpp: string;
    javascript: string;
  };
  testCases: Array<{ input: string; output: string; isHidden: boolean }>;
}

export async function generateCodingQuestion(
  topic: string,
  difficulty: string
): Promise<GeneratedCodingQuestion> {
  const prompt = `
Generate a professional LeetCode-style coding question on topic "${topic}" with difficulty "${difficulty}".
Return strictly valid JSON:
{
  "title": "Longest Subarray with Sum K",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "questionText": "Given an array of integers and a target sum k, find the length of the longest subarray...",
  "constraints": "1 <= N <= 10^5, -10^9 <= k <= 10^9",
  "sampleInput": "nums = [1, -1, 5, -2, 3], k = 3",
  "sampleOutput": "4",
  "starterTemplates": {
    "java": "class Solution { public int maxLen(int[] nums, int k) { return 0; } }",
    "python": "class Solution:\\n    def maxLen(self, nums: List[int], k: int) -> int:\\n        return 0",
    "cpp": "class Solution { public: int maxLen(vector<int>& nums, int k) { return 0; } };",
    "javascript": "function maxLen(nums, k) { return 0; }"
  },
  "testCases": [
    { "input": "[1, -1, 5, -2, 3]\\n3", "output": "4", "isHidden": false },
    { "input": "[-2, -1, 2, 1]\\n1", "output": "2", "isHidden": true }
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
    title: `${topic} ${difficulty} Challenge`,
    difficulty: difficulty as any,
    topic,
    questionText: `Solve the following ${difficulty} difficulty problem on ${topic}.`,
    constraints: '1 <= N <= 10^4',
    sampleInput: '[1, 2, 3]',
    sampleOutput: '6',
    starterTemplates: {
      java: 'class Solution { public int solve() { return 0; } }',
      python: 'def solve(): return 0',
      cpp: 'int solve() { return 0; }',
      javascript: 'function solve() { return 0; }',
    },
    testCases: [{ input: '[1, 2, 3]', output: '6', isHidden: false }],
  };
}
