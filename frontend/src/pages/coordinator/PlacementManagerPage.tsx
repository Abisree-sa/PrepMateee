import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Briefcase, Plus, Building2, Calendar, Link as LinkIcon, DollarSign, MapPin, CheckCircle, Trash2, Send } from 'lucide-react';

export const PlacementManagerPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    roleType: 'Full-Time',
    jobDescription: '',
    requiredSkills: '',
    eligibilityCriteria: 'Minimum 60% / 6.5 CGPA in B.E / B.Tech',
    minCgpa: '6.5',
    batchYear: '2026',
    applicationLink: '',
    registrationDeadline: '',
    interviewDate: '',
    selectionProcess: 'Online Assessment -> Technical Interview -> HR Interview',
    salaryStipend: '₹ 8.5 LPA',
    jobLocation: 'Pan India / Hybrid',
    additionalNotes: '',
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    try {
      const res = await apiRequest('/placement/opportunities');
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobTitle || !formData.applicationLink) {
      return alert('Company Name, Job Title, and Application Link are required!');
    }

    setPublishing(true);
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await apiRequest('/placement/opportunities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessMsg('Placement Opportunity published & Student Notifications dispatched successfully!');
      setFormData({
        companyName: '',
        jobTitle: '',
        roleType: 'Full-Time',
        jobDescription: '',
        requiredSkills: '',
        eligibilityCriteria: 'Minimum 60% / 6.5 CGPA in B.E / B.Tech',
        minCgpa: '6.5',
        batchYear: '2026',
        applicationLink: '',
        registrationDeadline: '',
        interviewDate: '',
        selectionProcess: 'Online Assessment -> Technical Interview -> HR Interview',
        salaryStipend: '₹ 8.5 LPA',
        jobLocation: 'Pan India / Hybrid',
        additionalNotes: '',
      });
      loadOpportunities();
    } catch (err: any) {
      alert(err.message || 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this placement drive notice?')) return;
    try {
      await apiRequest(`/placement/opportunities/${id}`, { method: 'DELETE' });
      loadOpportunities();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-indigo-400" />
          Placement Opportunities Coordinator Hub
        </h1>
        <p className="text-sm text-slate-400">
          Publish official campus hiring drives, off-campus opportunities, and corporate recruitment links for students.
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
            <Plus className="w-5 h-5 text-indigo-400" /> Publish Placement Drive
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amazon / Microsoft / Zoho"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Job Title / Role *</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Development Engineer (SDE-1)"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">Role Type</label>
                <select
                  value={formData.roleType}
                  onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Both">Both (FTE + Intern)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">Package / Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. ₹ 12 LPA"
                  value={formData.salaryStipend}
                  onChange={(e) => setFormData({ ...formData, salaryStipend: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Application Link *</label>
              <input
                type="url"
                required
                placeholder="https://company.com/careers/job123"
                value={formData.applicationLink}
                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Aug 20, 2026"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">Min CGPA</label>
                <input
                  type="text"
                  placeholder="6.5"
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Required Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="Java, Data Structures, SQL, React"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold uppercase block mb-1">Job Description</label>
              <textarea
                rows={3}
                required
                placeholder="Full details of role requirements..."
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{publishing ? 'Publishing Notice...' : 'Publish Drive Notice'}</span>
            </button>
          </form>
        </div>

        {/* Existing Drives List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-white">Active Placement Drives ({opportunities.length})</h3>

          {loading ? (
            <div className="text-xs text-slate-400 animate-pulse">Loading placement notices...</div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{opp.jobTitle}</span>
                      <span className="text-xs font-bold text-indigo-400">@ {opp.companyName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        {opp.roleType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{opp.jobDescription}</p>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                      <span>Package: {opp.salaryStipend}</span>
                      <span>Deadline: {opp.registrationDeadline}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(opp.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
