import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Target, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  Sliders,
  ShieldCheck,
  ArrowLeftRight
} from 'lucide-react';
import { DIABETES_TYPES, triggerHaptic } from '../constants';
import { exportToJSON } from '../utils/storage';

export default function SettingsSection({ 
  profile, 
  onSaveProfile, 
  records, 
  reminders, 
  onImportData, 
  onLoadDemo, 
  onClearAll,
  onOpenDetailedModal 
}) {
  const [formData, setFormData] = useState({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [field]: Number(value) || 0
      }
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    triggerHaptic(20);
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleUnit = () => {
    triggerHaptic(15);
    const newUnit = formData.unit === 'mg/dL' ? 'mmol/L' : 'mg/dL';
    const updated = { ...formData, unit: newUnit };
    setFormData(updated);
    onSaveProfile(updated);
  };

  const handleExportJSON = () => {
    triggerHaptic(15);
    exportToJSON(records, formData, reminders);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.records || parsed.profile)) {
          triggerHaptic(20);
          onImportData(parsed);
          setImportStatus('Yedek başarıyla yüklendi!');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          alert('Geçersiz yedek dosyası.');
        }
      } catch (err) {
        alert('Dosya okunurken hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    triggerHaptic(15);
    if (confirm('Örnek demo verileri yüklenecek. Onaylıyor musunuz?')) {
      onLoadDemo();
    }
  };

  const handleClear = () => {
    triggerHaptic(30);
    if (confirm('DİKKAT: Cihazdaki TÜM ölçüm ve kayıtlar silinecektir! Bu işlem geri alınamaz. Emin misiniz?')) {
      onClearAll();
    }
  };

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
              Ayarlar & Kişisel Profil
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hasta profili, hedef aralıklar ve veri yedekleme seçenekleri
            </p>
          </div>
        </div>

        {/* Quick Unit Switcher Button */}
        <button
          type="button"
          onClick={handleToggleUnit}
          className="touch-active self-start sm:self-auto px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />
          <span>Birim: {formData.unit || 'mg/dL'}</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Profile Card */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-700" />
            Hasta & Doktor Bilgileri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Ad Soyad</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Örn: Rıfat Bey"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Diyabet Tipi</label>
              <select
                value={formData.diabetesType || 'type2'}
                onChange={(e) => handleInputChange('diabetesType', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {DIABETES_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Takip Eden Doktor Adı</label>
              <input
                type="text"
                value={formData.doctorName || ''}
                onChange={(e) => handleInputChange('doctorName', e.target.value)}
                placeholder="Örn: Prof. Dr. Ahmet Yılmaz"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Doktor Telefon Numarası</label>
              <input
                type="tel"
                value={formData.doctorPhone || ''}
                onChange={(e) => handleInputChange('doctorPhone', e.target.value)}
                placeholder="Örn: +905321234567"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Target Ranges Card (ADA Standards) */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-700" />
            Glukoz Hedef Aralıkları ({formData.unit || 'mg/dL'})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Hipoglisemi Alt Sınırı
              </label>
              <input
                type="number"
                value={formData.targets?.hypo ?? 70}
                onChange={(e) => handleTargetChange('hypo', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Varsayılan: 70</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Açlık Hedef Üst Sınırı
              </label>
              <input
                type="number"
                value={formData.targets?.fastingMax ?? 130}
                onChange={(e) => handleTargetChange('fastingMax', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Varsayılan: 130</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Tokluk Hedef Üst Sınırı
              </label>
              <input
                type="number"
                value={formData.targets?.postMealMax ?? 180}
                onChange={(e) => handleTargetChange('postMealMax', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Varsayılan: 180</span>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-emerald-600">
            {savedSuccess ? '✓ Ayarlar başarıyla kaydedildi!' : ''}
          </span>
          <button
            type="submit"
            className="touch-active px-6 py-2.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>

      </form>

      {/* Data Backup & Restore Section */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Veri Yönetimi & Cihaz Yedekleme
        </h4>

        {importStatus && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          {/* JSON Export */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="touch-active p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Yedek Al (JSON)</span>
          </button>

          {/* JSON Import File Input */}
          <label className="touch-active p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Yedek Yükle</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset Demo Records */}
          <button
            type="button"
            onClick={handleResetDemo}
            className="touch-active p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Örnek Veri</span>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={handleClear}
            className="touch-active p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Verileri Sıfırla</span>
          </button>

        </div>
      </div>

    </section>
  );
}
