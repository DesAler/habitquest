import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { PageHeader, Modal, Spinner, EmptyState } from '../components/ui';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { ShoppingBag, History, Zap, PackageX } from 'lucide-react';

const FAKE_REWARDS = [
  { id: 1, key: 'coffee', xp_cost: 100, category: 'general', image: '/uploads/coffee.jpeg' },
  { id: 2, key: 'stickers', xp_cost: 150, category: 'general', image: '/uploads/stickers.jpeg' },
  { id: 3, key: 'aura', xp_cost: 500, category: 'digital', image: '/uploads/aura.jpeg' },
  { id: 4, key: 'vip', xp_cost: 1000, category: 'digital', image: '/uploads/vip.jpeg' },
  { id: 5, key: 'boost', xp_cost: 300, category: 'general', image: '/uploads/boost.jpeg' },
  { id: 6, key: 'theme', xp_cost: 750, category: 'digital', image: '/uploads/theme.jpeg' },
  { id: 7, key: 'box', xp_cost: 250, category: 'general', image: '/uploads/box.jpeg' }
];

const CATEGORY_ICONS = {
  digital: '💻',
  merchandise: '🎁',
  general: '⭐',
};

const getImageUrl = (img) => img;

export default function ShopPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [rewards, setRewards] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [confirmReward, setConfirmReward] = useState(null);
  const [tab, setTab] = useState('shop');
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      setRewards(FAKE_REWARDS);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPurchases = localStorage.getItem('my_purchases');
    if (savedPurchases) {
      try {
        setPurchases(JSON.parse(savedPurchases));
      } catch (e) {
        localStorage.removeItem('my_purchases');
      }
    }
    load();
  }, []);

  const handlePurchase = async () => {
    if (!confirmReward || !user) return;
    const cost = Number(confirmReward.xp_cost);

    if ((user.xp || 0) < cost) {
      showToast(t('notEnoughXP'), 'error');
      return;
    }

    setBuying(confirmReward.id);

    setTimeout(() => {
      const newPurchase = {
        id: Date.now(),
        reward: confirmReward,
        xp_spent: cost,
        date: new Date().toISOString(),
      };

      const updatedPurchases = [newPurchase, ...purchases];
      setPurchases(updatedPurchases);
      localStorage.setItem('my_purchases', JSON.stringify(updatedPurchases));

      if (typeof user.setUser === 'function') {
        user.setUser({ ...user, xp: (user.xp || 0) - cost });
      } else {
        user.xp = (user.xp || 0) - cost;
      }

      const rewardName = t(`items.${confirmReward.key}.name`);
      showToast(`${t('purchased')}: ${rewardName}`, 'success');
      
      setConfirmReward(null);
      setBuying(null);
    }, 600);
  };

  const categories = useMemo(() => {
    const cats = rewards.map((r) => r?.category).filter(Boolean);
    return ['all', ...new Set(cats)];
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    if (filterCat === 'all') return rewards;
    return rewards.filter((r) => r?.category === filterCat);
  }, [rewards, filterCat]);

  const canAfford = (cost) => (user?.xp || 0) >= Number(cost || 0);

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-10">
        <PageHeader
          title={t('rewardShop')}
          subtitle={`${t('yourXP')}: ${user?.xp || 0} XP`}
          action={
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 text-white"
            >
              <Zap className="fill-white" size={24} />
              <div>
                <p className="font-display font-black text-xl leading-none">{user?.xp || 0}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">{t('yourXP')}</p>
              </div>
            </motion.div>
          }
        />

        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full sm:w-fit">
          {['shop', 'purchases'].map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                tab === id ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              {id === 'shop' ? <ShoppingBag size={18} /> : <History size={18} />}
              {id === 'shop' ? t('rewardShop') : t('purchaseHistory')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tab === 'shop' ? (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(c)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    filterCat === c ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {c === 'all' ? t('categories.all') : `${CATEGORY_ICONS[c] || '📦'} ${t(`categories.${c}`)}`}
                </button>
              ))}
            </div>

            {filteredRewards.length === 0 ? (
              <EmptyState
                icon={<PackageX className="w-10 h-10" />}
                title={t('errorNotFound')}
                description={t('noPurchases')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRewards.map((reward, index) => {
                  const affordable = canAfford(reward?.xp_cost);
                  return (
                    <motion.div
                      key={reward?.id ?? index}
                      className={`group bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 shadow-sm border-2 border-transparent transition-all duration-300 hover:-translate-y-2 active:scale-95 ${!affordable ? 'opacity-80' : ''}`}
                    >
                      <div className="relative h-48 rounded-[2rem] overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900">
                        <img src={reward.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="px-2 space-y-1">
                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">
                          {t(`items.${reward.key}.name`)}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 h-8">
                          {t(`items.${reward.key}.desc`)}
                        </p>
                        <div className="flex items-center justify-between pt-4">
                          <span className="font-black text-brand-600 dark:text-brand-400 text-lg">{reward.xp_cost} XP</span>
                          <button
                            onClick={() => affordable && setConfirmReward(reward)}
                            disabled={!affordable}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                              affordable ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {affordable ? t('purchase') : t('notEnoughXP')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <EmptyState
                icon={<History className="w-10 h-10" />}
                title={t('noPurchases')}
                description={t('purchaseHistory')}
              />
            ) : (
              purchases.map((p, index) => (
                <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] flex items-center gap-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img src={p.reward.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm font-bold">{t(`items.${p.reward.key}.name`)}</div>
                  <div className="text-right text-brand-600 font-black">-{p.xp_spent} XP</div>
                </div>
              ))
            )}
          </div>
        )}

        <Modal
          open={!!confirmReward}
          onClose={() => setConfirmReward(null)}
          title={t('confirmPurchase')}
        >
          {confirmReward && (
            <div className="space-y-6 text-center">
              <img
                src={getImageUrl(confirmReward?.image) || '/placeholder.png'}
                alt=""
                className="w-32 h-32 rounded-3xl object-cover mx-auto mb-4 shadow-2xl"
              />
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                {t(`items.${confirmReward.key}.name`)}
              </h3>
              <p className="text-2xl font-black text-brand-600">
                {confirmReward?.xp_cost || 0} XP
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmReward(null)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-700 dark:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!!buying}
                  className="flex-1 py-4 rounded-2xl font-bold bg-brand-500 text-white shadow-xl shadow-brand-500/30 disabled:opacity-70"
                >
                  {buying ? '...' : t('purchase')}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] ${
              toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'
            } text-white px-8 py-4 rounded-3xl shadow-2xl font-bold`}
          >
            {toast.msg}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
}