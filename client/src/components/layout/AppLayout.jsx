import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import i18n from '../../i18n';
import { 
  LayoutDashboard, ListChecks, Trophy, ShoppingBag, 
  User, Menu, X, MessageSquare, Calendar, LogOut, Sun, Moon, Languages, Send, BarChart3, Users
} from 'lucide-react';

// Настройки языков
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
  const location = useLocation();

  // СОСТОЯНИЯ
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Для мобильного меню (3 полоски)
  const [isBotOpen, setIsBotOpen] = useState(false);   // Для ИИ бота
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

  // ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ БОТУ
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('hq_token'); 
      const currentLang = localStorage.getItem('hq_language') || 'ru'; 
      const res = await fetch('https://habitquest-fhyd.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Пункты меню с красивыми иконками
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: t('dashboard'), path: '/' },
    { icon: <ListChecks size={20} />, label: t('habits'), path: '/habits' },
    { icon: <Calendar size={20} />, label: t('calendar'), path: '/calendar' },
    { icon: <BarChart3 size={20} />, label: t('statistics'), path: '/statistics' },
    { icon: <ShoppingBag size={20} />, label: t('shop'), path: '/shop' },
    { icon: <Users size={20} />, label: t('friends'), path: '/friends' },
    { icon: <Trophy size={20} />, label: t('leaderboard'), path: '/leaderboard' },
    { icon: <User size={20} />, label: t('profile'), path: '/profile' },
  ];

  const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  // Внутренний контент сайдбара (используется и в десктопе, и в мобилке)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-8 px-2">
        <span className="text-2xl font-black text-brand-600 italic tracking-tighter">HabitQuest</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 
            ${location.pathname === item.path 
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {item.icon} <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {/* Переключатель темы */}
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 font-bold hover:text-brand-600 transition-colors">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Выбор языка */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {LANGUAGES.map(({ code, label }) => (
            <button key={code} onClick={() => changeLanguage(code)}
              className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all
                ${i18n.language === code ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Аватарка и Юзер */}
        <div className="flex items-center gap-3 px-2 pb-2">
          <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-black shadow-lg flex-shrink-0">
            {firstLetter}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.username}</p>
            <p className="text-[10px] text-brand-500 font-black uppercase">Lvl {user?.level} • {user?.xp} XP</p>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:scale-110 transition-transform">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">
      
      {/* ДЕСКТОПНЫЙ САЙДБАР */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6">
        <SidebarContent />
      </aside>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <aside className="absolute top-0 left-0 w-72 h-full bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsMenuOpen(false)} className="p-2"><X size={24} /></button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* МОБИЛЬНЫЙ ХЕДЕР */}
        <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
            <Menu size={24} />
          </button>
          <span className="font-black text-brand-600 italic">HabitQuest</span>
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-black">
            {firstLetter}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <Outlet />
          
          {/* ФУТЕР ВНУТРИ КОНТЕНТА */}
          <footer className="mt-20 py-10 border-t border-slate-200 dark:border-slate-800 opacity-50">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[10px] font-bold uppercase tracking-widest">
                <div>
                   <p className="text-brand-600 mb-2">Founders</p>
                   <p>Arsen Tileuken • Kozhanov Danat • Akarys</p>
                </div>
                <div className="md:text-right">
                   <p>© 2026 HabitQuest Inc • SDU Project</p>
                </div>
             </div>
          </footer>
        </div>
      </main>

      {/* --- КРУТОЙ ИИ БОТ --- */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button onClick={() => setIsBotOpen(!isBotOpen)}
          className="bg-brand-600 hover:bg-brand-500 text-white w-14 h-14 rounded-2xl shadow-2xl transition-all flex items-center justify-center hover:scale-110 active:scale-95 shadow-brand-500/40">
          {isBotOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>

        {isBotOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-brand-600 p-5 text-white">
              <p className="font-black text-sm uppercase tracking-wider">HabitQuest AI</p>
              <p className="text-[10px] opacity-70">Задайте вопрос по привычкам</p>
            </div>
            <div className="p-4 h-64 overflow-y-auto bg-slate-50 dark:bg-slate-900 space-y-4 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold shadow-sm ${m.isBot ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none' : 'bg-brand-600 text-white rounded-br-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-[10px] text-slate-400 animate-pulse font-bold">Печатает...</div>}
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Спроси бота..." className="flex-1 text-xs outline-none px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl dark:text-white font-bold" />
              <button onClick={handleSend} className="bg-brand-600 text-white p-2 rounded-xl hover:bg-brand-500 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}