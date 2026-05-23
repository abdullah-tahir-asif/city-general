import React, { useState, useEffect } from 'react';
import { Phone, AlertTriangle, Clock, MapPin, Heart, Shield, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EmergencyWidget() {
  const [erWaitTimes, setErWaitTimes] = useState({
    general: 14,
    trauma: 4,
    pediatrics: 8,
    cardiology: 0, // Direct emergency entry
  });

  const [activeGuide, setActiveGuide] = useState<'cpr' | 'stroke' | 'burns' | 'choking'>('cpr');
  const [address, setAddress] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'routing' | 'enroute' | 'arrived'>('idle');
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time minor adjustment of ER times
  useEffect(() => {
    const interval = setInterval(() => {
      setErWaitTimes(prev => ({
        general: Math.max(5, prev.general + (Math.random() > 0.5 ? 1 : -1)),
        trauma: Math.max(2, prev.trauma + (Math.random() > 0.6 ? 1 : -1)),
        pediatrics: Math.max(4, prev.pediatrics + (Math.random() > 0.4 ? 1 : -1)),
        cardiology: 0,
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setErWaitTimes(prev => ({
        general: Math.max(8, Math.floor(Math.random() * 12) + 8),
        trauma: Math.max(2, Math.floor(Math.random() * 6) + 2),
        pediatrics: Math.max(3, Math.floor(Math.random() * 10) + 3),
        cardiology: 0,
      }));
      setIsRefreshing(false);
    }, 600);
  };

  const startAmbulanceDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setDispatchStatus('routing');
    setDispatchProgress(5);

    // Dynamic routing stages
    setTimeout(() => {
      setDispatchStatus('enroute');
      const timer = setInterval(() => {
        setDispatchProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setDispatchStatus('arrived');
            return 100;
          }
          return prev + 15;
        });
      }, 500);
    }, 1200);
  };

  const resetDispatch = () => {
    setDispatchStatus('idle');
    setAddress('');
    setDispatchProgress(0);
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-50/30 overflow-hidden" id="emergency-widget">
      {/* Red Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl animate-pulse">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100">24/7 Red Alert Hotline</span>
              <h3 className="text-2xl font-bold tracking-tight">1-800-555-0199</h3>
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] font-bold py-1 px-2.5 bg-red-700/50 rounded-full inline-block border border-red-400/20">
              ● CRITICAL RESPONSE ACTIVE
            </span>
            <span className="text-xs text-rose-100 mt-1">Direct Priority Dispatcher</span>
          </div>
        </div>
        <p className="text-xs text-rose-50 mt-3 font-medium flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          If you are experiencing chest pains, shortness of breath, or deep trauma, call <strong className="underline">911</strong> immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Wait Times */}
        <div className="lg:col-span-4 p-6 bg-rose-50/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              Live ER Wait Times
            </h4>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              title="Refresh waiting periods"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Trauma Center (Level 1)</span>
                <span className="font-bold text-red-600">{erWaitTimes.trauma} min</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-red-500 h-full rounded-full" 
                  initial={{ width: '10%' }}
                  animate={{ width: `${Math.min(100, (erWaitTimes.trauma / 40) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>General Emergency Care</span>
                <span className="font-bold text-amber-600">{erWaitTimes.general} min</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-amber-400 h-full rounded-full" 
                  initial={{ width: '30%' }}
                  animate={{ width: `${Math.min(100, (erWaitTimes.general / 40) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Pediatric ER</span>
                <span className="font-bold text-blue-600">{erWaitTimes.pediatrics} min</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-400 h-full rounded-full" 
                  initial={{ width: '20%' }}
                  animate={{ width: `${Math.min(100, (erWaitTimes.pediatrics / 40) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-xs font-semibold text-red-950">Cardiac Chest Pain Unit</span>
              </div>
              <span className="text-xs font-bold text-red-700 bg-white px-2 py-0.5 rounded-full border border-red-100">
                Immediate Intake
              </span>
            </div>
          </div>
        </div>

        {/* First Aid Instructions */}
        <div className="lg:col-span-4 p-6">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-red-500" />
            First-Aid Incident Actions
          </h4>

          {/* Guide switcher tab list */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
            {(['cpr', 'stroke', 'burns', 'choking'] as const).map(guide => (
              <button
                key={guide}
                onClick={() => setActiveGuide(guide)}
                className={`py-1 text-[10px] font-bold rounded capitalize transition-all ${
                  activeGuide === guide 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {guide === 'cpr' ? 'CPR' : guide}
              </button>
            ))}
          </div>

          <div className="min-h-[140px] bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            {activeGuide === 'cpr' && (
              <div className="space-y-2">
                <div className="font-bold text-red-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Adult CPR Steps
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700 font-medium">
                  <li>Call 911 and request an automated external defibrillator (AED) immediately.</li>
                  <li>Place the heel of one hand in the center of the chest; place your other hand on top.</li>
                  <li>Push hard and fast: 100 to 120 compressions per minute (to the beat of "Staying Alive").</li>
                  <li>Provide 2 rescue breaths after every 30 compressions if trained, or do chest-only CPR.</li>
                </ol>
              </div>
            )}
            {activeGuide === 'stroke' && (
              <div className="space-y-2">
                <div className="font-bold text-amber-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Think F.A.S.T.
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-medium mt-1">
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <strong className="text-slate-900 font-bold">F - Face Drooping</strong>
                    <p className="text-[10px] text-slate-500 leading-tight">Does one side of the face smile unevenly or sag?</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <strong className="text-slate-900 font-bold">A - Arm Weakness</strong>
                    <p className="text-[10px] text-slate-500 leading-tight">Ask them to raise both arms. Does one drift downward?</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <strong className="text-slate-900 font-bold">S - Speech Slur</strong>
                    <p className="text-[10px] text-slate-500 leading-tight">Is their sentence slurred, garbled, or hard to follow?</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <strong className="text-slate-900 font-bold">T - Time to call 911</strong>
                    <p className="text-[10px] text-red-600 leading-tight font-semibold">Every minute counts. Write down stroke onset time.</p>
                  </div>
                </div>
              </div>
            )}
            {activeGuide === 'burns' && (
              <div className="space-y-2">
                <div className="font-bold text-orange-700 flex items-center gap-1.5">
                  Thermal Skin Treatment
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                  <li><strong className="text-slate-950 font-semibold">Cool the burn:</strong> Run cool water over injury for 10-20 mins. Never use ice or butter.</li>
                  <li>Remove rings, watches or clothing near burn gently, before swelling starts.</li>
                  <li>Cover with a sterile, non-adherent bandage or clean plastic wrap loosely.</li>
                  <li>Take ibuprofen or paracetamol for immediate discomfort.</li>
                </ul>
              </div>
            )}
            {activeGuide === 'choking' && (
              <div className="space-y-2">
                <div className="font-bold text-red-700 flex items-center gap-1.5">
                  The Heimlich Maneuver
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700 font-medium">
                  <li>Stand behind the choking individual. Wrap arms around their lower chest.</li>
                  <li>Make a fist with one hand. Grasp it with the other hand.</li>
                  <li>Place your thumb-side fist slightly above their navel (well below breastbone).</li>
                  <li>Perform 5 sharp, upward and inward thrusts to eject the foreign object.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Dispatch Simulator */}
        <div className="lg:col-span-4 p-6 bg-slate-50/50">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Active Ambulance Dispatcher
          </h4>
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Verify emergency service range. Entering an address simulates real-time vehicle dispatch monitoring.
          </p>

          <AnimatePresence mode="wait">
            {dispatchStatus === 'idle' ? (
              <motion.form 
                onSubmit={startAmbulanceDispatch}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter current location street address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs py-2 px-3 pr-8 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 font-medium text-slate-800 placeholder-slate-400"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-slate-900/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-red-500" />
                  Simulate Priority Dispatch
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Ambulance ER-04</span>
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[150px] inline-block">
                      {address}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dispatchStatus === 'routing' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                    dispatchStatus === 'enroute' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {dispatchStatus === 'routing' ? 'Routing Map...' :
                     dispatchStatus === 'enroute' ? 'In Route' : 'Arrived at Site'}
                  </span>
                </div>

                {/* Dispatch Progress and visual */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Dispatch Tracker</span>
                    <span>{dispatchProgress}% completed</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full" 
                      style={{ width: `${dispatchProgress}%` }}
                      transition={{ type: 'spring', stiffness: 60 }}
                    />
                    {dispatchStatus === 'enroute' && (
                      <div className="absolute top-0 right-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Activity className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>
                    {dispatchStatus === 'routing' && 'Reviewing traffic patterns for quickest transit.'}
                    {dispatchStatus === 'enroute' && 'EMS Unit 04 left Bay 2. Medical staff fully prepped.'}
                    {dispatchStatus === 'arrived' && 'Unit ARRIVED. Emergency care responders are on the scene.'}
                  </span>
                </div>

                <button
                  onClick={resetDispatch}
                  className="w-full py-1 text-slate-500 hover:text-slate-800 text-[10px] hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                >
                  Clear Scanner Simulator
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
