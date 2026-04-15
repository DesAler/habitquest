import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };

  return (
    <div className={`${s[size]} border-violet-400 border-t-transparent rounded-full animate-spin`} />
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8 animate-slide-down">
    <div>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-white leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium">{subtitle}</p>}
    </div>
    {action && <div className="ml-4 flex-shrink-0">{action}</div>}
  </div>
);

export const StatCard = ({ label, value, icon, color = 'violet', trend, delay = 0 }) => {
  const gradients = {
    violet: 'from-violet-500 to-purple-600',
    green: 'from-emerald-400 to-teal-500',
    orange: 'from-orange-400 to-amber-500',
    pink: 'from-pink-400 to-rose-500',
    blue: 'from-blue-400 to-indigo-500',
  };

  const bgs = {
    violet: 'bg-violet-50 dark:bg-violet-900/20',
    green: 'bg-emerald-50 dark:bg-emerald-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
  };

  return (
    <div className={`card p-5 animate-slide-up delay-${delay}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-2xl ${bgs[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>

      <div className={`text-2xl font-display font-black bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
        {value}
      </div>

      {trend && <p className="text-xs text-slate-400 mt-1 font-medium">{trend}</p>}
    </div>
  );
};

export const ProgressBar = ({ value, max, color = '#a855f7', label, showPercent = true }) => {
  const [width, setWidth] = useState(0);
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-semibold">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}

      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const XP_THRESHOLDS = [0,100,250,500,900,1400,2000,2800,3800,5000,6500,8500,11000,14000,18000,23000,29000,36000,45000,55000];

export const XPProgressBar = ({ xp, level }) => {
  const [width, setWidth] = useState(0);

  const cur = XP_THRESHOLDS[Math.min(level - 1, XP_THRESHOLDS.length - 1)];
  const next = XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)];
  const pct = next > cur ? Math.min(Math.round(((xp - cur) / (next - cur)) * 100), 100) : 100;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div>
      <div className="flex justify-between text-xs text-violet-200 mb-1.5 font-semibold">
        <span>{xp.toLocaleString()} XP</span>
        <span>{next.toLocaleString()} XP</span>
      </div>

      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 transition-all duration-1000 ease-out shadow-sm"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md animate-zoom-in overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">{title}</h2>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all text-2xl font-light"
            >
              ×
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {children}
          </div>

          {footer && <div className="px-6 pb-6">{footer}</div>}
        </div>
      </div>
    </>,
    document.body
  );
};

export const Avatar = ({ user, size = 'md' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-28 h-28 text-5xl',
  };

  return (
    <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 shadow-md`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user?.username} className="w-full h-full object-cover" />
        : <span>{user?.username?.[0]?.toUpperCase() || '🐱'}</span>}
    </div>
  );
};

export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="text-6xl mb-4 animate-float">{icon}</div>
    <h3 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
    {subtitle && <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">{subtitle}</p>}
    {action}
  </div>
);

export const CategoryBadge = ({ category }) => {
  const styles = {
    fitness: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    health: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    education: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    mindfulness: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    productivity: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    social: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    creative: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    general: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return <span className={`badge ${styles[category] || styles.general}`}>{category}</span>;
};

export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="text-6xl animate-bounce-in">🐱</div>
      <div className="text-xl font-display font-bold text-violet-600 animate-pulse">HabitQuest</div>
      <Spinner size="md" />
    </div>
  </div>
);

export const ConfettiBurst = ({ active }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    const colors = ['#a855f7','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 6 + Math.random() * 8,
    }));

    setParticles(p);

    const timer = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            top: '40%',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
};