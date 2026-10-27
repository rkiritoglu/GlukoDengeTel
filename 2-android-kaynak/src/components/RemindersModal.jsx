import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Volume2,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { sendDesktopNotification, playNotificationChime } from '../utils/notifications';

export default function RemindersModal({ isOpen, onClose, reminders, onSaveReminders }) {
  const [list, setList] = useState(reminders || []);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('measurement'); // 'measurement' | 'medication'
  const [notificationStatus, setNotificationStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    const updated = list.map((item) => (item.id === id ? { ...item, active: !item.active } : item));
    setList(updated);
    onSaveReminders(updated);
  };

  const handleDelete = (id) => {
    const updated = list.filter((item) => item.id !== id);
    setList(updated);
    onSaveReminders(updated);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newItem = {
      id: `rem-${Date.now()}`,
      time: newTime,
      label: newLabel.trim(),
      active: true,
      type: newType,
    };

    const updated = [...list, newItem].sort((a, b) => a.time.localeCompare(b.time));
    setList(updated);
    onSaveReminders(updated);
    setNewLabel('');
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await sendDesktopNotification(
      'GlukoDenge Hatırlatıcı Testi',
      'Masaüstü bildirimleri ve sesli uyarı başarıyla çalışıyor! Ölçüm vakitlerinizde bu şekilde uyarılacaksınız.',
      {
        tag: 'test-notification',
      }
    );

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    setTestResult(res);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0">Ölçüm & İlaç Hatırlatıcıları</h3>
              <p className="text-xs text-teal-100/90 mt-0.5">Düzenli ölçüm alışkanlığı ve masaüstü uyarıları</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Notification Permission & Testing Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Masaüstü & Tarayıcı Bildirimleri</span>
                  {notificationStatus === 'granted' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Etkin
                    </span>
                  )}
                  {notificationStatus === 'default' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      İzin Bekliyor
                    </span>
                  )}
                  {notificationStatus === 'denied' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> Engellendi
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {notificationStatus === 'granted' && 'Bildirimler açık. Hatırlatıcı zamanı geldiğinde masaüstünüze sesli uyarı gelir.'}
                  {notificationStatus === 'default' && 'Ölçüm saatlerinde tarayıcınızın sizi uyarması için aşağıdaki test butonuna basarak izin verin.'}
                  {notificationStatus === 'denied' && 'Tarayıcı bildirimleri engellendi. Adres çubuğundaki kilit (ayar) simgesine tıklayarak bildirimlere izin veriniz.'}
                </div>
              </div>

              {/* Test Button */}
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestNotification}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isTesting ? 'Deneniyor...' : 'Şimdi Dene'}
              </button>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                testResult.permission === 'granted' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {testResult.permission === 'granted' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Existing Reminders List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Kayıtlı Hatırlatıcılar ({list.length})
              </span>
              <span className="text-[11px] text-slate-400">Her dakika otomatik denetlenir</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {list.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    item.active ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {item.time}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">
                        {item.type === 'measurement' ? 'Ölçüm Vakti' : 'İlaç / İnsülin'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={() => handleToggle(item.id)}
                      className="w-4 h-4 text-teal-600 rounded-sm cursor-pointer accent-teal-600"
                      title={item.active ? 'Aktif' : 'Pasif'}
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Reminder Form */}
          <form onSubmit={handleAdd} className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Yeni Hatırlatıcı Ekle
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
              />
              <input
                type="text"
                placeholder="Örn: Akşam Tokluk (21:00)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white sm:col-span-2"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
              >
                <option value="measurement">Ölçüm Hatırlatıcısı</option>
                <option value="medication">İlaç / İnsülin Hatırlatıcısı</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
