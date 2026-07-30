import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import {
  Users,
  CheckSquare,
  FileText,
  Mic,
  PlusSquare,
  ShieldAlert,
  Building2,
  TrendingUp,
  Award,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/coordinator/analytics');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-purple-400">Loading Coordinator Analytics Hub...</div>;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/20 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3">
              Placement Coordinator Hub
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Campus Placement <span className="gradient-text">Management Console</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Oversee departmental assessments, AI resume audits, mock interview reports & malpractice audits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/coordinator/assessment-builder"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Create New Assessment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Aggregate Stat Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Registered Students" value={data?.totalStudents || 0} icon={Users} color="indigo" />
        <StatCard title="Active Assessments" value={data?.totalAssessments || 0} icon={CheckSquare} color="emerald" />
        <StatCard title="Parsed Resumes" value={data?.totalResumes || 0} icon={FileText} color="purple" />
        <StatCard title="Completed AI Interviews" value={data?.totalInterviews || 0} icon={Mic} color="amber" />
      </div>

      {/* Averages Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch Average ATS Score</span>
          <div className="text-3xl font-black text-indigo-400">{data?.avgAtsScore || 0} / 100</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch Assessment Average</span>
          <div className="text-3xl font-black text-emerald-400">{data?.avgAssessmentScore || 0}%</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch Interview Score</span>
          <div className="text-3xl font-black text-purple-400">{data?.avgInterviewScore || 0} / 100</div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Departmental Breakdown & Enrolments
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Active College Departments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.deptStats || []).map((dept: any) => (
            <div key={dept.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                  {dept.code}
                </span>
                <span className="text-xs text-slate-400">{dept.studentCount} Students</span>
              </div>
              <h4 className="text-sm font-bold text-white">{dept.name}</h4>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                <span>Assigned Tests:</span>
                <span className="font-bold text-indigo-400">{dept.assessmentCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
