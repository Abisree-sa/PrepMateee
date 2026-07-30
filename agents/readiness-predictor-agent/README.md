# 🤖 Readiness Predictor Agent Micro-Package

## Overview
The **Readiness Predictor Agent** calculates candidate placement readiness percentages and categorizes candidates into target tier categories (**Tier 1 Super Dream**, **Tier 2 Dream**, **Tier 3 Mass Recruiter**) based on weighted resume, assessment, interview, and coding practice scores.

---

## Capabilities
- Weighted Multi-Factor Calculation (Resume 25%, Assessment 35%, Mock Interview 25%, Coding Practice 15%)
- Dynamic Company Tier Rerouting
- Breakdown Insights

---

## Standalone Usage
```typescript
import { predictPlacementReadiness } from './index';

const result = predictPlacementReadiness({
  resumeScore: 85,
  avgAssessmentScore: 90,
  mockInterviewScore: 82,
  codingPracticeScore: 78
});

console.log(result.readinessPercentage); // 84
console.log(result.tierCategory); // Tier 1 Super Dream
```
