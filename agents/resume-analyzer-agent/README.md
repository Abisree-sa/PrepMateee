# 🤖 ATS Resume Analyzer Micro-Package

## Overview
Parses candidate PDF/DOCX resume text, extracts core competencies, calculates ATS compatibility score (0-100), and provides actionable formatting suggestions.

---

## Standalone Usage
```typescript
import { analyzeResume } from './index';

const result = await analyzeResume('Jane Doe - Software Developer - Skills: Java, React, SQL...');
console.log(result.atsScore); // 84
```
