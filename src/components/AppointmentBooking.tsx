import React, { useState, useEffect } from 'react';
import { Doctor, Appointment } from '../types';
import { DOCTORS } from '../data/doctors';
import { Calendar, Clock, User, Phone, Mail, Award, CheckCircle, FileText, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import AuthGate from './AuthGate';

interface AppointmentBookingProps {
  preSelectedDoctor?: Doctor | null;
  onAddAppointment: (appointment: Appointment) => void;
  onViewPortal: () => void;
}

export default function AppointmentBooking({ preSelectedDoctor, onAddAppointment, onViewPortal }: AppointmentBookingProps) {
  const { user, profile, loading: authLoading, bookAppointment } = useFirebase();

  // Booking Form State
  const [specialty, setSpecialty] = useState<string>(preSelectedDoctor?.specialty || 'General Medicine');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preSelectedDoctor?.id || '');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [reason, setReason] = useState('');

  const [bookingResult, setBookingResult] = useState<Appointment | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill fields once user or profile is verified
  useEffect(() => {
    if (profile) {
      setPatientName(profile.name || '');
      setPatientPhone(profile.phone || '');
      setPatientEmail(profile.email || '');
      setPatientDob(profile.dob || '');
    } else if (user) {
      setPatientName(user.displayName || '');
      setPatientEmail(user.email || '');
    }
  }, [user, profile]);

  // Sync state if preSelectedDoctor changes
  useEffect(() => {
    if (preSelectedDoctor) {
      setSpecialty(preSelectedDoctor.specialty);
      setSelectedDoctorId(preSelectedDoctor.id);
    }
  }, [preSelectedDoctor]);

  // Available doctors based on specialty
  const availableDoctors = DOCTORS.filter(d => d.specialty === specialty);

  // Update selected doctor if specialty changes
  useEffect(() => {
    if (availableDoctors.length > 0) {
      const currentFits = availableDoctors.some(d => d.id === selectedDoctorId);
      if (!currentFits) {
        setSelectedDoctorId(availableDoctors[0].id);
      }
    } else {
      setSelectedDoctorId('');
    }
  }, [specialty]);

  const activeDoctor = DOCTORS.find(d => d.id === selectedDoctorId);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor || !bookingDate || !timeSlot || !user) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const savedDoc = await bookAppointment({
        patientName,
        patientPhone,
        patientEmail,
        patientDob,
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.name,
        specialty: activeDoctor.specialty,
        date: bookingDate,
        timeSlot,
        reason: reason || 'Routine Clinical Consultation'
      });

      onAddAppointment(savedDoc);
      setBookingResult(savedDoc);
    } catch (err: any) {
      console.error("Booking reservation error:", err);
      // Try to parse JSON from our structured firestore error if possible
      let friendlyMessage = 'We could not complete your checkup reservation right now. Please test connection parameters.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error) {
          friendlyMessage = `Firestore Security Policy Reject: ${parsed.error}`;
        }
      } catch {
        if (err?.message) friendlyMessage = err.message;
      }
      setSubmitError(friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setBookingResult(null);
    setBookingDate('');
    setTimeSlot('');
    setReason('');
    setSubmitError('');
    // Re-fill demographic fields
    if (profile) {
      setPatientName(profile.name || '');
      setPatientPhone(profile.phone || '');
      setPatientEmail(profile.email || '');
      setPatientDob(profile.dob || '');
    }
  };

  // Get tomorrow date for min selection
  const getMinDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Render auth barrier in case patient is unauthenticated
  if (authLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center justify-center min-h-[400px]" id="booking-loading-view">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-550 font-bold uppercase tracking-widest font-mono">Synchronizing Care Session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto" id="booking-auth-gate-boundary">
        <div className="bg-[#eff6ff] border border-blue-100 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 font-medium leading-relaxed">
            <span className="font-extrabold uppercase text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md mr-1.5 inline-block">Security Mandate</span>
            City General Hospital strictly enforces a <strong>verified patient registration check</strong>. Please sign in or register your HIPAA-compliant dossier profile below before choosing dates.
          </div>
        </div>
        <AuthGate 
          title="Schedule Clinical Consultations" 
          description="Register or sign in with your clinic keys to save appointments stably to our online database, review specialist availabilities, and download HIPAA summaries."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden" id="appointment-booking-wizard">
      <AnimatePresence mode="wait">
        {!bookingResult ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 md:p-10 space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">Care Booking</span>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Reserve an Online Consultation</h3>
                <p className="text-xs text-slate-500 mt-1">Book certified specialists. Choose dates and select from real-time availabilities.</p>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-100 text-[11px] text-red-700 rounded-xl flex items-start gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Step 1: Expert Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Service & Medical Staff</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Specialized Medical Care</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Dermatology">Dermatology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Clinician</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                      required
                    >
                      {availableDoctors.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Date & Slot Select */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Preferred Schedule</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Consultation Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={getMinDateString()}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {activeDoctor && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 mb-1.5">Weekly Availability</span>
                      <div className="flex flex-wrap gap-1">
                        {activeDoctor.availability.map((day) => (
                          <span key={day} className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                            {day}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Please consult only on active schedule days.</p>
                    </div>
                  )}
                </div>

                {/* Timeslots */}
                {activeDoctor && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Consultation Timeslots</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {activeDoctor.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all ${
                            timeSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Patient Information (Pre-filled, editable) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Patient Registry Core</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">First & Last Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                      />
                      <User className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="johndoe@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Visit (Symptoms or Requests)</label>
                  <textarea
                    rows={2}
                    placeholder="Describe symptoms, requested medications or general checkup goals..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!timeSlot || !bookingDate || submitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs hover:shadow-xl hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Request Booking / Secure in Database
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Doctor Info Sidebar */}
            <div className="lg:col-span-5 bg-slate-50 p-6 md:p-10 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between">
              {activeDoctor ? (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb] py-1 px-2.5 bg-blue-50 border border-blue-100 rounded-full">
                      Selected Practitioner
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={activeDoctor.image}
                      alt={activeDoctor.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-center sm:text-left">
                      <h4 className="text-lg font-bold text-slate-900">{activeDoctor.name}</h4>
                      <p className="text-xs text-blue-600 font-bold">{activeDoctor.specialty} Specialist</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{activeDoctor.education}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
                    <p className="italic text-slate-500 leading-relaxed text-[11px]">
                      "{activeDoctor.bio}"
                    </p>
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-normal">Expertise</span>
                        <span className="text-slate-800 font-bold font-mono">{activeDoctor.experience} years active</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-normal">Rating</span>
                        <span className="text-slate-800 font-bold">★ {activeDoctor.rating} / 5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust badge */}
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-2">
                    <h5 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      Joint Commission Certified
                    </h5>
                    <p className="text-[10px] text-blue-800 font-medium leading-relaxed">
                      City General complies with all Joint Commission Hospital accreditation codes for absolute safety and digital record safety compliance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <span className="p-3 bg-slate-100 rounded-2xl mb-3">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">Select an Expert</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                     Once you assign a clinician and service, their credentials and ratings will load here instantly.
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 hidden lg:block text-[10px] text-slate-400 text-center font-medium">
                Protected by 256-bit SSL Clinical Data Vault Encryption.
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100/50 px-2.5 py-1 rounded-full inline-block border border-emerald-200">
                Booking ID: {bookingResult.id}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Appointment is Registered!</h3>
              <p className="text-xs text-slate-500">
                We have registered your booking request in the persistent Firestore database. A confirmation is logged in your clinical patient file profile.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl text-left text-xs divide-y divide-slate-100 space-y-3">
              <div className="flex justify-between pb-3">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{bookingResult.patientName}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Clinician</span>
                <span className="font-bold text-blue-600">{bookingResult.doctorName} ({bookingResult.specialty})</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Assigned Date</span>
                <span className="font-bold text-slate-900">{bookingResult.date}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Consultation Hour</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">{bookingResult.timeSlot}</span>
              </div>
              <div className="flex justify-between pt-3 text-[11px] text-slate-500 italic max-w-sm">
                <span>Reason:</span>
                <span className="text-slate-700 font-medium whitespace-pre-line text-right">{bookingResult.reason}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={handleReset}
                className="py-3 px-6 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-all"
              >
                Book Another Appointment
              </button>
              <button
                onClick={onViewPortal}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs hover:shadow-lg hover:shadow-blue-500/10 transition-all flex items-center justify-center gap-1"
              >
                Access Patient Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
