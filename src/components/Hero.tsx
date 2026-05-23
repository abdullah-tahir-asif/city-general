import React from 'react';
import { ShieldCheck, Activity, Calendar, Lock, BookOpen, Clock, Heart, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onSetView: (view: 'home' | 'doctors' | 'booking' | 'portal' | 'admin') => void;
  onScrollToEmergency: () => void;
}

export default function Hero({ onSetView, onScrollToEmergency }: HeroProps) {
  return (
    <div className="space-y-12">
      {/* Upper Main Intro Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 md:pt-10">
        
        {/* Caption & Call to Action */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-blue-50/80 px-4 py-1.5 rounded-full border border-blue-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
              Joint Commission National Quality Champion
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none font-display">
            Comprehensive Clinical Care <br className="hidden md:inline" />
            <span className="text-blue-600">Centered Around You</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-500 max-w-xl leading-relaxed font-semibold">
            At City General Hospital, our network of board-certified clinicians combine cutting-edge procedural technologies with deep human empathy. We specialize in providing comprehensive healthcare, from neonatal units to advanced cardiovascular treatments.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
            <button
              onClick={() => onSetView('booking')}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer hover:shadow-xl transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Booking Online</span>
            </button>
            <button
              onClick={() => onSetView('portal')}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 border border-slate-200 hover:border-slate-300"
            >
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Access Encrypted Portal</span>
            </button>
          </div>

          {/* Core Trust Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 text-center divide-x divide-slate-100">
            <div className="space-y-1">
              <span className="text-xl md:text-2xl font-black text-slate-900 font-mono">15 Min</span>
              <span className="text-[10px] text-slate-400 font-bold block">Avg. Trauma Intake</span>
            </div>
            <div className="space-y-1">
              <span className="text-xl md:text-2xl font-black text-slate-900 font-mono">250+</span>
              <span className="text-[10px] text-slate-400 font-bold block">Certified Doctors</span>
            </div>
            <div className="space-y-1">
              <span className="text-xl md:text-2xl font-black text-slate-900 font-mono">99.4%</span>
              <span className="text-[10px] text-slate-400 font-bold block">Patient Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Dynamic Card Illustration Layout */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-blue-400/5 rounded-full filter blur-3xl" />
          
          <div className="relative bg-gradient-to-tr from-slate-50 to-blue-50 p-6 rounded-3xl border border-slate-100/80 shadow-inner flex flex-col gap-4">
            {/* Live Indicator Alert */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 block">System Diagnostic Active</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 inline-block">Cardiovascular & Trauma units fully staffed.</span>
              </div>
            </div>

            {/* Micro Quick Portal card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase block">Secured Patients Vault</span>
                  <span className="text-xs font-bold text-slate-900">Lab Results & Drug Refills</span>
                </div>
              </div>
              <button 
                onClick={() => onSetView('portal')}
                className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                title="Enter Encrypted Directory"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Consultation card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase block">Instantly Book Doctor Slots</span>
                  <span className="text-xs font-bold text-slate-900">Virtual or In-Person Checkups</span>
                </div>
              </div>
              <button 
                onClick={() => onSetView('booking')}
                className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                title="Open Online Appointment Calendar"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Grid of Interactive Service Panels */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] tracking-widest uppercase text-blue-600 font-extrabold block">Primary Specializations</span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1 font-display">Explore Our Medical Services</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all space-y-3">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl inline-block">
              <Heart className="w-5 h-5 fill-blue-50 stroke-blue-600" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">Cardiovascular Institute</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              State-of-the-art diagnostic labs, interventional cardiology, and customized hypertension wellness programs.
            </p>
            <button 
              onClick={() => onSetView('doctors')}
              className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
            >
              Consult experts <ChevronRight />
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all space-y-3">
            <span className="p-2 bg-[#f0fdf4] text-[#16a34a] rounded-xl inline-block">
              <Activity className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">Neurology & Stroke Center</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Comprehensive treatment for chronic migraines, peripheral neuropathic disorders, and stroke post-recovery plans.
            </p>
            <button 
              onClick={() => onSetView('doctors')}
              className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
            >
              Consult experts <ChevronRight />
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all space-y-3">
            <span className="p-2 bg-[#fef2f2] text-[#dc2626] rounded-xl inline-block">
              <Clock className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">Level 1 Emergency Center</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              24/7 fully-equipped clinical trauma units, on-call pediatric emergency response teams, and zero-wait check-in protocols.
            </p>
            <button 
              onClick={onScrollToEmergency}
              className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
            >
              Live Wait Times <ChevronRight />
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all space-y-3">
            <span className="p-2 bg-[#faf5ff] text-[#9333ea] rounded-xl inline-block">
              <BookOpen className="w-5 h-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">Preventative Medicine</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Annual health physical panels, detailed vaccination checkups, and dietary counseling guided by longevity guidelines.
            </p>
            <button 
              onClick={() => onSetView('booking')}
              className="text-[10px] font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Book Checkup Slots <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Icon helper
function ChevronRight() {
  return <span className="text-[11px] font-extrabold">→</span>;
}
