/**
 * Readiness Predictor Agent — Standalone Micro-Package
 * Calculates candidate readiness score and target company placement tier.
 */

export interface CandidateMetrics {
  resumeScore: number | null;
  avgAssessmentScore: number | null;
  mockInterviewScore: number | null;
  codingPracticeScore: number | null;
}

export interface ReadinessResult {
  readinessPercentage: number;
  tierCategory: string;
  summaryBadge: string;
  breakdown: {
    resumeWeight: number;
    assessmentWeight: number;
    interviewWeight: number;
    codingWeight: number;
  };
}

export function predictPlacementReadiness(metrics: CandidateMetrics): ReadinessResult {
  const resume = metrics.resumeScore ?? 60;
  const assessment = metrics.avgAssessmentScore ?? 65;
  const interview = metrics.mockInterviewScore ?? 60;
  const coding = metrics.codingPracticeScore ?? 50;

  const score = Math.round(
    resume * 0.25 +
    assessment * 0.35 +
    interview * 0.25 +
    coding * 0.15
  );

  let tierCategory = 'Tier 3 Mass Recruiter Readiness';
  let summaryBadge = 'Placement Warmup Phase';

  if (score >= 85) {
    tierCategory = 'Tier 1 Super Dream ($20LPA+ Amazon / Microsoft)';
    summaryBadge = 'Super Dream Candidate';
  } else if (score >= 70) {
    tierCategory = 'Tier 2 Dream ($8LPA-15LPA Product Roles)';
    summaryBadge = 'Dream Role Contender';
  }

  return {
    readinessPercentage: score,
    tierCategory,
    summaryBadge,
    breakdown: {
      resumeWeight: Math.round(resume * 0.25),
      assessmentWeight: Math.round(assessment * 0.35),
      interviewWeight: Math.round(interview * 0.25),
      codingWeight: Math.round(coding * 0.15),
    },
  };
}
