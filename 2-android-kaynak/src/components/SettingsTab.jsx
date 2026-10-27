import React, { useState } from 'react';
import { 
  User, 
  Target, 
  Bell, 
  ShieldAlert, 
  Trash2, 
  RotateCcw, 
  Save, 
  Smartphone,
  PhoneCall,
  CheckCircle2,
  Info,
  Volume2,
  Sparkles
} from 'lucide-react';
import { DIABETES_TYPES, triggerHaptic } from '../constants';
import { sendDesktopNotification, playNotificationChime } from '../utils/notifications';

export default function SettingsTab({ 
  profile, 
  onSaveProfile, 
  reminders, 
  onSaveReminders, 
  onLoadDemo, 
  onClearAll 
}) {
  const [formData, setFormData] = useState({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleTargetChange = (key, val) => {
    setFormData((prev) => ({
      ...prev,
      targets: {
        ...prev.targets,
        [key]: Number(val),
      },
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    triggerHaptic(20);
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleReminder = (id) => {
    triggerHaptic(15);
    const updated = reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    onSaveReminders(updated);

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleTestNotification = async () => {
    triggerHaptic(25);
    playNotificationChime();
    const result = await sendDesktopNotification(
      'GlukoDenge Sesli Hatırlatıcı',
      'Bildirim ve sesli uyarı sistemi sorunsuz çalışıyor!'
    );
    setTestMsg(result.message);
    setTimeout(() => setTestMsg(''), 4000);
  };

  return (
    <div className="space-y-4">
      
      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-800">Kişisel Bilgiler & Doktor</h3>
          </div>
          {savedSuccess && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kaydedildi</span>
            </span>
          )}
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Ad Soyad</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Diyabet Türü</label>
            <select
              value={formData.diabetesType || 'type2'}
              onChange={(e) => handleChange('diabetesType', e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none"
            >
              {DIABETES_TYPES.map((dt) => (
                <option key={dt.id} value={dt.id}>{dt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Ölçüm Birimi</label>
            <select
              value={formData.unit || 'mg/dL'}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none"
            >
              <option value="mg/dL">mg/dL (Türkiye)</option>
              <option value="mmol/L">mmol/L</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Takip Eden Doktor</label>
          <input
            type="text"
            value={formData.doctorName || ''}
            onChange={(e) => handleChange('doctorName', e.target.value)}
            placeholder="Dr. Adı Soyadı"
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Doktor Tel</label>
            <input
              type="tel"
              value={formData.doctorPhone || ''}
              onChange={(e) => handleChange('doctorPhone', e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Acil Kişi Tel</label>
            <input
              type="tel"
              value={formData.emergencyContact || ''}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Target Glucose Thresholds */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 block mb-2">
            Hedef Şeker Aralıkları (ADA Standartları)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block">Hipoglisemi Alt Sınırı</span>
              <input
                type="number"
                value={formData.targets?.hypo || 70}
                onChange={(e) => handleTargetChange('hypo', e.target.value)}
                className="w-full font-bold bg-white px-2 py-1 rounded border border-slate-200 mt-1"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block">Açlık Üst Sınırı</span>
              <input
                type="number"
                value={formData.targets?.fastingMax || 130}
                onChange={(e) => handleTargetChange('fastingMax', e.target.value)}
                className="w-full font-bold bg-white px-2 py-1 rounded border border-slate-200 mt-1"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block">Tokluk (2s) Üst Sınırı</span>
              <input
                type="number"
                value={formData.targets?.postMealMax || 180}
                onChange={(e) => handleTargetChange('postMealMax', e.target.value)}
                className="w-full font-bold bg-white px-2 py-1 rounded border border-slate-200 mt-1"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block">Hiperglisemi Kritik</span>
              <input
                type="number"
                value={formData.targets?.hyperCritical || 250}
                onChange={(e) => handleTargetChange('hyperCritical', e.target.value)}
                className="w-full font-bold bg-white px-2 py-1 rounded border border-slate-200 mt-1"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="touch-active w-full py-2.5 bg-teal-600 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 mt-2"
        >
          <Save className="w-4 h-4" />
          <span>Ayarları Kaydet</span>
        </button>
      </form>

      {/* Daily Reminders & Notification Sound Test */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-800">Ölçüm & İlaç Alarmları</h3>
          </div>
          <span className="text-[10px] text-slate-400">Android Bildirimleri</span>
        </div>

        {/* Notification Sound Test Button */}
        <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-900">
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Bildirim & Ses Denemesi</span>
            </div>
            <button
              type="button"
              onClick={handleTestNotification}
              className="touch-active px-3 py-1.5 bg-teal-600 text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center space-x-1"
            >
              <span>Şimdi Test Et</span>
            </button>
          </div>
          {testMsg && (
            <p className="text-[11px] font-bold text-teal-800 bg-white p-2 rounded-xl border border-teal-200">
              {testMsg}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              onClick={() => handleToggleReminder(r.id)}
              className="touch-active flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 block">{r.label}</span>
                <span className="text-[11px] font-mono text-teal-700 font-semibold">{r.time}</span>
              </div>
              <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${r.active ? 'bg-teal-600' : 'bg-slate-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Android Installation Guide Card */}
      <div className="bg-slate-800 text-white rounded-3xl p-4 shadow-sm space-y-2">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-teal-100">Telefona Uygulama Olarak Yükleme</h3>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          1. Telefonunuzun Chrome tarayıcısında bu adresi açın.
          <br />
          2. Sağ üstteki <strong>üç noktaya (⋮)</strong> dokunun.
          <br />
          3. <strong>"Ana Ekrana Ekle"</strong> veya <strong>"Uygulamayı Yükle"</strong> seçeneğine dokunun.
          <br />
          Artık internetsiz bile çalışan bağımsız bir uygulama olarak açılır!
        </p>
      </div>

      {/* Reset & Demo Data Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => {
            triggerHaptic(20);
            if (window.confirm('Örnek verileri yüklemek istiyor musunuz?')) {
              onLoadDemo();
            }
          }}
          className="touch-active py-2.5 px-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
          <span>Örnek Veri Yükle</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(30);
            if (window.confirm('TÜM verileriniz silinecektir! Onaylıyor musunuz?')) {
              onClearAll();
            }
          }}
          className="touch-active py-2.5 px-3 bg-white border border-rose-200 text-rose-600 text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Tüm Verileri Sıfırla</span>
        </button>
      </div>

    </div>
  );
}
