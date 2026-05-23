/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EmergencyWidget from './components/EmergencyWidget';
import DoctorProfiles from './components/DoctorProfiles';
import AppointmentBooking from './components/AppointmentBooking';
import PatientPortal from './components/PatientPortal';
import AdminPortal from './components/AdminPortal';
import { Appointment, Doctor } from './types';
import { DOCTORS } from './data/doctors';
import { Heart, Phone, MapPin, Mail, Award, AlertCircle, Clock, ShieldCheck, HelpCircle, X, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './components/Toast';

// Seed initial upcoming appointments so the portal dashboard is filled on first load.
const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-90412',
    patientName: 'Alex Mercer',
    patientPhone: '+1 (555) 728-9412',
    patientEmail: 'alex.mercer@demo.com',
    patientDob: '1992-05-14',
    doctorId: 'doc-1',
    doctorName: 'Dr. Robert Chen',
    specialty: 'Cardiology',
    date: '2026-06-15',
    timeSlot: '10:00 AM',
    reason: 'Routine post-therapy evaluation and ECG check',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  }
];

function loadAppointments(): Appointment[] {
  try {
    const saved = localStorage.getItem('hospital_appointments');
    if (saved) return JSON.parse(saved) as Appointment[];
  } catch {
    /* use demo fallback */
  }
  return INITIAL_DEMO_APPOINTMENTS;
}

export default function App() {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'home' | 'doctors' | 'booking' | 'portal' | 'admin'>('home');
  const [showBulletin, setShowBulletin] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments);
  
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  const emergencySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('hospital_appointments', JSON.stringify(appointments));
    } catch {
      showToast('Could not save appointments locally. Your browser storage may be full.', 'error');
    }
  }, [appointments, showToast]);

  const handleScrollToEmergency = () => {
    // If we're not on home page, switch to home first
    if (activeView !== 'home') {
      setActiveView('home');
    }
    
    // Allow React layout to render, then scroll
    setTimeout(() => {
      const widget = document.getElementById('emergency-widget-container');
      if (widget) {
        widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleBookWithDoctor = (doc: Doctor) => {
    setSelectedDoctorForBooking(doc);
    setActiveView('booking');
  };

  const handleAddAppointment = (newAppt: Appointment) => {
    setAppointments(prev => [newAppt, ...prev]);
    showToast(`Appointment confirmed with ${newAppt.doctorName}`, 'success');
  };

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-900" id="main-application">
      
      {/* Navbar */}
      <Navbar 
        activeView={activeView} 
        onSetView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'auto' });
        }}
        onScrollToEmergency={handleScrollToEmergency}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10 md:space-y-12">
        
        <div
          role="status"
          className="card-surface p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between border-cyan-100 bg-gradient-to-r from-cyan-50/80 to-white"
        >
          <div className="flex items-start sm:items-center gap-3 text-sm text-slate-700 font-medium leading-relaxed">
            <span className="px-2.5 py-1 bg-cyan-700 text-white font-bold uppercase text-[9px] tracking-wider rounded-lg shrink-0">
              News
            </span>
            <span>
              Our new Cardiac Intensive Suite is now open. Seasonal flu vaccines are available — book online anytime.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBulletin(true)}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-900 shrink-0 cursor-pointer sm:px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors"
          >
            Learn more →
          </button>
        </div>

        {/* Dynamic Nav Views with smooth transition triggers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-12"
          >
            {activeView === 'home' && (
              <>
                {/* Hero Section */}
                <Hero 
                  onSetView={(view) => {
                    setActiveView(view);
                    window.scrollTo({ top: 0 });
                  }} 
                  onScrollToEmergency={handleScrollToEmergency} 
                />

                {/* Emergency Tracker Console Anchor */}
                <div id="emergency-widget-container" ref={emergencySectionRef} className="pt-2">
                  <div className="mb-4">
                    <span className="section-eyebrow text-red-600 block">Immediate helpdesk</span>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1 font-display">Emergency trauma center & ER wait times</h3>
                  </div>
                  <EmergencyWidget />
                </div>
              </>
            )}

            {activeView === 'doctors' && (
              <div className="space-y-6">
                <div>
                  <span className="section-eyebrow block mb-1">Our directory</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Meet our board-certified clinicians</h2>
                  <p className="text-xs text-slate-500 mt-1">Filter by specialization, ratings, and days available to directly reserve slots.</p>
                </div>
                <DoctorProfiles 
                  onBookAppointment={handleBookWithDoctor} 
                  onOpenMessageWithDoctor={(doc) => {
                    setSelectedDoctorForBooking(doc);
                    setActiveView('portal');
                  }}
                />
              </div>
            )}

            {activeView === 'booking' && (
              <div className="space-y-6">
                <div>
                  <span className="section-eyebrow block mb-1">Real-time scheduling</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Reserve outpatient checkups</h2>
                </div>
                <AppointmentBooking 
                  preSelectedDoctor={selectedDoctorForBooking} 
                  onAddAppointment={handleAddAppointment}
                  onViewPortal={() => {
                    setActiveView('portal');
                    window.scrollTo({ top: 0 });
                  }}
                />
              </div>
            )}

            {activeView === 'portal' && (
              <div className="space-y-6">
                <div>
                  <span className="section-eyebrow block mb-1">Client vault</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Patient portal</h2>
                </div>
                <PatientPortal 
                  appointments={appointments} 
                  doctors={DOCTORS}
                  onOpenBooking={() => {
                    setSelectedDoctorForBooking(null);
                    setActiveView('booking');
                  }}
                  initialSelectedDoctor={selectedDoctorForBooking}
                />
              </div>
            )}



            {activeView === 'admin' && (
              <div className="space-y-6">
                <div>
                  <span className="section-eyebrow block mb-1">Administrative center</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Admin console</h2>
                </div>
                <AdminPortal />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Persistent Footer with address parameters & emergency contact information */}
      <footer className="bg-white/90 backdrop-blur border-t border-slate-200/80 mt-16 text-slate-600 font-sans" id="hospital-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Branding Column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-xl text-white shadow-sm">
                  <Heart className="w-4 h-4 fill-white stroke-cyan-700" />
                </div>
                <span className="text-sm font-black text-slate-900 tracking-tight">City General Hospital</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm font-medium">
                Pioneering evidence-based clinical medicine and emergency services since 1984. Accredited with top honors by the Joint Commission on Healthcare Safety standards.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold py-1 px-2.5 bg-cyan-50 border border-cyan-100 rounded-full text-cyan-800 w-fit">
                <Award className="w-3.5 h-3.5" /> Approved HIPAA Vault Facility
              </div>
            </div>

            {/* Quick Directory Details */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">Clinical Map & Address</h4>
              
              <div className="space-y-3 text-xs font-semibold text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    742 Evergreen Terrace,<br />
                    Medical Plaza Block B, Second Floor<br />
                    Springfield, OR 97477
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">support@citygeneralportal.org</span>
                </div>
              </div>
            </div>

            {/* Emergency Hotlines Contact Column */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-extrabold pb-0.5 uppercase text-red-600 tracking-wider border-b border-red-100 w-fit">
                🚨 Emergency Contacts & Operating Hours
              </h4>
              
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">24/7 Priority Emergency Line</span>
                  <a href="tel:1-800-555-0199" className="text-slate-900 font-bold block text-sm hover:underline hover:text-red-600">
                    1-800-555-0199
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Standard Clinic Working Hours</span>
                  <span className="text-slate-800 font-medium text-[11px] block mt-0.5">
                    Monday – Friday: 8:00 AM – 6:00 PM<br />
                    Saturday – Sunday: Closed (ER Open)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Trauma ER Admissions</span>
                  <span className="text-red-600 font-black text-[11px] block mt-0.5">
                    Open 24 Hours / 365 Days a Year
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-medium gap-4">
            <span>© 2026 City General Hospital System Corporation. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-700 cursor-pointer">HIPAA Disclosures</span>
              <span className="hover:text-slate-700 cursor-pointer">Patient Rights Act</span>
              <span className="hover:text-slate-700 cursor-pointer">SSL Vault Security Terms</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modern, Jaw-dropping Bulletin Modal Overlay */}
      <AnimatePresence>
        {showBulletin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulletin(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 md:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Official Update</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">
                    Cardiac Intensive Suite & Seasonal Vaccines
                  </h3>
                </div>
                <button
                  onClick={() => setShowBulletin(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all cursor-pointer border border-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Body */}
              <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                <p>
                  City General is proud to announce the formal operation of our next-generation **Cardiac Intensive Suite**. Equipped with state-of-the-art diagnostic imaging arrays and low-induction therapeutic pacing systems, this suite decreases post-procedural recovery times by up to 30%.
                </p>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Check className="w-4 h-4 text-blue-600" />
                    Seasonal Flu Vaccines Now Ready
                  </h4>
                  <p className="text-slate-600 text-xs">
                    Flu and seasonal respiratory vaccines are fully authorized and active. Active patients can book a vaccine session directly online with any available clinical staff or during an outpatient checkup.
                  </p>
                </div>
              </div>

              {/* Footer / CTA buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setShowBulletin(false);
                    setActiveView('booking');
                  }}
                  className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/15 cursor-pointer transition-all text-center"
                >
                  Schedule Checkup Now
                </button>
                <button
                  onClick={() => setShowBulletin(false)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Close Bulletin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
