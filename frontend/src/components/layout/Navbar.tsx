import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { LogOut, User, Sparkles, ShieldCheck, GraduationCap, Bell, Megaphone, Briefcase, Trophy, CheckCircle, ExternalLink, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('/notifications');
      setNotifications(res.notifications || []);
    } catch (e) {}
  };

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Placement<span className="gradient-text">Ready</span>
          </span>
          <span className="text-xs text-slate-400 font-medium block">AI Placement Prep & Assessment Platform</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
            {user.role === 'STUDENT' ? (
              <>
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{user.department?.name || 'Department'}</span>
                <span className="text-slate-500">|</span>
                <span className="text-indigo-300">Batch {user.admissionYear || '2026'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Placement Coordinator</span>
              </>
            )}
          </div>

          {/* Interactive Notifications & Campus Announcements Bell Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Campus Announcements & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-400" />
                    Campus Announcements & Alerts
                  </span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                          notif.isRead
                            ? 'bg-slate-950 border-slate-800 text-slate-400'
                            : 'bg-indigo-950/40 border-indigo-500/30 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-indigo-300 flex items-center gap-1.5">
                            {notif.type === 'PLACEMENT_OPPORTUNITY' && <Briefcase className="w-3.5 h-3.5 text-emerald-400" />}
                            {notif.type === 'HACKATHON' && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                            {notif.type === 'ANNOUNCEMENT' && <Megaphone className="w-3.5 h-3.5 text-indigo-400" />}
                            {notif.title}
                          </span>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{notif.message}</p>
                        <span className="text-[9px] text-slate-500 block font-mono">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-500 py-6">
                      No active announcements.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] font-semibold text-indigo-400">
                  <Link to="/student/placements" onClick={() => setShowNotifications(false)} className="hover:underline">
                    Placement Drives →
                  </Link>
                  <Link to="/student/hackathons" onClick={() => setShowNotifications(false)} className="hover:underline">
                    Hackathons →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-200">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
