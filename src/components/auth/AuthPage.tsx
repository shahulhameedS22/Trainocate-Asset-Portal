import React, { useState } from 'react';
import { 
  Laptop, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, loginAsDemoUser } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role: UserRole) => {
    loginAsDemoUser(role);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 shadow-xl shadow-blue-600/30 border border-blue-400/30 mb-2">
            <Laptop className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Asset Portal</h1>
          <p className="text-xs text-slate-400">
            Enterprise IT Asset Management & Compliance
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0c1322]/90 backdrop-blur-xl border border-[#1a2744] p-6 sm:p-7 rounded-2xl shadow-2xl space-y-5">
          {/* Tab Switcher */}
          <div className="flex bg-[#070c18] border border-[#17223b] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Sarah Chen"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#070c18] border border-[#1a2744] focus:border-blue-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@assetportal.internal"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#070c18] border border-[#1a2744] focus:border-blue-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#070c18] border border-[#1a2744] focus:border-blue-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Create IT Account' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-3 border-t border-[#17223b] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center">
              Quick Test Sign In (1-Click)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="p-2 rounded-xl bg-[#091020] hover:bg-[#121f3d] border border-[#192747] text-left transition-colors group"
              >
                <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-200 truncate mt-0.5">
                  Full control
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('manager')}
                className="p-2 rounded-xl bg-[#091020] hover:bg-[#121f3d] border border-[#192747] text-left transition-colors group"
              >
                <div className="flex items-center space-x-1 text-blue-400 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Manager</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-200 truncate mt-0.5">
                  Approvals
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('staff')}
                className="p-2 rounded-xl bg-[#091020] hover:bg-[#121f3d] border border-[#192747] text-left transition-colors group"
              >
                <div className="flex items-center space-x-1 text-slate-300 text-[10px] font-bold">
                  <User className="w-3 h-3" />
                  <span>Staff</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-200 truncate mt-0.5">
                  Borrow/Tickets
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400">
          Protected by Enterprise Firebase Security Rules & 256-bit encryption
        </p>
      </div>
    </div>
  );
};
