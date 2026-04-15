import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PageHeader, Avatar, Spinner, XPProgressBar } from '../components/ui';

const MEDALS = ['🥇', '🥈', '🥉'];
const LEVEL_TITLES = ['Novice','Apprentice','Explorer','Seeker','Achiever','Champion','Master','Grand Master','Legend','Mythic'];

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getLeaderboard().then(r => setUsers(r.data.users)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const myRank = users.findIndex(u => u.id === user?.id) + 1;

  return (
    <div className="space-y-6">
      <PageHeader title={t('leaderboard')} subtitle="Top habit builders this month" />

      {/* My rank */}
      {myRank > 0 && (
        <div className="card p-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white border-0 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-display font-black text-xl">
            #{myRank}
          </div>
          <div>
            <p className="text-brand-200 text-sm">Your ranking</p>
            <p className="font-display font-bold text-lg">You're #{myRank} on the leaderboard!</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u, i) => {
              const isMe = u.id === user?.id;
              const levelTitle = LEVEL_TITLES[Math.min((u.level || 1) - 1, LEVEL_TITLES.length - 1)];
              return (
                <div key={u.id}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
                    ${isMe ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}>
                  {/* Rank */}
                  <div className="w-10 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-2xl">{MEDALS[i]}</span>
                      : <span className="font-display font-bold text-slate-400 dark:text-slate-500">#{i + 1}</span>}
                  </div>

                  {/* Avatar */}
                  <Avatar user={u} size="md" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm truncate ${isMe ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                        {u.username} {isMe && '(You)'}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{levelTitle}</span>
                    </div>
                    <div className="mt-1 w-32">
                      <XPProgressBar xp={u.xp} level={u.level} />
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-brand-600 dark:text-brand-400">{u.xp.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">XP • Lvl {u.level}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}