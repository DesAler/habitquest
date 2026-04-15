import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { statsAPI, habitsAPI } from '../services/api';
import { StatCard, XPProgressBar, ProgressBar, Spinner, EmptyState } from '../components/ui';
import HabitCard from '../components/habits/HabitCard';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, habitsRes] = await Promise.all([statsAPI.getDashboard(), habitsAPI.getAll()]);
      setStats(statsRes.data);
      setHabits(habitsRes.data.habits.slice(0, 4));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  const LEVEL_TITLES = ['Novice','Apprentice','Explorer','Seeker','Achiever','Champion','Master','Grand Master','Legend','Mythic'];
  const levelTitle = LEVEL_TITLES[Math.min((user?.level || 1) - 1, LEVEL_TITLES.length - 1)];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome header */}
      <div className="card p-6 bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋</p>
            <h1 className="font-display font-bold text-2xl mb-1">{user?.username}</h1>
            <p className="text-brand-200 text-sm">{levelTitle} • Level {user?.level}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold">{user?.xp}</div>
            <div className="text-brand-200 text-sm">total XP</div>
          </div>
        </div>
        <div className="mt-4">
          <XPProgressBar xp={user?.xp || 0} level={user?.level || 1} />
        </div>
      </div>

      {/* Today's progress */}
      <div>
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-3">{t('todayProgress')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t('completed')} value={`${stats?.today.completed || 0}/${stats?.today.total || 0}`} icon="✅" color="green" />
          <StatCard label={t('completionRate')} value={`${stats?.today.rate || 0}%`} icon="📈" color="brand" />
          <StatCard label={t('thisWeek')} value={`${stats?.week.rate || 0}%`} icon="📅" color="orange" />
          <StatCard label={t('thisMonth')} value={`${stats?.month.rate || 0}%`} icon="🗓️" color="brand" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4">{t('weeklyOverview')}</h2>
          {stats?.weeklyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.weeklyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }}
                  formatter={(v, n) => [v, n === 'completed' ? 'Completed' : 'Total']}
                />
                <Bar dataKey="total" fill="#e2e8f0" radius={[6,6,0,0]} />
                <Bar dataKey="completed" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Top streaks */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4">{t('topStreaks')}</h2>
          {stats?.streaks?.length > 0 ? (
            <div className="space-y-3">
              {stats.streaks.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                    <ProgressBar value={s.streak} max={Math.max(s.streak, 30)} showPercent={false} />
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-display font-bold text-sm flex-shrink-0">
                    🔥 {s.streak}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">Complete habits to build streaks!</p>
          )}
        </div>
      </div>

      {/* Today's habits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Today's Habits</h2>
          <Link to="/habits" className="text-brand-500 text-sm font-medium hover:text-brand-600">View all →</Link>
        </div>
        {habits.length === 0 ? (
          <EmptyState icon="🌱" title="No habits yet" subtitle="Create your first habit to start tracking"
            action={<Link to="/habits" className="btn-primary">Create Habit</Link>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map(h => <HabitCard key={h.id} habit={h} onUpdate={loadData} />)}
          </div>
        )}
      </div>
    </div>
  );
}