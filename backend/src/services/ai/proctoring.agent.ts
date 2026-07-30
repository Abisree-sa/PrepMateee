export interface ProctoringEvent {
  event: 'LOOKING_AWAY' | 'MULTIPLE_FACES' | 'NO_FACE' | 'MOBILE_DETECTED' | 'TALKING_BACKGROUND_VOICE' | 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE';
  timestamp: string;
  description: string;
}

export interface ProctoringReport {
  totalEvents: number;
  malpracticeScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: Record<string, number>;
  summary: string;
  flaggedForCoordinator: boolean;
}

export function evaluateProctoringLogs(logs: ProctoringEvent[]): ProctoringReport {
  const breakdown: Record<string, number> = {};
  let totalScore = 0;

  const weights: Record<string, number> = {
    LOOKING_AWAY: 5,
    NO_FACE: 10,
    MULTIPLE_FACES: 25,
    MOBILE_DETECTED: 35,
    TALKING_BACKGROUND_VOICE: 15,
    TAB_SWITCH: 15,
    FULLSCREEN_EXIT: 10,
    COPY_PASTE: 20,
  };

  for (const item of logs) {
    breakdown[item.event] = (breakdown[item.event] || 0) + 1;
    totalScore += weights[item.event] || 10;
  }

  const malpracticeScore = Math.min(100, totalScore);

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (malpracticeScore > 70) riskLevel = 'CRITICAL';
  else if (malpracticeScore > 40) riskLevel = 'HIGH';
  else if (malpracticeScore > 20) riskLevel = 'MEDIUM';

  const flaggedForCoordinator = malpracticeScore >= 35;

  let summary = 'Clean exam attempt with minimal alerts.';
  if (riskLevel === 'CRITICAL') {
    summary = 'CRITICAL MALPRACTICE WARNING: Multiple suspicious events including tab switches, mobile phone detection, or extra face presence.';
  } else if (riskLevel === 'HIGH') {
    summary = 'HIGH RISK: Repeated tab switching and audio/gaze anomalies flagged.';
  } else if (riskLevel === 'MEDIUM') {
    summary = 'MODERATE ALERT: Minor tab navigation or gaze shifts detected.';
  }

  return {
    totalEvents: logs.length,
    malpracticeScore,
    riskLevel,
    breakdown,
    summary,
    flaggedForCoordinator,
  };
}
