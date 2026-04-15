import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logsAPI } from '../../services/api';
import { CategoryBadge, Modal } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import confetti from 'canvas-confetti';

export default function HabitCard({ habit, onUpdate, onEdit, onDelete, index = 0 }) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  
  const [showProof, setShowProof] = useState(false);
  const [proofType, setProofType] = useState('text');
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const daysUntilDeadline = habit.deadline
    ? Math.ceil((new Date(habit.deadline) - new Date()) / 86400000)
    : null;
  const isDeadlineSoon = daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline <= 3;

  const handleProofSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('habit_id', habit.id);
      fd.append('proof_type', proofType);
      if (proofType === 'text') fd.append('proof_content', proofText);
      else if (proofFile) fd.append('proof_image', proofFile);

      const { data } = await logsAPI.complete(fd);
      
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#d946ef', '#6366f1']
      });

      setShowProof(false);
      setProofText(''); 
      setProofFile(null);
      setJustCompleted(true);
      
      const msg = data.levelUp
        ? `🎉 ${t('habit_card.levelUpMsg')}! Lvl ${data.level}! +${data.xp_earned} XP`
        : `✅ +${data.xp_earned} XP! ${t('streak')}: 🔥${data.streak}`;
      
      setToast({ msg, type: 'success' });
      setTimeout(() => setToast(null), 4000);
      
      await refreshUser();
      onUpdate?.();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || t('habit_card.failed'), type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally { setSubmitting(false); }
  };

  const canSubmit = proofType === 'text' ? proofText.trim().length > 0 : !!proofFile;

  return (
    <>
      <div
        className={`card-glass-premium relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/20
          animate-slide-up ${habit.completedToday || justCompleted ? 'opacity-90 border-emerald-500/50' : ''}`}
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="h-1.5 w-full rounded-t-3xl" style={{ background: `linear-gradient(to right, ${habit.color}, ${habit.color}88)` }} />

        {isDeadlineSoon && (
          <div className="absolute top-4 right-4 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full font-bold animate-pulse">
            ⏰ {daysUntilDeadline === 0 ? t('today') : `${daysUntilDeadline}${t('habit_card.daysLeft')}`}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: habit.color + '20', border: `2px solid ${habit.color}30` }}>
              {habit.icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-display font-bold text-slate-800 dark:text-white truncate text-base leading-tight">{habit.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <CategoryBadge category={habit.category} />
                <span className="text-xs font-bold text-violet-500">+{habit.xp_reward} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-xl">
              <span>🔥</span>
              <span className="font-black text-orange-500">{habit.current_streak || 0}</span>
              <span className="text-xs text-slate-400 font-semibold">{t('days')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 ml-auto">
              {onEdit && (
                <button onClick={() => onEdit(habit)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-all active:scale-90">
                  ✏️
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(habit)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                  🗑️
                </button>
              )}
              <button
                onClick={() => !habit.completedToday && !justCompleted && setShowProof(true)}
                disabled={habit.completedToday || justCompleted}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95
                  ${(habit.completedToday || justCompleted)
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md hover:shadow-violet-500/40 hover:scale-105'}`}
              >
                {(habit.completedToday || justCompleted) ? `✓ ${t('completed')}` : t('markComplete')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal open={showProof} onClose={() => setShowProof(false)} title={`📸 ${t('addProof')}`}
        footer={
          <button onClick={handleProofSubmit} disabled={submitting || !canSubmit}
            className="btn-primary w-full py-3.5 text-base">
            {submitting ? t('loading') : `✅ ${t('markComplete')} · +${habit.xp_reward} XP`}
          </button>
        }>
        <div className="space-y-5">
          <div className="flex gap-2">
            <button onClick={() => setProofType('text')}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all 
                ${proofType === 'text' ? 'border-violet-500 bg-violet-50 text-violet-600' : 'border-slate-100 text-slate-500'}`}>
              ✍️ {t('proofText')}
            </button>
            <button onClick={() => setProofType('image')}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all 
                ${proofType === 'image' ? 'border-violet-500 bg-violet-50 text-violet-600' : 'border-slate-100 text-slate-500'}`}>
              📷 {t('proofImage')}
            </button>
          </div>

          {proofType === 'text' ? (
            <textarea className="input resize-none h-28" placeholder={t('proofPlaceholder')}
              value={proofText} onChange={e => setProofText(e.target.value)} />
          ) : (
            <label className="block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:border-violet-300 transition-all">
              <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files[0])} />
              {proofFile ? (
                <p className="text-xs text-violet-600 font-bold">{proofFile.name}</p>
              ) : (
                <p className="text-sm text-slate-500">{t('habit_card.tapToUpload')} 📷</p>
              )}
            </label>
          )}
        </div>
      </Modal>

      {toast && (
        <div className={`fixed bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 px-5 py-4 rounded-2xl shadow-2xl animate-bounce-in font-semibold flex items-start gap-3
          ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'}`}>
          <span className="flex-1 text-sm">{toast.msg}</span>
        </div>
      )}
    </>
  );
}