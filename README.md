# 🚀 PrepMateee — Enterprise AI-Powered Campus Placement & Assessment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TypeScript-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Prisma-339933)](https://nodejs.org/)
[![AI Powered](https://img.shields.io/badge/AI Engine-Google%20Gemini%202.0-8E44AD)](https://ai.google.dev/)

**PrepMateee** is an end-to-end, production-ready enterprise campus placement preparation, automated coding assessment, AI mock interview, and automated proctoring platform tailored for educational institutions.

---

## 🌟 Key Features & Modules

### 1. 💻 Enterprise LeetCode-Style Assessment IDE Workspace
- **2-Column Split Workspace**: Problem description, constraints, input/output format, sample test cases, and multi-language code editor (Java, Python, C++, C, JavaScript).
- **Multi-Question Tabs ($Q_1, Q_2, \dots, Q_N$)**: Seamlessly switch between assessment questions with independent state saving and automatic `localStorage` draft recovery.
- **Empty Solution Guard**: Prevents invalid or blank code submission with clear feedback.
- **Sample vs Hidden Test Cases Evaluation**: Run solution against visible sample test cases before submitting against hidden evaluation test cases.
- **Automated Hardware Teardown**: Immediately terminates webcam & microphone media streams (`stream.getTracks().forEach(track => track.stop())`) upon assessment completion or exit.

### 2. ⚡ Connected Coding Profile Analytics & Sync
- **URL & Handle Auto-Extraction**: Accepts raw usernames or full URLs (e.g. `https://github.com/username` or `https://leetcode.com/u/username/`).
- **Multi-Endpoint Fallback Engine**: Fetches verified public stats using multiple API fallbacks to ensure 100% connection reliability without rate-limit failures.
- **Verified LeetCode Analytics**: Real-time problem breakdown (Easy, Medium, Hard progress bars), global ranking, acceptance rate, and reputation points.
- **GitHub Repository & Tech Stack Insights**: Primary programming languages breakdown, detected technology stack tags (`#react`, `#express`, `#prisma`), project complexity overview, star & fork counts.

### 3. 🎙️ AI Mock Interview Simulator & STAR Evaluation
- **Realistic Technical & HR Interview Rounds**: Conversational AI interviewer powered by Google Gemini 2.0.
- **Vision AI Eye Contact & Expression Tracking**: Tracks eye contact percentage, facial engagement, speaking pace, and voice clarity in real-time.
- **Comprehensive Candidate Report**: Radar chart visualization of technical skills, problem solving, HR confidence, STAR methodology adherence, and personalized 3-week learning roadmap.

### 4. 📄 ATS Resume Analyzer & Skill Gap Engine
- **Instant ATS Scoring**: Analyzes uploaded PDF/DOCX resumes for formatting, keyword match, project complexity, and section layout.
- **Company-Specific Skill Gap Analysis**: Compare candidate resume against target companies (e.g. Amazon, Microsoft, Google) and generate actionable preparation checklists.

### 5. 📢 Campus Placement Drives & Notice Board
- **Coordinator Placement Manager (`/coordinator/placements`)**: Publish job drives with company logo, eligibility criteria, minimum CGPA, eligible departments, salary/stipend package, selection process, and application deadline.
- **Student Placement Drives Hub (`/student/placements`)**: Search, filter by department/salary, view eligibility status, download attachments, and log job applications.

### 6. 🏆 Hackathon Management Module
- **Coordinator Hackathon Publisher (`/coordinator/hackathons`)**: Create national/campus hackathons with prizes, deadlines, and registration links.
- **Student Hackathons Hub (`/student/hackathons`)**: Browse upcoming coding contests and hackathons.
- **Automated Notification Dispatcher**: Automatically pushes high-priority notifications to registered students whenever a new placement drive or hackathon is announced.

### 7. 🔔 Interactive Campus Announcements & Notifications
- **Navbar Notification Bell Popover**: Displays unread notification count badge with one-click mark-as-read and direct action links.
- **Dashboard Bulletin Banner**: Top-of-dashboard announcements banner highlighting urgent campus placement notices.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM |
| **Database** | SQLite (`dev.db`) |
| **AI Agents** | Google Gemini 2.0 Flash API (`@google/genai`) |
| **Authentication** | JWT Authentication with RBAC (`STUDENT`, `COORDINATOR`, `ADMIN`) |

---

## 🔐 Institutional Constraints & Login Credentials

> **Domain Restriction**: All official student and coordinator email addresses must end with **`@sece.ac.in`**.

### Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Placement Coordinator** | `coordinator@sece.ac.in` | `admin123` |
| **Student User** | `abisree.tm2024it@sece.ac.in` | `student123` |

---

## 🚦 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone Repository
```bash
git clone https://github.com/Abisree-sa/PrepMateee.git
cd PrepMateee
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Setup Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key-prepmateee-2026"
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 4. Initialize Database & Seed Demo Data
```bash
cd backend
npx prisma db push
npx ts-node src/seed.ts
cd ..
```

### 5. Launch Development Servers
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

---

## 📁 Repository Project Structure

```
PrepMateee/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, PlacementOpportunity, Hackathon, Assessment, etc.)
│   │   └── dev.db              # SQLite Database
│   ├── src/
│   │   ├── config/             # Prisma & Environment config
│   │   ├── middleware/         # Auth JWT & RBAC middleware
│   │   ├── modules/            # Assessment, Placement, Profile, Hackathon, Resume controllers
│   │   ├── services/ai/        # Gemini AI agent clients (Resume, Interview, Proctoring, Readiness)
│   │   ├── routes.ts           # Central Express routing table
│   │   └── server.ts           # Express HTTP Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout (Navbar, Sidebar), StatCard, ExamProctorOverlay
│   │   ├── pages/
│   │   │   ├── auth/           # Login & Registration pages
│   │   │   ├── coordinator/    # Placement Manager, Hackathon Manager, Live Monitoring, Audit
│   │   │   └── student/        # Student Dashboard, Assessment IDE, Placement Drives, Hackathons
│   │   ├── services/           # Fetch API utility
│   │   └── App.tsx             # React Router configuration
└── package.json                # Main workspace scripts
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
