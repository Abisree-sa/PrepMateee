import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Building,
  CheckSquare,
  Mic,
  BarChart3,
  Users,
  PlusSquare,
  ShieldAlert,
  BookOpen,
  MonitorCheck,
  Trophy,
  Briefcase,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isStudent = user.role === 'STUDENT';

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/placements', label: 'Placement Drives', icon: Briefcase },
    { to: '/student/resume', label: 'Resume & Skill Gap', icon: FileText },
    { to: '/student/company-prep', label: 'Company AI Prep', icon: Building },
    { to: '/student/assessments', label: 'Daily Assessments', icon: CheckSquare },
    { to: '/student/hackathons', label: 'Hackathons & Contests', icon: Trophy },
    { to: '/student/materials', label: 'Prep Materials', icon: BookOpen },
    { to: '/student/mock-interview', label: 'AI Mock Interviews', icon: Mic },
    { to: '/student/analytics', label: 'Readiness Analytics', icon: BarChart3 },
  ];

  const coordinatorLinks = [
    { to: '/coordinator/dashboard', label: 'Coordinator Hub', icon: LayoutDashboard },
    { to: '/coordinator/placements', label: 'Publish Placements', icon: Briefcase },
    { to: '/coordinator/live-monitoring', label: 'Live Exam Monitor', icon: MonitorCheck },
    { to: '/coordinator/assessment-builder', label: 'Assessment Builder', icon: PlusSquare },
    { to: '/coordinator/hackathons', label: 'Publish Hackathons', icon: Trophy },
    { to: '/coordinator/students', label: 'Student Management', icon: Users },
    { to: '/coordinator/materials', label: 'Prep Materials', icon: BookOpen },
    { to: '/coordinator/proctoring-audits', label: 'Proctoring Audits', icon: ShieldAlert },
  ];

  const links = isStudent ? studentLinks : coordinatorLinks;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {isStudent ? 'Student Navigation' : 'Coordinator Admin'}
          </h3>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-3 py-2 text-xs text-slate-400 border-t border-slate-800/80">
        <p>© 2026 PlacementReady</p>
        <p className="text-[10px] text-slate-400">Campus Placement Ecosystem</p>
      </div>
    </aside>
  );
};
