import React from 'react';
import { ShieldCheck, Activity, Calendar, Lock, BookOpen, Clock, Heart, ArrowUpRight, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onSetView: (view: 'home' | 'doctors' | 'booking' | 'portal' | 'admin') => void;
  onScrollToEmergency: () => void;
}

const SERVICES = [
  {
    icon: Heart,
    title: 'Cardiovascular Institute',
    desc: 'Interventional cardiology, diagnostic imaging, and hypertension wellness programs.',
    color: 'bg-cyan-50 text-cyan-700',
    cta: 'Consult experts',
    action: 'doctors' as const,
    linkClass: 'text-cyan-700',
  },
  {
    icon: Activity,
    title: 'Neurology & Stroke Center',
    desc: 'Stroke recovery, migraine care, and peripheral neuropathy treatment plans.',
    color: 'bg-emerald-50 text-emerald-700',
    cta: 'Consult experts',
    action: 'doctors' as const,
    linkClass: 'text-emerald-700',
  },
  {
    icon: Clock,
    title: 'Level 1 Emergency Center',
    desc: '24/7 trauma units, pediatric emergency teams, and rapid intake protocols.',
    color: 'bg-red-50 text-red-600',
    cta: 'Live wait times',
    action: 'emergency' as const,
    linkClass: 'text-red-600',
  },
  {
    icon: BookOpen,
    title: 'Preventative Medicine',
    desc: 'Annual physicals, vaccinations, and dietary counseling for long-term health.',
    color: 'bg-violet-50 text-violet-700',
    cta: 'Book checkup',
    action: 'booking' as const,
    linkClass: 'text-violet-700',
  },
];

export default function Hero({ onSetView, onScrollToEmergency }: HeroProps) {
  return (
    <div className="space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-2 md:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-cyan-100 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-800">
              Joint Commission Quality Champion
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.05] font-display">
            Comprehensive care{' '}
            <span className="gradient-text block sm:inline">centered around you</span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Board-certified clinicians, advanced technology, and compassionate support — from neonatal care to cardiovascular treatment, all in one trusted network.
          </p>

          <div className="flex flex-wrap gap-3 pt-1 justify-center lg:justify-start">
            <button type="button" onClick={() => onSetView('booking')} className="btn-primary">
              <Calendar className="w-4 h-4" />
              Schedule online
            </button>
            <button type="button" onClick={() => onSetView('portal')} className="btn-secondary">
              <Lock className="w-4 h-4 text-cyan-600" />
              Patient portal
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0">
            {[
              { value: '15 min', label: 'Avg. trauma intake' },
              { value: '250+', label: 'Certified doctors' },
              { value: '99.4%', label: 'Patient satisfaction' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-surface px-3 py-4 text-center"
              >
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-display block">
                  {stat.value}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="lg:col-span-5 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/20 via-indigo-400/10 to-emerald-400/10 rounded-[2rem] blur-2xl" />

          <div className="relative card-surface p-6 space-y-4 shadow-glow border-cyan-100/60">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-100/80 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700 block">
                  Live system status
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Cardiovascular & trauma units fully staffed
                </span>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            </div>

            {[
              {
                icon: Lock,
                iconBg: 'bg-cyan-50 text-cyan-700',
                eyebrow: 'Secure patient vault',
                title: 'Lab results & prescriptions',
                onClick: () => onSetView('portal'),
              },
              {
                icon: Calendar,
                iconBg: 'bg-rose-50 text-rose-600',
                eyebrow: 'Instant booking',
                title: 'Virtual or in-person visits',
                onClick: () => onSetView('booking'),
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-cyan-200 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase block">
                      {card.eyebrow}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{card.title}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={card.onClick}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 group-hover:text-cyan-700 group-hover:border-cyan-200 transition-colors cursor-pointer"
                  aria-label={`Open ${card.title}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 font-medium justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              HIPAA-compliant · 256-bit encrypted
            </div>
          </div>
        </motion.div>
      </div>

      <section aria-labelledby="services-heading">
        <div className="mb-6">
          <span className="section-eyebrow">Primary specializations</span>
          <h2 id="services-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-display">
            Explore our medical services
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((svc, i) => (
            <motion.article
              key={svc.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="card-surface card-interactive p-5 space-y-3 group"
            >
              <span className={`p-2.5 rounded-xl inline-block ${svc.color}`}>
                <svc.icon className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">{svc.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
              <button
                type="button"
                onClick={() =>
                  svc.action === 'emergency' ? onScrollToEmergency() : onSetView(svc.action)
                }
                className={`text-xs font-bold ${svc.linkClass} hover:underline flex items-center gap-0.5 cursor-pointer`}
              >
                {svc.cta}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
