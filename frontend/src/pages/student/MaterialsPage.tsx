import React, { useEffect, useState } from 'react';
import { apiRequest, uploadFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  FileText,
  Search,
  UploadCloud,
  Download,
  Eye,
  Plus,
  Sparkles,
  Tag,
  Clock,
  User,
} from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal state for Coordinators
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Coding Notes');
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const categories = ['ALL', 'Coding Notes', 'Aptitude Notes', 'Interview Guides', 'Company Papers', 'General'];

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'ALL') params.append('category', category);
      if (search) params.append('search', search);

      const res = await apiRequest(`/materials?${params.toString()}`);
      setMaterials(res.materials || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [category]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileObj || !uploadTitle || !uploadTopic) {
      return alert('Title, topic, and file are required');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFileObj);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('category', uploadCategory);
      formData.append('topic', uploadTopic);

      await uploadFile('/materials/upload', formData);
      alert('Placement Preparation Material published and students notified!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadTopic('');
      setUploadFileObj(null);
      fetchMaterials();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isCoordinator = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Placement Preparation <span className="gradient-text">Materials Repository</span>
          </h1>
          <p className="text-sm text-slate-400">
            Access coding guides, quantitative aptitude notes, company interview papers & technical roadmaps published by placement coordinators.
          </p>
        </div>

        {isCoordinator && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Publish New Material</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMaterials()}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="p-8 text-center text-indigo-400 font-semibold">Loading Preparation Materials...</div>
      ) : materials.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
          <h3 className="text-base font-bold text-white">No Materials Found</h3>
          <p className="text-xs text-slate-400">No resources available for the selected category or search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div key={item.id} className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    .{item.fileType}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Topic: {item.topic}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {item.uploadedBy?.fullName || 'Coordinator'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Preview File</span>
                  </a>

                  <a
                    href={item.fileUrl}
                    download={item.fileName}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Material Modal for Coordinators */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 w-full max-w-lg space-y-6">
            <h2 className="text-xl font-bold text-white">Publish Placement Preparation Material</h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Graph Algorithms & Amazon Tagged Questions"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Resource Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Coding Notes">Coding Notes</option>
                  <option value="Aptitude Notes">Aptitude Notes</option>
                  <option value="Interview Guides">Interview Guides</option>
                  <option value="Company Papers">Company Papers</option>
                  <option value="General">General Placement Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Topic / Domain *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graphs & BFS/DFS"
                  value={uploadTopic}
                  onChange={(e) => setUploadTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of key concepts covered in this file..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select File (PDF, Docx, Text, PPT) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  onChange={(e) => setUploadFileObj(e.target.files?.[0] || null)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2 text-xs text-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Publishing & Notifying...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
