import React from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Calendar,
  UserCheck,
  BarChart3,
  Megaphone,
  Award,
  Database,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'registrations'
  | 'qr-kiosk'
  | 'schedule'
  | 'volunteers'
  | 'announcements'
  | 'feedback-certs'
  | 'architecture';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'qr-kiosk', label: 'QR Verification Code', icon: QrCode, highlight: true },
    { id: 'schedule', label: 'Schedule & Tracks', icon: Calendar },
    { id: 'volunteers', label: 'Volunteer Roster', icon: UserCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'feedback-certs', label: 'Feedback & Certs', icon: Award },
    { id: 'architecture', label: 'Architecture & SQL', icon: Database },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 z-30 transition-transform duration-300 md:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg tracking-tight">EventOS Pro</h1>
            <p className="text-[11px] text-slate-400 font-medium">Event Management System</p>
          </div>
        </div>
        {setIsOpenMobile && (
          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                if (setIsOpenMobile) setIsOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 p-3 rounded-lg">
          <p className="text-xs font-semibold text-slate-500 uppercase">Current Event</p>
          <p className="text-sm text-white truncate font-medium mt-0.5">Tech Summit 2026</p>
          <div className="mt-2 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[65%]"></div>
          </div>
          <p className="text-[10px] mt-1 text-slate-400">65% Check-in progress</p>
        </div>
      </div>
    </aside>
  );
};
