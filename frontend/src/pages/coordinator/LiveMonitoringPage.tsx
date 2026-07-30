import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { MonitorCheck, Camera, Mic, Maximize, AlertTriangle, Clock, RefreshCw, ShieldCheck } from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveCandidates = async () => {
    try {
      const res = await apiRequest('/coordinator/assessments/ALL/live-monitoring');
      setCandidates(res.candidates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCandidates();
    const interval = setInterval(() => {
      if (autoRefresh) fetchLiveCandidates();
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MonitorCheck className="w-7 h-7 text-emerald-400" />
            Live Assessment <span className="gradient-text">Real-Time Monitoring</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time candidate camera, microphone, full-screen mode, progress & malpractice telemetry feed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              autoRefresh
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Live Auto-Sync Active (4s)' : 'Auto-Sync Paused'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-emerald-400 font-semibold">Syncing Candidate Telemetry Feed...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
          <h3 className="text-base font-bold text-white">No Active Assessment Sessions</h3>
          <p className="text-xs text-slate-400">There are currently no candidates actively attempting scheduled assessments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand.submissionId}
              className={`glass-panel p-6 rounded-3xl space-y-4 border transition-all ${
                cand.malpracticeScore > 30 ? 'border-rose-500/40 shadow-rose-950/40' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{cand.department}</span>
                  <h3 className="text-base font-bold text-white">{cand.studentName}</h3>
                  <span className="text-[11px] font-mono text-indigo-400">{cand.registerNumber}</span>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    cand.isSubmitted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                  }`}>
                    {cand.isSubmitted ? 'SUBMITTED' : 'IN PROGRESS'}
                  </span>
                </div>
              </div>

              {/* Status Badges Matrix */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-center font-bold">
                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                  cand.cameraStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Cam: {cand.cameraStatus ? 'ON' : 'OFF'}</span>
                </div>

                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                  cand.micStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Mic: {cand.micStatus ? 'ON' : 'OFF'}</span>
                </div>

                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                  cand.fullscreenStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  <Maximize className="w-3.5 h-3.5" />
                  <span>Full: {cand.fullscreenStatus ? 'YES' : 'NO'}</span>
                </div>
              </div>

              {/* Progress Bar & Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Exam Progress</span>
                  <span className="font-mono text-indigo-400">{cand.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${cand.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {cand.remainingMinutes} Mins Remaining
                </span>

                <span className={`font-bold ${cand.malpracticeScore > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  Malpractice: {cand.malpracticeScore}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
