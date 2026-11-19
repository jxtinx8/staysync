export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  pgName: string;
  pgAddress: string;
  city: string;
  pincode: string;
  upiId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  totalFloors: number;
  establishedYear: number;
  noticePeriodDays: number;
  monthlyDueDate: number; // Day of month e.g. 5
}

export type RoomType = 'AC' | 'Non-AC';
export type RoomStatus = 'Available' | 'Partially Occupied' | 'Fully Occupied' | 'Maintenance';

export interface Bed {
  id: string; // e.g. "101-A"
  bedNumber: string; // e.g. "Bed A"
  isOccupied: boolean;
  studentId?: string;
  studentName?: string;
}

export interface Room {
  id: string;
  roomNumber: string; // e.g. "101"
  floor: number;
  capacity: number; // 1, 2, 3, 4
  rentPerBed: number;
  type: RoomType;
  amenities: string[];
  status: RoomStatus;
  beds: Bed[];
  description?: string;
}

export type StudentStatus = 'Active' | 'Checked Out';

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2026-001"
  name: string;
  photoUrl: string;
  phone: string;
  email: string;
  parentName: string;
  parentPhone: string;
  emergencyContact: string;
  college: string;
  course: string;
  academicYear: string;
  permanentAddress: string;
  joiningDate: string; // YYYY-MM-DD
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  status: StudentStatus;
  checkOutDate?: string;
  idProofType?: string;
  idProofNumber?: string;
  notes?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Card' | 'Cheque';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. "REC-2026-11-014"
  studentId: string;
  studentName: string;
  roomNumber: string;
  bedNumber: string;
  month: string; // e.g. "November 2026"
  billingDate: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'Electricity'
  | 'Water'
  | 'Food'
  | 'Internet'
  | 'Maintenance'
  | 'Staff Salaries'
  | 'Cleaning'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paidTo?: string;
  notes?: string;
}

export type ComplaintCategory = 
  | 'Electricity'
  | 'Water'
  | 'Wi-Fi'
  | 'Cleaning'
  | 'Furniture'
  | 'Plumbing'
  | 'Food'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'New' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  ticketNumber: string; // e.g. "TKT-1042"
  studentId: string;
  studentName: string;
  roomNumber: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type VisitorStatus = 'Currently Inside' | 'Checked Out';

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  purpose: string;
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:mm
  exitTime?: string; // HH:mm
  status: VisitorStatus;
}

export interface Activity {
  id: string;
  type: 'payment' | 'student' | 'room' | 'complaint' | 'expense' | 'visitor';
  title: string;
  description: string;
  timestamp: string;
}
