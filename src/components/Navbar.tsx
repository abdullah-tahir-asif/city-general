import React from 'react';
import { Shield, Phone, Activity, Heart, Calendar, Lock, BookOpen, Layers } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

interface NavbarProps {
  activeView: 'home' | 'doctors' | 'booking' | 'portal' | 'admin';
  onSetView: (view: 'home' | 'doctors' | 'booking' | 'portal' | 'admin') => void;
  onScrollToEmergency: () => void;
}

export default function Navbar({ activeView, onSetView, onScrollToEmergency }: NavbarProps) {
  const { user, profile } = useFirebase();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => onSetView('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Heart className="w-5 h-5 fill-white stroke-blue-600" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 block md:text-base leading-none font-display">
                City General
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-blue-600 uppercase block mt-1">
                Medical Network
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 font-sans">
            <button
              onClick={() => onSetView('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                activeView === 'home'
                  ? 'bg-blue-600/10 text-blue-700 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSetView('doctors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                activeView === 'doctors'
                  ? 'bg-blue-600/10 text-blue-700 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Our Doctors
            </button>
            <button
              onClick={() => onSetView('booking')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                activeView === 'booking'
                  ? 'bg-blue-600/10 text-blue-700 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Book Appt
            </button>
            <button
              onClick={() => onSetView('portal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeView === 'portal'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-105'
              }`}
            >
              {user ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-extrabold max-w-[120px] truncate">{profile?.name || user.email?.split('@')[0]}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Patient Portal</span>
                </>
              )}
            </button>
            <button
              onClick={() => onSetView('admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 bg-slate-50 border border-slate-100 cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activeView === 'admin' ? 'text-white' : 'text-blue-500'}`} />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Actions & Immediate Callout */}
          <div className="flex items-center gap-2">
            <button
              onClick={onScrollToEmergency}
              className="py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-750 hover:to-rose-750 text-white rounded-xl text-xs font-black tracking-tight flex items-center gap-1.5 shadow-md shadow-red-500/10 hover:shadow-lg hover:scale-102 transition-all duration-200 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>ER waittimes</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

