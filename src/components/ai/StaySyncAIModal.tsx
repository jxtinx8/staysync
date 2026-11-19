import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BedDouble,
  CreditCard,
  Users,
  Wrench,
  X,
  RotateCcw,
  Key,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatINR, formatDate } from '../../utils/formatters';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  dataCard?: {
    type: 'pending_rent' | 'vacant_beds' | 'student_count' | 'collection' | 'complaints' | 'net_profit' | 'overdue_rent';
    title: string;
    metrics?: { label: string; value: string; color?: string }[];
    table?: { headers: string[]; rows: (string | number)[][] };
  };
}

interface StaySyncAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const StaySyncAIModal: React.FC<StaySyncAIModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { metrics, rooms, students, payments, expenses, complaints, visitors, selectedMonth } = useData();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Hello Rajesh! I am StaySync AI, your verified PG Business Intelligence Assistant. Every answer I provide is calculated strictly from verified database records. Ask me anything about rent dues, bed vacancies, monthly profit or resident complaints.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    'How much rent is pending?',
    'Which rooms have vacant beds?',
    'How many students are currently staying?',
    'What is this month\'s actual collection?',
    'Which complaints are unresolved?',
    'What is our net profit this month?',
    'Who has overdue rent?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Smart Query Engine: Deterministic, Grounded, Zero Hallucinations
  const processQuery = (query: string): Message => {
    const q = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 1. Pending Rent
    if (q.includes('pending') && (q.includes('rent') || q.includes('collection') || q.includes('how much'))) {
      const pendingPayments = payments.filter(
        p => (p.status === 'Pending' || p.status === 'Partially Paid' || p.status === 'Overdue') && p.month === selectedMonth
      );
      const totalPending = pendingPayments.reduce((acc, p) => acc + p.balance, 0);
      const overdueTotal = pendingPayments.filter(p => p.status === 'Overdue').reduce((acc, p) => acc + p.balance, 0);

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `As of ${selectedMonth}, the total pending rent is ${formatINR(totalPending)} across ${pendingPayments.length} resident(s). Out of this, ${formatINR(overdueTotal)} is already overdue.`,
        timestamp,
        dataCard: {
          type: 'pending_rent',
          title: 'Pending Rent Breakdown',
          metrics: [
            { label: 'Total Pending', value: formatINR(totalPending), color: 'text-amber-600' },
            { label: 'Overdue Dues', value: formatINR(overdueTotal), color: 'text-rose-600' },
            { label: 'Pending Students', value: `${pendingPayments.length} Students`, color: 'text-slate-800' },
          ],
          table: {
            headers: ['Student', 'Room', 'Balance', 'Due Date', 'Status'],
            rows: pendingPayments.map(p => [p.studentName, `Room ${p.roomNumber}`, formatINR(p.balance), p.dueDate, p.status]),
          },
        },
      };
    }

    // 2. Vacant Beds
    if (q.includes('vacant') || q.includes('available bed') || q.includes('which room') || q.includes('empty')) {
      const vacantList: { room: string; floor: number; bed: string; rent: number; type: string }[] = [];
      rooms.forEach(r => {
        r.beds.forEach(b => {
          if (!b.isOccupied) {
            vacantList.push({
              room: r.roomNumber,
              floor: r.floor,
              bed: b.bedNumber,
              rent: r.rentPerBed,
              type: r.type,
            });
          }
        });
      });

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `You currently have ${vacantList.length} vacant bed slots available across ${new Set(vacantList.map(v => v.room)).size} rooms. Total potential monthly revenue from vacant beds is ${formatINR(vacantList.reduce((acc, v) => acc + v.rent, 0))}.`,
        timestamp,
        dataCard: {
          type: 'vacant_beds',
          title: 'Available Vacant Beds',
          metrics: [
            { label: 'Vacant Beds', value: `${vacantList.length} Beds`, color: 'text-emerald-600' },
            { label: 'Occupancy Rate', value: `${metrics.occupancyRate}%`, color: 'text-brand-600' },
          ],
          table: {
            headers: ['Room', 'Floor', 'Bed Slot', 'Type', 'Rent/Mo'],
            rows: vacantList.map(v => [`Room ${v.room}`, `Floor ${v.floor}`, v.bed, v.type, formatINR(v.rent)]),
          },
        },
      };
    }

    // 3. How many students
    if (q.includes('student') || q.includes('staying') || q.includes('resident') || q.includes('occupant')) {
      const activeStudents = students.filter(s => s.status === 'Active');
      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `There are currently ${activeStudents.length} active students staying at your PG. Bed occupancy is at ${metrics.occupancyRate}% (${metrics.occupiedBeds} occupied out of ${metrics.totalBeds} total beds).`,
        timestamp,
        dataCard: {
          type: 'student_count',
          title: 'Resident Occupancy Summary',
          metrics: [
            { label: 'Active Students', value: `${activeStudents.length}`, color: 'text-brand-600' },
            { label: 'Occupied Beds', value: `${metrics.occupiedBeds} / ${metrics.totalBeds}`, color: 'text-slate-800' },
            { label: 'Vacant Beds', value: `${metrics.availableBeds}`, color: 'text-emerald-600' },
          ],
        },
      };
    }

    // 4. Actual Collection
    if (q.includes('actual collection') || q.includes('collected') || q.includes('collection') || q.includes('revenue')) {
      const monthPayments = payments.filter(p => p.month === selectedMonth);
      const totalCollected = monthPayments.reduce((acc, p) => acc + p.amountPaid, 0);
      const totalBilled = monthPayments.reduce((acc, p) => acc + p.amountDue, 0);
      const rate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `For ${selectedMonth}, your actual verified rent collection is ${formatINR(totalCollected)} out of ${formatINR(totalBilled)} billed (${rate}% collection efficiency).`,
        timestamp,
        dataCard: {
          type: 'collection',
          title: 'Rent Collection Audit',
          metrics: [
            { label: 'Actual Collected', value: formatINR(totalCollected), color: 'text-emerald-600' },
            { label: 'Total Billed', value: formatINR(totalBilled), color: 'text-slate-700' },
            { label: 'Efficiency', value: `${rate}%`, color: 'text-brand-600' },
          ],
        },
      };
    }

    // 5. Unresolved complaints
    if (q.includes('complaint') || q.includes('unresolved') || q.includes('ticket') || q.includes('maintenance') || q.includes('issue')) {
      const pendingComp = complaints.filter(c => c.status !== 'Resolved');
      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `There are currently ${pendingComp.length} unresolved maintenance tickets in the hostel. ${pendingComp.filter(c => c.priority === 'Urgent').length} ticket is marked Urgent.`,
        timestamp,
        dataCard: {
          type: 'complaints',
          title: 'Active Maintenance Tickets',
          metrics: [
            { label: 'Unresolved Tickets', value: `${pendingComp.length}`, color: 'text-amber-600' },
            { label: 'Urgent Priority', value: `${pendingComp.filter(c => c.priority === 'Urgent').length}`, color: 'text-rose-600' },
          ],
          table: {
            headers: ['Ticket #', 'Room', 'Priority', 'Category', 'Issue Title'],
            rows: pendingComp.map(c => [c.ticketNumber, `Room ${c.roomNumber}`, c.priority, c.category, c.title]),
          },
        },
      };
    }

    // 6. Net Profit
    if (q.includes('net profit') || q.includes('profit') || q.includes('margin') || q.includes('income')) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `Your Net Operating Profit for ${selectedMonth} is ${formatINR(metrics.netProfit)}. This is strictly calculated using: Net Profit = Actual Rent Collected (${formatINR(metrics.monthlyCollectedRent)}) − Recorded Expenses (${formatINR(metrics.monthlyExpenses)}).`,
        timestamp,
        dataCard: {
          type: 'net_profit',
          title: 'Net Profit Calculation',
          metrics: [
            { label: 'Rent Collected', value: formatINR(metrics.monthlyCollectedRent), color: 'text-emerald-600' },
            { label: 'Expenses', value: formatINR(metrics.monthlyExpenses), color: 'text-amber-600' },
            { label: 'Net Profit', value: formatINR(metrics.netProfit), color: metrics.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600' },
          ],
        },
      };
    }

    // 7. Overdue Rent
    if (q.includes('overdue')) {
      const overdueList = payments.filter(p => p.status === 'Overdue');
      const overdueTotal = overdueList.reduce((acc, p) => acc + p.balance, 0);

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: `You have ${overdueList.length} resident(s) with overdue rent totaling ${formatINR(overdueTotal)}.`,
        timestamp,
        dataCard: {
          type: 'overdue_rent',
          title: 'Overdue Rent Notice List',
          metrics: [
            { label: 'Overdue Total', value: formatINR(overdueTotal), color: 'text-rose-600' },
            { label: 'Overdue Count', value: `${overdueList.length} Residents`, color: 'text-slate-800' },
          ],
          table: {
            headers: ['Student', 'Room', 'Overdue Amount', 'Due Date', 'Notes'],
            rows: overdueList.map(p => [p.studentName, `Room ${p.roomNumber}`, formatINR(p.balance), p.dueDate, p.notes || '']),
          },
        },
      };
    }

    // Default fallback
    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: `I verified your query against the live database: Your PG has ${metrics.totalRooms} rooms, ${metrics.totalBeds} beds (${metrics.occupancyRate}% occupancy), ${metrics.totalStudents} active residents, ${formatINR(metrics.monthlyCollectedRent)} collected this month, and ${formatINR(metrics.pendingRent)} pending rent. Try one of the quick questions below for detailed breakdowns.`,
      timestamp,
    };
  };

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = processQuery(q);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] shadow-modal border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200/80 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">StaySync AI</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified DB Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in verified PG records • Zero hallucinations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Clear chat history"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Intelligence Notice Strip */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Active Data Engine: 10 Rooms, 25 Beds, 15 Students, Live Ledger
          </span>
          <span className="text-brand-600 font-semibold">100% Deterministic</span>
        </div>

        {/* Chat message history container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-brand-600 text-white shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white text-left shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-subtle'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Structured Result Card if attached */}
                {msg.dataCard && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle text-left space-y-3 mt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-900">{msg.dataCard.title}</span>
                      <span className="text-[10px] text-slate-400">Database Record</span>
                    </div>

                    {/* Metrics pills */}
                    {msg.dataCard.metrics && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {msg.dataCard.metrics.map((m, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-[10px] font-medium text-slate-500">{m.label}</div>
                            <div className={`text-sm font-bold mt-0.5 ${m.color || 'text-slate-900'}`}>
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mini table */}
                    {msg.dataCard.table && (
                      <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                              {msg.dataCard.table.headers.map((h, i) => (
                                <th key={i} className="py-1.5 px-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {msg.dataCard.table.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                {row.map((val, j) => (
                                  <td key={j} className="py-1.5 px-2.5 text-slate-700">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 px-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">Analyzing database records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-white border-t border-slate-200/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Suggested Database Inquiries
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg whitespace-nowrap text-slate-700 font-medium transition-colors border border-slate-200/60"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 mt-2"
          >
            <input
              type="text"
              placeholder="Ask anything about rent, beds, students, expenses, or profit..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
