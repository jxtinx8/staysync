import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  CreditCard,
  BedDouble,
  ShieldAlert,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  ExternalLink,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  User
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Student, Room, StudentStatus } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

interface StudentsViewProps {
  initialSearchQuery?: string;
  onOpenRecordPayment: (paymentId?: string) => void;
  onPrintReceipt: (paymentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  initialSearchQuery = '',
  onOpenRecordPayment,
  onPrintReceipt,
}) => {
  const { students, rooms, payments, complaints, addStudent, updateStudent, checkOutStudent, deleteStudent } = useData();

  // Search & Filters
  const [search, setSearch] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Checked Out'>('Active');
  const [roomFilter, setRoomFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [profileModalStudent, setProfileModalStudent] = useState<Student | null>(null);
  const [checkOutModal, setCheckOutModal] = useState<{ isOpen: boolean; student: Student | null; date: string }>({
    isOpen: false,
    student: null,
    date: new Date().toISOString().slice(0, 10),
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields for Add/Edit
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(10000);
  const [securityDeposit, setSecurityDeposit] = useState(20000);
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered students
  const filteredStudents = students.filter(student => {
    if (statusFilter !== 'All' && student.status !== statusFilter) return false;
    if (roomFilter !== 'All' && student.roomNumber !== roomFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchId = student.studentId.toLowerCase().includes(q);
      const matchCollege = student.college.toLowerCase().includes(q);
      const matchRoom = student.roomNumber.toLowerCase().includes(q);
      const matchPhone = student.phone.includes(q);
      if (!matchName && !matchId && !matchCollege && !matchRoom && !matchPhone) return false;
    }
    return true;
  });

  // Vacant beds generator for modal
  const vacantBedsInSelectedRoom = (() => {
    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) return [];
    return room.beds.filter(b => !b.isOccupied || (editingStudent && b.id === editingStudent.bedId));
  })();

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setPhone('+91 ');
    setEmail('');
    setParentName('');
    setParentPhone('+91 ');
    setEmergencyContact('');
    setCollege('');
    setCourse('');
    setAcademicYear('1st Year');
    setPermanentAddress('');
    setJoiningDate(new Date().toISOString().slice(0, 10));

    // Default to first room with vacant beds
    const firstAvailableRoom = rooms.find(r => r.beds.some(b => !b.isOccupied));
    if (firstAvailableRoom) {
      setSelectedRoomId(firstAvailableRoom.id);
      const firstBed = firstAvailableRoom.beds.find(b => !b.isOccupied);
      setSelectedBedId(firstBed?.id || '');
      setMonthlyRent(firstAvailableRoom.rentPerBed);
      setSecurityDeposit(firstAvailableRoom.rentPerBed * 2);
    } else {
      setSelectedRoomId('');
      setSelectedBedId('');
    }

    setIdProofType('Aadhaar Card');
    setIdProofNumber('');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setPhotoUrl(student.photoUrl);
    setPhone(student.phone);
    setEmail(student.email);
    setParentName(student.parentName);
    setParentPhone(student.parentPhone);
    setEmergencyContact(student.emergencyContact);
    setCollege(student.college);
    setCourse(student.course);
    setAcademicYear(student.academicYear);
    setPermanentAddress(student.permanentAddress);
    setJoiningDate(student.joiningDate);
    setSelectedRoomId(student.roomId);
    setSelectedBedId(student.bedId);
    setMonthlyRent(student.monthlyRent);
    setSecurityDeposit(student.securityDeposit);
    setIdProofType(student.idProofType || 'Aadhaar Card');
    setIdProofNumber(student.idProofNumber || '');
    setIsAddEditModalOpen(true);
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const firstAvailableBed = room.beds.find(b => !b.isOccupied || (editingStudent && b.id === editingStudent.bedId));
      setSelectedBedId(firstAvailableBed?.id || '');
      setMonthlyRent(room.rentPerBed);
      setSecurityDeposit(room.rentPerBed * 2);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = rooms.find(r => r.id === selectedRoomId);
    if (!targetRoom) {
      showToast('error', 'Please select an available room.');
      return;
    }
    const targetBed = targetRoom.beds.find(b => b.id === selectedBedId);
    if (!targetBed) {
      showToast('error', 'Please select an available bed slot.');
      return;
    }

    if (editingStudent) {
      const res = updateStudent({
        ...editingStudent,
        name,
        photoUrl,
        phone,
        email,
        parentName,
        parentPhone,
        emergencyContact,
        college,
        course,
        academicYear,
        permanentAddress,
        joiningDate,
        roomId: targetRoom.id,
        roomNumber: targetRoom.roomNumber,
        bedId: targetBed.id,
        bedNumber: targetBed.bedNumber,
        monthlyRent: Number(monthlyRent),
        securityDeposit: Number(securityDeposit),
        idProofType,
        idProofNumber,
      });
      if (res.success) {
        showToast('success', res.message);
        setIsAddEditModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = addStudent({
        name,
        photoUrl,
        phone,
        email,
        parentName,
        parentPhone,
        emergencyContact,
        college,
        course,
        academicYear,
        permanentAddress,
        joiningDate,
        roomId: targetRoom.id,
        roomNumber: targetRoom.roomNumber,
        bedId: targetBed.id,
        bedNumber: targetBed.bedNumber,
        monthlyRent: Number(monthlyRent),
        securityDeposit: Number(securityDeposit),
        idProofType,
        idProofNumber,
      });
      if (res.success) {
        showToast('success', res.message);
        setIsAddEditModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    }
  };

  const handleCheckOutConfirm = () => {
    if (!checkOutModal.student) return;
    const res = checkOutStudent(checkOutModal.student.id, checkOutModal.date);
    if (res.success) {
      showToast('success', res.message);
      setCheckOutModal({ isOpen: false, student: null, date: '' });
      if (profileModalStudent?.id === checkOutModal.student.id) {
        setProfileModalStudent(null);
      }
    } else {
      showToast('error', res.message);
    }
  };

  const handleDelete = (studentId: string) => {
    if (window.confirm('Delete student record? This will permanently release their bed.')) {
      const res = deleteStudent(studentId);
      if (res.success) {
        showToast('success', res.message);
        if (profileModalStudent?.id === studentId) setProfileModalStudent(null);
      } else {
        showToast('error', res.message);
      }
    }
  };

  // Get current payment status for student
  const getStudentPaymentStatus = (studentId: string) => {
    const pay = payments.find(p => p.studentId === studentId && p.month.includes('Nov'));
    return pay ? pay.status : 'Pending';
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student & Resident Directory</h2>
          <p className="text-xs text-slate-500">
            Manage student admissions, KYC records, room assignments and checkout settlements.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Admit New Student</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, college, room or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="Active">Active Residents ({students.filter(s => s.status === 'Active').length})</option>
            <option value="Checked Out">Checked Out ({students.filter(s => s.status === 'Checked Out').length})</option>
            <option value="All">All Students ({students.length})</option>
          </select>

          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Rooms</option>
            {rooms.map(r => (
              <option key={r.id} value={r.roomNumber}>Room {r.roomNumber}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List View: Table Style */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Student & ID</th>
                <th className="py-3.5 px-4">Room & Bed</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">College / Course</th>
                <th className="py-3.5 px-4">Monthly Rent</th>
                <th className="py-3.5 px-4">Rent Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const payStatus = getStudentPaymentStatus(student.id);
                const isActive = student.status === 'Active';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Student & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={student.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                        />
                        <div>
                          <button
                            onClick={() => setProfileModalStudent(student)}
                            className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-left"
                          >
                            {student.name}
                          </button>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {student.studentId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Room & Bed */}
                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-lg border border-brand-200">
                            Room {student.roomNumber}
                          </span>
                          <span className="text-slate-500 font-medium">{student.bedNumber}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Checked Out
                        </span>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px] flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{student.email}</span>
                      </div>
                    </td>

                    {/* College & Course */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{student.college}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{student.course} ({student.academicYear})</div>
                    </td>

                    {/* Monthly Rent */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatINR(student.monthlyRent)}</div>
                      <div className="text-[10px] text-slate-400">Deposit: {formatINR(student.securityDeposit)}</div>
                    </td>

                    {/* Rent Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                          payStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : payStatus === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : payStatus === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {payStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setProfileModalStudent(student)}
                          className="px-2.5 py-1 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg font-semibold transition-colors flex items-center gap-1"
                          title="View Full Profile"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {isActive && (
                          <button
                            onClick={() => setCheckOutModal({ isOpen: true, student, date: new Date().toISOString().slice(0, 10) })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Check Out Student"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No students match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Student Profile Modal */}
      {profileModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-modal border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={profileModalStudent.photoUrl}
                  alt={profileModalStudent.name}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{profileModalStudent.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        profileModalStudent.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {profileModalStudent.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {profileModalStudent.studentId} • Joined {formatDate(profileModalStudent.joiningDate)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setProfileModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Room & Allocation Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-blue-50/50 border border-brand-200/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-brand-700 font-semibold uppercase tracking-wider">
                    Assigned Accommodation
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    Room {profileModalStudent.roomNumber} — {profileModalStudent.bedNumber}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Monthly Rent: <span className="font-semibold text-slate-900">{formatINR(profileModalStudent.monthlyRent)}</span> • Security Deposit: <span className="font-semibold text-slate-900">{formatINR(profileModalStudent.securityDeposit)}</span>
                  </div>
                </div>

                {profileModalStudent.status === 'Active' && (
                  <button
                    onClick={() => {
                      const st = profileModalStudent;
                      setProfileModalStudent(null);
                      openEditModal(st);
                    }}
                    className="px-3 py-1.5 bg-white border border-brand-300 text-brand-700 font-semibold rounded-lg shadow-sm hover:bg-brand-50"
                  >
                    Change Bed
                  </button>
                )}
              </div>

              {/* Personal & College Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                    Contact & KYC
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{' '}
                    <span className="font-semibold text-slate-800">{profileModalStudent.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <span className="font-semibold text-slate-800">{profileModalStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ID Proof:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {profileModalStudent.idProofType} ({profileModalStudent.idProofNumber || 'Verified'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Permanent Address:</span>{' '}
                    <span className="font-medium text-slate-700">{profileModalStudent.permanentAddress}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                    College & Guardian
                  </div>
                  <div>
                    <span className="text-slate-400">Institution:</span>{' '}
                    <span className="font-semibold text-slate-800">{profileModalStudent.college}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Course / Year:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {profileModalStudent.course} ({profileModalStudent.academicYear})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Parent / Guardian:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {profileModalStudent.parentName} ({profileModalStudent.parentPhone})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Emergency Contact:</span>{' '}
                    <span className="font-semibold text-slate-800">{profileModalStudent.emergencyContact}</span>
                  </div>
                </div>
              </div>

              {/* Payment History Ledger for this Student */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                    Rent Payment Records
                  </h4>
                  <button
                    onClick={() => {
                      const st = profileModalStudent;
                      setProfileModalStudent(null);
                      onOpenRecordPayment();
                    }}
                    className="text-brand-600 hover:text-brand-700 font-semibold text-xs"
                  >
                    + Record Payment
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Receipt #</th>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Amount Due</th>
                        <th className="py-2.5 px-3">Paid</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments
                        .filter(p => p.studentId === profileModalStudent.id)
                        .map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{p.receiptNumber}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{p.month}</td>
                            <td className="py-2 px-3">{formatINR(p.amountDue)}</td>
                            <td className="py-2 px-3 font-semibold text-emerald-600">{formatINR(p.amountPaid)}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  p.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : p.status === 'Overdue'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              {p.amountPaid > 0 ? (
                                <button
                                  onClick={() => onPrintReceipt(p.id)}
                                  className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 ml-auto"
                                >
                                  <Printer className="h-3 w-3" />
                                  <span>Print</span>
                                </button>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                onClick={() => handleDelete(profileModalStudent.id)}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Student</span>
              </button>

              <div className="flex gap-2">
                {profileModalStudent.status === 'Active' && (
                  <button
                    onClick={() => {
                      const st = profileModalStudent;
                      setProfileModalStudent(null);
                      setCheckOutModal({ isOpen: true, student: st, date: new Date().toISOString().slice(0, 10) });
                    }}
                    className="px-4 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Check Out Student
                  </button>
                )}
                <button
                  onClick={() => setProfileModalStudent(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-modal border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Admit New Student / Resident'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Section 1: Personal Information */}
              <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-400">
                1. Personal Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Section 2: Room & Allocation */}
              <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-400 pt-2 border-t border-slate-100">
                2. Room & Bed Allocation
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Room *</label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Choose Room --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.type}, {r.capacity}-Sharing) - {formatINR(r.rentPerBed)}/mo
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Bed Slot *</label>
                  <select
                    required
                    value={selectedBedId}
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Choose Bed --</option>
                    {vacantBedsInSelectedRoom.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} {b.isOccupied ? '(Currently Assigned)' : '(Available)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agreed Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Deposit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Section 3: College & Emergency Contact */}
              <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-400 pt-2 border-t border-slate-100">
                3. Academic & Guardian Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">College / University / Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Christ University / Infosys"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Father/Mother name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 ..."
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 ... (Relationship)"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Section 4: KYC & Permanent Address */}
              <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-400 pt-2 border-t border-slate-100">
                4. KYC Verification & Address
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Proof Type</label>
                  <select
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="College ID">College ID</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 7829 **** 1290"
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Permanent Home Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, City, State, PIN code"
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  {editingStudent ? 'Update Profile' : 'Admit & Allocate Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Out Modal */}
      {checkOutModal.isOpen && checkOutModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <UserX className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Check Out Resident</h3>
                <p className="text-xs text-slate-500">Vacate bed & settle deposit</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 my-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{checkOutModal.student.name}</div>
                <div className="text-slate-500 mt-0.5">
                  Room {checkOutModal.student.roomNumber} ({checkOutModal.student.bedNumber})
                </div>
                <div className="mt-2 text-slate-700">
                  Security Deposit to refund: <span className="font-bold text-slate-900">{formatINR(checkOutModal.student.securityDeposit)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checkout Date</label>
                <input
                  type="date"
                  value={checkOutModal.date}
                  onChange={(e) => setCheckOutModal(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Confirming checkout will release this bed slot immediately and mark the student's record as Checked Out.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCheckOutModal({ isOpen: false, student: null, date: '' })}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOutConfirm}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm text-xs"
              >
                Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
