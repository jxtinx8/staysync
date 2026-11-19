import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  RotateCcw,
  Bell,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Receipt,
  Wrench,
  UserCheck,
  BedDouble,
  ChevronDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TabType } from './Sidebar';
import { formatINR } from '../../utils/formatters';

interface TopNavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenMobileMenu: () => void;
  onOpenAdmitStudent: () => void;
  onOpenRecordPayment: () => void;
  onOpenAddExpense: () => void;
  onOpenAddComplaint: () => void;
  onOpenAddVisitor: () => void;
  onOpenAddRoom: () => void;
  onOpenAI: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenAdmitStudent,
  onOpenRecordPayment,
  onOpenAddExpense,
  onOpenAddComplaint,
  onOpenAddVisitor,
  onOpenAddRoom,
  onOpenAI,
  searchQuery,
  setSearchQuery,
}) => {
  const { metrics, resetToSampleData, complaints, payments, selectedMonth, setSelectedMonth } = useData();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getPageTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'rooms': return 'Room & Bed Management';
      case 'students': return 'Student & Resident Directory';
      case 'payments': return 'Rent Collection & Billing';
      case 'expenses': return 'Operating Expenses & Bills';
      case 'complaints': return 'Maintenance & Service Tickets';
      case 'visitors': return 'Visitor Log & Gate Entry';
      case 'reports': return 'Financial & Occupancy Reports';
      case 'ai': return 'StaySync AI Business Intelligence';
      case 'settings': return 'PG Configuration & Settings';
    }
  };

  const overduePayments = payments.filter(p => p.status === 'Overdue');
  const urgentComplaints = complaints.filter(c => c.status !== 'Resolved' && (c.priority === 'Urgent' || c.priority === 'High'));
  const totalNotifications = overduePayments.length + urgentComplaints.length;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-subtle">
        {/* Left side: Hamburger on mobile + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
                {getPageTitle(activeTab)}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live PG Sync
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Month selector */}
          <div className="hidden md:flex items-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="November 2026">Nov 2026 (Active)</option>
              <option value="October 2026">Oct 2026</option>
              <option value="September 2026">Sep 2026</option>
            </select>
          </div>

          {/* Quick search input */}
          <div className="relative hidden xl:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, room, bill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 text-xs font-semibold shadow-sm transition-all"
            title="Ask StaySync AI anything about your PG"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">StaySync AI</span>
          </button>

          {/* Quick Action Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Quick Action</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-modal border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Create New
                  </div>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenAdmitStudent(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 text-left font-medium"
                  >
                    <UserPlus className="h-4 w-4 text-brand-600" />
                    <span>Admit Student</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenRecordPayment(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 text-left font-medium"
                  >
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span>Record Payment</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenAddExpense(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 text-left font-medium"
                  >
                    <Receipt className="h-4 w-4 text-amber-600" />
                    <span>Add Expense</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenAddComplaint(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 text-left font-medium"
                  >
                    <Wrench className="h-4 w-4 text-rose-600" />
                    <span>Log Complaint</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenAddVisitor(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 text-left font-medium"
                  >
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    <span>Check-In Visitor</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickMenu(false); onOpenAddRoom(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 text-left font-medium border-t border-slate-100"
                  >
                    <BedDouble className="h-4 w-4 text-slate-600" />
                    <span>Add Room</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {totalNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              )}
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {totalNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-40">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">Notifications & Alerts</span>
                    <span className="text-[11px] text-slate-500">{totalNotifications} pending</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {overduePayments.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setActiveTab('payments'); setShowNotifications(false); }}
                        className="p-3 hover:bg-rose-50/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Overdue Rent: {p.studentName}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Room {p.roomNumber} ({p.bedNumber}) — {formatINR(p.balance)} due since {p.dueDate}.
                        </p>
                      </div>
                    ))}
                    {urgentComplaints.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setActiveTab('complaints'); setShowNotifications(false); }}
                        className="p-3 hover:bg-amber-50/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>[{c.priority}] {c.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Room {c.roomNumber} • {c.studentName}
                        </p>
                      </div>
                    ))}
                    {totalNotifications === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                        All systems clear! No overdue rents or urgent tickets.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reset Demo Data button for Hackathons */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Reset to 10 Indian PG sample rooms & students"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden lg:inline text-[11px] font-medium">Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Reset Demo Data</h3>
                <p className="text-xs text-slate-500">Restore default Bangalore PG setup</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This will restore the complete verified Indian dataset:
              <br />• 10 Rooms (AC / Non-AC)
              <br />• 25 Bed Slots
              <br />• 15 Indian Students (Aarav, Rohan, Priyansh, Sneha...)
              <br />• Rent records with UPI/IMPS receipts
              <br />• Operating expenses, maintenance tickets & visitors.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
              >
                Reset Database Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
