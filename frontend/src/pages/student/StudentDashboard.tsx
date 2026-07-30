import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import {
  FileText, CheckSquare, Mic, Award, ArrowUpRight, BrainCircuit,
  Sparkles, Target, Clock, Compass, Github, Code2, ExternalLink,
  CheckCircle, Zap, Save, Trophy, Flame, Star, GitFork, RotateCcw, AlertTriangle, Briefcase, Link2, Layers, Cpu, Megaphone, Bell
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyRecs, setDailyRecs] = useState<any>(null);
  const [careerTracks, setCareerTracks] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Profile connect state
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadPersonalizedData();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await apiRequest('/student/dashboard');
      setData(res);
      if (res.studentInfo) {
        setGithubUsername(res.studentInfo.githubUsername || '');
        setLeetcodeUsername(res.studentInfo.leetcodeUsername || '');
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalizedData = async () => {
    setRecsLoading(true);
    try {
      const [recsRes, careerRes] = await Promise.all([
        apiRequest('/profile/recommendations'),
        apiRequest('/profile/career-match', { method: 'POST' }),
      ]);
      setDailyRecs(recsRes);
      setCareerTracks(careerRes.careerTracks || []);
    } catch (err) {
      console.error('Failed to load personalized recommendations:', err);
    } finally {
      setRecsLoading(false);
    }
  };

  const handleSaveProfiles = async () => {
    if (!githubUsername && !leetcodeUsername) return;
    setProfileSaving(true);
    try {
      const res = await apiRequest('/profile/connect-coding', {
        method: 'POST',
        body: JSON.stringify({ githubUsername, leetcodeUsername }),
      });
      setProfileSaved(true);
      if (res.githubUsername) setGithubUsername(res.githubUsername);
      if (res.leetcodeUsername) setLeetcodeUsername(res.leetcodeUsername);

      setTimeout(() => setProfileSaved(false), 3500);
      loadDashboard();
      loadPersonalizedData();
    } catch (err: any) {
      alert(err.message || 'Profile sync failed');
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-400 font-semibold animate-pulse">
        Initializing AI Placement Engine & Personalization System...
      </div>
    );
  }

  const readiness = data?.readiness || {
    readinessPercentage: null,
    tierCategory: 'Insufficient Data',
    summaryBadge: 'No Activity Yet',
  };
  const metrics = data?.metrics || { resumeAtsScore: null, avgAssessmentScore: null, avgInterviewScore: null, completedAssessments: 0, completedInterviews: 0 };
  const codingStats = data?.codingProfileData;
  const ghStats = codingStats?.github;
  const lcStats = codingStats?.leetcode;
  const announcements = data?.announcements || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {readiness.summaryBadge}
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Placement Readiness:{' '}
              {readiness.readinessPercentage !== null ? (
                <span className="gradient-text">{readiness.readinessPercentage}%</span>
              ) : (
                <span className="text-slate-400 text-2xl">Calculating...</span>
              )}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Target Tier: <strong className="text-emerald-400">{readiness.tierCategory}</strong> | AI Agent Synced
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/placements"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Placement Drives
            </Link>

            <Link
              to="/student/hackathons"
              className="px-5 py-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/30 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Hackathons
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Campus Announcements Banner */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400 animate-bounce" />
            Official Campus Placement Cell Announcements
          </h2>
          <span className="text-xs text-indigo-400 font-mono">
            Live Bulletins
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann: any, aIdx: number) => (
            <div
              key={aIdx}
              className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                ann.priority === 'HIGH'
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-300 flex items-center gap-1.5 text-sm">
                  {ann.title}
                </span>
                {ann.priority === 'HIGH' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    HIGH PRIORITY
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{ann.message}</p>

              {ann.link && (
                <div className="pt-1">
                  <Link
                    to={ann.link}
                    className="inline-flex items-center gap-1 text-indigo-400 font-bold text-xs hover:underline"
                  >
                    View Notice Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Resume ATS Score"
          value={metrics.hasResume ? `${metrics.resumeAtsScore}/100` : 'Not Uploaded'}
          subtitle={metrics.hasResume ? 'Evaluated by AI Agent' : 'Upload resume to analyze'}
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Assessment Score"
          value={metrics.completedAssessments > 0 ? `${metrics.avgAssessmentScore}%` : 'Not Attempted'}
          subtitle={`${metrics.completedAssessments} Tests Completed`}
          icon={CheckSquare}
          color="emerald"
        />
        <StatCard
          title="Mock Interview Score"
          value={metrics.completedInterviews > 0 ? `${metrics.avgInterviewScore}/100` : 'Not Attempted'}
          subtitle={`${metrics.completedInterviews} Interview Rounds`}
          icon={Mic}
          color="purple"
        />
        <StatCard
          title="Verified LeetCode Solved"
          value={lcStats?.isFound ? `${lcStats.totalSolved} Solved` : 'Not Connected'}
          subtitle={lcStats?.isFound ? `Global Rank ${lcStats.ranking}` : 'Enter LeetCode handle or URL'}
          icon={Code2}
          color="amber"
        />
      </div>

      {/* Connect Coding Profiles & Real Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-400" />
            Connect Profiles or URLs
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your GitHub / LeetCode username or paste full profile URLs (e.g. <code>https://github.com/username</code> or <code>https://leetcode.com/u/username/</code>).
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Github className="w-3.5 h-3.5" /> GitHub Username or Profile URL
              </label>
              <input
                type="text"
                placeholder="username or https://github.com/username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" /> LeetCode Username or Profile URL
              </label>
              <input
                type="text"
                placeholder="username or https://leetcode.com/u/username/"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleSaveProfiles}
              disabled={profileSaving || (!githubUsername && !leetcodeUsername)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30"
            >
              {profileSaved ? (
                <><CheckCircle className="w-4 h-4 text-emerald-400" /> Username Extracted & Synced!</>
              ) : profileSaving ? (
                'Extracting Username & Syncing APIs...'
              ) : (
                <><RotateCcw className="w-4 h-4" /> Sync & Verify Profiles</>
              )}
            </button>
          </div>

          {codingStats?.lastSyncedTime && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
              <span className="text-emerald-400 font-bold block">✓ Status: {codingStats.syncStatus || 'Connected'}</span>
              <span>Last Synced: {codingStats.lastSyncedTime}</span>
            </div>
          )}
        </div>

        {/* Real Coding Analytics Dashboard */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Verified Coding Profile Activity Analytics
            </h2>
            {codingStats && (
              <button
                onClick={handleSaveProfiles}
                disabled={profileSaving}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Retry Sync
              </button>
            )}
          </div>

          {!codingStats ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No coding profiles connected. Enter your GitHub or LeetCode username/URL to load live profile statistics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verified LeetCode Analytics Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" /> LeetCode (@{lcStats?.username || 'N/A'})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{lcStats?.ranking || 'Unranked'}</span>
                </div>

                {lcStats?.isFound ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">{lcStats.totalSolved}</span>
                      <span className="text-xs font-semibold text-slate-400">Problems Solved</span>
                    </div>

                    {/* Difficulty Distribution Bars */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-emerald-400">Easy ({lcStats.easySolved})</span>
                          <span className="text-slate-400">{lcStats.easyPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${lcStats.easyPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-amber-400">Medium ({lcStats.mediumSolved})</span>
                          <span className="text-slate-400">{lcStats.mediumPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${lcStats.mediumPct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-rose-400">Hard ({lcStats.hardSolved})</span>
                          <span className="text-slate-400">{lcStats.hardPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${lcStats.hardPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Acceptance Rate: {lcStats.acceptanceRate}</span>
                      <span>Reputation: {lcStats.reputation}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 flex items-center gap-1.5 py-4">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{lcStats?.error || 'LeetCode Profile Unavailable'}</span>
                  </div>
                )}
              </div>

              {/* Verified GitHub Analytics Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    {ghStats?.avatarUrl && (
                      <img src={ghStats.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Github className="w-4 h-4" /> GitHub (@{ghStats?.username || 'N/A'})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">{ghStats?.publicReposCount || 0} Repos</span>
                </div>

                {ghStats?.isFound ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {ghStats.totalStars} Stars
                      </span>
                      <span className="flex items-center gap-1 text-indigo-400">
                        <GitFork className="w-3.5 h-3.5" /> {ghStats.totalForks} Forks
                      </span>
                      <span className="text-slate-400">{ghStats.followers} Followers</span>
                    </div>

                    {/* Top Languages & Detected Tech Stack */}
                    {ghStats.topLanguages && ghStats.topLanguages.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Primary Languages & Tech Stack</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ghStats.topLanguages.map((lang: string, lIdx: number) => (
                            <span key={lIdx} className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                              {lang}
                            </span>
                          ))}
                          {(ghStats.detectedTechStack || []).slice(0, 4).map((tech: string, tIdx: number) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                              #{tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Public Repos list */}
                    <div className="space-y-1.5 pt-1">
                      {(ghStats.publicRepos || []).slice(0, 3).map((repo: any, idx: number) => (
                        <a
                          key={idx}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all"
                        >
                          <span className="truncate max-w-[140px]">{repo.name}</span>
                          <span className="text-[10px] text-indigo-400">{repo.language}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 flex items-center gap-1.5 py-4">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ghStats?.error || 'GitHub Profile Unavailable'}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Detailed Repository Analysis & Tech Stack Insights Card */}
      {ghStats?.isFound && (
        <div className="glass-panel p-6 rounded-3xl space-y-5 border border-indigo-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              GitHub Repository & Technology Stack Analysis Insights
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Bio: "{ghStats.bio}"
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider block">Project Complexity Overview</span>
              <p className="text-slate-300 leading-relaxed">{ghStats.projectComplexityOverview}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-purple-400 font-bold uppercase text-[10px] tracking-wider block">Repository Activity Summary</span>
              <p className="text-slate-300 leading-relaxed">{ghStats.activitySummary}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider block">Detected Tech Stack</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {(ghStats.detectedTechStack || []).map((t: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Daily Challenge & Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Challenge */}
          <div className="glass-panel p-6 rounded-3xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Today's Personalized Coding Challenge
              </h2>
              <button
                onClick={loadPersonalizedData}
                disabled={recsLoading}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {recsLoading ? 'Generating...' : '↻ Refresh AI Pick'}
              </button>
            </div>

            {dailyRecs?.todaysChallenge && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white">{dailyRecs.todaysChallenge.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dailyRecs.todaysChallenge.difficulty}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {dailyRecs.todaysChallenge.topic}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                    {dailyRecs.todaysChallenge.companyTag}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{dailyRecs.todaysChallenge.description}</p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300">
                  💡 <strong>Solving Strategy:</strong> {dailyRecs.todaysChallenge.recommendedSolvingOrder}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <a
                    href={dailyRecs.todaysChallenge.leetcodeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/20"
                  >
                    Solve on LeetCode <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={dailyRecs.todaysChallenge.gfgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    Practice on GFG <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* AI Career Track Match */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              AI Career Track Match & Readiness
            </h2>
            <div className="space-y-4">
              {careerTracks.map((tr, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{tr.trackName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{tr.whyMatch}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400 block">{tr.matchPercentage}% Match</span>
                      <span className="text-xs text-indigo-300 font-mono">Readiness: {tr.readinessScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-emerald-400 font-bold uppercase block text-[10px]">Current Strengths</span>
                      <p className="text-slate-300 mt-1">{tr.currentStrengths?.join(', ')}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-amber-400 font-bold uppercase block text-[10px]">Skills Needing Improvement</span>
                      <p className="text-slate-300 mt-1">{tr.missingSkills?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed & Hackathons */}
        <div className="space-y-6">
          {/* Hackathons Quick Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Active Hackathons
              </h3>
              <Link to="/student/hackathons" className="text-xs text-indigo-400 font-bold hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.hackathons || []).slice(0, 2).map((h: any) => (
                <div key={h.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                  <span className="font-bold text-white block">{h.title}</span>
                  <span className="text-[10px] text-amber-400 block font-mono">Deadline: {h.registrationDeadline}</span>
                  <a
                    href={h.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 font-bold flex items-center gap-1 hover:underline pt-1"
                  >
                    Apply Now <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Recent Activity Feed */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Chronological Activity Log
            </h3>
            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {(data?.recentActivity || []).length > 0 ? (
                (data.recentActivity || []).map((log: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400">{log.details}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
