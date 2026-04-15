import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { habitsAPI } from '../services/api';
import { PageHeader, Modal, EmptyState, Spinner } from '../components/ui';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';

export default function HabitsPage() {
  const { t } = useTranslation();

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [deleteHabit, setDeleteHabit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await habitsAPI.getAll();
      setHabits(Array.isArray(data?.habits) ? data.habits : []);
    } catch (e) {
      console.error(e);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await habitsAPI.create(form);
      setShowCreate(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editHabit?.id) return;

    setSubmitting(true);
    try {
      await habitsAPI.update(editHabit.id, form);
      setEditHabit(null);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteHabit?.id) return;

    try {
      await habitsAPI.delete(deleteHabit.id);
      setDeleteHabit(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ['all', ...new Set(habits.map((h) => h.category).filter(Boolean))];
  const filtered = filterCat === 'all' ? habits : habits.filter((h) => h.category === filterCat);
  const todayCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('myHabits')}
        subtitle={`${todayCount}/${habits.length} ${t('habits_page.completedTodayCount')}`}
        action={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span> {t('addHabit')}
          </button>
        }
      />

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filterCat === c
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-300'
              }`}
            >
              {c === 'all' ? t('habits_page.all') : t(`categories.${c.toLowerCase()}`, { defaultValue: c })}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🌱"
          title={t('noHabits')}
          subtitle={t('habits_page.startTracking')}
          action={
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              {t('addHabit')}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onUpdate={load}
              onEdit={setEditHabit}
              onDelete={setDeleteHabit}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('addHabit')}>
        <HabitForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={submitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editHabit} onClose={() => setEditHabit(null)} title={t('editHabit')}>
        <HabitForm
          habit={editHabit}
          onSubmit={handleEdit}
          onCancel={() => setEditHabit(null)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteHabit} onClose={() => setDeleteHabit(null)} title={t('deleteHabit')}>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t('habits_page.deleteConfirm')} <strong>"{deleteHabit?.name}"</strong>? {t('habits_page.cannotBeUndone')}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDeleteHabit(null)}
            className="btn-secondary flex-1"
          >
            {t('cancel')}
          </button>
          <button type="button" onClick={handleDelete} className="btn-danger flex-1">
            {t('delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
}