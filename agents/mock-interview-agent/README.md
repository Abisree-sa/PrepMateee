# 🤖 AI Mock Interviewer Micro-Package

## Overview
The **AI Mock Interviewer Micro-Package** conducts interactive, multi-turn technical and HR interview rounds tailored to company profiles (e.g. Amazon, Microsoft) powered by Google Gemini 2.0.

---

## Standalone Usage
```typescript
import { generateInterviewQuestion } from './index';

const turn = await generateInterviewQuestion(
  'Software Engineer SDE-1',
  'Amazon',
  1
);

console.log(turn.question);
```
