export interface CareerTrackRecommendation {
  roleTitle: string;
  matchScore: number;
  expectedSalaryRange: string;
  topHiringCompanies: string[];
  keyRequiredSkills: string[];
  skillGapToBridge: string[];
}

export function recommendCareers(
  department: string,
  userSkills: string[] = [],
  targetRolePref?: string
): CareerTrackRecommendation[] {
  const upperSkills = userSkills.map(s => s.toUpperCase());

  const isWebDev = upperSkills.some(s => s.includes('REACT') || s.includes('NODE') || s.includes('WEB') || s.includes('HTML'));
  const isCloud = upperSkills.some(s => s.includes('AWS') || s.includes('DOCKER') || s.includes('LINUX') || s.includes('CLOUD'));

  return [
    {
      roleTitle: 'Software Development Engineer (SDE-1)',
      matchScore: 88,
      expectedSalaryRange: '₹12 LPA - ₹28 LPA',
      topHiringCompanies: ['Amazon', 'Microsoft', 'Google', 'Zoho', 'Walmart'],
      keyRequiredSkills: ['DSA', 'Java/C++', 'Object-Oriented Design', 'SQL'],
      skillGapToBridge: ['Advanced Graph Algorithms', 'Low Level Design'],
    },
    {
      roleTitle: 'Full-Stack Software Engineer',
      matchScore: isWebDev ? 92 : 75,
      expectedSalaryRange: '₹10 LPA - ₹22 LPA',
      topHiringCompanies: ['Atlassian', 'ServiceNow', 'Adobe', 'Zoho'],
      keyRequiredSkills: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL'],
      skillGapToBridge: ['Microservices', 'WebSockets', 'Redis Caching'],
    },
    {
      roleTitle: 'Cloud & Infrastructure Engineer',
      matchScore: isCloud ? 90 : 70,
      expectedSalaryRange: '₹14 LPA - ₹26 LPA',
      topHiringCompanies: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Cisco'],
      keyRequiredSkills: ['Docker', 'Kubernetes', 'Linux Systems', 'CI/CD Pipelines'],
      skillGapToBridge: ['Terraform', 'Prometheus Monitoring'],
    },
  ];
}
