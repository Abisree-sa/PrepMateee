import { geminiClient } from './gemini.client';

export interface LeetCodeStyleQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  questionText: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  starterTemplates: {
    java: string;
    python: string;
    cpp: string;
    c: string;
    javascript: string;
  };
  testCases: Array<{
    input: string;
    output: string;
    isHidden: boolean;
  }>;
}

export async function generateCodingQuestionAI(promptStr: string): Promise<LeetCodeStyleQuestion> {
  const prompt = `
You are a Principal Technical Recruiter & Competitive Programming Expert at LeetCode / FAANG.
Generate a complete, enterprise-grade LeetCode-style Coding Assessment Problem based on this prompt: "${promptStr}".

Output strictly a valid JSON object matching this exact TypeScript structure:

{
  "title": "Problem Title",
  "difficulty": "Easy", // or "Medium" or "Hard"
  "topic": "Arrays", // or "Graphs", "Dynamic Programming", "Trees", "Strings"
  "questionText": "Detailed, professional problem description with background and task requirements.",
  "constraints": "1 <= N <= 10^5\\n-10^9 <= nums[i] <= 10^9",
  "inputFormat": "First line contains integer N. Second line contains N space-separated integers.",
  "outputFormat": "Print a single integer representing the target output.",
  "sampleInput": "4\\n2 7 11 15\\n9",
  "sampleOutput": "0 1",
  "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1].",
  "timeLimitMs": 2000,
  "memoryLimitMb": 256,
  "starterTemplates": {
    "java": "import java.util.*;\\n\\npublic class Solution {\\n    public int[] solve(int[] nums, int target) {\\n        // Write your solution here\\n        return new int[]{};\\n    }\\n}",
    "python": "def solve(nums, target):\\n    # Write your solution here\\n    pass",
    "cpp": "#include <vector>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    vector<int> solve(vector<int>& nums, int target) {\\n        // Write your solution here\\n        return {};\\n    }\\n};",
    "c": "#include <stdio.h>\\n#include <stdlib.h>\\n\\nint* solve(int* nums, int numsSize, int target, int* returnSize) {\\n    *returnSize = 2;\\n    int* result = (int*)malloc(2 * sizeof(int));\\n    // Write your solution here\\n    return result;\\n}",
    "javascript": "function solve(nums, target) {\\n  // Write your solution here\\n  return [];\\n}"
  },
  "testCases": [
    { "input": "4\\n2 7 11 15\\n9", "output": "0 1", "isHidden": false },
    { "input": "3\\n3 2 4\\n6", "output": "1 2", "isHidden": false },
    { "input": "2\\n3 3\\n6", "output": "0 1", "isHidden": true },
    { "input": "5\\n1 5 3 7 9\\n12", "output": "1 3", "isHidden": true }
  ]
}
`;

  const aiText = await geminiClient.generateText(
    prompt,
    'You are a senior competitive programming author. Output strictly valid JSON with no markdown block surrounding it.'
  );

  if (aiText) {
    try {
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Failed to parse Gemini generated coding question, fallback to heuristic generator:', e);
    }
  }

  return getHeuristicCodingQuestionPreset(promptStr);
}

export function getHeuristicCodingQuestionPreset(presetKey: string): LeetCodeStyleQuestion {
  const pLower = presetKey.toLowerCase();

  if (pLower.includes('two sum') || pLower.includes('array')) {
    return {
      title: 'Two Sum & Hash Pair Search',
      difficulty: 'Easy',
      topic: 'Arrays & Sliding Window',
      questionText: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
      inputFormat: 'Line 1: N (array size)\nLine 2: N space-separated integers\nLine 3: target integer',
      outputFormat: 'Two space-separated indices representing 0-indexed positions.',
      sampleInput: '4\n2 7 11 15\n9',
      sampleOutput: '0 1',
      explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterTemplates: {
        java: `import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[]{map.get(diff), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
        python: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
        cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (map.count(diff)) return {map[diff], i};\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
        c: `#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    for(int i=0; i<numsSize; i++){\n        for(int j=i+1; j<numsSize; j++){\n            if(nums[i] + nums[j] == target){\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    return res;\n}`,
        javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`
      },
      testCases: [
        { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
        { input: '3\n3 2 4\n6', output: '1 2', isHidden: false },
        { input: '2\n3 3\n6', output: '0 1', isHidden: true },
        { input: '5\n1 5 3 7 9\n12', output: '1 3', isHidden: true }
      ]
    };
  }

  if (pLower.includes('island') || pLower.includes('graph')) {
    return {
      title: 'Number of Islands (BFS/DFS Traversal)',
      difficulty: 'Medium',
      topic: 'Graphs & BFS/DFS',
      questionText: 'Given an m x n 2D binary grid grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
      constraints: '1 <= m, n <= 300\ngrid[i][j] is \'0\' or \'1\'.',
      inputFormat: 'Line 1: m n (rows and columns)\nNext m lines: n binary characters representing grid',
      outputFormat: 'Single integer representing count of connected land islands.',
      sampleInput: '4 5\n11110\n11010\n11000\n00000',
      sampleOutput: '1',
      explanation: 'All connected 1s form a single contiguous land island.',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterTemplates: {
        java: `public class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        python: `def numIslands(grid):\n    # Write your solution here\n    return 0`,
        cpp: `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        return 0;\n    }\n};`,
        c: `int numIslands(char** grid, int gridSize, int* gridColSize) {\n    // Write your solution here\n    return 0;\n}`,
        javascript: `function numIslands(grid) {\n  // Write your solution here\n  return 0;\n}`
      },
      testCases: [
        { input: '4 5\n11110\n11010\n11000\n00000', output: '1', isHidden: false },
        { input: '4 5\n11000\n11000\n00100\n00011', output: '3', isHidden: false },
        { input: '3 3\n100\n010\n001', output: '3', isHidden: true }
      ]
    };
  }

  // Default Preset: Coin Change (DP)
  return {
    title: 'Coin Change & Dynamic Programming',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    questionText: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
    constraints: '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
    inputFormat: 'Line 1: N (number of coin types)\nLine 2: N space-separated coin values\nLine 3: amount integer',
    outputFormat: 'Single integer representing minimum coins needed, or -1.',
    sampleInput: '3\n1 2 5\n11',
    sampleOutput: '3',
    explanation: '11 = 5 + 5 + 1 (3 coins total).',
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    starterTemplates: {
      java: `public class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      python: `def coinChange(coins, amount):\n    # Write your solution here\n    return 0`,
      cpp: `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      c: `int coinChange(int* coins, int coinsSize, int amount) {\n    // Write your solution here\n    return 0;\n}`,
      javascript: `function coinChange(coins, amount) {\n  // Write your solution here\n  return 0;\n}`
    },
    testCases: [
      { input: '3\n1 2 5\n11', output: '3', isHidden: false },
      { input: '1\n2\n3', output: '-1', isHidden: false },
      { input: '1\n1\n0', output: '0', isHidden: true }
    ]
  };
}
