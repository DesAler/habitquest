import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logsAPI } from '../services/api';
import { PageHeader, Spinner } from '../components/ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [calData, setCalData] = useState({});
  const [habitCount, setHabitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await logsAPI.getCalendar(year, month);
        setCalData(data.calendarData || {});
        setHabitCount(data.habitCount || 0);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [year, month]);

  const prevMonth = () => setDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const getDayStatus = (dateStr) => {
    const data = calData[dateStr];
    if (!data || data.total === 0) return 'empty';
    if (dateStr > today) return 'future';
    if (data.completed === 0) return 'missed';
    if (data.completed >= data.total) return 'full';
    return 'partial';
  };

  const getDayColor = (status, isToday) => {
    if (isToday) return 'ring-2 ring-brand-500';
    switch (status) {
      case 'full': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'partial': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'missed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700';
    }
  };

  const selectedData = selected ? calData[selected] : null;

  // Summary stats
  const completedDays = Object.values(calData).filter(d => d.completed >= d.total && d.total > 0).length;
  const missedDays = Object.values(calData).filter(d => d.completed === 0 && d.total > 0).length;
  const partialDays = Object.values(calData).filter(d => d.completed > 0 && d.completed < d.total).length;

  return (
    <div className="space-y-6">
      <PageHeader title={t('calendarView')} subtitle={`${habitCount} active habits tracked`} />

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[
          { color: 'bg-green-100 border-green-200 text-green-700', label: 'All completed' },
          { color: 'bg-yellow-100 border-yellow-200 text-yellow-700', label: 'Partial' },
          { color: 'bg-red-100 border-red-200 text-red-700', label: 'Missed' },
          { color: 'bg-white border-slate-200 text-slate-500', label: 'No data' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${l.color}`} />
            <span className="text-xs text-slate-500 dark:text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-display font-bold text-green-500">{completedDays}</div>
          <div className="text-xs text-slate-500 mt-1">Perfect Days</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-display font-bold text-yellow-500">{partialDays}</div>
          <div className="text-xs text-slate-500 mt-1">Partial Days</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-display font-bold text-red-400">{missedDays}</div>
          <div className="text-xs text-slate-500 mt-1">Missed Days</div>
        </div>
      </div>

      <div className="card p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            ‹
          </button>
          <div className="text-center">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              {MONTHS[month - 1]} {year}
            </h2>
          </div>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            ›
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty cells for first week */}
            {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}

            {/* Day cells */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const status = getDayStatus(dateStr);
              const isToday = dateStr === today;
              const data = calData[dateStr];

              return (
                <button
                  key={day}
                  onClick={() => setSelected(selected === dateStr ? null : dateStr)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-sm font-medium transition-all hover:scale-105 cursor-pointer
                    ${getDayColor(status, isToday)}
                    ${selected === dateStr ? 'ring-2 ring-brand-500 scale-105' : ''}
                    ${isToday ? 'font-bold' : ''}`}
                >
                  <span>{day}</span>
                  {data && data.total > 0 && !['future', 'empty'].includes(status) && (
                    <span className="text-xs opacity-70 leading-none mt-0.5">
                      {data.completed}/{data.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day detail */}
      {selected && selectedData && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">
            📅 {selected} — {selectedData.completed}/{selectedData.total} habits completed
          </h3>
          {selectedData.logs?.length > 0 ? (
            <div className="space-y-2">
              {selectedData.logs.map(log => (
                <div key={log.id} className={`flex items-center gap-3 p-3 rounded-xl ${log.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <span className="text-xl">{log.habit?.icon || '⭐'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.habit?.name}</p>
                    {log.proof_content && log.proof_type === 'text' && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">"{log.proof_content}"</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${log.completed ? 'text-green-600' : 'text-red-500'}`}>
                    {log.completed ? '✓ Done' : '✗ Missed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No habit data for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}