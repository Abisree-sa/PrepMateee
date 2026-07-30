# 🤖 Code Evaluator Micro-Package

## Overview
Executes candidate solution code against test cases, captures stdout, checks compilation/runtime errors, and measures execution time (ms) and memory usage (MB).

---

## Standalone Usage
```typescript
import { evaluateStudentCode } from './index';

const res = await evaluateStudentCode(
  'function twoSum(nums, target) { return [0, 1]; }',
  'javascript',
  [{ input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false }]
);

console.log(res.verdict); // Accepted
```
