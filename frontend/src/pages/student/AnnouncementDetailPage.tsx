import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  Megaphone, Calendar, ArrowLeft, Download, Paperclip, Video, Image as ImageIcon,
  CheckCircle, ShieldAlert, Sparkles, Building2, Tag
} from 'lucide-react';

export const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnnouncementDetail(id);
    }
  }, [id]);

  const loadAnnouncementDetail = async (annId: string) => {
    try {
      const res = await apiRequest(`/announcements/${annId}`);
      setAnnouncement(res.announcement);
    } catch (err) {
      console.error('Failed to load announcement details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-400 font-semibold animate-pulse">
        Loading Campus Announcement Details...
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Announcement Not Found</h2>
        <p className="text-xs text-slate-400">The requested campus announcement may have been removed or unpublished.</p>
        <Link to="/student/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Main Detail Glass Panel */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800">
        {/* Cover Image Banner */}
        {announcement.coverImageUrl && (
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <img
              src={announcement.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {announcement.category}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                announcement.priorityLevel === 'URGENT'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : announcement.priorityLevel === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {announcement.priorityLevel} PRIORITY
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Published: {new Date(announcement.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
          {announcement.title}
        </h1>

        {/* Full Rich Description */}
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4 pt-2">
          {announcement.description}
        </div>

        {/* Embedded Video Player */}
        {announcement.videoUrl && (
          <div className="space-y-2 pt-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-4 h-4" /> Embedded Announcement Video
            </h3>
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <video controls className="w-full max-h-96">
                <source src={announcement.videoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        )}

        {/* Downloadable PDF Document Attachment Card */}
        {announcement.documentUrl && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Paperclip className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {announcement.documentName || 'Official Attachment.pdf'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Official Campus Document</span>
              </div>
            </div>

            <a
              href={announcement.documentUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
