export interface PlacementReadinessMetrics {
  resumeScore: number | null;
  avgAssessmentScore: number | null;
  mockInterviewScore: number | null;
  codingPracticeScore: number | null;
}

export interface ReadinessPredictionResult {
  readinessPercentage: number;
  tierCategory: string;
  readinessLevel: 'High Placement Probability' | 'Moderate Placement Probability' | 'Requires Targeted Practice';
  componentStatus: {
    resumeStatus: string;
    assessmentStatus: string;
    interviewStatus: string;
  };
}

export function predictPlacementReadiness(metrics: PlacementReadinessMetrics): ReadinessPredictionResult {
  const { resumeScore, avgAssessmentScore, mockInterviewScore, codingPracticeScore } = metrics;

  let totalWeight = 0;
  let weightedSum = 0;

  if (resumeScore !== null && resumeScore > 0) {
    weightedSum += resumeScore * 0.25;
    totalWeight += 0.25;
  }

  if (avgAssessmentScore !== null && avgAssessmentScore > 0) {
    weightedSum += avgAssessmentScore * 0.35;
    totalWeight += 0.35;
  }

  if (mockInterviewScore !== null && mockInterviewScore > 0) {
    weightedSum += mockInterviewScore * 0.25;
    totalWeight += 0.25;
  }

  if (codingPracticeScore !== null && codingPracticeScore > 0) {
    weightedSum += codingPracticeScore * 0.15;
    totalWeight += 0.15;
  }

  // Calculate percentage dynamically from attempted components
  const readinessPercentage = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  let tierCategory = 'Mass Recruiter (5-10 LPA)';
  let readinessLevel: 'High Placement Probability' | 'Moderate Placement Probability' | 'Requires Targeted Practice' = 'Requires Targeted Practice';

  if (readinessPercentage >= 85) {
    tierCategory = 'Dream Companies (30+ LPA)';
    readinessLevel = 'High Placement Probability';
  } else if (readinessPercentage >= 72) {
    tierCategory = 'Tier 1 Product Companies (18-30 LPA)';
    readinessLevel = 'High Placement Probability';
  } else if (readinessPercentage >= 60) {
    tierCategory = 'Tier 2 Product Companies (10-18 LPA)';
    readinessLevel = 'Moderate Placement Probability';
  }

  return {
    readinessPercentage,
    tierCategory,
    readinessLevel,
    componentStatus: {
      resumeStatus: resumeScore !== null && resumeScore > 0 ? `${resumeScore}/100 ATS` : 'Pending Upload',
      assessmentStatus: avgAssessmentScore !== null && avgAssessmentScore > 0 ? `${Math.round(avgAssessmentScore)}% Avg` : 'Pending Attempt',
      interviewStatus: mockInterviewScore !== null && mockInterviewScore > 0 ? `${Math.round(mockInterviewScore)}/100 Evaluated` : 'Pending Attempt',
    },
  };
}
