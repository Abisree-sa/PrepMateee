# 🤖 AI Coding Mentor Micro-Package

## Overview
Interactive pair-programming AI agent providing progressive hints, algorithmic strategies, and Big-O time/space complexity analysis.

---

## Standalone Usage
```typescript
import { getCodingMentorAdvice } from './index';

const advice = await getCodingMentorAdvice('Two Sum', 'function twoSum(nums, target) {...}');
console.log(advice.hint);
```
