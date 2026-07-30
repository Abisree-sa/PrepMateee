# 🤖 Vision & STAR Interview Evaluator Micro-Package

## Overview
Evaluates completed candidate mock interview transcripts alongside real-time vision AI tracking metrics (eye contact %, smile engagement, speaking pace) to produce a comprehensive score report.

---

## Standalone Usage
```typescript
import { evaluateInterviewSession } from './index';

const report = await evaluateInterviewSession('Q: Walk me through a project. A: I built a system...', {
  eyeContactScore: 88,
  smileEngagementScore: 82,
  speakingPaceScore: 85
});

console.log(report.overallScore); // 85
```
