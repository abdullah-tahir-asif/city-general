import React, { useState, useEffect } from 'react';
import { Shield, Activity, Heart, Lock, Menu, X, Phone } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { AnimatePresence, motion } from 'motion/react';

type View = 'home' | 'doctors' | 'booking' | 'portal' | 'admin';

interface NavbarProps {
  activeView: View;
  onSetView: (view: View) => void;
  onScrollToEmergency: () => void;
}

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'home', label: 'Overview' },
  { id: 'doctors', label: 'Our Doctors' },
  { id: 'booking', label: 'Book Appointment' },
  { id: 'portal', label: 'Patient Portal' },
  { id: 'admin', label: 'Admin' },
];

export default function Navbar({ activeView, onSetView, onScrollToEmergency }: NavbarProps) {
  const { user, profile } = useFirebase();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navigate = (view: View) => {
    onSetView(view);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const portalLabel = user
    ? (profile?.name || user.email?.split('@')[0] || 'My Portal')
    : 'Patient Portal';

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-sm">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[4.5rem]">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
            aria-label="City General Hospital home"
          >
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-xl text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 fill-white stroke-cyan-700" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 block md:text-base leading-none font-display">
                City General
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-cyan-700 uppercase block mt-1">
                Medical Network
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_ITEMS.filter((item) => item.id !== 'portal' && item.id !== 'admin').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={activeView === item.id ? 'page' : undefined}
                className={`nav-pill ${activeView === item.id ? 'nav-pill-active' : 'nav-pill-inactive'}`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => navigate('portal')}
              aria-current={activeView === 'portal' ? 'page' : undefined}
              className={`nav-pill flex items-center gap-1.5 ${
                activeView === 'portal'
                  ? 'bg-slate-900 text-white'
                  : 'nav-pill-inactive'
              }`}
            >
              {user && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" aria-hidden />
              )}
              {!user && <Lock className="w-3.5 h-3.5 text-cyan-600" aria-hidden />}
              <span className="max-w-[120px] truncate">{portalLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('admin')}
              aria-current={activeView === 'admin' ? 'page' : undefined}
              className={`nav-pill flex items-center gap-1.5 border ${
                activeView === 'admin'
                  ? 'bg-cyan-700 text-white border-cyan-600 shadow-md shadow-cyan-500/20'
                  : 'nav-pill-inactive border-slate-200 bg-slate-50/80'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activeView === 'admin' ? 'text-white' : 'text-cyan-600'}`} />
              Admin
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="tel:1-800-555-0199"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">1-800-555-0199</span>
            </a>

            <button
              type="button"
              onClick={onScrollToEmergency}
              className="btn-emergency hidden sm:inline-flex"
              aria-label="View emergency wait times"
            >
              <Activity className="w-3.5 h-3.5" aria-hidden />
              <span>ER Wait Times</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 w-[min(100%,20rem)] bg-white z-50 shadow-2xl lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="text-sm font-extrabold text-slate-900 font-display">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    aria-current={activeView === item.id ? 'page' : undefined}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      activeView === item.id
                        ? 'bg-cyan-50 text-cyan-800 border border-cyan-100'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.id === 'portal' ? portalLabel : item.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onScrollToEmergency();
                  }}
                  className="w-full mt-4 btn-emergency justify-center"
                >
                  <Activity className="w-4 h-4" />
                  ER Wait Times
                </button>

                <a
                  href="tel:1-800-555-0199"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 border border-red-100 rounded-xl bg-red-50"
                >
                  <Phone className="w-4 h-4" />
                  Emergency: 1-800-555-0199
                </a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
