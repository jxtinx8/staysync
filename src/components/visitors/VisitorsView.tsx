import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  Calendar,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Visitor } from '../../types';
import { formatDate, downloadCSV } from '../../utils/formatters';

export const VisitorsView: React.FC = () => {
  const { visitors, students, checkInVisitor, checkOutVisitor, deleteVisitor } = useData();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Currently Inside' | 'Checked Out'>('All');

  // Modals state
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check In form fields
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [studentId, setStudentId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryTime, setEntryTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
  );

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredVisitors = visitors.filter(v => {
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.visitorName.toLowerCase().includes(q);
      const matchStudent = v.studentName.toLowerCase().includes(q);
      const matchRoom = v.roomNumber.toLowerCase().includes(q);
      const matchPhone = v.phone.includes(q);
      if (!matchName && !matchStudent && !matchRoom && !matchPhone) return false;
    }
    return true;
  });

  const currentlyInsideCount = visitors.filter(v => v.status === 'Currently Inside').length;
  const checkedOutCount = visitors.filter(v => v.status === 'Checked Out').length;

  const openCheckInModal = () => {
    setVisitorName('');
    setPhone('+91 ');
    if (students.length > 0) setStudentId(students[0].id);
    setPurpose('');
    setDate(new Date().toISOString().slice(0, 10));
    setEntryTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setIsCheckInModalOpen(true);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === studentId);
    if (!st) {
      showToast('error', 'Please select the student being visited.');
      return;
    }

    const res = checkInVisitor({
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      studentId: st.id,
      studentName: st.name,
      roomNumber: st.roomNumber,
      purpose: purpose.trim() || 'Social visit',
      date,
      entryTime,
    });

    if (res.success) {
      showToast('success', res.message);
      setIsCheckInModalOpen(false);
    } else {
      showToast('error', res.message);
    }
  };

  const handleCheckOut = (visitorId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const res = checkOutVisitor(visitorId, currentTime);
    if (res.success) showToast('success', res.message);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete visitor entry from register?')) {
      const res = deleteVisitor(id);
      if (res.success) showToast('success', res.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Visitor Name', 'Phone', 'Host Student', 'Room #', 'Purpose', 'Entry Time', 'Exit Time', 'Status'];
    const rows = filteredVisitors.map(v => [
      v.date,
      v.visitorName,
      v.phone,
      v.studentName,
      v.roomNumber,
      v.purpose,
      v.entryTime,
      v.exitTime || 'Still Inside',
      v.status,
    ]);
    downloadCSV('StaySync_Visitor_Register', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-subtle ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Gate Entry & Visitor Register</h2>
          <p className="text-xs text-slate-500">
            Monitor and record parent, guardian and guest visits with live check-in and check-out tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Register</span>
          </button>

          <button
            onClick={openCheckInModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Check-In Visitor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Visitors</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{visitors.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logged in database</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Currently Inside</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{currentlyInsideCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active inside premises</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Checked Out</span>
          <div className="text-xl font-bold text-slate-700 mt-1">{checkedOutCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed visits</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Currently Inside', 'Checked Out'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor, student, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Visitor Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Visitor Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Host Resident / Room</th>
                <th className="py-3.5 px-4">Visit Purpose</th>
                <th className="py-3.5 px-4">Date & Timing</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.map(vis => {
                const isInside = vis.status === 'Currently Inside';

                return (
                  <tr key={vis.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{vis.visitorName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">{vis.phone}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{vis.studentName}</div>
                      <div className="text-[11px] text-brand-600 font-medium">Room {vis.roomNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 italic">"{vis.purpose}"</td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{formatDate(vis.date)}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        In: <span className="font-semibold text-slate-700">{vis.entryTime}</span>
                        {vis.exitTime && (
                          <span> • Out: <span className="font-semibold text-slate-700">{vis.exitTime}</span></span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                          isInside
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {vis.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isInside && (
                          <button
                            onClick={() => handleCheckOut(vis.id)}
                            className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm transition-colors text-xs flex items-center gap-1"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Check Out</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(vis.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No visitor records match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-brand-600">
                <UserCheck className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Check-In New Visitor</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visitor Contact Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Being Visited *</label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Room {s.roomNumber} ({s.bedNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parent visit, luggage delivery, study"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entry Time</label>
                  <input
                    type="time"
                    required
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Check In Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
