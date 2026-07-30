import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { ShieldAlert, AlertTriangle, Eye, Mic, MonitorX, UserX } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudits() {
      try {
        const res = await apiRequest('/coordinator/proctoring-audits');
        setAudits(res.audits || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAudits();
  }, []);

  if (loading) return <div className="p-8 text-center text-rose-400">Loading Malpractice Proctoring Logs...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
          Proctoring & Malpractice <span className="gradient-text">Audit Logs</span>
        </h1>
        <p className="text-sm text-slate-400">
          AI Proctoring detection reports flagged for coordinator review (Tab switches, background speech, face absence).
        </p>
      </div>

      {audits.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
          <ShieldAlert className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-white">Clean Exam Environment</h3>
          <p className="text-xs text-slate-400 mt-1">No flagged malpractice scores or suspicious events recorded.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {audits.map((audit) => (
            <div key={audit.submissionId} className="glass-panel p-6 rounded-3xl border border-rose-500/20 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">{audit.department}</span>
                  <h3 className="text-lg font-extrabold text-white">{audit.studentName}</h3>
                  <p className="text-xs text-slate-400">{audit.studentEmail}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase">Test Taken</span>
                    <span className="text-xs font-bold text-white">{audit.assessmentTitle}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-lg">
                    Malpractice Index: {audit.malpracticeScore}/100
                  </div>
                </div>
              </div>

              {/* Event Logs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Logged Proctoring Anomaly Events:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(audit.logEvents || []).map((ev: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 uppercase block">{ev.event}</span>
                        <p className="text-slate-400">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
