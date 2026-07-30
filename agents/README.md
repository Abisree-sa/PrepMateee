# 🤖 PrepMateee — Standalone AI Agent Micro-Packages

This directory contains the **10 Autonomous AI Agents** powering the PrepMateee platform. Each agent is structured as an **independent, modular micro-package** with its own standalone implementation, prompt configuration, type definitions, and documentation.

---

## 📦 Directory of AI Agent Micro-Packages

| # | Agent Name | Micro-Package Directory | Core Capability |
| :- | :--- | :--- | :--- |
| **1** | **Placement Readiness Predictor** | [`agents/readiness-predictor-agent/`](./readiness-predictor-agent) | Predicts candidate readiness % and company tier placement readiness. |
| **2** | **AI Mock Interviewer** | [`agents/mock-interview-agent/`](./mock-interview-agent) | Simulates real-time technical and STAR behavioral interview rounds. |
| **3** | **Vision & STAR Interview Evaluator** | [`agents/interview-evaluator-agent/`](./interview-evaluator-agent) | Evaluates interview transcripts and vision AI eye contact/expression tracking. |
| **4** | **ATS Resume Analyzer** | [`agents/resume-analyzer-agent/`](./resume-analyzer-agent) | Parses PDF resumes and generates ATS scores with formatting recommendations. |
| **5** | **Company Skill Gap Analyzer** | [`agents/skill-gap-agent/`](./skill-gap-agent) | Compares candidate profile against target company requirements (Amazon, Microsoft, etc.). |
| **6** | **AI Coding Mentor** | [`agents/coding-mentor-agent/`](./coding-mentor-agent) | Interactive pair-programming mentor for algorithmic hints and Big-O analysis. |
| **7** | **LeetCode Question Builder** | [`agents/leetcode-question-builder-agent/`](./leetcode-question-builder-agent) | Generates coding problems with multi-language starter templates & test cases. |
| **8** | **Company Tagged Query Agent** | [`agents/company-prep-agent/`](./company-prep-agent) | Analyzes student queries to generate company-tagged problem roadmaps. |
| **9** | **Personalized Learning Roadmap** | [`agents/learning-roadmap-agent/`](./learning-roadmap-agent) | Builds 3-week milestone learning paths based on candidate weaknesses. |
| **10**| **Vision AI Proctoring Audit** | [`agents/vision-proctoring-agent/`](./vision-proctoring-agent) | Audits exam snapshots & tab switches to generate malpractice risk scores. |

---

Each agent folder can be reviewed, executed, or exported as a standalone microservice.
