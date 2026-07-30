export interface WeeklyRoadmapItem {
  weekNumber: number;
  title: string;
  focusTopics: string[];
  recommendedHours: number;
  learningResources: { title: string; type: 'ARTICLE' | 'VIDEO' | 'PRACTICE'; url: string }[];
}

export function generatePersonalizedRoadmap(
  department: string,
  userSkills: string[] = [],
  avgAssessmentScore: number = 70
): WeeklyRoadmapItem[] {
  const isITorCSE = department.includes('Computer') || department.includes('Information') || department.includes('AI');

  return [
    {
      weekNumber: 1,
      title: isITorCSE ? 'Advanced Data Structures & Algorithmic Optimization' : 'Core Technical Fundamentals & Coding Foundations',
      focusTopics: isITorCSE ? ['Dynamic Programming', 'Graph Traversals', 'Tree Algorithms'] : ['Programming Syntax', 'Array Pointers', 'Basic Math'],
      recommendedHours: 12,
      learningResources: [
        { title: 'LeetCode Top Interview 150', type: 'PRACTICE', url: 'https://leetcode.com' },
        { title: 'DSA Master Roadmap Notes', type: 'ARTICLE', url: '#' },
      ],
    },
    {
      weekNumber: 2,
      title: 'Full-Stack Development & Distributed Architecture',
      focusTopics: ['REST APIs', 'Database Indexing', 'Authentication & JWT'],
      recommendedHours: 14,
      learningResources: [
        { title: 'System Design Interview Primer', type: 'ARTICLE', url: '#' },
        { title: 'Node.js & Express Production Patterns', type: 'VIDEO', url: '#' },
      ],
    },
    {
      weekNumber: 3,
      title: 'Target Company Mock Interviews & Speed Coding',
      focusTopics: ['Speed Coding under 30 Mins', 'HR Behavioral STAR Method', 'System Design'],
      recommendedHours: 10,
      learningResources: [
        { title: 'Mock Interview Feedback Log', type: 'PRACTICE', url: '#' },
      ],
    },
    {
      weekNumber: 4,
      title: 'Final Campus Placement Preparation & Resume Polish',
      focusTopics: ['ATS Resume Polish', 'Company Technical Round Drills', 'HR Leadership Questions'],
      recommendedHours: 15,
      learningResources: [
        { title: 'Amazon & Google Behavioral Guide', type: 'ARTICLE', url: '#' },
      ],
    },
  ];
}
