import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rewardsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PageHeader, Modal, Spinner, EmptyState } from '../components/ui';

const CATEGORY_ICONS = { digital: '💻', merchandise: '🎁', general: '⭐' };

export default function ShopPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [confirmReward, setConfirmReward] = useState(null);
  const [tab, setTab] = useState('shop');
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const load = async () => {
    try {
      const [rRes, pRes] = await Promise.all([rewardsAPI.getAll(), rewardsAPI.getHistory()]);
      setRewards(rRes.data.rewards);
      setPurchases(pRes.data.purchases);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePurchase = async () => {
    if (!confirmReward) return;
    setBuying(confirmReward.id);
    try {
      await rewardsAPI.purchase(confirmReward.id);
      setConfirmReward(null);
      setToast({ msg: `🎉 ${confirmReward.name} purchased!`, type: 'success' });
      setTimeout(() => setToast(null), 3500);
      await refreshUser();
      load();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Purchase failed', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally { setBuying(null); }
  };

  const categories = ['all', ...new Set(rewards.map(r => r.category))];
  const filtered = filterCat === 'all' ? rewards : rewards.filter(r => r.category === filterCat);
  const canAfford = (cost) => (user?.xp || 0) >= cost;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('rewardShop')}
        subtitle={`You have ${user?.xp || 0} XP to spend`}
        action={
          <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-display font-bold text-brand-600 dark:text-brand-400">{user?.xp || 0} XP</p>
              <p className="text-xs text-brand-400">Level {user?.level}</p>
            </div>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {['shop', 'purchases'].map(tab_name => (
          <button key={tab_name} onClick={() => setTab(tab_name)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === tab_name ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
            {tab_name === 'shop' ? `🛍️ ${t('rewardShop')}` : `📦 ${t('purchaseHistory')}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tab === 'shop' ? (
        <>
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize
                  ${filterCat === c ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                {c === 'all' ? 'All' : `${CATEGORY_ICONS[c] || '📦'} ${c}`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(reward => {
              const affordable = canAfford(reward.xp_cost);
              return (
                <div key={reward.id} className={`card overflow-hidden group transition-all hover:shadow-lg ${!affordable ? 'opacity-70' : ''}`}>
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
                      {CATEGORY_ICONS[reward.category] || '📦'} {reward.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-1">{reward.name}</h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⚡</span>
                        <span className="font-display font-bold text-brand-600 dark:text-brand-400">{reward.xp_cost}</span>
                        <span className="text-xs text-slate-400">XP</span>
                      </div>
                      <button
                        onClick={() => affordable && setConfirmReward(reward)}
                        disabled={!affordable}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                          ${affordable ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                      >
                        {affordable ? t('purchase') : t('notEnoughXP')}
                      </button>
                    </div>
                    {!affordable && (
                      <p className="text-xs text-red-400 mt-1">Need {reward.xp_cost - (user?.xp || 0)} more XP</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Purchase history */
        purchases.length === 0 ? (
          <EmptyState icon="📦" title={t('noPurchases')} subtitle="Complete habits to earn XP and buy rewards!" />
        ) : (
          <div className="space-y-3">
            {purchases.map(p => (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img src={p.reward?.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{p.reward?.name}</h4>
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-brand-600 dark:text-brand-400 font-bold text-sm">-{p.xp_spent} XP</p>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Purchase confirm modal */}
      <Modal open={!!confirmReward} onClose={() => setConfirmReward(null)} title="Confirm Purchase">
        {confirmReward && (
          <div className="space-y-4">
            <div className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <img src={confirmReward.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{confirmReward.name}</h3>
                <p className="text-brand-600 font-bold">⚡ {confirmReward.xp_cost} XP</p>
                <p className="text-xs text-slate-400">Remaining: {(user?.xp || 0) - confirmReward.xp_cost} XP</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Are you sure you want to purchase this item?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReward(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePurchase} disabled={!!buying} className="btn-primary flex-1">
                {buying ? 'Purchasing...' : `Buy for ${confirmReward.xp_cost} XP`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-3`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-xl">&times;</button>
        </div>
      )}
    </div>
  );
}