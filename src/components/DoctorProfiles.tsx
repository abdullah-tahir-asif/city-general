import React, { useState, useMemo } from 'react';
import { DOCTORS } from '../data/doctors';
import { Doctor } from '../types';
import { Search, Star, Briefcase, GraduationCap, Calendar, MessageSquare, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface DoctorProfilesProps {
  onBookAppointment: (doctor: Doctor) => void;
  onOpenMessageWithDoctor?: (doctor: Doctor) => void;
}

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'General Medicine',
  'Dermatology'
];

export default function DoctorProfiles({ onBookAppointment, onOpenMessageWithDoctor }: DoctorProfilesProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter(doc => {
      const matchSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.education.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSpecialty && matchSearch;
    });
  }, [selectedSpecialty, searchQuery]);

  return (
    <div id="doctor-profiles-section" className="space-y-8">
      {/* Upper filter block */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search active practitioners by name or credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium text-slate-800 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Scrollable horizontal filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar select-none">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl space-y-3">
          <p className="text-slate-500 font-medium">No medical experts match your active search terms.</p>
          <button 
            onClick={() => { setSelectedSpecialty('All'); setSearchQuery(''); }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Reset query filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100/40 transition-all flex flex-col h-full overflow-hidden group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-600/90 rounded text-blue-50 rounded-md">
                      {doc.specialty}
                    </span>
                    <h4 className="text-lg font-bold mt-1 text-white">{doc.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-slate-950 px-2 py-0.5 rounded-lg text-xs font-extrabold shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500 shrink-0" />
                    <span>{doc.rating}</span>
                  </div>
                </div>
              </div>

              {/* Bio & credentials */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                    "{doc.bio}"
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{doc.experience} yr experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{doc.availability[0]} - {doc.availability[doc.availability.length - 1]}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-600 font-medium pt-1">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{doc.education}</span>
                  </div>
                </div>

                {/* Direct buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {onOpenMessageWithDoctor && (
                    <button
                      onClick={() => onOpenMessageWithDoctor(doc)}
                      className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                      title="Direct Patient Portal Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Portal Mail
                    </button>
                  )}
                  <button
                    onClick={() => onBookAppointment(doc)}
                    className="col-span-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-blue-600/10 transition-all flex items-center justify-center gap-1 group-hover:bg-blue-700"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Slots
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
