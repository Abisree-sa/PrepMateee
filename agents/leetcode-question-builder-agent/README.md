# 🤖 LeetCode Question Builder Micro-Package

## Overview
Generates LeetCode-style coding assessment problems complete with multi-language starter templates (Java, Python, C++, JavaScript), problem constraints, sample test cases, and hidden evaluation test cases.

---

## Standalone Usage
```typescript
import { generateCodingQuestion } from './index';

const q = await generateCodingQuestion('Dynamic Programming', 'Medium');
console.log(q.title);
console.log(q.starterTemplates.java);
```
