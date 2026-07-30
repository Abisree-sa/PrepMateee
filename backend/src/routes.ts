import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from './middleware/auth.middleware';
import { requireRoles } from './middleware/rbac.middleware';

import { registerStudent, loginUser, logoutUser, getCurrentUser } from './modules/auth/auth.controller';
import { uploadAndAnalyzeResume, getStudentResume, getSkillGapForCompany } from './modules/resume/resume.controller';
import {
  createAssessment,
  getAssignedAssessmentsForStudent,
  getAssessmentById,
  updateAssessmentHeartbeat,
  submitAssessment,
  generateCodingQuestionApi,
  getCodingPresetApi,
  runStudentCodeApi,
} from './modules/assessment/assessment.controller';
import {
  startMockInterview,
  processInterviewTurn,
  evaluateInterview,
  getStudentInterviewHistory,
} from './modules/interview/interview.controller';
import {
  getCoordinatorAnalytics,
  getStudentListForCoordinator,
  getLiveAssessmentMonitoring,
  getProctoringAudits,
  getAllDepartments,
} from './modules/coordinator/coordinator.controller';
import { getStudentDashboard, askCompanyPrep, getNotifications, markNotificationRead } from './modules/student/student.controller';
import { uploadMaterial, getMaterials, getMaterialById } from './modules/materials/materials.controller';
import {
  connectCodingProfiles,
  getPersonalizedRecommendations,
  getCareerTrackMatch,
} from './modules/profile/codingProfile.controller';
import {
  createHackathon,
  getHackathons,
  getHackathonById,
} from './modules/hackathon/hackathon.controller';
import {
  createPlacementOpportunity,
  getPlacementOpportunities,
  logPlacementApply,
  deletePlacementOpportunity,
} from './modules/placement/placement.controller';

const router = Router();

// Multer storage setup for resume and materials upload
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// --- AUTH ROUTES ---
router.post('/auth/register-student', registerStudent);
router.post('/auth/login', loginUser);
router.post('/auth/logout', requireAuth, logoutUser);
router.get('/auth/me', requireAuth, getCurrentUser);

// --- STUDENT DASHBOARD & NOTIFICATIONS ---
router.get('/student/dashboard', requireAuth, requireRoles(['STUDENT']), getStudentDashboard);
router.post('/student/company-prep', requireAuth, askCompanyPrep);
router.get('/notifications', requireAuth, getNotifications);
router.post('/notifications/:id/read', requireAuth, markNotificationRead);

// --- PLACEMENT OPPORTUNITIES ROUTES ---
router.get('/placement/opportunities', requireAuth, getPlacementOpportunities);
router.post('/placement/opportunities', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), createPlacementOpportunity);
router.post('/placement/opportunities/:id/log-apply', requireAuth, requireRoles(['STUDENT']), logPlacementApply);
router.delete('/placement/opportunities/:id', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), deletePlacementOpportunity);

// --- CODING PROFILE & PERSONALIZATION ROUTES ---
router.post('/profile/connect-coding', requireAuth, requireRoles(['STUDENT']), connectCodingProfiles);
router.get('/profile/recommendations', requireAuth, requireRoles(['STUDENT']), getPersonalizedRecommendations);
router.post('/profile/career-match', requireAuth, requireRoles(['STUDENT']), getCareerTrackMatch);

// --- HACKATHONS ROUTES ---
router.get('/hackathons', requireAuth, getHackathons);
router.get('/hackathons/:id', requireAuth, getHackathonById);
router.post('/hackathons', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), createHackathon);

// --- RESUME & SKILL GAP ROUTES ---
router.post('/resume/upload', requireAuth, requireRoles(['STUDENT']), upload.single('resume'), uploadAndAnalyzeResume);
router.get('/resume/my-resume', requireAuth, requireRoles(['STUDENT']), getStudentResume);
router.post('/resume/skill-gap', requireAuth, getSkillGapForCompany);

// --- ASSESSMENT ROUTES ---
router.get('/assessments/assigned', requireAuth, requireRoles(['STUDENT']), getAssignedAssessmentsForStudent);
router.post('/assessments/generate-coding-ai', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), generateCodingQuestionApi);
router.post('/assessments/coding-preset', requireAuth, getCodingPresetApi);
router.post('/assessments/run-code', requireAuth, runStudentCodeApi);
router.get('/assessments/:id', requireAuth, getAssessmentById);
router.post('/assessments/:id/heartbeat', requireAuth, requireRoles(['STUDENT']), updateAssessmentHeartbeat);
router.post('/assessments/:id/submit', requireAuth, requireRoles(['STUDENT']), submitAssessment);

// --- PLACEMENT PREPARATION MATERIALS ROUTES ---
router.get('/materials', requireAuth, getMaterials);
router.get('/materials/:id', requireAuth, getMaterialById);
router.post('/materials/upload', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), upload.single('file'), uploadMaterial);

// --- MOCK INTERVIEW ROUTES ---
router.post('/interview/start', requireAuth, requireRoles(['STUDENT']), startMockInterview);
router.post('/interview/turn', requireAuth, requireRoles(['STUDENT']), processInterviewTurn);
router.post('/interview/evaluate', requireAuth, requireRoles(['STUDENT']), evaluateInterview);
router.get('/interview/history', requireAuth, requireRoles(['STUDENT']), getStudentInterviewHistory);

// --- COORDINATOR ADMIN ROUTES ---
router.post('/coordinator/assessments', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), createAssessment);
router.get('/coordinator/analytics', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), getCoordinatorAnalytics);
router.get('/coordinator/students', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), getStudentListForCoordinator);
router.get('/coordinator/assessments/:assessmentId/live-monitoring', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), getLiveAssessmentMonitoring);
router.get('/coordinator/proctoring-audits', requireAuth, requireRoles(['COORDINATOR', 'ADMIN']), getProctoringAudits);
router.get('/coordinator/departments', getAllDepartments);

export default router;
