import { geminiClient } from './gemini.client';

export interface CompanySkillGapResult {
  companyName: string;
  matchPercentage: number;
  dsaReadinessScore: number;
  systemDesignScore: number;
  developmentSkillScore: number;
  projectRelevanceScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  missingTechnologies: string[];
  missingCertifications: string[];
  preparationRoadmap: {
    week: number;
    title: string;
    focusTopics: string[];
    recommendedAction: string;
  }[];
}

const COMPANY_BENCHMARKS: Record<string, {
  requiredSkills: string[];
  requiredLangs: string[];
  dsaWeight: number;
  sysDesignWeight: number;
  devWeight: number;
  preferredCerts: string[];
}> = {
  Amazon: {
    requiredSkills: ['DSA', 'JAVA', 'C++', 'MICROSERVICES', 'AWS', 'OOD', 'SYSTEM DESIGN', 'SQL'],
    requiredLangs: ['JAVA', 'C++', 'PYTHON'],
    dsaWeight: 0.40,
    sysDesignWeight: 0.25,
    devWeight: 0.35,
    preferredCerts: ['AWS Certified Developer', 'Oracle Certified Java SE'],
  },
  Google: {
    requiredSkills: ['ADVANCED DSA', 'C++', 'PYTHON', 'SYSTEM DESIGN', 'ALGORITHMS', 'DISTRIBUTED SYSTEMS', 'LINUX'],
    requiredLangs: ['C++', 'PYTHON', 'GO', 'JAVA'],
    dsaWeight: 0.50,
    sysDesignWeight: 0.30,
    devWeight: 0.20,
    preferredCerts: ['Google Cloud Professional Cloud Architect'],
  },
  Microsoft: {
    requiredSkills: ['C#', '.NET', 'AZURE', 'DSA', 'SYSTEM DESIGN', 'SQL SERVER', 'REACT', 'TYPESCRIPT'],
    requiredLangs: ['C#', 'C++', 'TYPESCRIPT', 'JAVA'],
    dsaWeight: 0.35,
    sysDesignWeight: 0.25,
    devWeight: 0.40,
    preferredCerts: ['Microsoft Certified: Azure Developer Associate'],
  },
  Atlassian: {
    requiredSkills: ['TYPESCRIPT', 'REACT', 'GO', 'JAVA', 'REST APIS', 'WEBSOCKETS', 'MICROSERVICES', 'DOCKER'],
    requiredLangs: ['TYPESCRIPT', 'JAVA', 'GO', 'PYTHON'],
    dsaWeight: 0.30,
    sysDesignWeight: 0.30,
    devWeight: 0.40,
    preferredCerts: ['AWS Certified Solutions Architect'],
  },
  Walmart: {
    requiredSkills: ['JAVA', 'SPRING BOOT', 'KAFKA', 'REACT', 'SQL', 'MICROSERVICES', 'DSA'],
    requiredLangs: ['JAVA', 'JAVASCRIPT', 'SQL'],
    dsaWeight: 0.35,
    sysDesignWeight: 0.20,
    devWeight: 0.45,
    preferredCerts: ['Oracle Certified Professional Java Programmer'],
  },
  Zoho: {
    requiredSkills: ['CORE JAVA', 'C++', 'DATA STRUCTURES', 'OOP FROM SCRATCH', 'MATRIX PUZZLES', 'SQL', 'HTML/CSS'],
    requiredLangs: ['JAVA', 'C++', 'C'],
    dsaWeight: 0.45,
    sysDesignWeight: 0.15,
    devWeight: 0.40,
    preferredCerts: ['Oracle Certified Associate Java SE'],
  },
};

export async function analyzeSkillGapForCompany(
  studentSkills: string[],
  studentProjects: any[],
  targetCompany: string
): Promise<CompanySkillGapResult> {
  const benchmark = COMPANY_BENCHMARKS[targetCompany] || COMPANY_BENCHMARKS['Amazon'];
  const upperStudentSkills = studentSkills.map(s => s.toUpperCase());

  const matchingSkills = benchmark.requiredSkills.filter(req =>
    upperStudentSkills.some(st => st.includes(req) || req.includes(st))
  );

  const missingSkills = benchmark.requiredSkills.filter(req => !matchingSkills.includes(req));

  const hasDSA = upperStudentSkills.some(s => s.includes('DSA') || s.includes('ALGORITHM') || s.includes('DATA STRUCTURE'));
  const hasSysDesign = upperStudentSkills.some(s => s.includes('SYSTEM DESIGN') || s.includes('ARCHITECTURE') || s.includes('MICROSERVICES'));
  const hasDev = upperStudentSkills.some(s => s.includes('REACT') || s.includes('NODE') || s.includes('SPRING') || s.includes('WEB'));

  const dsaReadinessScore = hasDSA ? Math.min(95, 65 + matchingSkills.length * 5) : 55;
  const systemDesignScore = hasSysDesign ? Math.min(90, 60 + matchingSkills.length * 4) : 45;
  const developmentSkillScore = hasDev ? Math.min(95, 70 + studentProjects.length * 8) : 60;
  const projectRelevanceScore = studentProjects.length > 0 ? Math.min(92, 65 + studentProjects.length * 10) : 50;

  const matchRatio = matchingSkills.length / benchmark.requiredSkills.length;
  const calculatedMatch = Math.round(
    (dsaReadinessScore * benchmark.dsaWeight) +
    (systemDesignScore * benchmark.sysDesignWeight) +
    (developmentSkillScore * benchmark.devWeight) +
    (matchRatio * 20)
  );
  const matchPercentage = Math.min(96, Math.max(48, calculatedMatch));

  return {
    companyName: targetCompany,
    matchPercentage,
    dsaReadinessScore,
    systemDesignScore,
    developmentSkillScore,
    projectRelevanceScore,
    matchingSkills: matchingSkills.length > 0 ? matchingSkills : ['CORE CS FUNDAMENTALS'],
    missingSkills: missingSkills.slice(0, 4),
    missingTechnologies: missingSkills.filter(s => s.includes('AWS') || s.includes('AZURE') || s.includes('DOCKER') || s.includes('KAFKA')),
    missingCertifications: benchmark.preferredCerts,
    preparationRoadmap: [
      {
        week: 1,
        title: `Master ${targetCompany} Core Topics`,
        focusTopics: missingSkills.slice(0, 2),
        recommendedAction: `Solve 15 target ${targetCompany} tagged LeetCode medium problems on ${missingSkills[0] || 'Arrays & Graphs'}.`
      },
      {
        week: 2,
        title: 'System Architecture & High-Level Design',
        focusTopics: ['Scalability', 'Database Indexing', 'API Gateway'],
        recommendedAction: `Build a mini microservices project demonstrating ${targetCompany} technical stack.`
      },
      {
        week: 3,
        title: 'Mock Interview Drilling',
        focusTopics: ['Speed Coding', 'Behavioral Leadership Principles'],
        recommendedAction: `Complete 3 AI Mock Interview sessions on ${targetCompany} format.`
      },
      {
        week: 4,
        title: 'Final Revision & Speed Runs',
        focusTopics: ['Hard LeetCode Patterns', 'Resume Deep Dive'],
        recommendedAction: `Revise key projects and solve 5 Hard company-tagged problems.`
      }
    ]
  };
}
