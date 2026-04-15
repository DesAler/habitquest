import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const FLOATING_EMOJIS = ['⭐','🔥','💪','📚','🧘','🏃','✅','🎯','💎','🌟'];

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex dark:bg-slate-950 overflow-hidden">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated background circles */}
        {[1,2,3,4].map(i => (
          <div key={i} className="absolute rounded-full border border-white/10"
            style={{ width: i * 200, height: i * 200, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animationDelay: `${i * 0.5}s` }} />
        ))}

        {/* Floating emoji elements */}
        {FLOATING_EMOJIS.map((emoji, i) => (
          <div key={i} className="absolute text-2xl opacity-30 animate-float"
            style={{ left: `${5 + (i * 9)}%`, top: `${10 + Math.sin(i) * 60}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${3 + i * 0.4}s` }}>
            {emoji}
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">🐱</div>
            <span className="text-white font-display font-black text-2xl">HabitQuest</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-bounce-in">🚀</div>
          <h2 className="text-white font-display font-black text-4xl leading-tight mb-4">
            Build habits.<br/>Earn XP.<br/>Level up.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Track your daily habits, maintain streaks, and unlock exclusive rewards as you grow into the best version of yourself.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🔥', text: 'Streak tracking' },
              { icon: '⚡', text: 'XP & Levels' },
              { icon: '🛍️', text: 'Reward shop' },
              { icon: '👥', text: 'Social features' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-3 text-white text-sm font-semibold">
                <span>{f.icon}</span><span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-sm">© 2025 HabitQuest. Build good habits. 🐱</div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-rose-50/50 to-violet-50/50 dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-violet-500/30">🐱</div>
            <span className="font-display font-black text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">HabitQuest</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display font-black text-3xl text-slate-800 dark:text-white mb-2">{t('welcomeBack')} 👋</h1>
            <p className="text-slate-400 text-sm">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-violet-600 hover:text-violet-700 font-bold">
                {t('signUp')} →
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">📧 {t('email')}</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoComplete="email" />
            </div>
            <div>
              <label className="label">🔐 {t('password')}</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</> : `🚀 ${t('signIn')}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}