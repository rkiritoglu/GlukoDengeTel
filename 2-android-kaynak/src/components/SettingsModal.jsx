import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Target, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { DIABETES_TYPES } from '../constants';
import { exportToJSON } from '../utils/storage';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  profile, 
  onSaveProfile, 
  records, 
  reminders, 
  onImportData, 
  onClearAll 
}) {
  const [formData, setFormData] = useState({ ...profile });
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      targets: {
        ...prev.targets,
        [field]: Number(value),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleExport = () => {
    exportToJSON(records, formData, reminders);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.records) {
          onImportData(parsed);
          setImportStatus('Yedek başarıyla yüklendi!');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          alert('Geçersiz yedek dosyası formatı.');
        }
      } catch (err) {
        alert('Dosya okunurken hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0">Profil & Hedef Ayarları</h3>
              <p className="text-xs text-teal-100/90 mt-0.5">Kişisel hedeflerinizi ve bilgilerinizi özelleştirin</p>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* Patient Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" /> Hasta & Hekim Bilgileri
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Diyabet Tipi</label>
                <select
                  value={formData.diabetesType}
                  onChange={(e) => handleChange('diabetesType', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500"
                >
                  {DIABETES_TYPES.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Takip Eden Doktor</label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => handleChange('doctorName', e.target.value)}
                  placeholder="Dr. Adı Soyadı"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Acil Durum Telefonu</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Target Thresholds (ADA Standard) */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-600" /> Hedef Glukoz Aralıkları (mg/dL)
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Klinik rehberler ve hekiminizin önerdiği sınırları belirleyin.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Hipoglisemi Eşiği</label>
                <input
                  type="number"
                  value={formData.targets.hypo}
                  onChange={(e) => handleTargetChange('hypo', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <span className="text-[10px] text-slate-400">Standart: 70 mg/dL</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Açlık Hedef Üst</label>
                <input
                  type="number"
                  value={formData.targets.fastingMax}
                  onChange={(e) => handleTargetChange('fastingMax', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <span className="text-[10px] text-slate-400">Standart: 130 mg/dL</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tokluk Hedef Üst</label>
                <input
                  type="number"
                  value={formData.targets.postMealMax}
                  onChange={(e) => handleTargetChange('postMealMax', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <span className="text-[10px] text-slate-400">Standart: 180 mg/dL</span>
              </div>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Veri Yedekleme & Geri Yükleme
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Yedek İndir (.json)
              </button>

              <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Yedekten Geri Yükle
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>

              {importStatus && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {importStatus}
                </span>
              )}
            </div>
          </div>

          {/* Danger Zone: Clear Data */}
          <div className="pt-4 border-t border-red-100 bg-red-50/50 p-3.5 rounded-2xl border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-800 block">Tüm Kayıtları Sıfırla</span>
                <span className="text-[11px] text-red-600/80">Tüm ölçümlerinizi cihazdan kalıcı olarak siler.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Tüm kayıtlarınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
                    onClearAll();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
              >
                Tümünü Sil
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 cursor-pointer transition"
            >
              Ayarları Kaydet
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
