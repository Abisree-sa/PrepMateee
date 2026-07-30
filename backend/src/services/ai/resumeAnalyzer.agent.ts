import { geminiClient } from './gemini.client';

export interface ResumeAnalysisResult {
  parsedData: {
    fullName: string;
    email: string;
    phone: string;
    education: string[];
    cgpa: string;
    skills: string[];
    programmingLanguages: string[];
    frameworks: string[];
    projects: { title: string; techStack: string[]; description: string }[];
    internships: string[];
    certifications: string[];
    achievements: string[];
    codingProfiles: string[];
    experienceYears: number;
  };
  atsScore: number;
  qualityReport: {
    resumeQuality: string;
    atsCompatibility: string;
    technicalStrengths: string[];
    weakAreas: string[];
    missingSections: string[];
    grammarScore: number;
    formattingFeedback: string;
    suggestions: string[];
  };
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
  const textSample = resumeText.slice(0, 5000);

  const prompt = `You are an expert AI Resume Analysis Agent. You MUST analyze ONLY the actual content of the resume text provided below.
Do NOT use any default, template, or example values. Every field must be extracted or inferred EXCLUSIVELY from the resume text.
If a field is not present in the resume, use an empty array [] or empty string "" — never invent placeholder data.

CRITICAL RULES:
- atsScore must be computed from actual resume quality signals: presence of action verbs, quantified achievements, section completeness, keyword density, formatting clarity, and ATS-friendliness. It MUST vary per resume (range: 30–97).
- grammarScore must reflect actual writing quality found in the text (range: 40–99).
- technicalStrengths must name SPECIFIC technologies/skills actually found in the resume text.
- weakAreas must identify REAL gaps or weaknesses visible in this specific resume.
- suggestions must be PERSONALIZED to this exact resume — not generic advice.
- missingSections must list sections that are genuinely absent from this resume.

Resume Text:
"""
${textSample}
"""

Output a single valid JSON object matching this schema exactly:
{
  "parsedData": {
    "fullName": "<extracted from resume>",
    "email": "<extracted or empty string>",
    "phone": "<extracted or empty string>",
    "education": ["<degree and institution from resume>"],
    "cgpa": "<exact CGPA/GPA found or empty string>",
    "skills": ["<only skills explicitly listed in resume>"],
    "programmingLanguages": ["<only languages found in resume>"],
    "frameworks": ["<only frameworks/libraries found in resume>"],
    "projects": [
      { "title": "<actual project title>", "techStack": ["<tech used>"], "description": "<actual description>" }
    ],
    "internships": ["<actual internship entries or empty array>"],
    "certifications": ["<actual certifications or empty array>"],
    "achievements": ["<actual achievements or empty array>"],
    "codingProfiles": ["<actual profiles mentioned or empty array>"],
    "experienceYears": <number based on internship/work history>
  },
  "atsScore": <integer 30-97 based on actual resume quality>,
  "qualityReport": {
    "resumeQuality": "<specific assessment of THIS resume's depth and quality>",
    "atsCompatibility": "<specific ATS parsing assessment for THIS resume>",
    "technicalStrengths": ["<specific strength from THIS resume>", "<another specific strength>"],
    "weakAreas": ["<specific weakness found in THIS resume>"],
    "missingSections": ["<sections genuinely missing from THIS resume>"],
    "grammarScore": <integer 40-99 based on actual writing quality>,
    "formattingFeedback": "<specific formatting observation about THIS resume>",
    "suggestions": [
      "<specific actionable suggestion for THIS resume>",
      "<another specific suggestion>"
    ]
  }
}`;

  const aiText = await geminiClient.generateText(
    prompt,
    'You are a senior technical recruiter and ATS expert. Analyze only the provided resume text. Return only clean valid JSON without markdown code blocks. Never use placeholder or template values.'
  );

  if (aiText) {
    try {
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as ResumeAnalysisResult;
    } catch (e) {
      console.warn('Failed to parse Gemini resume response, using heuristic parser:', e);
    }
  }

  return parseResumeHeuristically(resumeText);
}

function parseResumeHeuristically(text: string): ResumeAnalysisResult {
  const lower = text.toLowerCase();

  const allKnownSkills = [
    'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'go', 'rust', 'kotlin', 'swift',
    'react', 'node.js', 'express', 'angular', 'vue', 'django', 'flask', 'spring boot', 'next.js',
    'sql', 'postgresql', 'mongodb', 'redis', 'mysql', 'sqlite', 'firebase',
    'dsa', 'system design', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git',
    'html', 'css', 'tailwind', 'graphql', 'rest api', 'microservices', 'linux'
  ];

  const foundSkills = allKnownSkills.filter(s => lower.includes(s));
  const progLangs = ['python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'go', 'rust', 'kotlin', 'swift'].filter(l => lower.includes(l));
  const frameworks = ['react', 'node.js', 'express', 'angular', 'vue', 'django', 'flask', 'spring boot', 'next.js', 'tailwind'].filter(f => lower.includes(f));

  const cgpaMatch = text.match(/(?:cgpa|gpa|marks)[\s:]*([0-9]\.[0-9]{1,2})/i);
  const cgpa = cgpaMatch ? cgpaMatch[1] : '';

  const actionVerbs = ['architected', 'built', 'implemented', 'developed', 'optimized', 'engineered', 'designed', 'created', 'deployed', 'automated', 'reduced', 'improved', 'led', 'managed'];
  const verbMatches = actionVerbs.filter(v => lower.includes(v));
  const hasMetrics = /\d+%|\d+x|\d+ms|\d+\s*users|\d+\s*requests/.test(lower);

  // Score based on actual content signals
  let atsScore = 35;
  atsScore += Math.min(20, foundSkills.length * 2);
  atsScore += Math.min(12, verbMatches.length * 3);
  if (hasMetrics) atsScore += 8;
  if (lower.includes('project')) atsScore += 5;
  if (lower.includes('intern')) atsScore += 7;
  if (lower.includes('certif')) atsScore += 5;
  if (lower.includes('github') || lower.includes('leetcode')) atsScore += 5;
  if (cgpa) atsScore += 3;
  atsScore = Math.min(97, Math.max(30, atsScore));

  const missingSections: string[] = [];
  if (!lower.includes('certif')) missingSections.push('Certifications');
  if (!lower.includes('intern') && !lower.includes('experience')) missingSections.push('Internship / Work Experience');
  if (!lower.includes('leetcode') && !lower.includes('github') && !lower.includes('coding')) missingSections.push('Coding Profiles (GitHub/LeetCode)');
  if (!lower.includes('achiev') && !lower.includes('award') && !lower.includes('hackathon')) missingSections.push('Achievements & Awards');

  const strengths: string[] = [];
  if (foundSkills.length >= 5) strengths.push(`Diverse technical stack: ${foundSkills.slice(0, 4).join(', ')}`);
  else if (foundSkills.length > 0) strengths.push(`Core skills present: ${foundSkills.join(', ')}`);
  if (verbMatches.length >= 3) strengths.push(`Strong use of action verbs: ${verbMatches.slice(0, 3).join(', ')}`);
  if (hasMetrics) strengths.push('Quantified achievements with measurable impact metrics');
  if (lower.includes('intern')) strengths.push('Industry internship experience demonstrated');
  if (strengths.length === 0) strengths.push('Resume submitted for analysis — add more technical content for stronger signals');

  const suggestions: string[] = [];
  if (!hasMetrics) suggestions.push('Add quantifiable metrics to project outcomes (e.g., "Reduced load time by 40%", "Handled 10K daily requests")');
  if (verbMatches.length < 3) suggestions.push('Begin each project/experience bullet with a strong action verb (Architected, Optimized, Deployed, Automated)');
  if (missingSections.length > 0) suggestions.push(`Add missing sections: ${missingSections.slice(0, 2).join(', ')}`);
  if (foundSkills.length < 5) suggestions.push('Expand the Skills section with specific technologies, tools, and platforms you have used');

  // Extract project titles from text
  const projectMatches = text.match(/(?:project[s]?[:\s]+|•\s*)([A-Z][\w\s\-&]+?)(?:\n|\||–|-|using|tech)/gi) || [];
  const extractedProjects = projectMatches.slice(0, 3).map(m => ({
    title: m.replace(/project[s]?[:\s]*/i, '').replace(/[\n|–\-].*/, '').trim(),
    techStack: frameworks.slice(0, 2),
    description: 'Project extracted from resume text'
  })).filter(p => p.title.length > 3);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/\+?[0-9][\d\s\-().]{8,}[0-9]/);
  const nameLines = text.split('\n').filter(l => l.trim().length > 2 && l.trim().length < 50);

  return {
    parsedData: {
      fullName: nameLines[0]?.trim() || 'Candidate',
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      education: lower.includes('b.tech') || lower.includes('b.e') || lower.includes('bachelor')
        ? ['B.Tech / B.E — extracted from resume']
        : lower.includes('m.tech') || lower.includes('master') ? ['M.Tech — extracted from resume'] : [],
      cgpa,
      skills: foundSkills.map(s => s.toUpperCase()),
      programmingLanguages: progLangs.map(p => p.toUpperCase()),
      frameworks: frameworks.map(f => f.toUpperCase()),
      projects: extractedProjects.length > 0 ? extractedProjects : [],
      internships: lower.includes('intern') ? ['Internship experience detected — see resume for details'] : [],
      certifications: lower.includes('certif') ? ['Certification detected — see resume for details'] : [],
      achievements: lower.includes('achiev') || lower.includes('award') || lower.includes('hackathon')
        ? ['Achievement detected — see resume for details'] : [],
      codingProfiles: [
        ...(lower.includes('github') ? ['GitHub'] : []),
        ...(lower.includes('leetcode') ? ['LeetCode'] : []),
        ...(lower.includes('codechef') ? ['CodeChef'] : []),
        ...(lower.includes('codeforces') ? ['Codeforces'] : []),
      ],
      experienceYears: lower.includes('intern') ? 1 : 0,
    },
    atsScore,
    qualityReport: {
      resumeQuality: atsScore >= 80 ? `Strong resume with ${foundSkills.length} technical skills and ${verbMatches.length} action verbs detected`
        : atsScore >= 60 ? `Moderate resume — ${foundSkills.length} skills found, needs more quantified impact`
        : `Weak resume signals — only ${foundSkills.length} skills detected, significant improvements needed`,
      atsCompatibility: atsScore >= 75 ? 'High ATS compatibility — standard section headers and keyword density detected'
        : atsScore >= 55 ? 'Moderate ATS compatibility — some keywords present but formatting may reduce parse accuracy'
        : 'Low ATS compatibility — missing key sections and insufficient technical keywords',
      technicalStrengths: strengths,
      weakAreas: suggestions.slice(0, 2),
      missingSections,
      grammarScore: Math.min(97, Math.max(40, 60 + verbMatches.length * 5 + (hasMetrics ? 10 : 0))),
      formattingFeedback: missingSections.length === 0
        ? 'All major resume sections detected. Ensure consistent font sizes and bullet point alignment.'
        : `Missing sections detected: ${missingSections.join(', ')}. Add these to improve ATS parsing.`,
      suggestions,
    },
  };
}
