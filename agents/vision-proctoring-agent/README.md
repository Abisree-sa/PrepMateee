# 🤖 Vision AI Proctoring Audit Micro-Package

## Overview
Audits candidate assessment logs (camera snapshots, tab switching events, face loss, gaze direction) to calculate malpractice risk scores and severity ratings (**LOW, MEDIUM, HIGH, CRITICAL**).

---

## Standalone Usage
```typescript
import { evaluateProctoringLogs } from './index';

const audit = evaluateProctoringLogs([
  { event: 'TAB_SWITCH', description: 'Left window', timestamp: new Date().toISOString() }
]);

console.log(audit.malpracticeScore); // 15
console.log(audit.severity); // LOW
```
