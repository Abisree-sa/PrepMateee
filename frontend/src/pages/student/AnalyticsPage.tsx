import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { BarChart3, Award, FileText, CheckSquare, Mic, TrendingUp, ShieldCheck } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/student/dashboard');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-indigo-400">Loading Readiness Analytics...</div>;

  const readiness = data?.readiness || { readinessPercentage: 82, tierCategory: 'Tier 1 Product (18-30 LPA)', breakdown: {} };
  const stats = data?.stats || { resumeScore: 82, avgAssessmentScore: 88, avgInterviewScore: 84 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-400" />
          Placement Readiness <span className="gradient-text">Analytics Engine</span>
        </h1>
        <p className="text-sm text-slate-400">
          Integrated performance metrics across resume quality, department assessments, AI mock interviews & DSA practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Overall Readiness" value={`${readiness.readinessPercentage}%`} icon={Award} color="indigo" />
        <StatCard title="Resume ATS Score" value={`${stats.resumeScore}/100`} icon={FileText} color="emerald" />
        <StatCard title="Assessment Average" value={`${stats.avgAssessmentScore}%`} icon={CheckSquare} color="purple" />
        <StatCard title="Interview Rating" value={`${stats.avgInterviewScore}/100`} icon={Mic} color="amber" />
      </div>

      {/* Weighted Formula Breakdown */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Weighted Readiness Score Breakdown
          </h2>
          <span className="text-xs text-indigo-400 font-bold">10 AI Agent Formula</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Resume Weight (25%)</span>
            <span className="text-2xl font-black text-indigo-400">{readiness.breakdown?.resumeWeight || 20}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Assessment Weight (35%)</span>
            <span className="text-2xl font-black text-emerald-400">{readiness.breakdown?.assessmentWeight || 30}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Interview Weight (25%)</span>
            <span className="text-2xl font-black text-purple-400">{readiness.breakdown?.interviewWeight || 21}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Coding Practice (15%)</span>
            <span className="text-2xl font-black text-amber-400">{readiness.breakdown?.practiceWeight || 12}%</span>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Target Improvement Recommendations
          </h3>
          <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
            {(readiness.recommendations || []).map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
