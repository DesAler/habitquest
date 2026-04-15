import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { statsAPI, habitsAPI } from '../services/api';
import { StatCard, XPProgressBar, ProgressBar, LoadingScreen, EmptyState } from '../components/ui';
import HabitCard from '../components/habits/HabitCard';

const CustomTooltip = ({ active, payload, label, t }) => {
  if (active && payload && payload.length) return (
    <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-slate-700">
      <p className="font-bold mb-1">{label}</p>
      {/* Оставляем только выполненные в тултипе */}
      <p className="text-violet-300">{t('completed')}: {payload[0]?.value || 0}</p>
    </div>
  );
  return null;
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greetingKey, setGreetingKey] = useState('morning');

  const LEVEL_KEYS = [
    'novice','apprentice','explorer','seeker','achiever','champion','master','grandMaster','legend','mythic'
  ];

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreetingKey('morning');
    else if (h < 18) setGreetingKey('afternoon');
    else setGreetingKey('evening');
  }, []);

  const load = async () => {
    try {
      const [sRes, hRes] = await Promise.all([statsAPI.getDashboard(), habitsAPI.getAll()]);
      setStats(sRes.data);
      setHabits(hRes.data.habits.slice(0, 6));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingScreen />;

  const lvl = user?.level || 1;
  const levelKey = LEVEL_KEYS[Math.min(lvl - 1, LEVEL_KEYS.length - 1)];
  const todayComplete = stats?.today.completed || 0;
  const todayTotal = stats?.today.total || 0;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 border-0 text-white p-6 sm:p-8 relative overflow-hidden animate-slide-down">
        <div className="absolute right-4 top-2 text-8xl opacity-10 animate-float">🐱</div>
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-violet-200 text-sm font-semibold mb-1">
              {t(`dashboard_page.greetings.${greetingKey}`)}
            </p>
            <h1 className="font-display font-black text-3xl mb-1">{user?.username} 👋</h1>
            <p className="text-violet-200 text-sm font-semibold">
              {t(`dashboard_page.levels.${levelKey}`)} · {t('level')} {lvl}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-display font-black">{(user?.xp || 0).toLocaleString()}</div>
            <div className="text-violet-200 text-sm font-semibold uppercase tracking-wider">
              {t('dashboard_page.totalXP')} ⚡
            </div>
          </div>
        </div>
        
        <div className="mt-5 relative z-10">
          <XPProgressBar xp={user?.xp || 0} level={lvl} />
          <p className="text-violet-200/70 text-xs mt-2 text-center font-semibold">{t('xpToNext')}</p>
        </div>

        <div className="mt-5 flex items-center gap-4 relative z-10">
          <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-violet-200 text-xs font-bold">{t('todayProgress')}</span>
              <span className="text-white font-black">{todayComplete}/{todayTotal}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${todayTotal > 0 ? (todayComplete / todayTotal) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t('today')} value={`${stats?.today.rate || 0}%`} icon="✅" color="green" trend={`${todayComplete}/${todayTotal} ${t('habits').toLowerCase()}`} delay={0} />
        <StatCard label={t('thisWeek')} value={`${stats?.week.rate || 0}%`} icon="📈" color="violet" trend={`${stats?.week.completed || 0} ${t('completed').toLowerCase()}`} delay={75} />
        <StatCard label={t('thisMonth')} value={`${stats?.month.rate || 0}%`} icon="🗓️" color="orange" trend={`${stats?.month.completed || 0} ${t('completed').toLowerCase()}`} delay={150} />
        <StatCard label={t('dashboard_page.totalHabits')} value={stats?.totalHabits || 0} icon="⭐" color="pink" trend={t('dashboard_page.active')} delay={225} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="font-display font-bold text-base text-slate-800 dark:text-white mb-4">{t('weeklyOverview')} 📊</h2>
          {stats?.weeklyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.weeklyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip t={t} />} cursor={{fill: 'transparent'}} />
                {/* Убрали Bar для total, оставили только completed */}
                <Bar dataKey="completed" fill="url(#barGrad)" radius={[8,8,0,0]} isAnimationActive={true} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-slate-300 text-sm flex-col gap-2">
              <span className="text-4xl animate-float">📊</span>
              <span>{t('dashboard_page.chartEmpty')}</span>
            </div>
          )}
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="font-display font-bold text-base text-slate-800 dark:text-white mb-4">{t('topStreaks')} 🔥</h2>
          {stats?.streaks?.filter(s => s.streak > 0).length > 0 ? (
            <div className="space-y-3">
              {stats.streaks.filter(s => s.streak > 0).map((s, i) => (
                <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${300 + i * 60}ms` }}>
                  <span className="text-2xl w-8 text-center">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mb-1">{s.name}</p>
                    <ProgressBar value={s.streak} max={Math.max(s.streak, 30)} showPercent={false} color="#f97316" />
                  </div>
                  <div className="flex items-center gap-0.5 text-orange-500 font-black text-sm flex-shrink-0">
                    🔥{s.streak}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="text-4xl mb-2 animate-float">🔥</span>
              <p className="text-slate-400 text-sm font-semibold">{t('Completedaily')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">
            {t('dashboard_page.todaysHabits')} ✅
          </h2>
          <Link to="/habits" className="text-violet-500 text-sm font-bold hover:text-violet-600 transition-colors">
            {t('dashboard_page.viewAll')} →
          </Link>
        </div>
        {habits.length === 0 ? (
          <EmptyState icon="🌱" title={t('noHabits')} subtitle={t('Completedaily')}
            action={<Link to="/habits" className="btn-primary">{t('addHabit')} 🚀</Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {habits.map((h, i) => <HabitCard key={h.id} habit={h} onUpdate={load} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}