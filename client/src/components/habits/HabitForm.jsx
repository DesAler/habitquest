import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['fitness','health','education','mindfulness','productivity','social','creative','finance','general'];
const ICONS = ['⭐','🏋️','🧘','📚','💧','🥗','🏃','🎯','💪','🧠','✍️','🎨','🎵','🌿','💤','🛁','🏊','🚴','🎮','📱'];
const COLORS = ['#6366f1','#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6'];

export default function HabitForm({ habit, onSubmit, onCancel, loading }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '', description: '', category: 'general', deadline: '',
    frequency: 'daily', xp_reward: 10, color: '#6366f1', icon: '⭐',
  });

  useEffect(() => {
    if (habit) setForm({
      name: habit.name || '',
      description: habit.description || '',
      category: habit.category || 'general',
      deadline: habit.deadline || '',
      frequency: habit.frequency || 'daily',
      xp_reward: habit.xp_reward || 10,
      color: habit.color || '#6366f1',
      icon: habit.icon || '⭐',
    });
  }, [habit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Название */}
      <div>
        <label className="label">{t('habitName')} *</label>
        <input 
          className="input" 
          placeholder={t('form.namePlaceholder')} 
          value={form.name} 
          onChange={e => set('name', e.target.value)} 
          required 
        />
      </div>

      {/* Описание */}
      <div>
        <label className="label">{t('description')}</label>
        <textarea 
          className="input resize-none" 
          rows={2} 
          placeholder={t('form.descPlaceholder')}
          value={form.description} 
          onChange={e => set('description', e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Категория */}
        <div>
          <label className="label">{t('category')} *</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </div>
        {/* Частота */}
        <div>
          <label className="label">{t('frequency')}</label>
          <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
            <option value="daily">{t('daily')}</option>
            <option value="weekly">{t('weekly')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Дедлайн */}
        <div>
          <label className="label">{t('deadline')}</label>
          <input type="date" className="input" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>
        {/* Награда */}
        <div>
          <label className="label">{t('xpReward')}</label>
          <input type="number" className="input" min={5} max={100} step={5}
            value={form.xp_reward} onChange={e => set('xp_reward', parseInt(e.target.value))} />
        </div>
      </div>

      {/* Иконка */}
      <div>
        <label className="label">{t('icon')}</label>
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          {ICONS.map(icon => (
            <button key={icon} type="button"
              onClick={() => set('icon', icon)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all
                ${form.icon === icon ? 'bg-brand-500 ring-2 ring-brand-500 ring-offset-1 text-white shadow-lg' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Цвет */}
      <div>
        <label className="label">{t('color')}</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button"
              onClick={() => set('color', c)}
              className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md' : 'opacity-70 hover:opacity-100'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 py-3 font-bold">
          {t('cancel')}
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 font-bold shadow-lg shadow-brand-500/20">
          {loading ? t('loading') : t('save')}
        </button>
      </div>
    </form>
  );
}