import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

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
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*120}px`, height: `${(i+1)*120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-3">H</div>
          <span className="text-white font-display font-bold text-2xl">HabitQuest</span>
        </div>
        <div className="relative">
          <h2 className="text-white font-display font-bold text-4xl leading-tight mb-4">
            Build habits.<br/>Earn rewards.<br/>Level up.
          </h2>
          <p className="text-white/70 text-lg">Track your daily habits, maintain streaks, and unlock exclusive rewards as you grow.</p>
          <div className="flex gap-4 mt-8">
            {['🔥 Streak System','⚡ XP & Levels','🛍️ Reward Shop'].map(f => (
              <div key={f} className="bg-white/10 backdrop-blur rounded-xl px-3 py-2 text-white text-sm">{f}</div>
            ))}
          </div>
        </div>
        <div className="relative text-white/50 text-sm">© 2025 HabitQuest. All rights reserved.</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">H</div>
            <span className="font-display font-bold text-xl dark:text-white">HabitQuest</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-1">{t('welcomeBack')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{t('noAccount')} <Link to="/register" className="text-brand-500 hover:text-brand-600 font-medium">{t('signUp')}</Link></p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('email')}</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('password')}</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? '...' : t('signIn')}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
            
          </div>
        </div>
      </div>
    </div>
  );
}