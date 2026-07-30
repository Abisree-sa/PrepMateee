import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Trophy, Plus, Building2, Calendar, Link as LinkIcon, Award, CheckCircle, Send } from 'lucide-react';

export const HackathonsManagerPage: React.FC = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizingCompany: '',
    registrationLink: '',
    registrationDeadline: '',
    eventDate: '',
    eligibility: 'All B.E / B.Tech Students',
    prizeInfo: '',
  });

  useEffect(() => {
    loadHackathons();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.organizingCompany || !formData.registrationLink) {
      return alert('Title, Organizing Company, and Registration Link are required!');
    }

    setPublishing(true);
    try {
      await apiRequest('/hackathons', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setSuccessMsg('Hackathon published and student notifications sent successfully!');
      setFormData({
        title: '',
        description: '',
        organizingCompany: '',
        registrationLink: '',
        registrationDeadline: '',
        eventDate: '',
        eligibility: 'All B.E / B.Tech Students',
        prizeInfo: '',
      });
      loadHackathons();
    } catch (err: any) {
      alert(err.message || 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-7 h-7 text-indigo-400" />
          Coordinator Hackathon Manager
        </h1>
        <p className="text-sm text-slate-400">
          Publish national hackathons, coding contests, and corporate challenges for students.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Publish Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Publish Hackathon Opportunity
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Hackathon Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Smart India Hackathon 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Organizing Company / Org *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google / Microsoft / Ministry of Education"
                value={formData.organizingCompany}
                onChange={(e) => setFormData({ ...formData, organizingCompany: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Registration Link *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={formData.registrationLink}
                onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">Registration Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Aug 15, 2026"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">Event Date</label>
                <input
                  type="text"
                  placeholder="e.g. Sep 01, 2026"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Prize Info (Optional)</label>
              <input
                type="text"
                placeholder="e.g. ₹1,00,000 Cash Prize + Internship Offer"
                value={formData.prizeInfo}
                onChange={(e) => setFormData({ ...formData, prizeInfo: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of the challenge..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{publishing ? 'Publishing & Notifying...' : 'Publish Hackathon'}</span>
            </button>
          </form>
        </div>

        {/* Existing Published List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-white">Published Hackathons ({hackathons.length})</h3>

          {loading ? (
            <div className="text-xs text-slate-400 animate-pulse">Loading hackathons...</div>
          ) : (
            <div className="space-y-3">
              {hackathons.map((h) => (
                <div key={h.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{h.title}</span>
                    <span className="text-xs font-bold text-indigo-400">{h.organizingCompany}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{h.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Deadline: {h.registrationDeadline}</span>
                    <span>Event: {h.eventDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
