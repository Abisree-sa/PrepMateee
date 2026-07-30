# 🤖 Learning Roadmap Agent Micro-Package

## Overview
Generates custom 3-week milestone roadmaps based on candidate department, skill gaps, and current performance metrics.

---

## Standalone Usage
```typescript
import { generatePersonalizedRoadmap } from './index';

const milestones = generatePersonalizedRoadmap('Information Technology', ['Java', 'SQL'], 75);
console.log(milestones);
```
