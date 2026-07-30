import React, { useEffect, useState } from 'react';
import { apiRequest, uploadFile } from '../../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Building,
  Target,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState('Amazon');
  const [skillGap, setSkillGap] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const targetCompanies = ['Amazon', 'Google', 'Microsoft', 'Atlassian', 'Walmart', 'Adobe', 'Zoho'];

  useEffect(() => {
    async function loadExistingResume() {
      try {
        const data = await apiRequest('/resume/my-resume');
        setResumeData(data);
        setSkillGap(data.skillGaps);
      } catch (err) {
        // No resume uploaded yet
      }
    }
    loadExistingResume();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await uploadFile('/resume/upload', formData);
      setResumeData(res);
      setSkillGap(res.skillGaps);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = async (companyName: string) => {
    setSelectedCompany(companyName);
    setCompanyLoading(true);
    try {
      const gapRes = await apiRequest('/resume/skill-gap', {
        method: 'POST',
        body: JSON.stringify({ companyName }),
      });
      setSkillGap(gapRes);
    } catch (err) {
      console.error(err);
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-400" />
            AI Resume & <span className="gradient-text">Skill Gap Analysis</span>
          </h1>
          <p className="text-sm text-slate-400">
            Upload your PDF resume to generate an instant ATS evaluation, technical audit & target company gap analysis.
          </p>
        </div>
      </div>

      {/* PDF Upload Section */}
      <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 shadow-2xl">
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full flex-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Upload PDF Resume
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center bg-slate-900/60 transition-all">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : 'Click or drag PDF resume here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Accepts standard PDF documents up to 5MB</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>AI Agent Analyzing Resume...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Run AI Resume Audit</span>
              </>
            )}
          </button>
        </form>
      </div>

      {resumeData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top ATS Score Breakdown Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-indigo-400">{resumeData.atsScore}</span>
                <span className="text-[10px] text-indigo-300 uppercase font-bold">/ 100</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ATS Quality Score</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {resumeData.qualityReport?.resumeQuality || 'Strong technical foundation'}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ATS Parsing Status</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-1">
                  {resumeData.qualityReport?.atsCompatibility || 'High Compatibility'}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Extracted Skills</h3>
                <p className="text-xs text-purple-300 font-semibold mt-1">
                  {(resumeData.parsedData?.skills || []).length} Core Technical Tokens
                </p>
              </div>
            </div>
          </div>

          {/* AI Quality Report Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Technical Strengths
              </h3>
              <ul className="space-y-2">
                {(resumeData.qualityReport?.technicalStrengths || []).map((st: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Improvement Suggestions
              </h3>
              <ul className="space-y-2">
                {(resumeData.qualityReport?.suggestions || []).map((sug: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skill Gap Analysis Agent Selector */}
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-indigo-400" />
                  Target Company Skill Gap Analysis
                </h2>
                <p className="text-xs text-slate-400">
                  Compare your extracted resume against recruitment benchmarks of top tech firms.
                </p>
              </div>

              {/* Target Company Tabs */}
              <div className="flex flex-wrap gap-2">
                {targetCompanies.map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleCompanyChange(comp)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCompany === comp
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {skillGap && !companyLoading && (
              <div className="space-y-6 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold">Benchmark Target</span>
                    <h3 className="text-lg font-extrabold text-white">{skillGap.targetCompany}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{skillGap.matchPercentage}%</span>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Required Skill Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Missing Skills */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Identified Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(skillGap.missingSkills || []).map((sk: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Required DSA Topics */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Required DSA Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {(skillGap.requiredDsaTopics || []).map((dsa: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                          {dsa}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Company Recommended Projects */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Recommended Benchmark Projects</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(skillGap.missingProjects || []).map((proj: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{proj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
