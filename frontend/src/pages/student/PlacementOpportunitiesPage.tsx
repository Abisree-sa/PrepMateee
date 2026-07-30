import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Briefcase, Calendar, MapPin, DollarSign, Search, Filter, ExternalLink, Building2, CheckCircle2, ChevronRight, AlertCircle, FileText } from 'lucide-react';

export const PlacementOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const res = await apiRequest(`/placement/opportunities?search=${search}&roleType=${roleFilter}`);
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async (opp: any) => {
    try {
      await apiRequest(`/placement/opportunities/${opp.id}/log-apply`, { method: 'POST' });
    } catch (e) {}
    window.open(opp.applicationLink, '_blank');
  };

  const filteredOpps = opportunities.filter((o) => {
    const matchesSearch = o.companyName.toLowerCase().includes(search.toLowerCase()) || o.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || o.roleType === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="p-8 text-center text-indigo-400 font-semibold animate-pulse">Loading Placement Opportunities...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-indigo-400" />
          Campus Placement Opportunities Portal
        </h1>
        <p className="text-sm text-slate-400">
          Official department placement drives, campus recruitment notices, and corporate hiring links.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search company or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400">Role Type:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
            <option value="Both">Both (FTE + Intern)</option>
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredOpps.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Placement Opportunities Found</h3>
          <p className="text-xs text-slate-400">Placement drives published by your coordinator will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg">
                      {opp.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{opp.jobTitle}</h3>
                      <p className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {opp.companyName}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {opp.roleType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{opp.jobDescription}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{opp.salaryStipend || 'Competitive'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{opp.jobLocation}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-rose-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: {opp.registrationDeadline}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Min CGPA: {opp.minCgpa > 0 ? opp.minCgpa : 'No Criteria'}</span>
                  </div>
                </div>

                {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {opp.requiredSkills.map((sk: string, sIdx: number) => (
                      <span key={sIdx} className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedOpp(opp)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1"
                >
                  View Details & Criteria
                </button>

                <button
                  onClick={() => handleApplyClick(opp)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 w-full max-w-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">{selectedOpp.companyName}</span>
                <h2 className="text-xl font-extrabold text-white">{selectedOpp.jobTitle}</h2>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕ Close</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-indigo-300 mb-1">Job Description</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedOpp.jobDescription}</p>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] text-indigo-300 mb-1">Eligibility & CGPA Criteria</h4>
                <p className="text-slate-300 leading-relaxed">{selectedOpp.eligibilityCriteria}</p>
                <span className="text-amber-400 font-mono block mt-1">Min CGPA Required: {selectedOpp.minCgpa} | Batch: {selectedOpp.batchYear}</span>
              </div>

              {selectedOpp.selectionProcess && (
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] text-indigo-300 mb-1">Selection Process</h4>
                  <p className="text-slate-300 leading-relaxed">{selectedOpp.selectionProcess}</p>
                </div>
              )}

              {selectedOpp.additionalNotes && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                  <strong className="text-slate-200">Additional Instructions:</strong> {selectedOpp.additionalNotes}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button onClick={() => setSelectedOpp(null)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                Back
              </button>

              <button
                onClick={() => handleApplyClick(selectedOpp)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
