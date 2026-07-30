import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  Megaphone, Plus, Trash2, Edit3, Eye, FileText, CheckCircle, Upload, Image, Video,
  Paperclip, AlertCircle, X, ShieldAlert, Sparkles, Send, Clock, Layers
} from 'lucide-react';

export const AnnouncementManagerPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PLACEMENT_DRIVE');
  const [priorityLevel, setPriorityLevel] = useState('NORMAL');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [targetDepts, setTargetDepts] = useState<string[]>(['ALL']);
  const [targetBatches, setTargetBatches] = useState<string[]>(['ALL']);
  const [publishStatus, setPublishStatus] = useState('PUBLISHED');
  const [documentName, setDocumentName] = useState('');

  // Files
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Modal / Preview State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await apiRequest('/coordinator/announcements');
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptToggle = (dept: string) => {
    if (dept === 'ALL') {
      setTargetDepts(['ALL']);
      return;
    }
    const filtered = targetDepts.filter((d) => d !== 'ALL');
    if (filtered.includes(dept)) {
      const updated = filtered.filter((d) => d !== dept);
      setTargetDepts(updated.length === 0 ? ['ALL'] : updated);
    } else {
      setTargetDepts([...filtered, dept]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Title and description are required');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('priorityLevel', priorityLevel);
      formData.append('summary', summary);
      formData.append('description', description);
      formData.append('targetDepartments', JSON.stringify(targetDepts));
      formData.append('targetBatches', JSON.stringify(targetBatches));
      formData.append('status', publishStatus);
      formData.append('documentName', documentName);

      if (coverImageFile) formData.append('coverImage', coverImageFile);
      if (videoFile) formData.append('video', videoFile);
      if (documentFile) formData.append('document', documentFile);

      const token = localStorage.getItem('token');
      const url = editingId ? `/api/coordinator/announcements/${editingId}` : '/api/coordinator/announcements';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish announcement');
      }

      resetForm();
      setShowFormModal(false);
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('PLACEMENT_DRIVE');
    setPriorityLevel('NORMAL');
    setSummary('');
    setDescription('');
    setTargetDepts(['ALL']);
    setTargetBatches(['ALL']);
    setPublishStatus('PUBLISHED');
    setDocumentName('');
    setCoverImageFile(null);
    setVideoFile(null);
    setDocumentFile(null);
    setEditingId(null);
  };

  const handleEdit = (ann: any) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setCategory(ann.category);
    setPriorityLevel(ann.priorityLevel);
    setSummary(ann.summary || '');
    setDescription(ann.description);
    setTargetDepts(ann.targetDepartments ? JSON.parse(ann.targetDepartments) : ['ALL']);
    setTargetBatches(ann.targetBatches ? JSON.parse(ann.targetBatches) : ['ALL']);
    setPublishStatus(ann.status);
    setDocumentName(ann.documentName || '');
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await apiRequest(`/coordinator/announcements/${id}`, { method: 'DELETE' });
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await apiRequest(`/coordinator/announcements/${id}/unpublish`, { method: 'PATCH' });
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-amber-400" />
            Dynamic Campus Announcement Management Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, publish, edit, and schedule official campus notices with image, video, and PDF attachments.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Announcement
        </button>
      </div>

      {/* Announcements Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Published & Scheduled Announcements ({announcements.length})
        </h2>

        {loading ? (
          <div className="text-center text-xs text-indigo-400 py-8 animate-pulse">
            Loading announcements from database...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <Megaphone className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No announcements published yet. Click "Create New Announcement" to publish your first campus notice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Title & Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Target Audience</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Publish Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-semibold text-white max-w-xs">
                      <div className="truncate">{ann.title}</div>
                      <span className="text-[10px] text-indigo-400 font-mono block">{ann.category}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ann.priorityLevel === 'URGENT'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : ann.priorityLevel === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {ann.priorityLevel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {ann.targetDepartments}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ann.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ann.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(ann)}
                        className="p-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700"
                        title="Edit Announcement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {ann.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleUnpublish(ann.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700"
                          title="Unpublish"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-slate-700"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                {editingId ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon SDE-1 Recruitment Drive 2026 Registration Open"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PLACEMENT_DRIVE">Placement Drive</option>
                    <option value="HACKATHON">Hackathon & Contest</option>
                    <option value="GENERAL_NOTICE">General Notice</option>
                    <option value="SEMINAR">Seminar & Workshop</option>
                    <option value="EXAM_ALERT">Exam / Assessment Alert</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent / Important</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Summary Preview (Short Text)
                </label>
                <input
                  type="text"
                  placeholder="Short 1-sentence summary displayed on cards & notifications"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Announcement Description (Rich Details) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed announcement content, eligibility details, instructions, schedules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Target Departments */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Departments
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['ALL', 'IT', 'CSE', 'ECE', 'EEE', 'AI-DS', 'MECH', 'CIVIL'].map((dept) => (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => handleDeptToggle(dept)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        targetDepts.includes(dept)
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-indigo-400" /> Cover Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                    className="text-[10px] text-slate-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-purple-400" /> Video (Optional)
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="text-[10px] text-slate-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-amber-400" /> PDF Document
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setDocumentFile(file);
                      if (file && !documentName) setDocumentName(file.name);
                    }}
                    className="text-[10px] text-slate-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {submitting ? 'Publishing...' : <><Send className="w-3.5 h-3.5" /> Publish Announcement</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
