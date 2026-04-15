import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { statsAPI } from '../services/api';
import { PageHeader, StatCard, Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function StatisticsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getDashboard().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const pieData = [
    { name: 'Completed', value: stats?.week.completed || 0, color: '#22c55e' },
    { name: 'Missed', value: Math.max(0, (stats?.week.total || 0) - (stats?.week.completed || 0)), color: '#f1f5f9' },
  ];

  const LEVEL_TITLES = ['Novice','Apprentice','Explorer','Seeker','Achiever','Champion','Master','Grand Master','Legend','Mythic'];
  const levelTitle = LEVEL_TITLES[Math.min((user?.level || 1) - 1, LEVEL_TITLES.length - 1)];

  return (
    <div className="space-y-6">
      <PageHeader title={t('statistics')} subtitle="Your habit performance overview" />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('today')} value={`${stats?.today.rate || 0}%`} icon="📅" color="brand" trend={`${stats?.today.completed}/${stats?.today.total} habits`} />
        <StatCard label={t('thisWeek')} value={`${stats?.week.rate || 0}%`} icon="📊" color="green" trend={`${stats?.week.completed} completions`} />
        <StatCard label={t('thisMonth')} value={`${stats?.month.rate || 0}%`} icon="🗓️" color="orange" trend={`${stats?.month.completed} completions`} />
        <StatCard label="Total Habits" value={stats?.totalHabits || 0} icon="✅" color="brand" trend="Active habits" />
      </div>

      {/* Level card */}
      <div className="card p-6 bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="font-display font-black text-2xl">{user?.level}</span>
          </div>
          <div className="flex-1">
            <p className="text-brand-200 text-sm font-medium">{t('currentLevel')}</p>
            <h2 className="font-display font-bold text-2xl">{levelTitle}</h2>
            <p className="text-brand-200 text-sm mt-1">{user?.xp} XP total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4">{t('weeklyOverview')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.weeklyData || []} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="total" fill="#e2e8f0" radius={[6,6,0,0]} name="Total" />
              <Bar dataKey="completed" fill="#6366f1" radius={[6,6,0,0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Weekly Rate</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill="#6366f1" fontSize={22} fontWeight="bold">
                {stats?.week.rate || 0}%
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streaks table */}
      {stats?.streaks?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4">{t('topStreaks')}</h3>
          <div className="space-y-3">
            {stats.streaks.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-lg flex-shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                    <span className="text-sm text-orange-500 font-bold">🔥 {s.streak}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                      style={{ width: `${Math.min((s.streak / 30) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}