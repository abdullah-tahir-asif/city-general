import React, { useState, useEffect } from 'react';
import { Appointment, MedicalRecord, Prescription, PortalMessage, VitalRecord, Doctor } from '../types';
import { DOCTORS } from '../data/doctors';
import { 
  Lock, User, LogIn, Activity, Calendar, Shield, Cpu, RefreshCw, AlertCircle, FileText, 
  MessageSquare, Send, Check, Heart, Plus, Bell, ChevronRight, BarChart3, Pill, Trash2, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import AuthGate from './AuthGate';

interface PatientPortalProps {
  appointments: Appointment[]; // Fallback prop, though we prefer real-time Firebase context state first
  doctors: Doctor[];
  onOpenBooking: () => void;
  initialSelectedDoctor?: Doctor | null;
}

export default function PatientPortal({ doctors, onOpenBooking, initialSelectedDoctor }: PatientPortalProps) {
  const { user, profile, appointments: fbAppointments, signOut, updateAppointmentStatus, loading: authLoading } = useFirebase();

  // Portal Nav View State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'prescriptions' | 'messages'>('dashboard');

  // Unified appointments list prioritizing live database state
  const activeAppointments = fbAppointments;

  // Form toggles
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showLogVital, setShowLogVital] = useState(false);
  const [showEditDemographics, setShowEditDemographics] = useState(false);

  // Form inputs states
  const [newRecord, setNewRecord] = useState({
    type: 'Lab Result' as 'Lab Result' | 'Clinical Note' | 'Imaging' | 'Vaccination',
    title: '',
    doctorName: DOCTORS[0].name,
    details: '',
    status: 'Normal' as 'Normal' | 'Attention Required' | 'Action Taken'
  });

  const [newPres, setNewPres] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    refillsRemaining: 3,
    prescribingDoctor: DOCTORS[0].name,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [newVital, setNewVital] = useState({
    date: new Date().toLocaleString('en-US', { month: 'short' }), // e.g., 'Jun'
    heartRate: 72,
    bloodPressure: '120/80',
    weight: 170,
    bloodSugar: 90
  });

  const [newDemo, setNewDemo] = useState({
    height: "5'10\"",
    bloodType: 'O+'
  });

  // Dynamic user data states
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [demographics, setDemographics] = useState({ height: "5'10\"", bloodType: "O+" });

  const [selectedDoctorId, setSelectedDoctorId] = useState(initialSelectedDoctor?.id || DOCTORS[0].id);
  const [typedMessage, setTypedMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Active lab result modal
  const [activeRecordDetail, setActiveRecordDetail] = useState<MedicalRecord | null>(null);

  // Success message notice for Refill Click action
  const [refillNotice, setRefillNotice] = useState<string | null>(null);

  // Load user dynamic stats on startup
  useEffect(() => {
    if (!user) return;
    
    const savedRecords = localStorage.getItem(`records_${user.uid}`);
    setRecords(savedRecords ? JSON.parse(savedRecords) : []);

    const savedPres = localStorage.getItem(`prescriptions_${user.uid}`);
    setPrescriptions(savedPres ? JSON.parse(savedPres) : []);

    const savedVitals = localStorage.getItem(`vitals_${user.uid}`);
    setVitals(savedVitals ? JSON.parse(savedVitals) : []);

    const savedDemo = localStorage.getItem(`demographics_${user.uid}`);
    setDemographics(savedDemo ? JSON.parse(savedDemo) : { height: "5'10\"", bloodType: "O+" });
  }, [user]);

  // Persist states to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`records_${user.uid}`, JSON.stringify(records));
    }
  }, [records, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`prescriptions_${user.uid}`, JSON.stringify(prescriptions));
    }
  }, [prescriptions, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`vitals_${user.uid}`, JSON.stringify(vitals));
    }
  }, [vitals, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`demographics_${user.uid}`, JSON.stringify(demographics));
    }
  }, [demographics, user]);

  // Sync messaging logs based on active conversation
  useEffect(() => {
    if (!user) return;
    const key = `messages_${user.uid}_${selectedDoctorId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const chosenDoc = DOCTORS.find(d => d.id === selectedDoctorId) || DOCTORS[0];
      const welcome: PortalMessage = {
        id: `welcome-${selectedDoctorId}`,
        sender: 'Doctor',
        senderName: chosenDoc.name,
        text: `Hello ${profile?.name || 'there'}! This is Dr. ${chosenDoc.name.split(' ').slice(1).join(' ')}. Welcome to your private, HIPAA-secure messaging thread. Please feel free to write to me regarding your ${chosenDoc.specialty.toLowerCase()} concerns or ask any general questions about your clinical care. I will respond to your messages during daily clinical rounds.`,
        timestamp: 'Just now'
      };
      setMessages([welcome]);
    }
  }, [user, selectedDoctorId, profile?.name]);

  const saveMessages = (newMsgs: PortalMessage[]) => {
    setMessages(newMsgs);
    if (user) {
      localStorage.setItem(`messages_${user.uid}_${selectedDoctorId}`, JSON.stringify(newMsgs));
    }
  };

  // If initial Selected Doctor is injected, automatically jump to messages
  useEffect(() => {
    if (initialSelectedDoctor && user) {
      setSelectedDoctorId(initialSelectedDoctor.id);
      setActiveTab('messages');
    }
  }, [initialSelectedDoctor, user]);

  const handleAddRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.title.trim() || !newRecord.details.trim()) return;
    const added: MedicalRecord = {
      id: `rec-${Date.now()}`,
      type: newRecord.type,
      title: newRecord.title,
      doctorName: newRecord.doctorName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      details: newRecord.details,
      status: newRecord.status
    };
    setRecords(prev => [added, ...prev]);
    setShowAddRecord(false);
    setNewRecord({
      type: 'Lab Result',
      title: '',
      doctorName: DOCTORS[0].name,
      details: '',
      status: 'Normal'
    });
  };

  const handleAddPrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPres.medication.trim() || !newPres.dosage.trim()) return;
    const added: Prescription = {
      id: `rx-${Date.now()}`,
      medication: newPres.medication,
      dosage: newPres.dosage,
      frequency: newPres.frequency || 'Take once daily in the morning',
      refillsRemaining: Number(newPres.refillsRemaining) || 0,
      prescribingDoctor: newPres.prescribingDoctor,
      startDate: newPres.startDate,
      endDate: newPres.endDate,
      status: 'Active'
    };
    setPrescriptions(prev => [added, ...prev]);
    setShowAddPrescription(false);
    setNewPres({
      medication: '',
      dosage: '',
      frequency: '',
      refillsRemaining: 3,
      prescribingDoctor: DOCTORS[0].name,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleLogVitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const added: VitalRecord = {
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
      heartRate: Number(newVital.heartRate) || 72,
      bloodPressure: newVital.bloodPressure || '120/80',
      weight: Number(newVital.weight) || 170,
      bloodSugar: Number(newVital.bloodSugar) || 90
    };
    setVitals(prev => [...prev, added]);
    setShowLogVital(false);
    setNewVital({
      date: new Date().toLocaleString('en-US', { month: 'short' }),
      heartRate: 72,
      bloodPressure: '120/80',
      weight: 170,
      bloodSugar: 90
    });
  };

  const handleEditDemographicsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemographics({
      height: newDemo.height || demographics.height,
      bloodType: newDemo.bloodType || demographics.bloodType
    });
    setShowEditDemographics(false);
  };

  const handleRefillRequest = (id: string, name: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === id && p.refillsRemaining > 0) {
        return { ...p, refillsRemaining: p.refillsRemaining - 1 };
      }
      return p;
    }));
    
    setRefillNotice(`A clinical refill request has been successfully dispatched for ${name} to PrimePharma Care.`);
    setTimeout(() => {
      setRefillNotice(null);
    }, 4000);
  };

  const handleCancelCheckup = async (apptId: string) => {
    if (window.confirm("Are you sure you want to cancel this scheduled checkup reservation?")) {
      try {
        await updateAppointmentStatus(apptId, 'Cancelled');
      } catch (err) {
        console.error("Failed to cancel scheduled appointment:", err);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const chosenDoc = DOCTORS.find(d => d.id === selectedDoctorId) || DOCTORS[0];
    const userMessageText = typedMessage;

    const newMsg: PortalMessage = {
      id: `m-${Date.now()}`,
      sender: 'Patient',
      senderName: profile?.name || 'Authorized Member',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today'
    };

    const updated = [...messages, newMsg];
    saveMessages(updated);
    setTypedMessage('');
    setIsReplying(true);

    // Simulate smart physician answering
    setTimeout(() => {
      let doctorText = '';
      const textLower = userMessageText.toLowerCase();

      if (textLower.includes('chest pain') || textLower.includes('breath') || textLower.includes('heart rate')) {
        doctorText = `Hello, this is Dr. ${chosenDoc.name.split(' ').slice(1).join(' ')}'s automated urgent assistance line. If you are actively experiencing localized chest pressure, palpitations, or difficulty breathing, please STOP typing, do not wait, and head directly to General ER or dial 911 immediately. Clinical safety remains our priority.`;
      } else if (textLower.includes('fever') || textLower.includes('sore throat') || textLower.includes('cough')) {
        doctorText = `Hi, thank you for writing. For moderate fevers or general respiratory fatigue, we advise staying strictly hydrated, resting, and evaluating your oral temperature every 4 hours. You can take temporary acetaminophen/ibuprofen. If symptoms persist for more than 48 hours, let's schedule an outpatient appointment.`;
      } else if (textLower.includes('refill') || textLower.includes('medication') || textLower.includes('prescription')) {
        doctorText = `Hello, regarding your prescriptions: I have received your request. Please ensure you click 'Request Refill' on your portal's Prescriptions drawer so our coordinator can electronically authorize the release to your local pharmacy.`;
      } else {
        doctorText = `Greetings, I have received your message. I am currently reviewing charts but wanted to confirm receipt of your inquiry. Your query has been logged, and I will write back with a detailed clinical answer shortly during diagnostic rounds. Stay hearty!`;
      }

      const doctorReply: PortalMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'Doctor',
        senderName: chosenDoc.name,
        text: doctorText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today'
      };

      saveMessages([...updated, doctorReply]);
      setIsReplying(false);
    }, 1500);
  };

  if (authLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center justify-center min-h-[500px]" id="portal-loading-gate">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-550 font-bold uppercase tracking-widest font-mono">Synchronizing Patient Vault Records...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden min-h-[580px] flex flex-col" id="patient-portal">
      <AnimatePresence mode="wait">
        {!user ? (
          // UNAUTHENTICATED GATE
          <motion.div 
            key="unauth"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 md:p-8"
          >
            <AuthGate 
              title="Secure Patient Portal Access" 
              description="Sign in or register to view authorized lab findings, coordinate checkups in real-time, order prescription refills, and message clinical practitioners directly."
            />
          </motion.div>
        ) : (
          // PORTAL DASHBOARD (AUTHENTICATED)
          <motion.div 
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-[580px]"
          >
            {/* Upper Member Alert Banner */}
            <div className="bg-slate-900 text-slate-100 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-850 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-widest">
                  {(profile?.name || user.email || 'AM').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{profile?.name || user.email?.split('@')[0]}</span>
                    <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      ID: {user.uid.substring(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Primary Clinician: Dr. Robert Chen • DoB: {profile?.dob || 'N/A'} • Verified Account
                  </span>
                </div>
              </div>

              {/* Quick-links inside portal */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['dashboard', 'records', 'prescriptions', 'messages'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-bold capitalize rounded-xl transition-all ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <button 
                  onClick={() => signOut()}
                  className="ml-3 px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors border border-slate-800 rounded-xl hover:border-red-900 inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Exit
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[550px]" id="portal-inner-body">
              {/* Alert notice messages if active */}
              {refillNotice && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-semibold rounded-xl flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>{refillNotice}</span>
                </div>
              )}

              {/* DASHBOARD TAB VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Welcome Record */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Health Alert</span>
                        <span className="p-1 bg-white rounded-lg text-blue-600 border border-blue-100 shadow-sm">
                          <Activity className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {vitals.length > 0 ? vitals[vitals.length - 1].bloodPressure : '-- / --'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">
                          {vitals.length > 0 ? 'Last Blood Pressure (mmHg)' : 'No Blood Pressure on File'}
                        </span>
                      </div>
                    </div>

                    {/* Active Prescriptions Counter */}
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Care Inventory</span>
                        <span className="p-1 bg-white rounded-lg text-amber-600 border border-amber-100 shadow-sm">
                          <Pill className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-slate-900 font-mono">{prescriptions.length} Active</span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">Medications Prescribed</span>
                      </div>
                    </div>

                    {/* Next Appointment Card */}
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Next Scheduled Visit</span>
                        <span className="p-1 bg-white rounded-lg text-emerald-600 border border-emerald-100 shadow-sm">
                          <Calendar className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-[13px] font-black text-slate-900 truncate block">
                          {activeAppointments.filter(a => a.status === 'Scheduled').length > 0 
                            ? activeAppointments.filter(a => a.status === 'Scheduled')[0].date 
                            : 'None Scheduled'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">
                          {activeAppointments.filter(a => a.status === 'Scheduled').length > 0 
                            ? `With ${activeAppointments.filter(a => a.status === 'Scheduled')[0].doctorName}` 
                            : 'Use booking tab to reserve'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals & Real-time Appointments Divider */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Real-time DB Appointments Logs Table */}
                    <div className="lg:col-span-12 bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Your Saved Consultation Schedule</h4>
                          <span className="text-[10px] text-slate-400">Synchronized dynamically from your secure Firebase Firestore account.</span>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-700 py-1 px-2.5 rounded-full font-mono">
                          {activeAppointments.length} Bookings Logs
                        </span>
                      </div>

                      {activeAppointments.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                          <Calendar className="w-8 h-8 text-slate-310 mx-auto" strokeWidth={1.5} />
                          <h5 className="text-xs font-bold text-slate-700">No scheduled appointments found on secure file.</h5>
                          <p className="text-[10px] text-slate-450 max-w-sm mx-auto">
                            Need outpatient checking services? Choose the bookings link in the portal menu to write coordinates.
                          </p>
                          <button
                            onClick={onOpenBooking}
                            className="mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Book Consultation
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-600 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="py-2.5 px-3">Booking ID</th>
                                <th className="py-2.5 px-3">Clinician Staff</th>
                                <th className="py-2.5 px-3">Date</th>
                                <th className="py-2.5 px-3">Hour Slot</th>
                                <th className="py-2.5 px-3">Reason</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Action Gate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                              {activeAppointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-slate-50/50 group transition-colors">
                                  <td className="py-3 px-3 font-mono text-[10px] text-slate-900 font-extrabold">
                                    {appt.id}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="text-slate-900 font-bold">{appt.doctorName}</div>
                                    <div className="text-[10px] text-slate-400 font-bold">{appt.specialty}</div>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                                    {appt.date}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-150">
                                      {appt.timeSlot}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 max-w-xs truncate text-[11px] text-slate-500">
                                    {appt.reason}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                      appt.status === 'Scheduled' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : appt.status === 'Cancelled'
                                        ? 'bg-red-50 text-red-700 border-red-100'
                                        : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                      {appt.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    {appt.status === 'Scheduled' && (
                                      <button
                                        onClick={() => handleCancelCheckup(appt.id)}
                                        className="py-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Cancel
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Vitals Line Chart SVG */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Cardiovascular Vitals Summary</h4>
                          <span className="text-[10px] text-slate-400">Resting Heart Rate trend tracked chronologically.</span>
                        </div>
                        <span className="text-[10px] font-bold py-1 px-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full">
                          {vitals.length > 0 ? 'Live Log Tracking' : 'No Data Added'}
                        </span>
                      </div>

                      {/* Custom SVG Line Chart */}
                      {vitals.length === 0 ? (
                        <div className="h-44 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center space-y-2">
                          <BarChart3 className="w-8 h-8 text-slate-300" />
                          <h5 className="text-xs font-bold text-slate-700">No Vitals Trends Logged</h5>
                          <p className="text-[10px] text-slate-450 max-w-xs leading-normal">
                            Keep track of your vitals over time. Once you submit a resting heart rate and metrics log, your visual cardiovascular curve will render here.
                          </p>
                          <button
                            onClick={() => setShowLogVital(true)}
                            className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                          >
                            Log First Entry
                          </button>
                        </div>
                      ) : (
                        <div className="h-44 w-full bg-slate-50 rounded-2xl border border-slate-100 p-2 relative flex flex-col justify-between">
                          {/* Upper line grid markers */}
                          <div className="absolute top-1/4 left-0 right-0 border-t border-slate-200/50 pointer-events-none" />
                          <div className="absolute top-1/2 left-0 right-0 border-t border-slate-200/50 pointer-events-none" />
                          <div className="absolute top-3/4 left-0 right-0 border-t border-slate-200/50 pointer-events-none" />

                          {/* Dynamic Custom SVG Line Chart */}
                          <svg className="w-full h-full overflow-visible pt-4 pb-6" viewBox="0 0 500 100">
                            {(() => {
                              const maxVal = 120;
                              const minVal = 40;
                              const pointsCount = vitals.length;
                              const getX = (idx: number) => {
                                if (pointsCount <= 1) return 250;
                                return 50 + (idx * (400 / (pointsCount - 1)));
                              };
                              const getY = (val: number) => {
                                const pct = (val - minVal) / (maxVal - minVal);
                                return 90 - (pct * 80); // bound between 10 and 90
                              };

                              const polyPoints = vitals.map((v, i) => `${getX(i)},${getY(v.heartRate)}`).join(' ');
                              const areaPoints = `${getX(0)},90 ` + vitals.map((v, i) => `${getX(i)},${getY(v.heartRate)}`).join(' ') + ` ${getX(pointsCount - 1)},90`;

                              return (
                                <>
                                  {/* Curve line */}
                                  {pointsCount > 1 && (
                                    <polyline
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeWidth="3.5"
                                      points={polyPoints}
                                    />
                                  )}
                                  {/* Area under curve */}
                                  {pointsCount > 1 && (
                                    <polygon
                                      fill="rgba(59, 130, 246, 0.04)"
                                      points={areaPoints}
                                    />
                                  )}
                                  {/* Dots & Labels */}
                                  {vitals.map((v, i) => (
                                    <g key={i}>
                                      <circle cx={getX(i)} cy={getY(v.heartRate)} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                                      <text x={getX(i)} y={getY(v.heartRate) - 10} fontSize="8" fontWeight="bold" fill="#334155" textAnchor="middle">
                                        {v.heartRate} bpm
                                      </text>
                                      <text x={getX(i)} y="102" fontSize="8" fill="#94a3b8" textAnchor="middle" className="uppercase font-bold">
                                        {v.date}
                                      </text>
                                    </g>
                                  ))}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Vitals summary lists */}
                    <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Personal Metrics</span>
                          <button
                            onClick={() => {
                              setNewDemo({
                                height: demographics.height,
                                bloodType: demographics.bloodType
                              });
                              setShowEditDemographics(true);
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-200/50">
                          <span className="text-slate-500 font-medium">Height</span>
                          <span className="font-bold text-slate-800">{demographics.height}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-200/50">
                          <span className="text-slate-500 font-medium">Weight</span>
                          <span className="font-bold text-slate-800">
                            {vitals.length > 0 ? `${vitals[vitals.length - 1].weight} lbs` : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-200/50">
                          <span className="text-slate-500 font-medium">Fasting Sugar</span>
                          <span className="font-bold text-slate-800">
                            {vitals.length > 0 ? `${vitals[vitals.length - 1].bloodSugar} mg/dL` : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5">
                          <span className="text-slate-500 font-medium">Blood Type</span>
                          <span className="font-bold text-red-650 uppercase">{demographics.bloodType}</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => setShowLogVital(true)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          <Plus className="w-3.5 h-3.5" /> Log Daily Vitals
                        </button>
                        <button
                          onClick={onOpenBooking}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Book Consultation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MEDICAL RECORDS VIEW TAB */}
              {activeTab === 'records' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Medical Records Vault</h4>
                      <p className="text-xs text-slate-500">HIPAA Protected clinical diagnostics, lab findings and imaging readouts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddRecord(true)}
                        className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Log Record
                      </button>
                      <span className="text-[10px] font-bold text-slate-500">{records.length} records active</span>
                    </div>
                  </div>

                  {records.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl space-y-3">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
                      <h5 className="text-sm font-bold text-slate-800">Your clinical archive is currently clean.</h5>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        No medical files, diagnoses, or electronic lab certificates are logged on this secure HIPAA device profile.
                      </p>
                      <button
                        onClick={() => setShowAddRecord(true)}
                        className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                      >
                        <Plus className="w-4 h-4" /> Log Custom Laboratory Entry
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-white">
                      {records.map(rec => (
                        <div 
                          key={rec.id}
                          onClick={() => setActiveRecordDetail(rec)}
                          className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-slate-100 rounded-xl text-slate-500">
                              <FileText className="w-4.5 h-4.5 text-blue-500" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {rec.type}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{rec.date}</span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 mt-1">{rec.title}</h5>
                              <span className="text-[10px] text-slate-500">Authorized by: {rec.doctorName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rec.status === 'Normal' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {rec.status}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Active Record slideout modal */}
                  <AnimatePresence>
                    {activeRecordDetail && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs flex items-center justify-center"
                        onClick={() => setActiveRecordDetail(null)}
                      >
                        <motion.div 
                          initial={{ scale: 0.95, y: 15 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.95, y: 15 }}
                          className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 z-50 text-left border border-slate-100 shadow-2xl relative"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                            <div>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                {activeRecordDetail.type}
                              </span>
                              <h4 className="text-base font-bold text-slate-900 mt-1">{activeRecordDetail.title}</h4>
                              <p className="text-[10px] text-slate-400">Date filed: {activeRecordDetail.date} • Authorized: {activeRecordDetail.doctorName}</p>
                            </div>
                            <button 
                              onClick={() => setActiveRecordDetail(null)}
                              className="text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-lg"
                            >
                              Close
                            </button>
                          </div>

                          <div className="whitespace-pre-line text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono">
                            {activeRecordDetail.details}
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                window.print();
                              }}
                              className="py-1 px-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                            >
                              Download PDF Report
                            </button>
                            <button
                              onClick={() => setActiveRecordDetail(null)}
                              className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              Acknowledge File
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ACTIVE PRESCRIPTIONS VIEW */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Clinical Rx Prescription Panel</h4>
                      <p className="text-xs text-slate-500">Electronically authorized active drug plans with instant pharmacy refills.</p>
                    </div>
                    <button
                      onClick={() => setShowAddPrescription(true)}
                      className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Log Prescription
                    </button>
                  </div>

                  {prescriptions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl space-y-3">
                      <Pill className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
                      <h5 className="text-sm font-bold text-slate-800">No active prescriptions tracked.</h5>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        There are no clinical prescriptions synchronized with your outpatient accounts. You can log an active drug trial or supplement to test the panel.
                      </p>
                      <button
                        onClick={() => setShowAddPrescription(true)}
                        className="py-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.2 shadow-md shadow-amber-500/10"
                      >
                        <Plus className="w-4 h-4" /> Log Custom Prescription Rx
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prescriptions.map(pres => (
                        <div key={pres.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-150 relative overflow-hidden flex flex-col justify-between space-y-4 min-h-[180px]">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] uppercase font-bold text-amber-700 font-mono bg-amber-100/60 px-2 py-0.5 rounded-md">
                                Licensed Rx Prescription
                              </span>
                              <span className="text-xs font-extrabold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                <Pill className="w-3 h-3" />
                                Active
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{pres.medication}</h4>
                              <span className="text-[10px] text-slate-500 block">Dosage: {pres.dosage}</span>
                              <p className="text-[11px] text-slate-700 font-medium mt-1 leading-normal italic">
                                "{pres.frequency}"
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
                              <div>
                                <span>Doctor:</span>
                                <span className="text-slate-800 font-bold block">{pres.prescribingDoctor}</span>
                              </div>
                              <div>
                                <span>Registry:</span>
                                <span className="text-slate-800 font-bold block">Refills Left: {pres.refillsRemaining}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/50 font-sans">
                            <button
                              onClick={() => handleRefillRequest(pres.id, pres.medication)}
                              disabled={pres.refillsRemaining <= 0}
                              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                pres.refillsRemaining > 0 
                                  ? 'bg-[#d97706] text-white hover:bg-[#b45309] hover:shadow-md' 
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {pres.refillsRemaining > 0 ? 'Request Refill Release' : 'No Refills Left - Requires Checkup'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECURE MESSAGING VIEW */}
              {activeTab === 'messages' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[360px]">
                  {/* Select Practitioner sidebar */}
                  <div className="md:col-span-4 bg-slate-50 p-4 rounded-3xl border border-slate-150 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Select Clinician</span>
                    <div className="space-y-1">
                      {DOCTORS.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            selectedDoctorId === doc.id
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-200/60'
                          }`}
                        >
                          <span className="truncate">{doc.name}</span>
                          <span className={`text-[9px] uppercase font-bold px-1 py-0.2 ml-1 rounded ${
                            selectedDoctorId === doc.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {doc.specialty.substring(0, 4)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messaging Window */}
                  <div className="md:col-span-8 flex flex-col justify-between bg-white rounded-3xl border border-slate-150 overflow-hidden min-h-[340px]">
                    {/* Header */}
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-900">
                          Secure Thread with {DOCTORS.find(d => d.id === selectedDoctorId)?.name || 'Physician'}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-mono tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        Secure SSL Active
                      </span>
                    </div>

                    {/* Messages Stack */}
                    <div className="flex-1 p-4 bg-slate-50/20 overflow-y-auto max-h-[200px] space-y-3" id="portal-messages-stack">
                      {messages.map((m, idx) => (
                        <div 
                          key={m.id || idx}
                          className={`max-w-[85%] p-3 rounded-2xl text-xs flex flex-col space-y-1 shadow-xs ${
                            m.sender === 'Patient'
                              ? 'bg-blue-600 text-white rounded-tr-none ml-auto'
                              : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none mr-auto'
                          }`}
                        >
                          <span className={`text-[9px] font-bold ${m.sender === 'Patient' ? 'text-blue-100' : 'text-slate-500'}`}>
                            {m.senderName} ({m.sender})
                          </span>
                          <p className="leading-relaxed font-semibold">{m.text}</p>
                          <span className={`text-[8px] text-right ${m.sender === 'Patient' ? 'text-blue-200' : 'text-slate-400'}`}>
                            {m.timestamp}
                          </span>
                        </div>
                      ))}

                      {isReplying && (
                        <div className="bg-white text-slate-550 border border-slate-150 max-w-[200px] p-2.5 rounded-2xl rounded-tl-none mr-auto flex items-center gap-2 text-xs font-semibold animate-pulse shadow-sm">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                          <span>Clinician responding...</span>
                        </div>
                      )}
                    </div>

                    {/* Input box */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50">
                      <input
                        type="text"
                        required
                        disabled={isReplying}
                        placeholder={`Ask ${DOCTORS.find(d => d.id === selectedDoctorId)?.name || 'Physician'} a question...`}
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        className="flex-1 text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                      />
                      <button
                        type="submit"
                        disabled={isReplying || !typedMessage.trim()}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:bg-slate-300"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADDTIONAL PREMIUM INTERACTIVE MODALS */}
      <AnimatePresence>
        {/* LOG NEW MEDICAL RECORD MODAL */}
        {showAddRecord && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Log Medical Record File</h4>
                  <p className="text-[10px] text-slate-400">HIPAA Compliant local diagnostic report logging.</p>
                </div>
                <button 
                  onClick={() => setShowAddRecord(false)}
                  className="p-1 bg-slate-100 hover:bg-slate-205 rounded-lg text-xs font-bold text-slate-550 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddRecordSubmit} className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Record Type</label>
                  <select 
                    value={newRecord.type} 
                    onChange={e => setNewRecord(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Lab Result">Lab Result (e.g., Blood panel, Urine test)</option>
                    <option value="Clinical Note">Clinical Note (e.g., General notes, Diagnosis)</option>
                    <option value="Imaging">Imaging Readout (e.g., X-Ray, MRI scan)</option>
                    <option value="Vaccination">Vaccination Receipt (e.g., Flu shot, booster)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Diagnostic Title / Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Comprehensive Metabolic Panel (CMP)"
                    value={newRecord.title}
                    onChange={e => setNewRecord(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Attending Physician / Staff</label>
                  <select
                    value={newRecord.doctorName}
                    onChange={e => setNewRecord(prev => ({ ...prev, doctorName: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {DOCTORS.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Severity Status</label>
                    <select
                      value={newRecord.status}
                      onChange={e => setNewRecord(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="Normal">Normal Findings</option>
                      <option value="Attention Required">Attention Required</option>
                      <option value="Action Taken">Action Taken</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Filing Date</label>
                    <input 
                      type="text" 
                      disabled
                      value="Today (Digital stamp)"
                      className="w-full p-2 bg-slate-100 border border-slate-150 rounded-xl font-bold text-slate-450 outline-none text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Clinical Findings Details / Readout Text</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Enter detailed report transcripts, lab numeric indicators / thresholds, and care advice."
                    value={newRecord.details}
                    onChange={e => setNewRecord(prev => ({ ...prev, details: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Verify and Log File to Device Vault
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* LOG NEW PRESCRIPTION Rx MODAL */}
        {showAddPrescription && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight">Log Authorized Rx Medication</h4>
                  <p className="text-[10px] text-slate-400">Preservation panel for outpatient health management track.</p>
                </div>
                <button 
                  onClick={() => setShowAddPrescription(false)}
                  className="p-1 bg-slate-100 hover:bg-slate-205 rounded-lg text-xs font-bold text-slate-550 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddPrescriptionSubmit} className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Medication Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Lisinopril 10mg tablets"
                    value={newPres.medication}
                    onChange={e => setNewPres(prev => ({ ...prev, medication: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Clinical Dosage</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10mg orally once daily"
                    value={newPres.dosage}
                    onChange={e => setNewPres(prev => ({ ...prev, dosage: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Frequency / Instruction</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Take daily in the morning with a full glass of water, do not chew"
                    value={newPres.frequency}
                    onChange={e => setNewPres(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Refills Authorized</label>
                    <input 
                      type="number" 
                      min="0"
                      max="12"
                      required
                      value={newPres.refillsRemaining}
                      onChange={e => setNewPres(prev => ({ ...prev, refillsRemaining: Number(e.target.value) }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Prescribing Physician</label>
                    <select
                      value={newPres.prescribingDoctor}
                      onChange={e => setNewPres(prev => ({ ...prev, prescribingDoctor: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {DOCTORS.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Authorize and Log Active Rx Medication
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* LOG NEW DAILY VITALS MODAL */}
        {showLogVital && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 max-w-sm w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-emerald-800 uppercase tracking-tight font-sans">Log Critical Vitals</h4>
                  <p className="text-[10px] text-slate-400">Save your physiological readings immediately.</p>
                </div>
                <button 
                  onClick={() => setShowLogVital(false)}
                  className="p-1 bg-slate-100 hover:bg-slate-205 rounded-lg text-xs font-bold text-slate-550 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleLogVitalSubmit} className="space-y-3.5 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Resting Heart Rate</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="30"
                        max="200"
                        value={newVital.heartRate}
                        onChange={e => setNewVital(prev => ({ ...prev, heartRate: Number(e.target.value) }))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none pr-8"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] font-bold text-slate-400">bpm</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Blood Pressure</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 117/76"
                      value={newVital.bloodPressure}
                      onChange={e => setNewVital(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-center focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Body Weight</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="50"
                        max="500"
                        value={newVital.weight}
                        onChange={e => setNewVital(prev => ({ ...prev, weight: Number(e.target.value) }))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none pr-8"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] font-bold text-slate-400">lbs</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700 block">Fasting Blood Sugar</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="40"
                        max="400"
                        value={newVital.bloodSugar}
                        onChange={e => setNewVital(prev => ({ ...prev, bloodSugar: Number(e.target.value) }))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none pr-12"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] font-bold text-slate-400">mg/dL</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] text-emerald-800 leading-normal flex gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Submitting these stats updates your live diagnostic curves, trends, and patient records dynamically.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  Verify and Log Vitals Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT DEMOGRAPHICS CARD MODAL */}
        {showEditDemographics && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 max-w-sm w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Update Demographics card</h4>
                  <p className="text-[10px] text-slate-400">Set stable physiological metrics.</p>
                </div>
                <button 
                  onClick={() => setShowEditDemographics(false)}
                  className="p-1 bg-slate-100 hover:bg-slate-205 rounded-lg text-xs font-bold text-slate-550 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleEditDemographicsSubmit} className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Registered Height</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 5'10\"
                    value={newDemo.height}
                    onChange={e => setNewDemo(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Antigen Blood Group Type</label>
                  <select
                    value={newDemo.bloodType}
                    onChange={e => setNewDemo(prev => ({ ...prev, bloodType: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="A+">A positive (A+)</option>
                    <option value="A-">A negative (A-)</option>
                    <option value="B+">B positive (B+)</option>
                    <option value="B-">B negative (B-)</option>
                    <option value="AB+">AB positive (AB+)</option>
                    <option value="AB-">AB negative (AB-)</option>
                    <option value="O+">O positive (O+)</option>
                    <option value="O-">O negative (O-)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Apply and Set Profile Card
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
