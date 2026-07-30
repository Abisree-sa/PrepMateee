import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Trophy, Calendar, ExternalLink, Building2, Award, Users, ArrowRight } from 'lucide-react';

export const HackathonsPage: React.FC = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHackathons() {
      try {
        const res = await apiRequest('/hackathons');
        setHackathons(res.hackathons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHackathons();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-indigo-400 font-semibold animate-pulse">Loading National & College Hackathons...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-400" />
          Hackathons & Coding Competitions
        </h1>
        <p className="text-sm text-slate-400">
          Discover company-sponsored hackathons, national coding contests, and campus innovation challenges.
        </p>
      </div>

      {hackathons.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Hackathons Published Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your Placement Coordinator will publish upcoming national and college hackathon opportunities here soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((h) => (
            <div key={h.id} className="glass-panel p-6 rounded-3xl space-y-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {h.organizingCompany}
                  </span>
                  {h.prizeInfo && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {h.prizeInfo}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">{h.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{h.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Deadline</span>
                    <span className="text-rose-400 font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> {h.registrationDeadline}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase block">Event Date</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> {h.eventDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span><strong>Eligibility:</strong> {h.eligibility}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <a
                  href={h.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Apply & Register Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
