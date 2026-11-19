import React, { useState } from 'react';
import {
  ReceiptText,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  Zap,
  Droplets,
  Utensils,
  Wifi,
  Wrench,
  Users2,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useData } from '../../context/DataContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { formatINR, formatDate, downloadCSV } from '../../utils/formatters';

export const ExpensesView: React.FC = () => {
  const { expenses, metrics, addExpense, updateExpense, deleteExpense, selectedMonth } = useData();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState<number>(5000);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');

  const categories: ExpenseCategory[] = [
    'Electricity',
    'Water',
    'Food',
    'Internet',
    'Maintenance',
    'Staff Salaries',
    'Cleaning',
    'Other',
  ];

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Electricity': return Zap;
      case 'Water': return Droplets;
      case 'Food': return Utensils;
      case 'Internet': return Wifi;
      case 'Maintenance': return Wrench;
      case 'Staff Salaries': return Users2;
      case 'Cleaning': return Sparkles;
      case 'Other': return HelpCircle;
    }
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Electricity': return '#F59E0B';
      case 'Food': return '#EF4444';
      case 'Staff Salaries': return '#6366F1';
      case 'Internet': return '#0EA5E9';
      case 'Water': return '#06B6D4';
      case 'Maintenance': return '#8B5CF6';
      case 'Cleaning': return '#10B981';
      case 'Other': return '#64748B';
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchRef = exp.referenceNumber?.toLowerCase().includes(q);
      const matchVendor = exp.paidTo?.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchVendor) return false;
    }
    return true;
  });

  // Category breakdown for chart
  const categoryBreakdownMap = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryBreakdownMap).map(([cat, val]) => ({
    name: cat,
    amount: val,
    color: getCategoryColor(cat as ExpenseCategory),
  })).sort((a, b) => b.amount - a.amount);

  const topCategory = categoryChartData[0]?.name || 'N/A';

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('Electricity');
    setAmount(2500);
    setDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('UPI');
    setReferenceNumber('');
    setPaidTo('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(exp.date);
    setPaymentMethod(exp.paymentMethod);
    setReferenceNumber(exp.referenceNumber || '');
    setPaidTo(exp.paidTo || '');
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Expense title is required.');
      return;
    }
    if (amount <= 0) {
      showToast('error', 'Please enter a valid expense amount.');
      return;
    }

    if (editingExpense) {
      const res = updateExpense({
        ...editingExpense,
        title: title.trim(),
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        paidTo: paidTo.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      if (res.success) {
        showToast('success', res.message);
        setIsModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = addExpense({
        title: title.trim(),
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        paidTo: paidTo.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      if (res.success) {
        showToast('success', res.message);
        setIsModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this expense record?')) {
      const res = deleteExpense(id);
      if (res.success) showToast('success', res.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Expense Title', 'Amount (INR)', 'Payment Mode', 'Paid To / Vendor', 'Reference #', 'Notes'];
    const rows = filteredExpenses.map(e => [
      e.date,
      e.category,
      e.title,
      e.amount,
      e.paymentMethod,
      e.paidTo || '',
      e.referenceNumber || '',
      e.notes || '',
    ]);
    downloadCSV(`StaySync_Expenses_${selectedMonth.replace(' ', '_')}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-subtle ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Operating Expenses & Utility Bills</h2>
          <p className="text-xs text-slate-500">
            Track electricity, mess food, Wi-Fi, staff salaries and maintenance expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatINR(metrics.monthlyExpenses)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{expenses.length} Invoices Recorded</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Actual Rent Collected
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatINR(metrics.monthlyCollectedRent)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Gross Inflow</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
            Net Profit (Rent − Exp)
          </span>
          <div className={`text-xl font-bold mt-1 ${metrics.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatINR(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {metrics.monthlyCollectedRent > 0
              ? `${Math.round((metrics.netProfit / metrics.monthlyCollectedRent) * 100)}% Net Margin`
              : '0% Margin'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Highest Expense
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1 truncate">{topCategory}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {formatINR(categoryChartData[0]?.amount || 0)}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category distribution chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Expense Breakdown by Category</h3>
          <p className="text-xs text-slate-500 mb-3">Where your PG operational budget goes</p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [formatINR(Number(value)), name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
            {categoryChartData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-bold text-slate-800">{formatINR(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List Table: 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Categories ({expenses.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense, vendor, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Expense Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(exp => {
                  const Icon = getCategoryIcon(exp.category);
                  const color = getCategoryColor(exp.category);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{exp.title}</div>
                        {exp.referenceNumber && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {exp.referenceNumber} • {exp.paymentMethod}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{exp.category}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{formatDate(exp.date)}</td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {exp.paidTo || 'Direct vendor'}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatINR(exp.amount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Edit Expense"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Delete Expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No expense records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-brand-600">
                <ReceiptText className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingExpense ? 'Edit Expense Record' : 'Record Operating Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BESCOM Electricity Bill - Nov"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer / IMPS</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid To / Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Airtel, Sri Krishna Provisions"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bill / Transaction Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. BESCOM-RR-991204"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional details about the bill or expense..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
