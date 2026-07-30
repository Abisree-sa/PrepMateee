# 🤖 Company Skill Gap Analyzer Micro-Package

## Overview
Compares candidate skills against company-specific job expectations (e.g. Amazon, Google, Microsoft) to generate a match score, missing skills list, and checklist.

---

## Standalone Usage
```typescript
import { analyzeSkillGap } from './index';

const gap = await analyzeSkillGap('Amazon', ['Java', 'SQL', 'Algorithms']);
console.log(gap.missingSkills);
```
