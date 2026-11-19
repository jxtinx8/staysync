import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthView: React.FC = () => {
  const { login, loginDemo, register, forgotPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Login form
  const [email, setEmail] = useState('rajesh.kumar@staysync.in');
  const [password, setPassword] = useState('password123');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPgName, setRegPgName] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');

  // Forgot pass
  const [forgotEmail, setForgotEmail] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }
    login(email, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPgName || !regPhone || !regPassword) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    register(regName, regEmail, regPgName, regPhone, regPassword);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = forgotPassword(forgotEmail);
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 -mt-32 h-96 w-96 rounded-full bg-brand-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-navy-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 items-center justify-center shadow-lg shadow-brand-500/30 mb-3">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">StaySync</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Hostel OS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized PG Management • Owner-Only Dashboard
          </p>
        </div>

        {/* Hackathon Demo Quick Login Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-brand-900/60 via-indigo-900/40 to-cyan-900/40 border border-brand-500/30 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400" />
              Hackathon Demo Mode
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/30 text-brand-200">
              Preloaded
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
            Instantly access Sri Sai Balaji PG with 10 verified rooms, 25 beds, 15 students, and live rent collection.
          </p>
          <button
            onClick={loginDemo}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>⚡ 1-Click Demo Owner Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Message notification */}
        {message && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 mb-4 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-800 mb-5 text-xs">
          <button
            onClick={() => { setActiveTab('login'); setMessage(null); }}
            className={`flex-1 pb-2.5 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'login'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Owner Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setMessage(null); }}
            className={`flex-1 pb-2.5 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'register'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register PG
          </button>
          <button
            onClick={() => { setActiveTab('forgot'); setMessage(null); }}
            className={`flex-1 pb-2.5 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'forgot'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Tab 1: Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Owner Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="rajesh.kumar@staysync.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] text-brand-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Sign In to Dashboard
            </button>
          </form>
        )}

        {/* Tab 2: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">PG / Hostel Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sai Balaji Executive PG"
                  value={regPgName}
                  onChange={(e) => setRegPgName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="+91 98450 82134"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Owner Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="owner@myhostel.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-colors mt-2"
            >
              Create Account & Launch PG
            </button>
          </form>
        )}

        {/* Tab 3: Forgot Password */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
            <p className="text-slate-400 text-xs leading-relaxed">
              Enter your registered owner email address and we'll send a password recovery notification.
            </p>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="rajesh.kumar@staysync.in"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Send Password Reset
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* Security watermark footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>StaySync Enterprise PG System • Bank-Grade Precision</span>
        </div>
      </div>
    </div>
  );
};
