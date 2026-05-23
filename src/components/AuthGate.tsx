import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { Shield, Lock, Mail, User, Phone, Calendar as CalendarIcon, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthGateProps {
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export default function AuthGate({ onSuccess, title, description }: AuthGateProps) {
  const { signIn, signUp, authError, loading } = useFirebase();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Fields Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (isSignUp) {
      if (!name.trim() || !phone.trim() || !dob.trim() || !email.trim() || !password.trim()) {
        setLocalError('Please fill in all clinical registration fields.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must contain at least 6 characters for regulatory vault safety.');
        return;
      }
      try {
        await signUp(email, password, name, phone, dob);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        // Errors caught by context
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setLocalError('Please write down your username and security key.');
        return;
      }
      try {
        await signIn(email, password);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        // Errors caught by context
      }
    }
  };

  const fillDemoUser = () => {
    // Fill with pre-set variables to allow high usability
    setEmail('patient.demo@citygeneral.org');
    setPassword('democare123');
    setName('Alex Mercer');
    setPhone('+1 (555) 728-9412');
    setDob('1992-05-14');
  };

  return (
    <div className="card-surface overflow-hidden max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[520px] shadow-lg" id="auth-gate-interface">
      {/* Visual Column */}
      <div className="md:col-span-5 bg-gradient-to-br from-cyan-700 via-teal-700 to-indigo-800 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 text-xs font-bold text-blue-100 w-fit">
            <Shield className="w-3.5 h-3.5 text-blue-200" />
            HIPAA Clinical Security Guard
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-tight">
            {title || "Welcome to your Secure Live Health Vault"}
          </h3>
          <p className="text-[11px] text-blue-100/90 leading-relaxed font-medium">
            {description || "Join City General's live patient system to immediately file medical history records, coordinate appointments, and direct-message care specialists securely."}
          </p>
        </div>

        <div className="space-y-4 pt-8 relative z-10">
          <div className="space-y-2 text-[10px] font-bold text-blue-150">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SSL Encryption Handshakes Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Restricted Core Database Rulesets</span>
            </div>
          </div>
          <div className="p-3 bg-blue-900/40 border border-blue-500/20 rounded-xl text-[10px] text-blue-200 leading-relaxed font-semibold">
            ⚡ QUICK TESTING: Need to evaluate the interface? Click the "Pre-fill Demo Credentials" button on the right to auto-fill mock patient attributes.
          </div>
        </div>
      </div>

      {/* Inputs Column */}
      <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-white">
        <div className="w-full max-w-sm mx-auto space-y-6">
          
          {/* Tabs */}
          <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-100">
            <button
              onClick={() => {
                setIsSignUp(false);
                setLocalError('');
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isSignUp 
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setLocalError('');
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isSignUp 
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Profile
            </button>
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-extrabold text-slate-900">
              {isSignUp ? "Create Patient Registry Profile" : "Secure Clinical Sign In"}
            </h4>
            <p className="text-[11px] text-slate-500">
              {isSignUp 
                ? "Enter contact information to establish your unified permanent chart." 
                : "Authorize login keys to resume appointment files."}
            </p>
          </div>

          {/* Error notification and info */}
          <AnimatePresence mode="wait">
            {(localError || authError) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 border border-red-100 text-[11px] text-red-700 rounded-xl flex items-start gap-2 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{localError || authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full text-xs py-2 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-600 mb-1">Phone Contact</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 728-9412"
                        className="w-full text-xs py-2 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {/* DoB */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-600 mb-1">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient.demo@citygeneral.org"
                  className="w-full text-xs py-2 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-600 mb-1">Security Vault Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs py-2 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 disabled:bg-slate-250 disabled:text-slate-450"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Vault Profile
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Secure Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Option */}
          <div className="pt-2 border-t border-slate-50 text-center">
            <button
              type="button"
              onClick={fillDemoUser}
              className="text-[10px] font-bold text-slate-500 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/50 py-1.5 px-3 rounded-lg border border-slate-100 hover:border-blue-100 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Pre-fill Demo Credentials
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
