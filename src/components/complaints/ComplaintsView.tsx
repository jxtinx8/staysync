import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  AlertTriangle,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  BedDouble,
  Utensils,
  HelpCircle,
  X,
  MessageSquare,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const ComplaintsView: React.FC = () => {
  const { complaints, students, rooms, addComplaint, updateComplaintStatus, deleteComplaint } = useData();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resolveModal, setResolveModal] = useState<{ isOpen: boolean; complaint: Complaint | null; notes: string }>({
    isOpen: false,
    complaint: null,
    notes: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [studentId, setStudentId] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Wi-Fi');
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [description, setDescription] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const categories: ComplaintCategory[] = [
    'Electricity',
    'Water',
    'Wi-Fi',
    'Cleaning',
    'Furniture',
    'Plumbing',
    'Food',
    'Other',
  ];

  const filteredComplaints = complaints.filter(comp => {
    if (selectedStatus !== 'All' && comp.status !== selectedStatus) return false;
    if (selectedPriority !== 'All' && comp.priority !== selectedPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = comp.title.toLowerCase().includes(q);
      const matchStudent = comp.studentName.toLowerCase().includes(q);
      const matchRoom = comp.roomNumber.toLowerCase().includes(q);
      const matchTicket = comp.ticketNumber.toLowerCase().includes(q);
      if (!matchTitle && !matchStudent && !matchRoom && !matchTicket) return false;
    }
    return true;
  });

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (s: ComplaintStatus) => {
    switch (s) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const openAddModal = () => {
    setTitle('');
    if (students.length > 0) {
      setStudentId(students[0].id);
    }
    setCategory('Wi-Fi');
    setPriority('Medium');
    setDescription('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === studentId);
    if (!st) {
      showToast('error', 'Please select the affected student.');
      return;
    }

    const res = addComplaint({
      studentId: st.id,
      studentName: st.name,
      roomNumber: st.roomNumber,
      category,
      priority,
      title: title.trim(),
      description: description.trim(),
    });

    if (res.success) {
      showToast('success', res.message);
      setIsAddModalOpen(false);
    } else {
      showToast('error', res.message);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModal.complaint) return;
    const res = updateComplaintStatus(resolveModal.complaint.id, 'Resolved', resolveModal.notes.trim());
    if (res.success) {
      showToast('success', res.message);
      setResolveModal({ isOpen: false, complaint: null, notes: '' });
    }
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
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Maintenance & Complaints Tracker</h2>
          <p className="text-xs text-slate-500">
            Log, assign and resolve facility issues: Wi-Fi, electricity, geysers, plumbing, and room repairs.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Register Ticket</span>
        </button>
      </div>

      {/* Ticket Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{complaints.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">New (Pending)</span>
          <div className="text-xl font-bold text-blue-600 mt-1">
            {complaints.filter(c => c.status === 'New').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">In Progress</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {complaints.filter(c => c.status === 'In Progress').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Resolved</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {complaints.filter(c => c.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'New', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedStatus === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Filter and Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket, room or resident..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Tickets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredComplaints.map(comp => {
          const isResolved = comp.status === 'Resolved';
          const isInProgress = comp.status === 'In Progress';

          return (
            <div
              key={comp.id}
              className={`bg-white rounded-2xl border p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${
                comp.priority === 'Urgent' && !isResolved ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">{comp.ticketNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(comp.priority)}`}>
                      {comp.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {comp.category}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(comp.status)}`}>
                    {comp.status}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-slate-900 text-sm mt-3">{comp.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{comp.description}</p>

                {/* Room & Student Details */}
                <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Reported by:</span>
                    <div className="font-semibold text-slate-800">{comp.studentName}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Location:</span>
                    <div className="font-bold text-brand-600">Room {comp.roomNumber}</div>
                  </div>
                </div>

                {/* Resolution Notes if any */}
                {comp.resolutionNotes && (
                  <div className="mt-3 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Resolution Notes:
                    </div>
                    <p className="text-emerald-700 mt-0.5">{comp.resolutionNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {formatDateTime(comp.createdAt)}
                </span>

                <div className="flex items-center gap-1.5">
                  {!isResolved && (
                    <>
                      {comp.status === 'New' && (
                        <button
                          onClick={() => updateComplaintStatus(comp.id, 'In Progress')}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                        >
                          Mark In-Progress
                        </button>
                      )}
                      <button
                        onClick={() => setResolveModal({ isOpen: true, complaint: comp, notes: 'Issue inspected and fixed.' })}
                        className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                      >
                        Resolve Ticket
                      </button>
                    </>
                  )}
                  {isResolved && (
                    <button
                      onClick={() => updateComplaintStatus(comp.id, 'In Progress')}
                      className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 rounded"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => deleteComplaint(comp.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredComplaints.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No complaints found</h4>
            <p className="text-xs text-slate-500 mt-1">All maintenance issues have been resolved!</p>
          </div>
        )}
      </div>

      {/* Add Complaint Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-brand-600">
                <Wrench className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Register Service Ticket</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Affected Student *</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Issue Summary / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser not heating, Wi-Fi weak"
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
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="Urgent">Urgent (Immediate)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the problem, when it happens, and any prior attempts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Register Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal.isOpen && resolveModal.complaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Resolve Complaint Ticket</h3>
                <p className="text-xs text-slate-500">{resolveModal.complaint.ticketNumber}</p>
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{resolveModal.complaint.title}</div>
                <div className="text-slate-500 mt-0.5">
                  Room {resolveModal.complaint.roomNumber} • {resolveModal.complaint.studentName}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Summary / Technician Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Electrician replaced faulty heating coil; checked voltage and verified working."
                  value={resolveModal.notes}
                  onChange={(e) => setResolveModal(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModal({ isOpen: false, complaint: null, notes: '' })}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
