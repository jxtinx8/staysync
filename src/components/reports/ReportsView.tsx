import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Users,
  BedDouble,
  CreditCard,
  Receipt
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../../context/DataContext';
import { formatINR, formatDate, downloadCSV } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { metrics, rooms, students, payments, expenses, complaints, selectedMonth } = useData();

  const [activeReportTab, setActiveReportTab] = useState<'collection' | 'dues' | 'vacant' | 'expenses'>('collection');

  // Multi-month financial history data
  const multiMonthFinancials = [
    { month: 'August', collected: 152000, expenses: 84000, profit: 68000, occupancy: 80 },
    { month: 'September', collected: 159000, expenses: 91000, profit: 68000, occupancy: 84 },
    { month: 'October', collected: 163000, expenses: 98000, profit: 65000, occupancy: 88 },
    {
      month: 'November',
      collected: metrics.monthlyCollectedRent,
      expenses: metrics.monthlyExpenses,
      profit: metrics.netProfit,
      occupancy: metrics.occupancyRate,
    },
  ];

  // Floor occupancy data
  const floorOccupancyData = [1, 2, 3].map(floor => {
    const floorRooms = rooms.filter(r => r.floor === floor);
    const capacity = floorRooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupied = floorRooms.reduce((acc, r) => acc + r.beds.filter(b => b.isOccupied).length, 0);
    const vacant = capacity - occupied;
    return {
      floor: `Floor ${floor}`,
      Capacity: capacity,
      Occupied: occupied,
      Vacant: vacant,
    };
  });

  // Vacant beds list
  const vacantBedsList: { roomNumber: string; floor: number; bedNumber: string; rent: number; type: string }[] = [];
  rooms.forEach(r => {
    r.beds.forEach(b => {
      if (!b.isOccupied) {
        vacantBedsList.push({
          roomNumber: r.roomNumber,
          floor: r.floor,
          bedNumber: b.bedNumber,
          rent: r.rentPerBed,
          type: r.type,
        });
      }
    });
  });

  // Export current report to CSV
  const handleExportCurrentReport = () => {
    if (activeReportTab === 'collection') {
      const headers = ['Receipt #', 'Student Name', 'Room', 'Bed', 'Billed', 'Paid', 'Balance', 'Status', 'Date', 'Method', 'Ref'];
      const rows = payments.map(p => [
        p.receiptNumber,
        p.studentName,
        p.roomNumber,
        p.bedNumber,
        p.amountDue,
        p.amountPaid,
        p.balance,
        p.status,
        p.paymentDate || 'N/A',
        p.paymentMethod || 'N/A',
        p.transactionRef || 'N/A',
      ]);
      downloadCSV(`StaySync_Collection_Report_${selectedMonth.replace(' ', '_')}`, headers, rows);
    } else if (activeReportTab === 'dues') {
      const pendingList = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue' || p.status === 'Partially Paid');
      const headers = ['Student Name', 'Room', 'Bed', 'Due Date', 'Outstanding Balance (INR)', 'Status'];
      const rows = pendingList.map(p => [
        p.studentName,
        p.roomNumber,
        p.bedNumber,
        p.dueDate,
        p.balance,
        p.status,
      ]);
      downloadCSV(`StaySync_Pending_Dues_Report`, headers, rows);
    } else if (activeReportTab === 'vacant') {
      const headers = ['Room Number', 'Floor', 'Bed Slot', 'Type', 'Rent Per Month (INR)'];
      const rows = vacantBedsList.map(v => [
        v.roomNumber,
        `Floor ${v.floor}`,
        v.bedNumber,
        v.type,
        v.rent,
      ]);
      downloadCSV(`StaySync_Vacant_Beds_Report`, headers, rows);
    } else if (activeReportTab === 'expenses') {
      const headers = ['Date', 'Category', 'Title', 'Amount (INR)', 'Payment Mode', 'Paid To', 'Ref #'];
      const rows = expenses.map(e => [
        e.date,
        e.category,
        e.title,
        e.amount,
        e.paymentMethod,
        e.paidTo || 'N/A',
        e.referenceNumber || 'N/A',
      ]);
      downloadCSV(`StaySync_Expenses_Audit_Report`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Financial & Occupancy Analytics</h2>
          <p className="text-xs text-slate-500">
            Real-time reporting, historical profit trends, floor occupancy rates, and downloadable CSV audits.
          </p>
        </div>

        <button
          onClick={handleExportCurrentReport}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Export Current Report (CSV)</span>
        </button>
      </div>

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Collection Efficiency</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {metrics.monthlyBilledRent > 0
              ? `${Math.round((metrics.monthlyCollectedRent / metrics.monthlyBilledRent) * 100)}%`
              : '0%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {formatINR(metrics.monthlyCollectedRent)} / {formatINR(metrics.monthlyBilledRent)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Profit Margin</span>
          <div className={`text-xl font-bold mt-1 ${metrics.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatINR(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Rent Collected − Expenses</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bed Occupancy</span>
          <div className="text-xl font-bold text-brand-600 mt-1">{metrics.occupancyRate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {metrics.occupiedBeds} of {metrics.totalBeds} Beds Full
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vacant Revenue Potential</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {formatINR(vacantBedsList.reduce((acc, b) => acc + b.rent, 0))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {vacantBedsList.length} vacant beds</div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-month revenue vs expenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Financial Growth (INR)</h3>
              <p className="text-xs text-slate-500">Rent collections vs expenses over the last 4 months</p>
            </div>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiMonthFinancials} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="collected" name="Rent Collected" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floor Occupancy Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Occupancy by Floor Level</h3>
              <p className="text-xs text-slate-500">Occupied vs available beds by floor</p>
            </div>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floorOccupancyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="floor" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Beds`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Occupied" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Vacant" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabbed Interactive Data Reports */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {/* Tab navigation */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveReportTab('collection')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeReportTab === 'collection' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Rent Collection Report ({payments.length})</span>
            </button>

            <button
              onClick={() => setActiveReportTab('dues')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeReportTab === 'dues' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Pending Dues ({payments.filter(p => p.balance > 0).length})</span>
            </button>

            <button
              onClick={() => setActiveReportTab('vacant')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeReportTab === 'vacant' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BedDouble className="h-3.5 w-3.5 text-emerald-500" />
              <span>Vacant Beds Directory ({vacantBedsList.length})</span>
            </button>

            <button
              onClick={() => setActiveReportTab('expenses')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeReportTab === 'expenses' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="h-3.5 w-3.5 text-blue-500" />
              <span>Expense Audit Log ({expenses.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Collection Report */}
        {activeReportTab === 'collection' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Billed</th>
                  <th className="py-3 px-4">Collected</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Method & UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium">{p.receiptNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.studentName}</td>
                    <td className="py-3 px-4 text-brand-600 font-medium">Room {p.roomNumber} ({p.bedNumber})</td>
                    <td className="py-3 px-4">{formatINR(p.amountDue)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatINR(p.amountPaid)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{formatINR(p.balance)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                      {p.paymentMethod || 'N/A'} • {p.transactionRef || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Pending Dues */}
        {activeReportTab === 'dues' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Room / Bed</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.filter(p => p.balance > 0).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.studentName}</td>
                    <td className="py-3 px-4 text-brand-600 font-medium">Room {p.roomNumber} ({p.bedNumber})</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(p.dueDate)}</td>
                    <td className="py-3 px-4 font-bold text-rose-600 text-sm">{formatINR(p.balance)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic">"{p.notes || 'Pending collection'}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Vacant Beds Directory */}
        {activeReportTab === 'vacant' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Floor Level</th>
                  <th className="py-3 px-4">Available Bed Slot</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Monthly Tariff (INR)</th>
                  <th className="py-3 px-4">Ready Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vacantBedsList.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">Room {v.roomNumber}</td>
                    <td className="py-3 px-4 text-slate-600">Floor {v.floor}</td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{v.bedNumber}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {v.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatINR(v.rent)} / month</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready for Admission
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Expense Audit Log */}
        {activeReportTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Method & Ref #</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600">{formatDate(e.date)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{e.title}</td>
                    <td className="py-3 px-4 text-slate-700">{e.paidTo || 'Direct vendor'}</td>
                    <td className="py-3 px-4 text-[11px] font-mono text-slate-500">
                      {e.paymentMethod} • {e.referenceNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-right">{formatINR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
