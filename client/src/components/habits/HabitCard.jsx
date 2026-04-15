import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logsAPI } from '../../services/api';
import { CategoryBadge, Modal } from '../ui';
import { useAuth } from '../../hooks/useAuth';

export default function HabitCard({ habit, onUpdate, onEdit, onDelete }) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [showProof, setShowProof] = useState(false);
  const [proofType, setProofType] = useState('text');
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const isDeadlineSoon = habit.deadline && (() => {
    const days = Math.ceil((new Date(habit.deadline) - new Date()) / 86400000);
    return days >= 0 && days <= 3;
  })();

  const handleComplete = async () => {
    if (habit.completedToday) return;
    setShowProof(true);
  };

  const handleProofSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('habit_id', habit.id);
      fd.append('proof_type', proofType);
      if (proofType === 'text') {
        fd.append('proof_content', proofText);
      } else if (proofFile) {
        fd.append('proof_image', proofFile);
      }
      const { data } = await logsAPI.complete(fd);
      setShowProof(false);
      setProofText('');
      setProofFile(null);
      setToast({ msg: `+${data.xp_earned} XP earned! 🎉${data.levelUp ? ' LEVEL UP! 🚀' : ''}`, type: 'success' });
      setTimeout(() => setToast(null), 3500);
      await refreshUser();
      onUpdate?.();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Failed to complete habit', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className={`card p-5 relative overflow-hidden transition-all hover:shadow-md ${habit.completedToday ? 'opacity-80' : ''}`}>
        {/* Color accent */}
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: habit.color }} />

        {/* Deadline warning */}
        {isDeadlineSoon && !habit.completedToday && (
          <div className="absolute top-3 right-3 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
            ⏰ Due soon
          </div>
        )}

        <div className="flex items-start gap-3 pl-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: habit.color + '20' }}>
            {habit.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white truncate">{habit.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge category={habit.category} />
              <span className="text-xs text-slate-400">+{habit.xp_reward} XP</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pl-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-orange-500">
              <span>🔥</span>
              <span className="font-bold">{habit.current_streak}</span>
              <span className="text-slate-400 font-normal">{t('days')}</span>
            </div>
            {habit.deadline && (
              <div className="text-slate-400 text-xs">📅 {habit.deadline}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(habit)}
                className="text-slate-400 hover:text-brand-500 transition-colors p-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20">
                ✏️
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(habit)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                🗑️
              </button>
            )}
            <button
              onClick={handleComplete}
              disabled={habit.completedToday}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                ${habit.completedToday
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/25'}`}
            >
              {habit.completedToday ? '✓ Done' : t('markComplete')}
            </button>
          </div>
        </div>
      </div>

      {/* Proof Modal */}
      <Modal open={showProof} onClose={() => setShowProof(false)} title={t('addProof')}
        footer={
          <button onClick={handleProofSubmit} disabled={submitting || (proofType === 'text' && !proofText.trim()) || (proofType === 'image' && !proofFile)}
            className="btn-primary w-full py-3">
            {submitting ? 'Submitting...' : `✅ Complete Habit (+${habit.xp_reward} XP)`}
          </button>
        }>
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('proofRequired')}</p>
          <div className="flex gap-2">
            <button onClick={() => setProofType('text')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${proofType === 'text' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              ✍️ {t('proofText')}
            </button>
            <button onClick={() => setProofType('image')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${proofType === 'image' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              📷 {t('proofImage')}
            </button>
          </div>
          {proofType === 'text' ? (
            <textarea className="input resize-none" rows={4} placeholder={t('proofPlaceholder')}
              value={proofText} onChange={e => setProofText(e.target.value)} />
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
              <input type="file" accept="image/*" className="hidden" id="proof-upload"
                onChange={e => setProofFile(e.target.files[0])} />
              <label htmlFor="proof-upload" className="cursor-pointer">
                {proofFile ? (
                  <div>
                    <img src={URL.createObjectURL(proofFile)} alt="proof" className="max-h-32 mx-auto rounded-xl mb-2 object-cover" />
                    <p className="text-sm text-brand-500">{proofFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm text-slate-500">Click to upload image</p>
                    <p className="text-xs text-slate-400 mt-1">Max 5MB</p>
                  </div>
                )}
              </label>
            </div>
          )}
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-3`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white text-xl">&times;</button>
        </div>
      )}
    </>
  );
}