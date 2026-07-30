/**
 * Vision AI Proctoring Agent — Standalone Micro-Package
 * Audits assessment events, camera status, and tab switches to generate malpractice risk scores.
 */

export interface ProctorEvent {
  event: string;
  description: string;
  timestamp: string;
}

export interface ProctoringAuditResult {
  malpracticeScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  auditSummary: string;
  flaggedEventsCount: number;
}

export function evaluateProctoringLogs(logs: ProctorEvent[]): ProctoringAuditResult {
  let score = 0;

  logs.forEach((l) => {
    if (l.event === 'TAB_SWITCH') score += 15;
    if (l.event === 'MULTIPLE_FACES_DETECTED') score += 35;
    if (l.event === 'NO_FACE_DETECTED') score += 20;
    if (l.event === 'LOOKING_AWAY') score += 10;
  });

  const malpracticeScore = Math.min(100, score);
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  if (malpracticeScore >= 70) severity = 'CRITICAL';
  else if (malpracticeScore >= 45) severity = 'HIGH';
  else if (malpracticeScore >= 20) severity = 'MEDIUM';

  return {
    malpracticeScore,
    severity,
    auditSummary: `Logged ${logs.length} proctoring events during candidate assessment. Risk rating: ${severity}.`,
    flaggedEventsCount: logs.length,
  };
}
