import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const StudentRegister: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  // Real-time extracted info preview
  const parseEmailPreview = (inputEmail: string) => {
    const clean = inputEmail.trim().toLowerCase();
    if (!clean.endsWith('@sece.ac.in')) return null;
    const local = clean.replace('@sece.ac.in', '');
    const match = local.match(/^([a-z0-9._]+?)(\d{4})([a-z]+)$/i);
    if (match) {
      const rawName = match[1];
      const year = match[2];
      const deptCode = match[3].toUpperCase();
      const name = rawName.split(/[._]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      return { name, year, deptCode };
    }
    return null;
  };

  const preview = parseEmailPreview(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerStudent(email, password);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Student Portal <span className="gradient-text">Registration</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Exclusive access for verified college students (@sece.ac.in)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Official College Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="abisree.tm2024it@sece.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Format: <span className="text-indigo-400 font-mono">name.deptYEAR@sece.ac.in</span>
              </p>
            </div>

            {/* AI Domain Classification Card */}
            {preview && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Auto-Classification Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 font-medium">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Student Name</span>
                    <span>{preview.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Department</span>
                    <span className="text-indigo-300 font-bold">{preview.deptCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Admission Year</span>
                    <span>{preview.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Role assigned</span>
                    <span className="text-emerald-400">STUDENT</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/student/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In to Portal
            </Link>
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <Link to="/admin/login" className="text-purple-400 text-xs font-medium hover:underline flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Placement Coordinator Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
