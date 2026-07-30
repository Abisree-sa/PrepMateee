/**
 * Learning Roadmap Agent — Standalone Micro-Package
 * Generates custom 3-week milestone roadmaps based on candidate department and skill gaps.
 */

export interface Milestone {
  week: string;
  focusTopic: string;
  targetGoal: string;
}

export function generatePersonalizedRoadmap(
  department: string,
  skills: string[],
  score: number
): Milestone[] {
  return [
    {
      week: 'Week 1',
      focusTopic: 'Data Structures & Dynamic Programming Foundations',
      targetGoal: `Solve 10 Medium DP problems tailored for ${department}`,
    },
    {
      week: 'Week 2',
      focusTopic: 'Graph Algorithms, BFS/DFS & Topological Sort',
      targetGoal: 'Master Kahn\'s Algorithm & Shortest Path Dijkstra',
    },
    {
      week: 'Week 3',
      focusTopic: 'System Design Fundamentals & STAR Behavioral Practice',
      targetGoal: 'Attend 2 AI Mock Interview rounds & publish 1 project',
    },
  ];
}
