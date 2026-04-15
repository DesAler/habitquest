import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { socialAPI } from '../services/api';
import { PageHeader, Avatar, Spinner, EmptyState } from '../components/ui';

export default function FriendsPage() {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState(new Set());
  const [tab, setTab] = useState('friends');
  const searchRef = useRef(null);

  const load = async () => {
    try {
      const [fRes, rRes] = await Promise.all([socialAPI.getFriends(), socialAPI.getRequests()]);
      setFriends(fRes.data.friends);
      setRequests(rRes.data.requests);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQ.length < 2) { setSearchResults([]); return; }
      setSearching(true);
      try {
        const { data } = await socialAPI.search(searchQ);
        setSearchResults(data.users);
      } catch (e) { console.error(e); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const sendRequest = async (id) => {
    try {
      await socialAPI.sendRequest(id);
      setSentIds(s => new Set([...s, id]));
    } catch (e) { console.error(e); }
  };

  const respondRequest = async (id, action) => {
    try {
      await socialAPI.respondRequest(id, action);
      load();
    } catch (e) { console.error(e); }
  };

  const LEVEL_TITLES = ['Novice','Apprentice','Explorer','Seeker','Achiever'];

  return (
    <div className="space-y-6">
      <PageHeader title={t('friends')} subtitle={`${friends.length} friends`} />

      {/* Search */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">🔍 {t('addFriend')}</h3>
        <div className="relative">
          <input
            ref={searchRef}
            className="input pr-10"
            placeholder={t('searchUsers')}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2 animate-slide-up">
            {searchResults.map(u => {
              const alreadyFriend = friends.some(f => f.id === u.id);
              const sent = sentIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Avatar user={u} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{u.username}</p>
                    <p className="text-xs text-slate-400">Level {u.level} • {u.xp} XP</p>
                  </div>
                  {alreadyFriend ? (
                    <span className="text-xs text-green-500 font-medium">✓ Friend</span>
                  ) : sent ? (
                    <span className="text-xs text-slate-400 font-medium">Sent ✓</span>
                  ) : (
                    <button onClick={() => sendRequest(u.id)} className="btn-primary text-xs py-1.5 px-3">
                      {t('sendRequest')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button onClick={() => setTab('friends')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'friends' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
          👥 {t('friends')} ({friends.length})
        </button>
        <button onClick={() => setTab('requests')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'requests' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
          📬 {t('friendRequests')} {requests.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{requests.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <EmptyState icon="👥" title={t('noFriends')} subtitle="Search for users above to add them as friends!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map(f => (
              <div key={f.id} className="card p-5 flex flex-col items-center text-center">
                <Avatar user={f} size="lg" />
                <h3 className="font-display font-semibold text-slate-900 dark:text-white mt-3">{f.username}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {LEVEL_TITLES[Math.min((f.level||1)-1,4)]} • Level {f.level}
                </p>
                {f.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{f.bio}</p>}
                <div className="flex gap-3 mt-3 w-full">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-center">
                    <p className="font-bold text-brand-600 dark:text-brand-400 text-sm">{f.xp}</p>
                    <p className="text-xs text-slate-400">XP</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-center">
                    <p className="font-bold text-brand-600 dark:text-brand-400 text-sm">{f.level}</p>
                    <p className="text-xs text-slate-400">Level</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <EmptyState icon="📬" title="No pending requests" subtitle="No one has sent you a friend request yet." />
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="card p-4 flex items-center gap-4">
                <Avatar user={r.sender} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{r.sender?.username}</p>
                  <p className="text-xs text-slate-400">Level {r.sender?.level} • Wants to be your friend</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => respondRequest(r.id, 'decline')} className="btn-secondary text-sm py-1.5 px-3">
                    {t('decline')}
                  </button>
                  <button onClick={() => respondRequest(r.id, 'accept')} className="btn-primary text-sm py-1.5 px-3">
                    {t('accept')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}