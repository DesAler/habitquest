import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'kk', label: 'KK', flag: '🇰🇿' },
];

export default function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // СОСТОЯНИЯ (STATES)
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: `Салам! Я твой HQ-бот. Готов стать лучше?`, isBot: true }
  ]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('hq_language', code);
  };

  // ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ (ОБНОВЛЕННАЯ)
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('hq_token'); 
      // Берем текущий язык сайта из локального хранилища (или ставим 'ru' по умолчанию)
      const currentLang = localStorage.getItem('hq_language') || 'ru'; 

      const res = await fetch('https://habitquest-fhyd.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Передаем сообщение И язык!
        body: JSON.stringify({ message: currentInput, language: currentLang }) 
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Бот спит / Бот ұйықтап жатыр / Bot is sleeping', isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
          H
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
            HabitQuest
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, key, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
              ${isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            {!collapsed && <span className="font-medium text-sm">{t(key)}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {!collapsed && (
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {LANGUAGES.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all
                  ${i18n.language === code
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {flag} {label}
              </button>
            ))}
          </div>
        )}

        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span className="text-sm font-medium">{theme === 'dark' ? t('light') : t('dark')}</span>}
        </button>

        <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.username?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-xs text-brand-500">Lvl {user?.level} • {user?.xp} XP</p>
            </div>
          )}
        </NavLink>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <span className="text-xl">🚪</span>
          {!collapsed && <span className="text-sm font-medium">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      <aside className={`hidden md:flex flex-col flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {/* --- ВЫЕЗЖАЮЩЕЕ МОБИЛЬНОЕ МЕНЮ --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Темный фон */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          {/* Сама панель */}
          <aside className="absolute top-0 left-0 w-64 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-left-4">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-2xl">☰</button>
          <span className="font-display font-bold text-lg">HabitQuest</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in min-h-screen">
            <Outlet />
          </div>

          <footer className="bg-slate-900 text-slate-400 py-12 px-10 border-t border-slate-800">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase text-xs tracking-widest">Headquarters</h4>
                <div className="text-sm space-y-2 opacity-80">
                  <p>📍 Алматы, пр. Абылай хана 1 (SDU)</p>
                  <p>📞 +7 (707) 281-86-32</p>
                  <p>📧 support@habitquest.kz</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase text-xs tracking-widest">The Founders</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex justify-between border-b border-slate-800 pb-1 italic"><span>Arsen Tileuken</span><span className="text-brand-500 text-[10px] font-bold uppercase">CEO</span></li>
                  <li className="flex justify-between border-b border-slate-800 pb-1 italic"><span>Kozhanov Danat</span><span className="text-brand-500 text-[10px] font-bold uppercase">CTO</span></li>
                  <li className="flex justify-between italic"><span>Sansyzbayuly Akarys</span><span className="text-brand-500 text-[10px] font-bold uppercase">Lead Dev</span></li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-10 text-[10px] uppercase tracking-widest opacity-40">© 2026 HabitQuest Inc. Proudly developed at SDU.</p>
          </footer>
        </main>
      </div>

      {/* --- FLOATING AI BOT --- */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => setIsBotOpen(!isBotOpen)}
          className="bg-brand-600 hover:bg-brand-500 text-white w-14 h-14 rounded-2xl shadow-2xl transition-all flex items-center justify-center text-2xl hover:scale-110 active:scale-95 shadow-brand-500/40"
        >
          {isBotOpen ? '✕' : '🤖'}
        </button>

        {isBotOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-brand-600 p-5 text-white">
              <p className="font-bold">HabitQuest AI Helper</p>
              <p className="text-[10px] opacity-70 italic">Online</p>
            </div>
            <div className="p-4 h-64 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-xs space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${m.isBot ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-sm' : 'bg-brand-600 text-white rounded-br-none shadow-md'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-[10px] text-slate-400 animate-pulse">Печатает...</div>}
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Спроси..." 
                className="flex-1 text-xs outline-none px-2 bg-transparent dark:text-white" 
              />
              <button onClick={handleSend} className="bg-brand-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-brand-500 transition-colors">
                PUSH
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}