import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import i18n from '../../i18n';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', key: 'dashboard', end: true },
  { to: '/habits', icon: '✅', key: 'habits' },
  { to: '/calendar', icon: '📅', key: 'calendar' },
  { to: '/statistics', icon: '📊', key: 'statistics' },
  { to: '/shop', icon: '🛍️', key: 'shop' },
  { to: '/friends', icon: '👥', key: 'friends' },
  { to: '/leaderboard', icon: '🏆', key: 'leaderboard' },
];

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'kk', flag: '🇰🇿' },
];

function SidebarInner({
  compact = false,
  setMobileOpen,
  lang,
  setLang,
  theme,
  toggleTheme,
  user,
  initials,
  t,
  onLogout,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-90 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(59,130,246,0.18), rgba(168,85,247,0.24), rgba(16,185,129,0.14), rgba(236,72,153,0.18), rgba(59,130,246,0.18))', backgroundSize: '300% 300%', animation: 'hq-bg-pan 18s ease-in-out infinite' }} />

      <div className={`relative z-10 flex h-full min-h-0 flex-col ${compact ? 'p-4' : 'p-5'} justify-between pb-6`}>
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Logo & Slogan */}
          <div className="mb-8 flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="flex items-center justify-center overflow-visible">
              <img src="http://localhost:5000/uploads/logo.png" alt="logo" className="w-24 h-24 object-contain drop-shadow-[0_0_14px_rgba(168,85,247,0.65)]" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[1.05rem] font-extrabold tracking-wide text-white">HabitQuest</div>
              <div className="text-xs text-white/60">{t('layout.slogan')}</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 custom-scroll">
            {NAV_ITEMS.map(({ to, icon, key, end }, i) => (
              <NavLink
                key={key}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'group relative flex w-full items-center overflow-hidden rounded-2xl px-4 py-4 text-[15px] font-semibold transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:-translate-y-[2px] active:scale-[0.98]',
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/90 via-fuchsia-500/80 to-indigo-500/90 text-white shadow-[0_0_28px_rgba(168,85,247,0.35)] ring-1 ring-white/10'
                      : 'bg-white/6 text-white/80 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="relative flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">{icon}</span>
                  <span className="tracking-wide">{t(key)}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar (Lang, Theme, Profile, Logout) */}
        <div className="mt-5 shrink-0 space-y-4 pb-1">
          {/* Language Switcher */}
          <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map(({ code, flag }) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`flex items-center justify-center rounded-2xl py-3 text-lg transition-all ${
                      active ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg' : 'bg-white/8 hover:bg-white/12'
                    }`}
                  >
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group flex w-full items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/6 px-4 py-4 text-left text-white/90 transform-gpu transition-all duration-500 hover:scale-[1.02] backdrop-blur-xl"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg transition-all duration-300 group-hover:rotate-12"
              style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #facc15, #f59e0b)' : 'linear-gradient(135deg, #fbbf24, #a855f7)' }}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{theme === 'dark' ? t('dark') : t('light')}</div>
              <div className="text-xs text-white/55">{t('layout.themeHint')}</div>
            </div>
          </button>

          {/* Profile Card */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/6 p-3 backdrop-blur-xl transition-all hover:scale-[1.01] ${isActive ? 'ring-2 ring-violet-400/40' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg">
              {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{user?.username || 'User'}</div>
              <div className="text-xs text-violet-300">
                {t('layout.profileHint', { level: user?.level ?? 1, xp: user?.xp ?? 0 })}
              </div>
            </div>
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-[1.3rem] border border-rose-400/20 bg-rose-500/10 px-4 py-4 text-left text-rose-200 transition-all hover:bg-rose-500/18"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-lg transition-all duration-300 group-hover:rotate-[-6deg]">🚪</span>
            <div className="text-sm font-semibold">{t('logout')}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('hq_language') || i18n.language?.slice(0, 2) || 'en');

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('hq_language', lang);
    if (i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = useMemo(() => {
    const name = user?.username || 'U';
    return name.trim().charAt(0).toUpperCase();
  }, [user]);

  const isLight = theme === 'light';
  const rootStyle = {
    background: isLight
      ? 'linear-gradient(135deg, #f8f2ea 0%, #f3ebe1 42%, #ebe1d4 100%)'
      : 'linear-gradient(135deg, #020617 0%, #050816 48%, #020617 100%)',
    backgroundSize: '300% 300%',
    animation: 'hq-bg-pan 20s ease-in-out infinite',
  };

  return (
    <div className={`flex min-h-screen overflow-x-hidden transition-colors duration-700 ${isLight ? 'text-slate-900' : 'text-white'}`} style={rootStyle}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex h-screen w-[290px] shrink-0 flex-col border-r border-white/10 bg-slate-950/95 text-white shadow-2xl overflow-y-auto custom-scroll">
        <SidebarInner
          setMobileOpen={setMobileOpen}
          lang={lang}
          setLang={setLang}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          initials={initials}
          t={t}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] overflow-y-auto custom-scroll border-r border-white/10 bg-slate-950 shadow-2xl">
            <SidebarInner
              compact
              setMobileOpen={setMobileOpen}
              lang={lang}
              setLang={setLang}
              theme={theme}
              toggleTheme={toggleTheme}
              user={user}
              initials={initials}
              t={t}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-[290px]">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-xl text-white shadow-lg transition-all hover:bg-white/12">☰</button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐱</span>
            <span className="font-display text-lg font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">HabitQuest</span>
          </div>
          <NavLink to="/profile" className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initials}
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}