import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CreditCard,
  ReceiptText,
  AlertCircle,
  UserCheck,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Sparkles,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';

export type TabType =
  | 'dashboard'
  | 'rooms'
  | 'students'
  | 'payments'
  | 'expenses'
  | 'complaints'
  | 'visitors'
  | 'reports'
  | 'ai'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { metrics, owner } = useData();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Room Management', icon: BedDouble, count: metrics.totalRooms },
    { id: 'students', label: 'Student Directory', icon: Users, count: metrics.totalStudents },
    {
      id: 'payments',
      label: 'Rent & Payments',
      icon: CreditCard,
      badge: metrics.overdueRent > 0 ? 'Overdue' : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: AlertCircle,
      badge: metrics.pendingComplaintsCount > 0 ? metrics.pendingComplaintsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'visitors',
      label: 'Visitor Register',
      icon: UserCheck,
      badge: metrics.activeVisitorsCount > 0 ? `${metrics.activeVisitorsCount} Inside` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    {
      id: 'ai',
      label: 'StaySync AI',
      icon: Bot,
      isSpecial: true,
      badge: 'Verified DB',
      badgeColor: 'bg-brand-600 text-white',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">StaySync</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[170px]">
                {owner.pgName}
              </p>
            </div>
          </div>
        </div>

        {/* Property Quick Info Pill */}
        <div className="px-4 py-3 bg-navy-800/60 mx-4 my-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Occupancy
            </span>
            <span className="font-semibold text-white">{metrics.occupancyRate}%</span>
          </div>
          <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.occupancyRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
            <span>{metrics.occupiedBeds} Occupied</span>
            <span className="text-emerald-400 font-medium">{metrics.availableBeds} Vacant Beds</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-900/40'
                      : 'bg-brand-600 text-white shadow-md shadow-brand-900/30'
                    : item.isSpecial
                    ? 'text-cyan-300 hover:bg-slate-800/80 hover:text-white border border-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.isSpecial
                        ? 'text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && !item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-brand-700/60 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Pending rent prompt widget */}
        {metrics.pendingRent > 0 && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
              <span>Pending Collection</span>
              <span>{formatINR(metrics.pendingRent)}</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              {metrics.overdueRent > 0 && (
                <span className="text-rose-400 font-medium">
                  {formatINR(metrics.overdueRent)} is overdue!
                </span>
              )}
            </p>
          </div>
        )}

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Owner'}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/30"
              />
              <div className="truncate">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.name || owner.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Owner Portal
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
