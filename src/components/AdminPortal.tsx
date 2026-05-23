import React, { useState, useEffect } from 'react';
import { Appointment, Doctor } from '../types';
import { DOCTORS } from '../data/doctors';
import { useFirebase, UserProfile } from '../context/FirebaseContext';
import { 
  ShieldCheck, Calendar, Users, Activity, CheckCircle2, XCircle, Clock, Search, 
  Plus, Edit, Trash2, LogOut, Lock, Mail, ChevronRight, UserPlus, FileEdit, AlertCircle,
  UserCheck, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPortal() {
  const { 
    user, 
    profile, 
    appointments, 
    isAdmin, 
    signIn, 
    signOut, 
    bookAppointment, 
    updateAppointmentStatus, 
    rescheduleAppointment, 
    getAllPatients,
    loading,
    authError,
    updateAdminCredentials,
    createNewAdmin,
    promoteUserToAdmin
  } = useFirebase();

  // Sub-view Tab State
  const [adminSubView, setAdminSubView] = useState<'appointments' | 'credentials' | 'admins'>('appointments');

  // Change Admin Credentials form states
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [credSuccessMsg, setCredSuccessMsg] = useState('');
  const [credErrorMsg, setCredErrorMsg] = useState('');
  const [credSubmitting, setCredSubmitting] = useState(false);

  // Create Admin Form states
  const [createAdminName, setCreateAdminName] = useState('');
  const [createAdminEmail, setCreateAdminEmail] = useState('');
  const [createAdminPassword, setCreateAdminPassword] = useState('');
  const [createAdminPhone, setCreateAdminPhone] = useState('');
  const [createAdminDob, setCreateAdminDob] = useState('');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrorMsg, setCreateErrorMsg] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Promote Admin states
  const [promotePatientId, setPromotePatientId] = useState('');
  const [promoteSuccessMsg, setPromoteSuccessMsg] = useState('');
  const [promoteErrorMsg, setPromoteErrorMsg] = useState('');
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);

  // Admin login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  // Dashboard filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Scheduled' | 'Completed' | 'Cancelled'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // List of patients for booking
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Add booking states
  const [showAddForm, setShowAddForm] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Patient details for guest booking
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');

  // Sibling states for booking
  const [selectedDoctorId, setSelectedDoctorId] = useState(DOCTORS[0].id);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  // Reschedule state
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleSlot, setNewRescheduleSlot] = useState('');
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState('');

  // Load patients list if isAdmin
  useEffect(() => {
    if (isAdmin) {
      setLoadingPatients(true);
      getAllPatients()
        .then((data) => {
          setPatients(data || []);
          if (data && data.length > 0) {
            setSelectedPatientId(data[0].uid);
          }
        })
        .catch((err) => console.error("Error loading registry patients:", err))
        .finally(() => setLoadingPatients(false));
    }
  }, [isAdmin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !password.trim()) {
      setLocalError('Please verify your admin login credentials.');
      return;
    }
    try {
      await signIn(email, password);
    } catch (err: any) {
      setLocalError(err?.message || 'Access Denied: Invalid credentials.');
    }
  };

  const handlePreFillAdmin = () => {
    setEmail('abdullahtahirasif@gmail.com');
    setPassword('8feb2006');
    setLocalError('');
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSuccessMsg('');
    setLocalError('');

    if (!bookingDate || !bookingSlot || !bookingReason.trim()) {
      setLocalError('Please complete all scheduling parameters.');
      return;
    }

    const docObj = DOCTORS.find(d => d.id === selectedDoctorId) || DOCTORS[0];

    let finalUserId = '';
    let finalPatientName = '';
    let finalPatientEmail = '';
    let finalPatientPhone = '';
    let finalPatientDob = '';

    if (isNewPatient) {
      if (!newPatientName.trim() || !newPatientEmail.trim() || !newPatientPhone.trim() || !newPatientDob) {
        setLocalError('Please write down patient demographics for guest registry.');
        return;
      }
      finalUserId = `GUEST-${Math.floor(1000 + Math.random() * 9000)}`;
      finalPatientName = newPatientName;
      finalPatientEmail = newPatientEmail;
      finalPatientPhone = newPatientPhone;
      finalPatientDob = newPatientDob;
    } else {
      const matchPatient = patients.find(p => p.uid === selectedPatientId);
      if (!matchPatient) {
        setLocalError('No valid patient selected.');
        return;
      }
      finalUserId = matchPatient.uid;
      finalPatientName = matchPatient.name;
      finalPatientEmail = matchPatient.email;
      finalPatientPhone = matchPatient.phone;
      finalPatientDob = matchPatient.dob;
    }

    try {
      const apptData = {
        patientName: finalPatientName,
        patientPhone: finalPatientPhone,
        patientEmail: finalPatientEmail,
        patientDob: finalPatientDob,
        doctorId: docObj.id,
        doctorName: docObj.name,
        specialty: docObj.specialty,
        date: bookingDate,
        timeSlot: bookingSlot,
        reason: bookingReason
      };

      await bookAppointment(apptData, finalUserId);
      setAddSuccessMsg('Clinical checkup slot booked and synced successfully.');
      
      // Reset form variables
      setBookingDate('');
      setBookingSlot('');
      setBookingReason('');
      setNewPatientName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
      setNewPatientDob('');
      
      setTimeout(() => {
        setShowAddForm(false);
        setAddSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to complete administrative appointment reservation.');
    }
  };

  const handleUpdateStatus = async (apptId: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    try {
      await updateAppointmentStatus(apptId, status);
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  const handleOpenReschedule = (appt: Appointment) => {
    setReschedulingAppt(appt);
    setNewRescheduleDate(appt.date);
    setNewRescheduleSlot(appt.timeSlot);
    setRescheduleSuccessMsg('');
  };

  const handleSaveReschedule = async () => {
    if (!reschedulingAppt) return;
    try {
      await rescheduleAppointment(reschedulingAppt.id, newRescheduleDate, newRescheduleSlot);
      setRescheduleSuccessMsg('Successfully rescheduled patient care schedule.');
      setTimeout(() => {
        setReschedulingAppt(null);
        setRescheduleSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error("Error rescheduling:", err);
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSuccessMsg('');
    setCredErrorMsg('');
    
    if (!adminNewEmail.trim() && !adminNewPassword.trim()) {
      setCredErrorMsg('Please specify either a new email address or a new administrative key.');
      return;
    }

    if (adminNewPassword && adminNewPassword !== adminConfirmPassword) {
      setCredErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setCredSubmitting(true);
    try {
      await updateAdminCredentials(
        adminNewEmail.trim() || undefined,
        adminNewPassword.trim() || undefined
      );
      setCredSuccessMsg('Administrative login credentials updated successfully.');
      setAdminNewEmail('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
    } catch (err: any) {
      setCredErrorMsg(err?.message || 'Failed to update administrative credentials.');
    } finally {
      setCredSubmitting(false);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccessMsg('');
    setCreateErrorMsg('');

    if (!createAdminName.trim() || !createAdminEmail.trim() || !createAdminPassword.trim() || !createAdminPhone.trim() || !createAdminDob) {
      setCreateErrorMsg('Please fill in all details.');
      return;
    }

    setCreateSubmitting(true);
    try {
      await createNewAdmin(
        createAdminEmail.trim(),
        createAdminPassword,
        createAdminName.trim(),
        createAdminPhone.trim(),
        createAdminDob
      );
      setCreateSuccessMsg(`Success! ${createAdminName} is now registered as an Admin.`);
      
      setCreateAdminName('');
      setCreateAdminEmail('');
      setCreateAdminPassword('');
      setCreateAdminPhone('');
      setCreateAdminDob('');

      // Reload patient list so current admin list stays synchronized
      const updatedPatientsList = await getAllPatients();
      setPatients(updatedPatientsList || []);
    } catch (err: any) {
      setCreateErrorMsg(err?.message || 'Could not register new administrator.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handlePromotePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteSuccessMsg('');
    setPromoteErrorMsg('');

    if (!promotePatientId) {
      setPromoteErrorMsg('Please select a registered patient to promote.');
      return;
    }

    setPromoteSubmitting(true);
    try {
      await promoteUserToAdmin(promotePatientId);
      const matchPatient = patients.find(p => p.uid === promotePatientId);
      setPromoteSuccessMsg(`Success! ${matchPatient?.name || 'User'} has been promoted to Admin.`);
      setPromotePatientId('');
      
      const updatedPatientsList = await getAllPatients();
      setPatients(updatedPatientsList || []);
    } catch (err: any) {
      setPromoteErrorMsg(err?.message || 'Administrative promotion failed.');
    } finally {
      setPromoteSubmitting(false);
    }
  };

  // Filtered appointments computation
  const filteredAppointments = appointments.filter(appt => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      appt.patientName.toLowerCase().includes(term) ||
      appt.doctorName.toLowerCase().includes(term) ||
      appt.id.toLowerCase().includes(term) ||
      appt.specialty.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    const matchesSpecialty = specialtyFilter === 'all' || appt.specialty === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  // Unique specialties for filtering
  const specialties = Array.from(new Set(DOCTORS.map(d => d.specialty)));

  // If not logged in as Admin, show Administrative Gate
  if (!user || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4" id="admin-security-gate">
        <div className="bg-white rounded-3xl border border-slate-200/85 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          
          {/* Accent side block */}
          <div className="md:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase">
                <Lock className="w-3.5 h-3.5" /> Clinical Portal Lock
              </div>
              <h3 className="text-2xl font-black tracking-tight leading-snug">
                Administrative Operations Shield
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Access is strictly authorized under City General Hospital digital governance protocol files. Authorized officers may direct-schedule clinical consultations and oversee active patient reservation manifests.
              </p>
            </div>
            <div className="pt-6 text-[10px] text-slate-500 font-bold space-y-1">
              <div>● Secure logs tracked centrally</div>
              <div>● Session timeouts automatically active</div>
            </div>
          </div>

          {/* Form Block */}
          <div className="md:col-span-7 p-8 md:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-sm w-full mx-auto space-y-6">
              <div className="space-y-1.5">
                <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Admin Authentication</h4>
                <p className="text-[11px] text-slate-500 font-medium">Verify your administrative key combination below to open active bookings.</p>
              </div>

              {localError && (
                <div className="p-3 bg-red-55/10 border border-red-200 text-[11px] text-red-700 rounded-xl flex items-start gap-2.5 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                  <span>{localError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-550 mb-1.5 font-mono">Executive Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="abdullahtahirasif@gmail.com"
                      className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all font-mono"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-550 mb-1.5 font-mono">Administrative Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white font-medium text-slate-800 transition-all font-mono"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Authenticate Access</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  onClick={handlePreFillAdmin}
                  className="text-[10px] font-extrabold text-slate-550 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/50 py-1.5 px-3 rounded-lg border border-slate-100 transition-all inline-flex items-center gap-1.5"
                >
                  🔑 Pre-fill Admin Credentials
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // Calculate quick dashboard stats
  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  return (
    <div className="max-w-7xl mx-auto py-2 space-y-8" id="admin-dashboard-section">
      
      {/* Header Profile Area */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-blue-600 text-[9px] font-extrabold tracking-widest uppercase rounded-lg border border-blue-500/10">
              AD-MIN ACCOUNT
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 font-bold">HIPAA Secure Connection Active</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{profile?.name || 'Administrator Terminal'}</h2>
          <p className="text-[11px] text-slate-400 leading-normal font-medium">Logged in via: <span className="font-mono text-blue-400 font-bold">{user.email}</span></p>
        </div>

        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-805 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-7000 hover:border-slate-600 transition-all cursor-pointer flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Exit Console</span>
        </button>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">TOTAL CONSULTATIONS</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5 block">{appointments.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-655 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">SCHEDULED / ACTIVE</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5 block">{scheduledCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">COMPLETED FILES</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5 block">{completedCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-650 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">CANCELLED RECORDS</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5 block">{cancelledCount}</span>
          </div>
        </div>

      </div>

      {/* Executive Console View Selection Tabs */}
      <div className="flex border-b border-slate-200 pb-px gap-2">
        <button
          onClick={() => setAdminSubView('appointments')}
          className={`py-2 px-4 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            adminSubView === 'appointments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-950'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Consultations Manifest</span>
        </button>

        <button
          onClick={() => setAdminSubView('admins')}
          className={`py-2 px-4 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            adminSubView === 'admins'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-950'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Designate Administrators</span>
        </button>

        <button
          onClick={() => setAdminSubView('credentials')}
          className={`py-2 px-4 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            adminSubView === 'credentials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-950'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Change Credentials</span>
        </button>
      </div>

      {adminSubView === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Core Bookings Manifest Table/List */}
          <div className="lg:col-span-8 space-y-4 bg-white p-5 rounded-2xl border border-slate-150/80 shadow-xs">
            
            {/* Header Action bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Active Consultation Register</h3>
                <p className="text-[11px] text-slate-500 font-medium font-sans">Oversee schedules, update care timelines, and transition patients.</p>
              </div>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold leading-normal cursor-pointer transition-all flex items-center justify-center gap-1.5 self-start"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Direct Add Booking</span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, symptom, specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-[11px] py-1.5 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 font-semibold"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Specialty filter */}
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Specialties</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>

            </div>

            {/* Appointments dynamic records rendering */}
            <div className="space-y-3.5 pt-2">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 space-y-1.5"
                  >
                    <Activity className="w-7 h-7 mx-auto stroke-slate-350" />
                    <div className="text-xs font-bold text-slate-800">No appointments match search parameters</div>
                    <div className="text-[10.5px] text-slate-400">Refine key indices or specialty attributes.</div>
                  </motion.div>
                ) : (
                  filteredAppointments.map(appt => {
                    const isScheduled = appt.status === 'Scheduled';
                    const isCompleted = appt.status === 'Completed';
                    const isCancelled = appt.status === 'Cancelled';

                    return (
                      <motion.div
                        key={appt.id}
                        layoutId={`appt-card-${appt.id}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-black text-blue-700 select-all">{appt.id}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10.5px] font-bold text-slate-650">{appt.date}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10.5px] font-bold text-slate-650">{appt.timeSlot}</span>
                          </div>

                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              {appt.patientName}
                              <span className="text-[10px] font-medium text-slate-400">({appt.patientDob})</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-semibold block leading-relaxed">
                              Clinician: <span className="text-slate-705 font-bold">Dr. {appt.doctorName.split(' ').slice(1).join(' ')}</span> ({appt.specialty})
                            </span>
                            <p className="text-[10.5px] text-slate-600 font-semibold mt-0.5 line-clamp-1 italic bg-white/60 p-1 px-2 border border-slate-100 rounded">
                              "{appt.reason}"
                            </p>
                          </div>
                        </div>

                        {/* Management Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                          
                          {/* Status badging */}
                          <div className="mr-2">
                            {isScheduled && (
                              <span className="p-1 px-2 bg-amber-50 text-[9px] font-extrabold text-amber-700 border border-amber-200 rounded-md">
                                Scheduled
                              </span>
                            )}
                            {isCompleted && (
                              <span className="p-1 px-2 bg-emerald-50 text-[9px] font-extrabold text-emerald-700 border border-emerald-250 rounded-md">
                                Completed
                              </span>
                            )}
                            {isCancelled && (
                              <span className="p-1 px-2 bg-red-50 text-[9px] font-extrabold text-red-650 border border-red-200 rounded-md">
                                Cancelled
                              </span>
                            )}
                          </div>

                          {/* Transitions */}
                          {isScheduled && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all cursor-pointer"
                                title="Transition to Completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenReschedule(appt)}
                                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all cursor-pointer"
                                title="Reschedule Care Hour"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                                className="p-1.5 bg-red-55 hover:bg-red-650 text-white rounded-md transition-all cursor-pointer"
                                title="Cancel Checkup Slot"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {!isScheduled && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'Scheduled')}
                              className="text-[9px] font-extrabold tracking-normal text-slate-500 hover:text-blue-600 hover:underline transition-all cursor-pointer"
                            >
                              Restore Status
                            </button>
                          )}

                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Reschedule Side modal / add direct modal */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Add direct form block */}
            <AnimatePresence mode="wait">
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white p-5 rounded-2xl border border-blue-105 shadow-md space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-755 inline-flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      Direct Booking Scheduler
                    </h4>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-650 font-bold"
                    >
                      Close
                    </button>
                  </div>

                  {localError && (
                    <div className="p-2.5 bg-red-50 border border-red-150 text-[10.5px] text-red-700 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-650" />
                      <span>{localError}</span>
                    </div>
                  )}

                  {addSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[10.5px] text-emerald-700 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{addSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateBooking} className="space-y-3 text-xs font-semibold text-slate-700">
                    
                    {/* Select registry vs new patient toggle */}
                    <div className="bg-slate-50 p-1 rounded-lg flex border border-slate-150">
                      <button
                        type="button"
                        onClick={() => setIsNewPatient(false)}
                        className={`flex-1 py-1 text-center text-[10px] font-bold rounded transition-all ${
                          !isNewPatient 
                            ? 'bg-white text-blue-700 shadow-xs' 
                            : 'text-slate-500'
                        }`}
                      >
                        Registered Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNewPatient(true)}
                        className={`flex-1 py-1 text-center text-[10px] font-bold rounded transition-all ${
                          isNewPatient 
                            ? 'bg-white text-blue-700 shadow-xs' 
                            : 'text-slate-500'
                        }`}
                      >
                        Guest File Check
                      </button>
                    </div>

                    {isNewPatient ? (
                      <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Patient Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Alex Mercer"
                            value={newPatientName}
                            onChange={(e) => setNewPatientName(e.target.value)}
                            className="w-full text-xs p-1.5 bg-white border border-slate-205 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-550 mb-1">Patient Phone</label>
                          <input
                            type="text"
                            required
                            placeholder="+1 (555) 728-9412"
                            value={newPatientPhone}
                            onChange={(e) => setNewPatientPhone(e.target.value)}
                            className="w-full text-xs p-1.5 bg-white border border-slate-205 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-550 mb-1">Email</label>
                            <input
                              type="email"
                              required
                              placeholder="alex@demo.org"
                              value={newPatientEmail}
                              onChange={(e) => setNewPatientEmail(e.target.value)}
                              className="w-full text-xs p-1.5 bg-white border border-slate-205 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-550 mb-1">DoB</label>
                            <input
                              type="date"
                              required
                              value={newPatientDob}
                              onChange={(e) => setNewPatientDob(e.target.value)}
                              className="w-full text-[11px] p-1.5 bg-white border border-slate-205 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Select Patient File</label>
                        <select
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="w-full text-xs p-1.5 bg-slate-50 border border-slate-205 rounded-md focus:outline-none text-slate-800"
                        >
                          {loadingPatients ? (
                            <option>Loading patients register...</option>
                          ) : patients.length === 0 ? (
                            <option>No registered patients found</option>
                          ) : (
                            patients.map(p => (
                              <option key={p.uid} value={p.uid}>
                                {p.name} ({p.email})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}

                    {/* Choose Doctor */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Board Doctor</label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 border border-slate-205 rounded-md focus:outline-none text-slate-800"
                      >
                        {DOCTORS.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.specialty})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Choose Date and TimeSlot */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Consult Date</label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-205 rounded-md focus:outline-none text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Care Slot</label>
                        <select
                          value={bookingSlot}
                          onChange={(e) => setBookingSlot(e.target.value)}
                          className="w-full text-xs p-1.5 bg-slate-50 border border-slate-205 rounded-md focus:outline-none text-slate-800"
                        >
                          <option value="">Choose slot</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:30 PM">03:30 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Reason for checkup</label>
                      <textarea
                        required
                        placeholder="Symptoms, complaints or standard checkup files..."
                        rows={2}
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded-md focus:outline-none text-slate-805"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4 text-white" />
                      <span>Confirm Care Reservation</span>
                    </button>

                  </form>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Reschedule Active Block */}
            <AnimatePresence mode="wait">
              {reschedulingAppt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white p-5 rounded-2xl border border-amber-250 shadow-md space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Reschedule Consultation
                    </h4>
                    <button
                      onClick={() => setReschedulingAppt(null)}
                      className="text-xs text-slate-450 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  {rescheduleSuccessMsg && (
                    <div className="p-2 bg-emerald-50 border border-emerald-150 text-[10px] text-emerald-700 rounded-lg flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{rescheduleSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Patient Reference ID:</span>
                      <span className="text-slate-800 font-bold block">{reschedulingAppt.patientName} ({reschedulingAppt.id})</span>
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Select New Clinical Date</label>
                      <input
                        type="date"
                        value={newRescheduleDate}
                        onChange={(e) => setNewRescheduleDate(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 border border-slate-205 rounded-md text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Select New Time Slot</label>
                      <select
                        value={newRescheduleSlot}
                        onChange={(e) => setNewRescheduleSlot(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 border border-slate-205 rounded-md text-slate-800"
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                        <option value="04:30 PM">04:30 PM</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSaveReschedule}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Commit New Reschedule Date
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Informative guidelines */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 text-[10.5px] font-medium leading-relaxed text-slate-500">
              <span className="font-extrabold text-slate-700 block uppercase tracking-wider font-mono text-[9px]">Administrative Guidelines</span>
              <p>
                ● Completed consult checkups automatically shift the checklist to historical patient files.
              </p>
              <p>
                ● Adding guest bookings immediately generates unique identifiers for patients without direct profile log access.
              </p>
            </div>

          </div>

        </div>
      )}

      {adminSubView === 'credentials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-xs max-w-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Administrative Authentication Parameters</h3>
            <p className="text-[11px] text-slate-500 font-medium font-sans">Re-key secure credentials for <span className="font-mono text-blue-600 font-bold">{user.email}</span>.</p>
          </div>

          {credSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{credSuccessMsg}</span>
            </div>
          )}

          {credErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-150 text-xs text-red-700 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{credErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangeCredentials} className="space-y-4 text-xs font-semibold text-slate-705">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-1.5">New Executive Email address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="new-admin-email@gmail.com"
                  value={adminNewEmail}
                  onChange={(e) => setAdminNewEmail(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                Leave empty if updating administrative access keys only.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-1.5 font-mono">New Administrative Key</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-1.5 font-mono">Confirm Key</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={credSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              {credSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Update Credentials</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[10.5px] leading-relaxed text-amber-800 font-medium">
            <span className="font-bold flex items-center gap-1 mb-1 text-[11px]"><Settings className="w-3.5 h-3.5" /> Security Notice</span>
            For immediate HIPAA-compliant account safety policies, updating credentials will instantly modify your secure Firebase login attributes. If your session is stale, Firebase may trigger a safety blocker requiring you to log out and sign back in before changing key items.
          </div>
        </div>
      )}

      {adminSubView === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Create and Promote Forms */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Create brand new Admin */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Register New Administrator</h3>
                <p className="text-[11px] text-slate-500 font-medium">Enter credentials to provision a full Administrative level account.</p>
              </div>

              {createSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-850 rounded-xl">
                  {createSuccessMsg}
                </div>
              )}

              {createErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-150 text-xs text-red-700 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-650" />
                  <span>{createErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateAdminSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Diana Prince"
                      value={createAdminName}
                      onChange={(e) => setCreateAdminName(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 303-9111"
                      value={createAdminPhone}
                      onChange={(e) => setCreateAdminPhone(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={createAdminDob}
                      onChange={(e) => setCreateAdminDob(e.target.value)}
                      className="w-full text-[11px] p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Secret Access Key Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={createAdminPassword}
                      onChange={(e) => setCreateAdminPassword(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="diana-prince@citygeneral.org"
                    value={createAdminEmail}
                    onChange={(e) => setCreateAdminEmail(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 font-sans"
                >
                  {createSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Provision Admin Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Promote existing Patient to Admin */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Promote Existing Patient</h3>
                <p className="text-[11px] text-slate-500 font-medium">Designate administrative permissions to any patient file already on record.</p>
              </div>

              {promoteSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-850 rounded-xl">
                  {promoteSuccessMsg}
                </div>
              )}

              {promoteErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-150 text-xs text-red-700 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-650" />
                  <span>{promoteErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePromotePatientSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Select Registered Patient to Elevate</label>
                  <select
                    value={promotePatientId}
                    onChange={(e) => setPromotePatientId(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white text-slate-805"
                  >
                    <option value="">-- Choose patient --</option>
                    {patients
                      .filter(p => p.role !== 'admin' && p.email !== 'abdullahtahirasif@gmail.com' && p.email !== 'admin@citygeneral.org')
                      .map(p => (
                        <option key={p.uid} value={p.uid}>
                          {p.name} ({p.email})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={promoteSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 font-sans"
                >
                  {promoteSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Elevate Selected Patient to Admin</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Current Administrators Column Layout */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-150/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Active Executive Directory</h3>
              <p className="text-[11px] text-slate-500 font-medium">Individuals authorized to modify digital care registries.</p>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 space-y-1">
              {/* Hardcoded main administrator files */}
              <div className="py-2.5 flex items-center justify-between gap-3 text-xs font-sans">
                <div>
                  <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                    Abdullah Tahir Asif
                    <span className="p-0.5 px-1.5 bg-blue-100 text-[8px] font-extrabold text-blue-700 tracking-wider rounded uppercase">Lead</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">abdullahtahirasif@gmail.com</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Root Admin" />
              </div>

              <div className="py-2.5 flex items-center justify-between gap-3 text-xs font-sans">
                <div>
                  <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                    Administrative Lead
                    <span className="p-0.5 px-1.5 bg-slate-100 text-[8px] font-extrabold text-slate-500 tracking-wider rounded uppercase">Fallback</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">admin@citygeneral.org</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-300" title="Fallback" />
              </div>

              {/* Dynamic designated administrators */}
              {patients
                .filter(p => p.role === 'admin' && p.email !== 'abdullahtahirasif@gmail.com' && p.email !== 'admin@citygeneral.org')
                .map(p => (
                  <div key={p.uid} className="py-2.5 flex items-center justify-between gap-3 text-xs font-sans">
                    <div>
                      <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                        {p.name}
                        <span className="p-0.5 px-1.5 bg-emerald-55 text-[8px] font-extrabold text-emerald-700 tracking-wider rounded uppercase">Designated</span>
                      </div>
                      <div className="text-[10px] text-slate-450 font-mono">{p.email}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500" title="Designated Admin" />
                  </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[10px] leading-relaxed text-slate-500 font-medium">
              Note: Root administration anchors are globally locked for absolute security. Designated administrators can be managed dynamically.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
