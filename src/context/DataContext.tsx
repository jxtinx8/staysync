import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  OwnerProfile,
  Room,
  Student,
  Payment,
  Expense,
  Complaint,
  Visitor,
  Activity,
  ComplaintStatus,
  PaymentStatus,
  PaymentMethod
} from '../types';
import {
  initialOwnerProfile,
  initialRooms,
  initialStudents,
  initialPayments,
  initialExpenses,
  initialComplaints,
  initialVisitors,
  initialActivities
} from '../data/mockData';

interface DashboardMetrics {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  totalStudents: number;
  monthlyBilledRent: number;
  monthlyCollectedRent: number;
  pendingRent: number;
  overdueRent: number;
  monthlyExpenses: number;
  netProfit: number;
  pendingComplaintsCount: number;
  activeVisitorsCount: number;
}

interface DataContextType {
  // State
  owner: OwnerProfile;
  rooms: Room[];
  students: Student[];
  payments: Payment[];
  expenses: Expense[];
  complaints: Complaint[];
  visitors: Visitor[];
  activities: Activity[];
  metrics: DashboardMetrics;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Room Actions
  addRoom: (room: Omit<Room, 'id' | 'beds' | 'status'>, initialBedsCount?: number) => { success: boolean; message: string };
  updateRoom: (room: Room) => { success: boolean; message: string };
  deleteRoom: (roomId: string) => { success: boolean; message: string };

  // Bed & Allocation Actions
  assignStudentToBed: (studentId: string, roomId: string, bedId: string) => { success: boolean; message: string };
  transferStudentBed: (studentId: string, newRoomId: string, newBedId: string) => { success: boolean; message: string };

  // Student Actions
  addStudent: (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => { success: boolean; message: string; studentId?: string };
  updateStudent: (student: Student) => { success: boolean; message: string };
  checkOutStudent: (studentId: string, checkOutDate: string) => { success: boolean; message: string };
  deleteStudent: (studentId: string) => { success: boolean; message: string };

  // Payment Actions
  recordPayment: (paymentId: string, amount: number, method: PaymentMethod, ref: string, date: string, notes?: string) => { success: boolean; message: string };
  createManualPayment: (payment: Omit<Payment, 'id' | 'receiptNumber'>) => { success: boolean; message: string };
  updatePayment: (payment: Payment) => { success: boolean; message: string };

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id'>) => { success: boolean; message: string };
  updateExpense: (expense: Expense) => { success: boolean; message: string };
  deleteExpense: (expenseId: string) => { success: boolean; message: string };

  // Complaint Actions
  addComplaint: (complaint: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt'>) => { success: boolean; message: string };
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, resolutionNotes?: string) => { success: boolean; message: string };
  deleteComplaint: (complaintId: string) => { success: boolean; message: string };

  // Visitor Actions
  checkInVisitor: (visitor: Omit<Visitor, 'id' | 'status'>) => { success: boolean; message: string };
  checkOutVisitor: (visitorId: string, exitTime: string) => { success: boolean; message: string };
  deleteVisitor: (visitorId: string) => { success: boolean; message: string };

  // Profile Actions
  updateOwnerProfile: (profile: Partial<OwnerProfile>) => void;

  // System Actions
  resetToSampleData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; message: string };
}

const STORAGE_KEY = 'staysync_data_v2';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('November 2026');

  // Load from localStorage or initialize
  const loadInitialData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return {
      owner: initialOwnerProfile,
      rooms: initialRooms,
      students: initialStudents,
      payments: initialPayments,
      expenses: initialExpenses,
      complaints: initialComplaints,
      visitors: initialVisitors,
      activities: initialActivities,
    };
  };

  const initial = loadInitialData();

  const [owner, setOwner] = useState<OwnerProfile>(initial.owner);
  const [rooms, setRooms] = useState<Room[]>(initial.rooms);
  const [students, setStudents] = useState<Student[]>(initial.students);
  const [payments, setPayments] = useState<Payment[]>(initial.payments);
  const [expenses, setExpenses] = useState<Expense[]>(initial.expenses);
  const [complaints, setComplaints] = useState<Complaint[]>(initial.complaints);
  const [visitors, setVisitors] = useState<Visitor[]>(initial.visitors);
  const [activities, setActivities] = useState<Activity[]>(initial.activities);

  // Sync to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        owner,
        rooms,
        students,
        payments,
        expenses,
        complaints,
        visitors,
        activities,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Failed to sync to localStorage', err);
    }
  }, [owner, rooms, students, payments, expenses, complaints, visitors, activities]);

  // Activity logger helper
  const logActivity = (type: Activity['type'], title: string, description: string) => {
    const newAct: Activity = {
      id: 'act-' + Date.now(),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newAct, ...prev.slice(0, 49)]);
  };

  // Recalculate room occupancy status
  const updateRoomStatus = (roomList: Room[]): Room[] => {
    return roomList.map(r => {
      const occupiedCount = r.beds.filter(b => b.isOccupied).length;
      let status = r.status;
      if (status !== 'Maintenance') {
        if (occupiedCount === 0) status = 'Available';
        else if (occupiedCount === r.capacity) status = 'Fully Occupied';
        else status = 'Partially Occupied';
      }
      return { ...r, status };
    });
  };

  // Metrics calculation
  const metrics: DashboardMetrics = useMemo(() => {
    let totalRooms = rooms.length;
    let totalBeds = 0;
    let occupiedBeds = 0;

    rooms.forEach(r => {
      totalBeds += r.capacity;
      occupiedBeds += r.beds.filter(b => b.isOccupied).length;
    });

    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const totalStudents = students.filter(s => s.status === 'Active').length;

    // Filter current month payments
    const monthPayments = payments.filter(p => p.month === selectedMonth);
    const monthlyBilledRent = monthPayments.reduce((acc, p) => acc + (p.amountDue || 0), 0);
    const monthlyCollectedRent = monthPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
    const pendingRent = monthPayments
      .filter(p => p.status === 'Pending' || p.status === 'Partially Paid')
      .reduce((acc, p) => acc + (p.balance || 0), 0);
    const overdueRent = monthPayments
      .filter(p => p.status === 'Overdue')
      .reduce((acc, p) => acc + (p.balance || 0), 0);

    // Monthly expenses
    const monthlyExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    // Net profit = actual collected rent - expenses
    const netProfit = monthlyCollectedRent - monthlyExpenses;

    const pendingComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;
    const activeVisitorsCount = visitors.filter(v => v.status === 'Currently Inside').length;

    return {
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      totalStudents,
      monthlyBilledRent,
      monthlyCollectedRent,
      pendingRent,
      overdueRent,
      monthlyExpenses,
      netProfit,
      pendingComplaintsCount,
      activeVisitorsCount,
    };
  }, [rooms, students, payments, expenses, complaints, visitors, selectedMonth]);

  // ================= ROOM ACTIONS =================
  const addRoom = (roomData: Omit<Room, 'id' | 'beds' | 'status'>, initialBedsCount?: number) => {
    // Check if room number already exists
    if (rooms.some(r => r.roomNumber.toLowerCase() === roomData.roomNumber.trim().toLowerCase())) {
      return { success: false, message: `Room ${roomData.roomNumber} already exists!` };
    }

    const capacity = roomData.capacity || initialBedsCount || 2;
    const beds = Array.from({ length: capacity }, (_, i) => ({
      id: `${roomData.roomNumber}-${String.fromCharCode(65 + i)}`,
      bedNumber: `Bed ${String.fromCharCode(65 + i)}`,
      isOccupied: false,
    }));

    const newRoom: Room = {
      ...roomData,
      id: 'room-' + Date.now(),
      roomNumber: roomData.roomNumber.trim(),
      capacity,
      status: 'Available',
      beds,
    };

    setRooms(prev => [...prev, newRoom]);
    logActivity('room', 'Room Created', `Room ${newRoom.roomNumber} (${newRoom.capacity}-sharing ${newRoom.type}) was added.`);
    return { success: true, message: `Room ${newRoom.roomNumber} created successfully.` };
  };

  const updateRoom = (updated: Room) => {
    // Ensure capacity matches beds length or adjust
    let beds = [...updated.beds];
    if (beds.length < updated.capacity) {
      for (let i = beds.length; i < updated.capacity; i++) {
        beds.push({
          id: `${updated.roomNumber}-${String.fromCharCode(65 + i)}`,
          bedNumber: `Bed ${String.fromCharCode(65 + i)}`,
          isOccupied: false,
        });
      }
    } else if (beds.length > updated.capacity) {
      // Check if trying to remove occupied beds
      const occupiedBeyond = beds.slice(updated.capacity).some(b => b.isOccupied);
      if (occupiedBeyond) {
        return { success: false, message: 'Cannot reduce room capacity while higher bed slots are occupied!' };
      }
      beds = beds.slice(0, updated.capacity);
    }

    const finalRoom = { ...updated, beds };
    setRooms(prev => updateRoomStatus(prev.map(r => r.id === updated.id ? finalRoom : r)));
    logActivity('room', 'Room Updated', `Room ${updated.roomNumber} settings were updated.`);
    return { success: true, message: `Room ${updated.roomNumber} updated successfully.` };
  };

  const deleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { success: false, message: 'Room not found.' };

    const hasOccupants = room.beds.some(b => b.isOccupied);
    if (hasOccupants) {
      return { success: false, message: `Cannot delete Room ${room.roomNumber} as it currently has assigned students. Reassign or checkout students first.` };
    }

    setRooms(prev => prev.filter(r => r.id !== roomId));
    logActivity('room', 'Room Deleted', `Room ${room.roomNumber} was deleted.`);
    return { success: true, message: `Room ${room.roomNumber} deleted successfully.` };
  };

  // ================= BED & ALLOCATION ACTIONS =================
  const assignStudentToBed = (studentId: string, roomId: string, bedId: string) => {
    const student = students.find(s => s.id === studentId);
    const room = rooms.find(r => r.id === roomId);
    if (!student || !room) return { success: false, message: 'Student or Room not found.' };

    const bed = room.beds.find(b => b.id === bedId);
    if (!bed) return { success: false, message: 'Bed slot not found in this room.' };
    if (bed.isOccupied && bed.studentId !== studentId) {
      return { success: false, message: `${bed.bedNumber} in Room ${room.roomNumber} is already occupied by ${bed.studentName}!` };
    }

    // Free student's old bed if any
    let updatedRooms = rooms.map(r => ({
      ...r,
      beds: r.beds.map(b => {
        if (b.studentId === studentId && (r.id !== roomId || b.id !== bedId)) {
          return { ...b, isOccupied: false, studentId: undefined, studentName: undefined };
        }
        if (r.id === roomId && b.id === bedId) {
          return { ...b, isOccupied: true, studentId: student.id, studentName: student.name };
        }
        return b;
      })
    }));

    setRooms(updateRoomStatus(updatedRooms));

    // Update student record
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          roomId: room.id,
          roomNumber: room.roomNumber,
          bedId: bed.id,
          bedNumber: bed.bedNumber,
          monthlyRent: room.rentPerBed,
        };
      }
      return s;
    }));

    logActivity('student', 'Bed Assigned', `${student.name} assigned to Room ${room.roomNumber} (${bed.bedNumber}).`);
    return { success: true, message: `Assigned ${student.name} to Room ${room.roomNumber} - ${bed.bedNumber}.` };
  };

  const transferStudentBed = (studentId: string, newRoomId: string, newBedId: string) => {
    return assignStudentToBed(studentId, newRoomId, newBedId);
  };

  // ================= STUDENT ACTIONS =================
  const addStudent = (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => {
    const targetRoom = rooms.find(r => r.id === studentData.roomId);
    if (!targetRoom) return { success: false, message: 'Selected room not found.' };

    const targetBed = targetRoom.beds.find(b => b.id === studentData.bedId);
    if (!targetBed) return { success: false, message: 'Selected bed not found.' };
    if (targetBed.isOccupied) {
      return { success: false, message: `${targetBed.bedNumber} is already occupied in Room ${targetRoom.roomNumber}!` };
    }

    const nextIdNum = students.length + 1;
    const generatedId = `STU-2026-${String(nextIdNum).padStart(3, '0')}`;
    const newStudentId = 'stu-' + Date.now();

    const newStudent: Student = {
      ...studentData,
      id: newStudentId,
      studentId: generatedId,
      status: 'Active',
      monthlyRent: studentData.monthlyRent || targetRoom.rentPerBed,
    };

    // Update room bed
    const updatedRooms = rooms.map(r => {
      if (r.id === targetRoom.id) {
        const updatedBeds = r.beds.map(b => {
          if (b.id === targetBed.id) {
            return { ...b, isOccupied: true, studentId: newStudentId, studentName: newStudent.name };
          }
          return b;
        });
        return { ...r, beds: updatedBeds };
      }
      return r;
    });

    setRooms(updateRoomStatus(updatedRooms));
    setStudents(prev => [newStudent, ...prev]);

    // Create current month's rent record for student
    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      receiptNumber: `REC-2026-11-${String(payments.length + 1).padStart(3, '0')}`,
      studentId: newStudentId,
      studentName: newStudent.name,
      roomNumber: targetRoom.roomNumber,
      bedNumber: targetBed.bedNumber,
      month: selectedMonth,
      billingDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      amountDue: newStudent.monthlyRent,
      amountPaid: 0,
      balance: newStudent.monthlyRent,
      status: 'Pending',
      notes: `Initial rent bill generated on joining`,
    };

    setPayments(prev => [newPayment, ...prev]);
    logActivity('student', 'Student Checked In', `${newStudent.name} admitted to Room ${targetRoom.roomNumber} (${targetBed.bedNumber}).`);

    return { success: true, message: `Student ${newStudent.name} admitted successfully with ID ${newStudent.studentId}.`, studentId: newStudentId };
  };

  const updateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    // Update name on bed if changed
    setRooms(prev => prev.map(r => ({
      ...r,
      beds: r.beds.map(b => b.studentId === updated.id ? { ...b, studentName: updated.name } : b)
    })));
    logActivity('student', 'Student Updated', `Profile of ${updated.name} was updated.`);
    return { success: true, message: `Student ${updated.name} updated successfully.` };
  };

  const checkOutStudent = (studentId: string, checkOutDate: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found.' };

    // Free the bed in room
    const updatedRooms = rooms.map(r => ({
      ...r,
      beds: r.beds.map(b => b.studentId === studentId ? { ...b, isOccupied: false, studentId: undefined, studentName: undefined } : b)
    }));

    setRooms(updateRoomStatus(updatedRooms));

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: 'Checked Out',
          checkOutDate: checkOutDate || new Date().toISOString().slice(0, 10),
        };
      }
      return s;
    }));

    logActivity('student', 'Student Checked Out', `${student.name} checked out from Room ${student.roomNumber}. Security deposit settlement initiated.`);
    return { success: true, message: `${student.name} checked out successfully. Bed released.` };
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found.' };

    // Release bed
    const updatedRooms = rooms.map(r => ({
      ...r,
      beds: r.beds.map(b => b.studentId === studentId ? { ...b, isOccupied: false, studentId: undefined, studentName: undefined } : b)
    }));
    setRooms(updateRoomStatus(updatedRooms));
    setStudents(prev => prev.filter(s => s.id !== studentId));
    logActivity('student', 'Student Removed', `Student record ${student.name} was removed.`);
    return { success: true, message: `Student removed successfully.` };
  };

  // ================= PAYMENT ACTIONS =================
  const recordPayment = (
    paymentId: string,
    amount: number,
    method: PaymentMethod,
    ref: string,
    date: string,
    notes?: string
  ) => {
    if (amount <= 0) {
      return { success: false, message: 'Payment amount must be greater than zero.' };
    }

    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return { success: false, message: 'Payment record not found.' };

    const newAmountPaid = (payment.amountPaid || 0) + amount;
    const newBalance = Math.max(0, payment.amountDue - newAmountPaid);
    let newStatus: PaymentStatus = 'Paid';

    if (newBalance === 0) {
      newStatus = 'Paid';
    } else if (newAmountPaid > 0 && newAmountPaid < payment.amountDue) {
      newStatus = 'Partially Paid';
    } else {
      newStatus = 'Pending';
    }

    const updatedPayment: Payment = {
      ...payment,
      amountPaid: newAmountPaid,
      balance: newBalance,
      status: newStatus,
      paymentDate: date || new Date().toISOString().slice(0, 10),
      paymentMethod: method,
      transactionRef: ref || `TXN-${Date.now().toString().slice(-6)}`,
      notes: notes ? (payment.notes ? `${payment.notes} | ${notes}` : notes) : payment.notes,
    };

    setPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
    logActivity('payment', 'Payment Received', `₹${amount.toLocaleString('en-IN')} received from ${payment.studentName} via ${method}.`);

    return { success: true, message: `Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully for ${payment.studentName}.` };
  };

  const createManualPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      receiptNumber: `REC-2026-11-${String(payments.length + 1).padStart(3, '0')}`,
    };
    setPayments(prev => [newPayment, ...prev]);
    logActivity('payment', 'Rent Bill Created', `Bill of ₹${newPayment.amountDue.toLocaleString('en-IN')} added for ${newPayment.studentName}.`);
    return { success: true, message: `Rent record created successfully.` };
  };

  const updatePayment = (updated: Payment) => {
    setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
    return { success: true, message: 'Payment updated successfully.' };
  };

  // ================= EXPENSE ACTIONS =================
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
    };
    setExpenses(prev => [newExp, ...prev]);
    logActivity('expense', 'Expense Recorded', `₹${newExp.amount.toLocaleString('en-IN')} spent on ${newExp.category} (${newExp.title}).`);
    return { success: true, message: `Expense recorded successfully.` };
  };

  const updateExpense = (updated: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    return { success: true, message: 'Expense updated successfully.' };
  };

  const deleteExpense = (expenseId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    if (exp) {
      logActivity('expense', 'Expense Removed', `Expense "${exp.title}" was removed.`);
    }
    return { success: true, message: 'Expense deleted successfully.' };
  };

  // ================= COMPLAINT ACTIONS =================
  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt'>) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: 'comp-' + Date.now(),
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    setComplaints(prev => [newComplaint, ...prev]);
    logActivity('complaint', 'Complaint Registered', `[${newComplaint.priority}] ${newComplaint.title} in Room ${newComplaint.roomNumber}.`);
    return { success: true, message: `Complaint ${newComplaint.ticketNumber} registered successfully.` };
  };

  const updateComplaintStatus = (complaintId: string, status: ComplaintStatus, resolutionNotes?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status,
          resolutionNotes: resolutionNotes || c.resolutionNotes,
          resolvedAt: status === 'Resolved' ? (c.resolvedAt || new Date().toISOString()) : undefined,
        };
      }
      return c;
    }));
    const comp = complaints.find(c => c.id === complaintId);
    if (comp) {
      logActivity('complaint', 'Complaint Status Changed', `${comp.ticketNumber} marked as ${status}.`);
    }
    return { success: true, message: `Ticket status updated to ${status}.` };
  };

  const deleteComplaint = (complaintId: string) => {
    setComplaints(prev => prev.filter(c => c.id !== complaintId));
    return { success: true, message: 'Complaint deleted.' };
  };

  // ================= VISITOR ACTIONS =================
  const checkInVisitor = (visitorData: Omit<Visitor, 'id' | 'status'>) => {
    const newVisitor: Visitor = {
      ...visitorData,
      id: 'vis-' + Date.now(),
      status: 'Currently Inside',
    };
    setVisitors(prev => [newVisitor, ...prev]);
    logActivity('visitor', 'Visitor Checked In', `${newVisitor.visitorName} visiting ${newVisitor.studentName} in Room ${newVisitor.roomNumber}.`);
    return { success: true, message: `Visitor ${newVisitor.visitorName} checked in.` };
  };

  const checkOutVisitor = (visitorId: string, exitTime: string) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === visitorId) {
        return {
          ...v,
          exitTime: exitTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'Checked Out',
        };
      }
      return v;
    }));
    const vis = visitors.find(v => v.id === visitorId);
    if (vis) {
      logActivity('visitor', 'Visitor Checked Out', `${vis.visitorName} checked out.`);
    }
    return { success: true, message: `Visitor checked out successfully.` };
  };

  const deleteVisitor = (visitorId: string) => {
    setVisitors(prev => prev.filter(v => v.id !== visitorId));
    return { success: true, message: 'Visitor entry removed.' };
  };

  // ================= PROFILE ACTIONS =================
  const updateOwnerProfile = (profile: Partial<OwnerProfile>) => {
    setOwner(prev => ({ ...prev, ...profile }));
  };

  // ================= SYSTEM ACTIONS =================
  const resetToSampleData = () => {
    setOwner(initialOwnerProfile);
    setRooms(initialRooms);
    setStudents(initialStudents);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setComplaints(initialComplaints);
    setVisitors(initialVisitors);
    setActivities(initialActivities);
    localStorage.removeItem(STORAGE_KEY);
    logActivity('room', 'Demo Data Reset', 'Restored 10 verified Indian rooms, 25 beds, 15 students and financial records.');
  };

  const exportDataJSON = () => {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      owner,
      rooms,
      students,
      payments,
      expenses,
      complaints,
      visitors,
      activities,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.rooms && parsed.students && parsed.payments) {
        if (parsed.owner) setOwner(parsed.owner);
        if (parsed.rooms) setRooms(parsed.rooms);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.complaints) setComplaints(parsed.complaints);
        if (parsed.visitors) setVisitors(parsed.visitors);
        if (parsed.activities) setActivities(parsed.activities);
        return { success: true, message: 'Database backup imported successfully!' };
      }
      return { success: false, message: 'Invalid JSON backup format.' };
    } catch (e: any) {
      return { success: false, message: 'Failed to parse JSON file: ' + e.message };
    }
  };

  return (
    <DataContext.Provider
      value={{
        owner,
        rooms,
        students,
        payments,
        expenses,
        complaints,
        visitors,
        activities,
        metrics,
        selectedMonth,
        setSelectedMonth,
        addRoom,
        updateRoom,
        deleteRoom,
        assignStudentToBed,
        transferStudentBed,
        addStudent,
        updateStudent,
        checkOutStudent,
        deleteStudent,
        recordPayment,
        createManualPayment,
        updatePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        addComplaint,
        updateComplaintStatus,
        deleteComplaint,
        checkInVisitor,
        checkOutVisitor,
        deleteVisitor,
        updateOwnerProfile,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
