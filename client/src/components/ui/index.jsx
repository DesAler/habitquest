// Shared UI components

export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div className={`${sizes[size]} border-brand-500 border-t-transparent rounded-full animate-spin`} />
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const StatCard = ({ label, value, icon, color = 'brand', trend }) => {
  const colors = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</div>
      {trend && <div className="text-xs text-slate-500 mt-1">{trend}</div>}
    </div>
  );
};

export const ProgressBar = ({ value, max, color = '#6366f1', label, showPercent = true }) => {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const XPProgressBar = ({ xp, level }) => {
  const THRESHOLDS = [0,100,250,500,900,1400,2000,2800,3800,5000,6500,8500,11000,14000,18000,23000,29000,36000,45000,55000];
  const currentXp = THRESHOLDS[Math.min(level - 1, THRESHOLDS.length - 1)];
  const nextXp = THRESHOLDS[Math.min(level, THRESHOLDS.length - 1)];
  const pct = nextXp > currentXp ? Math.round(((xp - currentXp) / (nextXp - currentXp)) * 100) : 100;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
        <span>{xp} XP</span>
        <span>{nextXp} XP</span>
      </div>
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 pb-6">{footer}</div>}
      </div>
    </div>
  );
};

export const Toast = ({ message, type = 'success', onClose }) => {
  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-brand-500',
    warning: 'bg-orange-500',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${styles[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white text-xl">&times;</button>
    </div>
  );
};

export const Avatar = ({ user, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-16 h-16 text-2xl', xl: 'w-24 h-24 text-4xl' };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
        : user?.username?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
    {subtitle && <p className="text-slate-500 text-sm mb-6 max-w-xs">{subtitle}</p>}
    {action}
  </div>
);

export const CategoryBadge = ({ category }) => {
  const colors = {
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
  return (
    <span className={`badge ${colors[category] || colors.general}`}>
      {category}
    </span>
  );
};