# 🤖 Company Tagged Query Agent Micro-Package

## Overview
Analyzes candidate natural language queries (e.g. *"give me 10 array problems for Amazon"*) to identify requested company, topic, intent, and generate targeted problem roadmaps.

---

## Standalone Usage
```typescript
import { askCompanyPrepAgent } from './index';

const res = await askCompanyPrepAgent('need 10 array problems for Amazon');
console.log(res.detectedCompany); // Amazon
```
