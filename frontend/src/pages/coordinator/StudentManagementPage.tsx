import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Users, Search, Building2, UserCheck, Wifi, Clock, AlertCircle } from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeptsAndStats() {
      try {
        const [deptRes, analyticsRes] = await Promise.all([
          apiRequest('/coordinator/departments'),
          apiRequest('/coordinator/analytics'),
        ]);
        setDepartments(deptRes.departments || []);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.error(err);
      }
    }
    loadDeptsAndStats();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedDept !== 'ALL') queryParams.append('departmentId', selectedDept);
      if (filterStatus !== 'ALL') queryParams.append('filterStatus', filterStatus);
      if (search) queryParams.append('search', search);

      const res = await apiRequest(`/coordinator/students?${queryParams.toString()}`);
      setStudents(res.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, filterStatus]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-400" />
          Department-Wise <span className="gradient-text">Student Management Hub</span>
        </h1>
        <p className="text-sm text-slate-400">
          Real-time roster grouped automatically by department email format (@sece.ac.in). Tracks online status, login activity, ATS scores & placement progress.
        </p>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Registered</span>
          <div className="text-2xl font-black text-white">{analytics?.totalStudents || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Students</span>
          <div className="text-2xl font-black text-emerald-400">{analytics?.totalActiveStudents || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Wifi className="w-3 h-3 text-purple-400" />
            Currently Online
          </span>
          <div className="text-2xl font-black text-purple-400">{analytics?.currentlyOnline || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Logged In Today</span>
          <div className="text-2xl font-black text-amber-400">{analytics?.loggedInToday || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Never Logged In</span>
          <div className="text-2xl font-black text-rose-400">{analytics?.neverLoggedIn || 0}</div>
        </div>
      </div>

      {/* Filter Controls & Department Selector */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDept === 'ALL'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Departments ({analytics?.totalStudents || 0})
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDept === d.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d.code}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Login Statuses</option>
              <option value="ONLINE">Currently Online</option>
              <option value="TODAY">Logged In Today</option>
              <option value="NEVER">Never Logged In</option>
            </select>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Name, email, reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Students Roster Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold uppercase text-slate-400">
                <th className="p-4 pl-6">Student Name & Reg No</th>
                <th className="p-4">Official Email</th>
                <th className="p-4 text-center">Dept & Year</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Resume & ATS</th>
                <th className="p-4 text-center">Last Login</th>
                <th className="p-4 pr-6 text-right">Readiness %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-purple-400">
                    Loading student roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No registered students found for this query.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{st.fullName}</span>
                        {st.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Online" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-purple-300">{st.registerNumber}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{st.email}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]">
                        {st.deptCode} ({st.admissionYear})
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {st.isOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${st.hasResume ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {st.hasResume ? `${st.resumeScore}/100` : 'No Resume'}
                      </span>
                    </td>
                    <td className="p-4 text-center text-[11px] text-slate-400">
                      {st.lastLoginAt ? new Date(st.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs border border-indigo-500/30">
                        {st.readinessPercentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
