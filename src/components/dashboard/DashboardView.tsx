import React from 'react';
import {
  BedDouble,
  Users,
  Wallet,
  Receipt,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useData } from '../../context/DataContext';
import { formatINR, formatDate, getRelativeTime } from '../../utils/formatters';
import { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenRecordPayment: (paymentId?: string) => void;
  onOpenAdmitStudent: () => void;
  onOpenAddExpense: () => void;
  onOpenAddComplaint: () => void;
  onOpenAI: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenRecordPayment,
  onOpenAdmitStudent,
  onOpenAddExpense,
  onOpenAddComplaint,
  onOpenAI,
}) => {
  const { metrics, payments, expenses, complaints, visitors, activities, rooms, selectedMonth } = useData();

  // Financial chart data comparing past 4 months
  const financialTrendsData = [
    { month: 'Aug', billed: 155000, collected: 152000, expenses: 84000, profit: 68000 },
    { month: 'Sep', billed: 162000, collected: 159000, expenses: 91000, profit: 68000 },
    { month: 'Oct', billed: 168000, collected: 163000, expenses: 98000, profit: 65000 },
    {
      month: 'Nov (Current)',
      billed: metrics.monthlyBilledRent,
      collected: metrics.monthlyCollectedRent,
      expenses: metrics.monthlyExpenses,
      profit: metrics.netProfit,
    },
  ];

  // Occupancy breakdown data for Donut Chart
  const occupancyData = [
    { name: 'Occupied Beds', value: metrics.occupiedBeds, color: '#2563EB' },
    { name: 'Vacant Beds', value: metrics.availableBeds, color: '#10B981' },
  ];

  // Upcoming rent payments
  const upcomingPayments = payments
    .filter(p => p.status === 'Pending' || p.status === 'Overdue' || p.status === 'Partially Paid')
    .slice(0, 5);

  // Active unhandled complaints
  const activeComplaints = complaints
    .filter(c => c.status !== 'Resolved')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Banner / Smart Alert bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-brand-950 p-6 text-white shadow-card border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Active Cycle: {selectedMonth}
              </span>
              <span className="text-xs text-slate-400">All data synced & verified</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Good evening, Rajesh. Your PG is running at {metrics.occupancyRate}% capacity.
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {metrics.availableBeds} beds are ready for new admissions. You have collected{' '}
              <span className="font-semibold text-emerald-400">{formatINR(metrics.monthlyCollectedRent)}</span> this month with{' '}
              <span className="font-semibold text-amber-400">{formatINR(metrics.pendingRent)}</span> pending collection.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl text-xs font-semibold shadow-lg shadow-brand-900/40 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask StaySync AI</span>
            </button>
            <button
              onClick={onOpenAdmitStudent}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <span>+ Admit Student</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Beds & Occupancy */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bed Occupancy</span>
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <BedDouble className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {metrics.occupiedBeds} <span className="text-base text-slate-400 font-normal">/ {metrics.totalBeds}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {metrics.occupancyRate}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>{metrics.totalRooms} Rooms total</span>
              <span className="text-brand-600 font-semibold">{metrics.availableBeds} Vacant Beds</span>
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Students</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</span>
              <span className="text-xs font-medium text-slate-500">Residents</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Verified Aadhaar IDs</span>
              <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                Directory <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Collection */}
        <div
          onClick={() => setActiveTab('payments')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rent Collected (Nov)</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {formatINR(metrics.monthlyCollectedRent)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Billed: {formatINR(metrics.monthlyBilledRent)}</span>
              <span className="text-amber-600 font-medium">Pending: {formatINR(metrics.pendingRent)}</span>
            </div>
          </div>
        </div>

        {/* Net Profit = Collected - Expenses */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Operating Profit</span>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatINR(metrics.netProfit)}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Formula: Rent - Exp
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Exp: {formatINR(metrics.monthlyExpenses)}</span>
              <span className="text-slate-700 font-semibold">Net Margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow Chart: 2/3 width */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Revenue & Expense Performance</h3>
              <p className="text-xs text-slate-500">Actual Rent Collected vs Operating Expenses (INR)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-brand-600" />
                <span className="text-slate-600">Collected Rent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-amber-500" />
                <span className="text-slate-600">Expenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="collected" name="Collected Rent" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Occupancy Ratio: 1/3 width */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Bed Occupancy Ratio</h3>
              <span className="text-xs font-semibold text-brand-600">{metrics.occupancyRate}% Full</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Live allocation across 10 rooms</p>

            <div className="h-48 mt-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Beds`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                Occupied Beds
              </span>
              <span className="font-bold text-slate-900">{metrics.occupiedBeds} beds</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Vacant & Ready
              </span>
              <span className="font-bold text-emerald-600">{metrics.availableBeds} beds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Collections & Urgent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending & Upcoming Rent */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pending & Overdue Rent Collection</h3>
              <p className="text-xs text-slate-500">Direct collection and receipt logging</p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {upcomingPayments.map((p) => {
              const isOverdue = p.status === 'Overdue';
              return (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.roomNumber}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.bedNumber} • Due: {formatDate(p.dueDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{formatINR(p.balance)}</div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOverdue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenRecordPayment(p.id)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              );
            })}

            {upcomingPayments.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                All student rents for this month are 100% collected!
              </div>
            )}
          </div>
        </div>

        {/* Pending Maintenance Complaints */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Maintenance Tickets</h3>
              <p className="text-xs text-slate-500">Needs owner or technician resolution</p>
            </div>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Tickets <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {activeComplaints.map((c) => {
              const isUrgent = c.priority === 'Urgent';
              return (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl text-xs font-bold mt-0.5 ${
                        isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.roomNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">{c.title}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            c.priority === 'Urgent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : c.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.studentName} • Category: {c.category}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-xs font-semibold text-slate-600 hover:text-brand-600 px-2 py-1 rounded hover:bg-slate-50 border border-slate-200 whitespace-nowrap"
                  >
                    View Ticket
                  </button>
                </div>
              );
            })}

            {activeComplaints.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                Zero pending complaints. All resident tickets resolved!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream & Live Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities: 2/3 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Operational Activity</h3>
            <span className="text-xs text-slate-400">Live event ledger</span>
          </div>
          <div className="mt-4 space-y-3">
            {activities.slice(0, 6).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{act.title}</span>
                    <span className="text-[11px] text-slate-400">{getRelativeTime(act.timestamp)}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Visitors in Hostel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Visitors Inside</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {metrics.activeVisitorsCount} Active
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {visitors
              .filter(v => v.status === 'Currently Inside')
              .map(v => (
                <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{v.visitorName}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">In: {v.entryTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Visiting {v.studentName} (Room {v.roomNumber})
                  </div>
                  <div className="text-[10px] text-slate-400 italic mt-0.5">
                    "{v.purpose}"
                  </div>
                </div>
              ))}

            {metrics.activeVisitorsCount === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No external visitors logged inside right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
