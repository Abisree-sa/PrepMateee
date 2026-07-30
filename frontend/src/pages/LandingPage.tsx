import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, BrainCircuit, Mic, CheckSquare, Target,
  Shield, BarChart3, Code2, Building, ArrowRight, Github,
  Zap, Award, Users, BookOpen, ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    color: 'indigo',
    title: 'AI Resume Analyzer',
    desc: 'Upload your PDF resume and get an instant ATS score, grammar analysis, technical strength audit, and personalized improvement suggestions — all powered by Gemini AI.',
  },
  {
    icon: Target,
    color: 'emerald',
    title: 'Company Benchmark Analysis',
    desc: 'Compare your skills against Amazon, Google, Microsoft, Zoho and more. Get a unique match percentage, missing skills list, and a 4-week preparation roadmap per company.',
  },
  {
    icon: BrainCircuit,
    color: 'purple',
    title: 'Company Prep AI Assistant',
    desc: 'Ask anything — "Give me Amazon Graph questions", "Show LinkedIn tagged LeetCode problems". Get 5–8 tagged problems with difficulty, approach, and code snippets instantly.',
  },
  {
    icon: Mic,
    color: 'rose',
    title: 'AI Mock Interview Suite',
    desc: 'Live webcam interview with AI voice questions (TTS), voice response input, real-time transcript, interview timer, and a full evaluation report after each session.',
  },
  {
    icon: CheckSquare,
    color: 'amber',
    title: 'Proctored Coding Assessments',
    desc: 'LeetCode-style coding editor with syntax highlighting, test case runner, and MCQ support. Full AI proctoring with webcam, mic, and tab-switch detection.',
  },
  {
    icon: Code2,
    color: 'cyan',
    title: 'Daily Coding Suggestions',
    desc: 'Connect your GitHub and LeetCode profiles. Get AI-curated daily problem recommendations based on your weak areas, solved history, and target company patterns.',
  },
  {
    icon: BarChart3,
    color: 'violet',
    title: 'Placement Readiness Score',
    desc: 'Your readiness is calculated from real activity — resume score, assessment performance, and mock interview results. No fabricated metrics, ever.',
  },
  {
    icon: Shield,
    color: 'slate',
    title: 'AI Exam Proctoring',
    desc: 'Vision AI monitors eye contact, face presence, mobile detection, and tab switches during assessments. Malpractice reports are auto-generated for coordinators.',
  },
];

const stats = [
  { value: '11', label: 'AI Agents', icon: Sparkles },
  { value: '6+', label: 'Target Companies', icon: Building },
  { value: '100%', label: 'Dynamic Analysis', icon: Zap },
  { value: '0', label: 'Fake Scores', icon: Award },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">PrepMate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/student/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/student/register"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Placement Preparation Platform
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Land Your Dream Job with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Driven Prep
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Resume analysis, company benchmarking, LeetCode-style assessments, AI mock interviews,
            and real-time placement readiness — all in one intelligent platform built for campus placements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/student/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-2xl shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Start Preparing Free
            </Link>
            <Link
              to="/student/login"
              className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              Sign In to Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative z-10 mt-16 max-w-5xl mx-auto">
          <div className="glass-panel rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
                  <Icon className="w-5 h-5 text-indigo-400 mx-auto" />
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-slate-400 font-semibold">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl font-extrabold text-white">Everything You Need to Get Placed</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every feature is powered by real AI — no templates, no fake scores, no repeated responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all group space-y-4"
              >
                <div className={`w-11 h-11 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl font-extrabold text-white">From Zero to Placement-Ready</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: FileText,
                title: 'Upload Your Resume',
                desc: 'Get an instant AI-powered ATS score, skill extraction, and company-specific gap analysis in seconds.',
              },
              {
                step: '02',
                icon: Code2,
                title: 'Practice & Assess',
                desc: 'Attempt proctored LeetCode-style coding assessments and get daily AI-curated problem suggestions.',
              },
              {
                step: '03',
                icon: Mic,
                title: 'Ace the Interview',
                desc: 'Practice with the AI mock interviewer using voice and webcam. Get a detailed evaluation report after every session.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <span className="text-5xl font-black text-slate-800 absolute top-4 right-6">{step}</span>
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Integrations</span>
            <h2 className="text-4xl font-extrabold text-white">Connect Your Coding Profiles</h2>
            <p className="text-slate-400">
              Link your GitHub and LeetCode accounts to unlock personalized daily problem suggestions
              based on your actual solved history and weak topics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 w-full sm:w-auto">
              <Github className="w-10 h-10 text-white" />
              <div className="text-left">
                <div className="text-sm font-bold text-white">GitHub Profile</div>
                <div className="text-xs text-slate-400">Track your project activity</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 w-full sm:w-auto">
              <Code2 className="w-10 h-10 text-amber-400" />
              <div className="text-left">
                <div className="text-sm font-bold text-white">LeetCode Profile</div>
                <div className="text-xs text-slate-400">Sync solved problems & streaks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Coordinators */}
      <section className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">For Placement Coordinators</span>
              <h2 className="text-3xl font-extrabold text-white">Full Control Over Placement Activities</h2>
              <ul className="space-y-3">
                {[
                  'Create and schedule proctored assessments for specific departments',
                  'Monitor live exam sessions with real-time camera and tab-switch alerts',
                  'Review AI-generated malpractice reports and proctoring audit logs',
                  'Track student placement readiness across the entire batch',
                  'Upload study materials and resources for students',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm hover:bg-amber-500/20 transition-all"
              >
                <Users className="w-4 h-4" />
                Coordinator Sign In
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Live Monitoring', icon: Shield, color: 'rose' },
                { label: 'Assessment Builder', icon: CheckSquare, color: 'indigo' },
                { label: 'Student Analytics', icon: BarChart3, color: 'emerald' },
                { label: 'Proctoring Audit', icon: BookOpen, color: 'amber' },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3`}>
                  <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                  </div>
                  <span className="text-xs font-bold text-slate-300 block">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-white">
              Ready to Get{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Placement-Ready?
              </span>
            </h2>
            <p className="text-slate-400">
              Register with your college email and start your AI-powered placement journey today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/student/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-2xl shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Create Free Account
            </Link>
            <Link
              to="/student/login"
              className="px-8 py-4 rounded-2xl border border-slate-700 hover:border-slate-600 text-slate-300 font-bold text-sm transition-all"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-400">PrepMate</span>
            <span>— AI Placement Preparation Platform</span>
          </div>
          <span>Built with Gemini AI · React · Node.js · Prisma</span>
        </div>
      </footer>
    </div>
  );
};
