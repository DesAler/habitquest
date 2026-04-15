import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { rewardsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PageHeader, Modal, Spinner, EmptyState } from '../components/ui';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { ShoppingBag, History, Zap } from 'lucide-react';

const CATEGORY_ICONS = { digital: '💻', merchandise: '🎁', general: '⭐' };
const API_URL = 'https://habitquest-fhyd.onrender.com'; // ТВОЙ БЭКЕНД

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
    <AnimatedPage>
      <div className="space-y-6 pb-10">
        <PageHeader
          title={t('rewardShop')}
          subtitle={`You have ${user?.xp || 0} XP to spend`}
          action={
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
              <Zap className="fill-white" size={24} />
              <div>
                <p className="font-display font-black text-xl leading-none">{user?.xp || 0}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Balance</p>
              </div>
            </motion.div>
          }
        />

        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full sm:w-fit">
          {['shop', 'purchases'].map((id) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300
                ${tab === id ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md scale-100' : 'text-slate-500 hover:bg-white/50'}`}>
              {id === 'shop' ? <ShoppingBag size={18} /> : <History size={18} />} {id === 'shop' ? t('rewardShop') : t('purchaseHistory')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tab === 'shop' ? (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all
                    ${filterCat === c ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'}`}>
                  {c === 'all' ? 'All Items' : `${CATEGORY_ICONS[c] || '📦'} ${c}`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((reward, index) => {
                const affordable = canAfford(reward.xp_cost);
                // ЧИНИМ КАРТИНКУ:
                const fullImgUrl = reward.image.startsWith('http') ? reward.image : `${API_URL}${reward.image}`;

                return (
                  <motion.div 
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 shadow-sm border-2 border-transparent transition-all duration-300 hover:border-brand-500/20 hover:shadow-2xl hover:-translate-y-2 active:scale-95 ${!affordable ? 'opacity-80' : ''}`}
                  >
                    <div className="relative h-48 rounded-[2rem] overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900">
                      <img src={fullImgUrl} alt={reward.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="px-2 space-y-1">
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">{reward.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 h-8">{reward.description}</p>
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-black text-brand-600 dark:text-brand-400 text-lg">{reward.xp_cost} XP</span>
                        <button onClick={() => affordable && setConfirmReward(reward)} disabled={!affordable}
                          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all
                            ${affordable ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                          {affordable ? t('purchase') : 'Locked'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ИСТОРИЯ ПОКУПОК */
          <div className="space-y-4">
            {purchases.map((p, index) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] flex items-center gap-4 shadow-sm"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={p.reward?.image.startsWith('http') ? p.reward.image : `${API_URL}${p.reward.image}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-sm font-bold">{p.reward?.name}</div>
                <div className="text-right text-brand-600 font-black">-{p.xp_spent} XP</div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal open={!!confirmReward} onClose={() => setConfirmReward(null)} title="Confirm Purchase">
          {confirmReward && (
            <div className="space-y-6 text-center">
              <img src={confirmReward.image.startsWith('http') ? confirmReward.image : `${API_URL}${confirmReward.image}`} alt="" className="w-32 h-32 rounded-3xl object-cover mx-auto mb-4 shadow-2xl" />
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">{confirmReward.name}</h3>
              <p className="text-2xl font-black text-brand-600">{confirmReward.xp_cost} XP</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmReward(null)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100">Cancel</button>
                <button onClick={handlePurchase} disabled={!!buying} className="flex-1 py-4 rounded-2xl font-bold bg-brand-500 text-white shadow-xl shadow-brand-500/30">
                  {buying ? '...' : 'Buy'}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {toast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] ${toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'} text-white px-8 py-4 rounded-3xl shadow-2xl font-bold`}>
            {toast.msg}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
}