import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  X,
  FileCheck,
  Building,
  User,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Payment, PaymentMethod, PaymentStatus } from '../../types';
import { formatINR, formatDate, numberToWordsINR, downloadCSV } from '../../utils/formatters';

interface PaymentsViewProps {
  initialPaymentIdToRecord?: string;
  onPrintReceiptRequested?: (paymentId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  initialPaymentIdToRecord,
  onPrintReceiptRequested,
}) => {
  const { payments, recordPayment, owner, selectedMonth, setSelectedMonth } = useData();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [recordPaymentModal, setRecordPaymentModal] = useState<{
    isOpen: boolean;
    payment: Payment | null;
  }>({
    isOpen: !!initialPaymentIdToRecord,
    payment: payments.find(p => p.id === initialPaymentIdToRecord) || null,
  });

  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    payment: Payment | null;
  }>({
    isOpen: false,
    payment: null,
  });

  // Record payment form fields
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter current month payments
  const currentMonthPayments = payments.filter(p => p.month === selectedMonth);

  const filteredPayments = currentMonthPayments.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.studentName.toLowerCase().includes(q);
      const matchRoom = p.roomNumber.toLowerCase().includes(q);
      const matchRec = p.receiptNumber.toLowerCase().includes(q);
      const matchTxn = p.transactionRef?.toLowerCase().includes(q);
      if (!matchName && !matchRoom && !matchRec && !matchTxn) return false;
    }
    return true;
  });

  // KPI calculations
  const totalBilled = currentMonthPayments.reduce((acc, p) => acc + p.amountDue, 0);
  const totalCollected = currentMonthPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const totalPending = currentMonthPayments
    .filter(p => p.status === 'Pending' || p.status === 'Partially Paid')
    .reduce((acc, p) => acc + p.balance, 0);
  const totalOverdue = currentMonthPayments
    .filter(p => p.status === 'Overdue')
    .reduce((acc, p) => acc + p.balance, 0);

  const openRecordModal = (p: Payment) => {
    setRecordPaymentModal({
      isOpen: true,
      payment: p,
    });
    setPayAmount(p.balance); // Default to full balance, but editable for partial!
    setPayMethod('UPI');
    setPayRef(`UPI/${Math.floor(100000 + Math.random() * 900000)}/HDFC`);
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayNotes('');
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordPaymentModal.payment) return;
    if (payAmount <= 0) {
      showToast('error', 'Please enter a valid payment amount greater than zero.');
      return;
    }
    if (!payRef.trim()) {
      showToast('error', 'Please provide a transaction reference or receipt ID.');
      return;
    }

    const res = recordPayment(
      recordPaymentModal.payment.id,
      Number(payAmount),
      payMethod,
      payRef.trim(),
      payDate,
      payNotes
    );

    if (res.success) {
      showToast('success', res.message);
      // Auto open printable receipt
      const updated = payments.find(p => p.id === recordPaymentModal.payment?.id);
      setRecordPaymentModal({ isOpen: false, payment: null });
      if (updated) {
        setReceiptModal({ isOpen: true, payment: { ...updated, amountPaid: (updated.amountPaid || 0) + Number(payAmount) } });
      }
    } else {
      showToast('error', res.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Student Name', 'Room', 'Bed', 'Month', 'Due Date', 'Amount Due (INR)', 'Amount Paid (INR)', 'Balance (INR)', 'Status', 'Payment Method', 'Transaction Ref', 'Notes'];
    const rows = filteredPayments.map(p => [
      p.receiptNumber,
      p.studentName,
      p.roomNumber,
      p.bedNumber,
      p.month,
      p.dueDate,
      p.amountDue,
      p.amountPaid,
      p.balance,
      p.status,
      p.paymentMethod || 'N/A',
      p.transactionRef || 'N/A',
      p.notes || ''
    ]);
    downloadCSV(`StaySync_Rent_Collection_${selectedMonth.replace(' ', '_')}`, headers, rows);
  };

  const handleNativePrint = () => {
    window.print();
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
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Rent Collection & Invoices</h2>
          <p className="text-xs text-slate-500">
            Track student rent payments, partial disbursements, UPI transaction references and download rent receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Billed Rent
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatINR(totalBilled)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{currentMonthPayments.length} Active Records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Collected Rent
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatINR(totalCollected)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% Efficiency
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Pending Rent
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1">{formatINR(totalPending)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting Student Clearance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Overdue Rent
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1">{formatINR(totalOverdue)}</div>
          <div className="text-[11px] text-rose-500 font-medium mt-0.5">Due date passed</div>
        </div>
      </div>

      {/* Search, Month & Status Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Paid', 'Partially Paid', 'Pending', 'Overdue'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, room or receipt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Rent Payment Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Resident / Room</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Billed Amount</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payment Method / Ref</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(payment => {
                const isPaid = payment.status === 'Paid';
                const isOverdue = payment.status === 'Overdue';
                const isPartial = payment.status === 'Partially Paid';

                return (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Receipt number */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {payment.receiptNumber}
                    </td>

                    {/* Student & Room */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{payment.studentName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-brand-600">Room {payment.roomNumber}</span>
                        <span>•</span>
                        <span>{payment.bedNumber}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{formatDate(payment.dueDate)}</div>
                      {payment.paymentDate && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Paid: {formatDate(payment.paymentDate)}
                        </div>
                      )}
                    </td>

                    {/* Billed */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatINR(payment.amountDue)}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {formatINR(payment.amountPaid)}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {payment.balance > 0 ? (
                        <span className={isOverdue ? 'text-rose-600' : 'text-amber-600'}>
                          {formatINR(payment.balance)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">₹0</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPartial
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isOverdue
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    {/* Method / Ref */}
                    <td className="py-3.5 px-4">
                      {payment.amountPaid > 0 ? (
                        <div>
                          <div className="font-medium text-slate-800">{payment.paymentMethod || 'UPI'}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                            {payment.transactionRef || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not recorded</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {payment.balance > 0 && (
                          <button
                            onClick={() => openRecordModal(payment)}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm transition-colors text-xs flex items-center gap-1"
                          >
                            <span>Record Pay</span>
                          </button>
                        )}

                        {payment.amountPaid > 0 && (
                          <button
                            onClick={() => setReceiptModal({ isOpen: true, payment })}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View / Print Rent Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No payment records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordPaymentModal.isOpen && recordPaymentModal.payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-brand-600">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Record Rent Payment</h3>
              </div>
              <button
                onClick={() => setRecordPaymentModal({ isOpen: false, payment: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 mt-4 text-xs">
              {/* Resident Summary Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{recordPaymentModal.payment.studentName}</span>
                  <span className="text-brand-600">
                    Room {recordPaymentModal.payment.roomNumber} ({recordPaymentModal.payment.bedNumber})
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Monthly Rent Due:</span>
                  <span className="font-semibold text-slate-900">{formatINR(recordPaymentModal.payment.amountDue)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Already Paid:</span>
                  <span className="font-semibold text-emerald-600">{formatINR(recordPaymentModal.payment.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                  <span>Outstanding Balance:</span>
                  <span className="text-amber-600">{formatINR(recordPaymentModal.payment.balance)}</span>
                </div>
              </div>

              {/* Amount to pay (Allows partial or full!) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount to Collect (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={recordPaymentModal.payment.balance}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPayAmount(recordPaymentModal.payment!.balance)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    Full Balance ({formatINR(recordPaymentModal.payment.balance)})
                  </button>
                  {recordPaymentModal.payment.balance > 2000 && (
                    <button
                      type="button"
                      onClick={() => setPayAmount(Math.round(recordPaymentModal.payment!.balance / 2))}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      50% Partial ({formatINR(Math.round(recordPaymentModal.payment.balance / 2))})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Reference / UTR */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction Reference / UTR / Cash Receipt # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI/991204/ICICI or CASH-101"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="Optional remarks"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordPaymentModal({ isOpen: false, payment: null })}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Rent Receipt Modal */}
      {receiptModal.isOpen && receiptModal.payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-modal border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2 text-slate-800">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official Rent Receipt</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNativePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptModal({ isOpen: false, payment: null })}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div id="printable-receipt" className="mt-4 p-6 border-2 border-slate-200 rounded-xl bg-white space-y-5 text-slate-800">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                    {owner.pgName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">{owner.pgAddress}, {owner.city} - {owner.pincode}</p>
                  <p className="text-xs text-slate-500">Phone: {owner.phone} | UPI: {owner.upiId}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 inline-block">
                    {receiptModal.payment.receiptNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Date: {formatDate(receiptModal.payment.paymentDate || new Date().toISOString())}</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-1 bg-slate-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
                Resident Rent Acknowledgement Receipt
              </div>

              {/* Tenant Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Received With Thanks From:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{receiptModal.payment.studentName}</div>
                  <div className="text-slate-600">Resident ID: {receiptModal.payment.studentId}</div>
                </div>
                <div>
                  <span className="text-slate-400">Accommodation Allocated:</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    Room {receiptModal.payment.roomNumber} ({receiptModal.payment.bedNumber})
                  </div>
                  <div className="text-slate-600">Rental Cycle: {receiptModal.payment.month}</div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3">
                      Monthly Room Rent & Facilities ({receiptModal.payment.month})
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {formatINR(receiptModal.payment.amountDue)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold text-emerald-800">
                    <td className="py-2.5 px-3">Total Amount Paid Received</td>
                    <td className="py-2.5 px-3 text-right">{formatINR(receiptModal.payment.amountPaid)}</td>
                  </tr>
                  {receiptModal.payment.balance > 0 && (
                    <tr className="bg-amber-50/50 font-semibold text-amber-800">
                      <td className="py-2 px-3">Remaining Balance Outstanding</td>
                      <td className="py-2 px-3 text-right">{formatINR(receiptModal.payment.balance)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* In Words */}
              <div className="text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400">Amount in Words: </span>
                <span className="font-bold text-slate-900 italic">
                  {numberToWordsINR(receiptModal.payment.amountPaid)}
                </span>
              </div>

              {/* Payment Mode and Signatures */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200">
                <div>
                  <div className="text-slate-500">
                    Payment Mode: <span className="font-bold text-slate-800">{receiptModal.payment.paymentMethod || 'UPI'}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Ref / UTR: {receiptModal.payment.transactionRef || 'N/A'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic font-bold text-sm text-slate-900">{owner.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                    Authorized Signatory / PG Manager
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end no-print">
              <button
                onClick={() => setReceiptModal({ isOpen: false, payment: null })}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
