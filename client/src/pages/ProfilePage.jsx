import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PageHeader, XPProgressBar, Avatar } from '../components/ui';
import i18n from '../i18n';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const fileRef = useRef();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    username: user?.username || '', 
    bio: user?.bio || '', 
    language: user?.language || 'en' 
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const LEVEL_KEYS = ['novice','apprentice','explorer','seeker','achiever','champion','master','grandMaster','legend','mythic'];
  const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' }, 
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }, 
    { code: 'kk', label: 'Қазақша', flag: '🇰🇿' }
  ];

  const levelKey = LEVEL_KEYS[Math.min((user?.level || 1) - 1, LEVEL_KEYS.length - 1)];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('bio', form.bio);
      fd.append('language', form.language);
      if (avatarFile) fd.append('avatar', avatarFile);
      
      await authAPI.updateProfile(fd);
      
      if (form.language !== i18n.language) {
        i18n.changeLanguage(form.language);
        localStorage.setItem('hq_language', form.language);
      }
      
      await refreshUser();
      setEditing(false);
      setAvatarFile(null);
      showToast(t('profile_page.successUpdate'));
    } catch (e) {
      showToast(e.response?.data?.error || t('profile_page.errorUpdate'), 'error');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      await authAPI.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      showToast(t('profile_page.successPassword'));
    } catch (e) {
      showToast(e.response?.data?.error || t('profile_page.errorPassword'), 'error');
    } finally { setPwLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t('profile')} />

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar user={avatarFile ? { ...user, avatar: null, username: user?.username } : user} size="xl" />
            {avatarFile && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <img src={URL.createObjectURL(avatarFile)} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {editing && (
              <>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg hover:bg-brand-600 transition-colors">
                  📷
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => setAvatarFile(e.target.files[0])} />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label">{t('username')}</label>
                  <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label className="label">{t('bio')}</label>
                  <textarea className="input resize-none" rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder={t('profile_page.bioPlaceholder')} />
                </div>
                <div>
                  <label className="label">{t('language')}</label>
                  <select className="input" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditing(false); setAvatarFile(null); }} className="btn-secondary flex-1">{t('cancel')}</button>
                  <button onClick={handleProfileSave} disabled={loading} className="btn-primary flex-1">
                    {loading ? '...' : t('save')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">{user?.username}</h2>
                <p className="text-brand-500 font-medium text-sm">
                  {t(`dashboard_page.levels.${levelKey}`)} • {t('level')} {user?.level}
                </p>
                {user?.bio && <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{user.bio}</p>}
                <p className="text-xs text-slate-400 mt-2">📧 {user?.email}</p>
                <button onClick={() => setEditing(true)} className="btn-secondary mt-3 text-sm py-1.5 flex items-center gap-2">
                  ✏️ {t('editProfile')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* XP / Level */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4">⚡ {t('profile_page.experienceLevel')}</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white font-display font-black text-2xl">
            {user?.level}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{t(`dashboard_page.levels.${levelKey}`)}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.xp} {t('profile_page.totalXp')}</p>
          </div>
        </div>
        <XPProgressBar xp={user?.xp || 0} level={user?.level || 1} />
        <p className="text-xs text-slate-400 mt-2 text-center">{t('xpToNext')}</p>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4">🔐 {t('changePassword')}</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">{t('currentPassword')}</label>
            <input type="password" className="input" value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">{t('newPassword')}</label>
            <input type="password" className="input" value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary w-full">
            {pwLoading ? '...' : t('update')}
          </button>
        </form>
      </div>

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