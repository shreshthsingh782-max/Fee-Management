import React, { useState } from 'react';
import { COLLEGE_INFO, INITIAL_USERS } from '../data/mockData';
import { UserProfile, CollegeProfile } from '../types';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Menu, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  Bell, 
  IndianRupee, 
  ChevronDown, 
  GraduationCap,
  Plus,
  Shield,
  Search,
  Receipt as ReceiptIcon,
  Award,
  Calculator,
  FileSpreadsheet,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  Server,
  Building2
} from 'lucide-react';

export type ActiveView = 
  | 'DASHBOARD' 
  | 'STUDENTS' 
  | 'BURSAR_SCANNER' 
  | 'STUDENT_PORTAL';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  clearedRate: string;
  collegeInfo?: CollegeProfile;
  usersList?: UserProfile[];
  onOpenCollegeSetup?: () => void;
  onResetDemoData?: () => void;
  onOpenExpenditures: () => void;
  onOpenReminders: () => void;
  onOpenScholarships: () => void;
  onOpenReconciliation: () => void;
  onOpenReports: () => void;
  onOpenAuditLogs: () => void;
  onOpenInstallments?: () => void;
  onOpenServerConsole?: () => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onToggleOnlineStatus: () => void;
  onSyncOfflineQueue: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  currentUser,
  onSelectUser,
  clearedRate,
  collegeInfo,
  usersList,
  onOpenCollegeSetup,
  onResetDemoData,
  onOpenExpenditures,
  onOpenReminders,
  onOpenScholarships,
  onOpenReconciliation,
  onOpenReports,
  onOpenAuditLogs,
  onOpenInstallments,
  onOpenServerConsole,
  isOnline,
  offlineQueueCount,
  onToggleOnlineStatus,
  onSyncOfflineQueue,
  onCloseMobile,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavClick = (view: ActiveView) => {
    onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const isStudent = currentUser.role === 'STUDENT';

  const navItems = isStudent
    ? [
        { id: 'STUDENT_PORTAL' as ActiveView, label: 'My Fees & Payments', icon: CreditCard },
        { id: 'DASHBOARD' as ActiveView, label: 'Institution Overview', icon: BarChart3 },
      ]
    : [
        { id: 'DASHBOARD' as ActiveView, label: 'Dashboard', icon: BarChart3 },
        { id: 'BURSAR_SCANNER' as ActiveView, label: 'Collect Fee', icon: IndianRupee, badge: 'POS' },
        { id: 'STUDENTS' as ActiveView, label: 'Student Ledgers', icon: Users },
      ];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800 text-slate-300 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shrink-0">
            {collegeInfo?.name
              ? collegeInfo.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              : 'SC'}
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-sm tracking-tight leading-tight truncate" title={collegeInfo?.name || 'Saraswati College'}>
              {collegeInfo?.name || 'Saraswati College'}
            </h1>
            <p className="text-slate-400 text-[10px] truncate">{collegeInfo?.code || 'Fee & Bursary ERP'}</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Switcher Bar */}
      <div className="p-3 border-b border-slate-800 relative bg-slate-950/40">
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Role</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-left flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-600 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.designation}</div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* Dropdown Menu for Switch Role */}
        {showUserMenu && (
          <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden divide-y divide-slate-700/60">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 bg-slate-900">
              Switch Role / Persona:
            </div>
            {(usersList || INITIAL_USERS).map((usr) => (
              <button
                key={usr.id}
                onClick={() => {
                  onSelectUser(usr);
                  setShowUserMenu(false);
                  if (usr.role === 'STUDENT') {
                    onSelectView('STUDENT_PORTAL');
                  } else {
                    onSelectView('DASHBOARD');
                  }
                }}
                className={`w-full p-2 text-left flex items-center gap-2 hover:bg-slate-700 transition cursor-pointer ${
                  currentUser.id === usr.id ? 'bg-slate-700/70' : ''
                }`}
              >
                <img src={usr.avatarUrl} alt={usr.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white flex items-center justify-between">
                    <span className="truncate">{usr.name}</span>
                    <span className="text-[9px] px-1 rounded bg-slate-900 text-slate-300 ml-1 shrink-0 font-mono">
                      {usr.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{usr.designation}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <div>
          <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2 px-2">
            Main Menu
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Student-specific management */}
        {isStudent && (
          <div>
            <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2 px-2">
              Student Services
            </div>
            <div className="space-y-1">
              {onOpenInstallments && (
                <button
                  onClick={() => {
                    onOpenInstallments();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Installment Plans</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 font-mono">
                    Flexi
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenScholarships();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Scholarships & Aid</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 font-mono">
                  Apply
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Staff & Admin Management Menu */}
        {!isStudent && (
          <div>
            <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2 px-2">
              Financial Operations
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenReconciliation();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Calculator className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Drawer Closing</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Challan</span>
              </button>

              <button
                onClick={() => {
                  onOpenScholarships();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Scholarship Sanctions</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 font-mono">
                  Waiver
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenExpenditures();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <ReceiptIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Expenditures</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Outflows</span>
              </button>

              <button
                onClick={() => {
                  onOpenReminders();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Fee Reminders</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 font-mono">
                  7d / 3d
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenReports();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Reports & GST SAC</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Export</span>
              </button>

              <button
                onClick={() => {
                  onOpenAuditLogs();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audit Trail Ledger</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-mono">
                  SHA-256
                </span>
              </button>

              {onOpenServerConsole && (
                <button
                  onClick={() => {
                    onOpenServerConsole();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200 border border-indigo-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Server className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Server Ops & API</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                    PORT 3000
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Network Resilience & Sync Card */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            )}
            <div className="text-[11px] leading-tight">
              <div className="font-semibold text-white flex items-center gap-1">
                {isOnline ? 'Online Gateway' : 'Offline Terminal'}
              </div>
              <div className="text-[10px] text-slate-400">
                {offlineQueueCount > 0 ? `${offlineQueueCount} queued locally` : 'Synced with Cloud'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {offlineQueueCount > 0 && isOnline && (
              <button
                onClick={onSyncOfflineQueue}
                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition cursor-pointer"
                title="Sync offline transaction queue"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </button>
            )}
            <button
              onClick={onToggleOnlineStatus}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition cursor-pointer font-mono"
              title="Toggle network connectivity simulation"
            >
              {isOnline ? 'Simulate Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Recovery Status */}
        <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Recovery Rate</span>
            <span className="font-mono font-bold text-blue-400">{clearedRate}%</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, Number(clearedRate)))}%` }}
            />
          </div>
        </div>

        {onOpenCollegeSetup && (
          <button
            onClick={onOpenCollegeSetup}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 py-1 transition cursor-pointer font-medium hover:bg-slate-800/60 rounded"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>College Setup & Registration</span>
          </button>
        )}

        {onResetDemoData && (
          <button
            onClick={onResetDemoData}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 py-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Ledger</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export const TopHeader: React.FC<{
  activeView: ActiveView;
  onOpenMobileMenu: () => void;
  clearedRate: string;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  collegeInfo?: CollegeProfile;
  usersList?: UserProfile[];
  onOpenCollegeSetup?: () => void;
  onOpenReminders: () => void;
  onOpenExpenditures: () => void;
  onOpenScholarships: () => void;
  onOpenReconciliation: () => void;
  onOpenReports: () => void;
  onOpenAuditLogs: () => void;
  onOpenServerConsole?: () => void;
  onCollectFee: () => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => void;
  serverConnected?: boolean;
}> = ({
  activeView,
  onOpenMobileMenu,
  clearedRate,
  currentUser,
  onSelectUser,
  collegeInfo,
  usersList,
  onOpenCollegeSetup,
  onOpenReminders,
  onOpenExpenditures,
  onOpenScholarships,
  onOpenReconciliation,
  onOpenReports,
  onOpenAuditLogs,
  onOpenServerConsole,
  onCollectFee,
  isOnline,
  offlineQueueCount,
  onSyncOfflineQueue,
  serverConnected = true,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getViewTitle = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return 'Executive Dashboard';
      case 'STUDENTS':
        return 'Student Fee Ledgers';
      case 'BURSAR_SCANNER':
        return 'Fee Collection Terminal';
      case 'STUDENT_PORTAL':
        return 'Student Fee Portal';
      default:
        return 'Bursar ERP';
    }
  };

  const isStudent = currentUser.role === 'STUDENT';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20">
      {/* Left: Menu & Section Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-slate-900 font-semibold text-sm sm:text-base">
            {getViewTitle()}
          </h2>
        </div>
      </div>

      {/* Right: Primary Actions & Connectivity & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Full-Stack Backend Connection Badge (Clickable for Diagnostics Console) */}
        <button
          onClick={onOpenServerConsole}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 text-[11px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium transition cursor-pointer"
          title="Click to open Express Server Operations Console & API Engine"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${serverConnected ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span>
          <span>Full-Stack REST</span>
        </button>

        {/* Network & Offline Status Pill */}
        <div className="flex items-center">
          {isOnline ? (
            offlineQueueCount > 0 ? (
              <button
                onClick={onSyncOfflineQueue}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Click to sync offline batches now"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Sync ({offlineQueueCount})</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg font-semibold">
              <WifiOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Offline ({offlineQueueCount} queued)</span>
            </div>
          )}
        </div>

        {/* Core Primary Action: Collect Fee */}
        {!isStudent && (
          <button
            onClick={onCollectFee}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Open Fee Collection Terminal"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collect Fee</span>
            <span className="sm:hidden">Collect</span>
          </button>
        )}

        {/* Shortcuts for Desktop */}
        {!isStudent && (
          <>
            <button
              onClick={onOpenReconciliation}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Daily Cashier Drawer Closing & Bank Challan"
            >
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
              <span>Closing</span>
            </button>

            <button
              onClick={onOpenScholarships}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Scholarships, Waivers & Concessions"
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Scholarships</span>
            </button>

            <button
              onClick={onOpenReports}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Financial Reports & GST Exemption"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
              <span>Reports</span>
            </button>

            <button
              onClick={onOpenAuditLogs}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Immutable Regulatory Audit Trail"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit</span>
            </button>

            {onOpenCollegeSetup && (
              <button
                onClick={onOpenCollegeSetup}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                title="Configure College Identity & Master Credentials"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>College Setup</span>
              </button>
            )}

            {onOpenServerConsole && (
              <button
                onClick={onOpenServerConsole}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Open Express Server Diagnostics & Jobs Console"
              >
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>Server Ops</span>
              </button>
            )}
          </>
        )}

        {/* User Pill & Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-1.5 sm:px-2 sm:py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-300 shrink-0"
            />
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-slate-900">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Logged In As</div>
                <div className="font-semibold text-slate-900 text-sm">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.designation}</div>
              </div>

              <div className="p-1.5 space-y-1">
                {onOpenCollegeSetup && (
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenCollegeSetup();
                    }}
                    className="w-full p-2 text-left rounded-lg transition flex items-center gap-2 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 cursor-pointer font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs truncate">Register / Setup College</div>
                      <div className="text-[10px] text-indigo-500 truncate">Identity & master credentials</div>
                    </div>
                  </button>
                )}
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">Switch Role:</div>
                {(usersList || INITIAL_USERS).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      setShowDropdown(false);
                    }}
                    className={`w-full p-2 text-left rounded-lg transition flex items-center gap-2.5 cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 text-blue-900 font-medium'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{u.role.replace('_', ' ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

