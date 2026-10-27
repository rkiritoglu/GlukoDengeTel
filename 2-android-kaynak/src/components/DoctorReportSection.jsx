import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Send, 
  PhoneCall, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { calculateStats, formatDisplayValue } from '../utils/calculations';
import { generateWhatsAppShareUrl, exportToCSV } from '../utils/storage';
import { DIABETES_TYPES, triggerHaptic } from '../constants';

export default function DoctorReportSection({ 
  records, 
  profile, 
  onOpenDetailedReport 
}) {
  const [selectedDays, setSelectedDays] = useState(14);
  const unit = profile?.unit || 'mg/dL';
  const stats = calculateStats(records, profile.targets, selectedDays);
  const diabetesLabel = DIABETES_TYPES.find(d => d.id === profile.diabetesType)?.label || 'Tip 2 Diyabet';

  const handleShareWhatsApp = () => {
    triggerHaptic(20);
    const url = generateWhatsAppShareUrl(records, profile, selectedDays);
    window.open(url, '_blank');
  };

  const handleDownloadCSV = () => {
    triggerHaptic(15);
    exportToCSV(records, profile.targets, unit);
  };

  const handleCallDoctor = () => {
    triggerHaptic(20);
    const tel = profile.doctorPhone || profile.emergencyContact || '112';
    window.location.href = `tel:${tel}`;
  };

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
                Doktor & Hekim Raporu
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> ADA Standart
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Muayene ve konsültasyon için klinik glisemik özet ve paylaşım araçları
            </p>
          </div>
        </div>

        {/* Days Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { triggerHaptic(10); setSelectedDays(d); }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedDays === d
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d} Gün
            </button>
          ))}
        </div>
      </div>

      {/* Patient & Doctor Banner */}
      <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
            {profile.name ? profile.name.charAt(0) : 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">{profile.name || 'Hasta Profili'}</span>
              <span className="text-[11px] text-teal-800 bg-teal-100/70 px-2 py-0.2 rounded font-semibold">{diabetesLabel}</span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5">
              Doktor: <strong className="text-slate-700">{profile.doctorName || 'Kayıtlı Değil'}</strong>
              {profile.doctorPhone ? ` • ${profile.doctorPhone}` : ''}
            </span>
          </div>
        </div>

        {profile.doctorPhone && (
          <button
            type="button"
            onClick={handleCallDoctor}
            className="touch-active px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Doktoru Ara</span>
          </button>
        )}
      </div>

      {/* 4 Clinical Indicators Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* Average Glucose */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-3.5 rounded-2xl border border-teal-200/70">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Ortalama Şeker</span>
          <div className="text-2xl font-black font-mono text-teal-950 mt-1">
            {stats.average > 0 ? formatDisplayValue(stats.average, unit) : '--'}
            <span className="text-xs font-semibold text-teal-700 ml-1">{unit}</span>
          </div>
          <span className="text-[10px] text-teal-600 block mt-1 font-medium">Hedef: 80-130 {unit}</span>
        </div>

        {/* Estimated HbA1c */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5 rounded-2xl border border-emerald-200/70">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Tahmini HbA1c</span>
          <div className="text-2xl font-black font-mono text-emerald-950 mt-1">
            {stats.estimatedA1c > 0 ? `%${stats.estimatedA1c}` : '--'}
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1 font-medium">Hedef: &lt; %7.0 (ADA)</span>
        </div>

        {/* Time In Range (TIR) */}
        <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 p-3.5 rounded-2xl border border-sky-200/70">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Hedefte Kalma (TIR)</span>
          <div className="text-2xl font-black font-mono text-sky-950 mt-1">
            %{stats.tir.inRange}
          </div>
          <span className="text-[10px] text-sky-600 block mt-1 font-medium">Hedef: &gt; %70 aralıkta</span>
        </div>

        {/* Hypo & Hyper Incidents */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 p-3.5 rounded-2xl border border-rose-200/70">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Hipo / Hiper Olayı</span>
          <div className="text-lg font-black font-mono text-rose-950 mt-1.5 flex items-center gap-1.5">
            <span className="text-rose-600">{stats.tir.low}%</span>
            <span className="text-slate-400 font-normal text-xs">/</span>
            <span className="text-amber-600">{stats.tir.high}%</span>
          </div>
          <span className="text-[10px] text-rose-600 block mt-1 font-medium">Düşük &lt; %4 olmalı</span>
        </div>

      </div>

      {/* Action Buttons: WhatsApp + PDF/Print + Detailed Modal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        
        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="touch-active py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
        >
          <span className="text-base">💬</span>
          <span>WhatsApp ile Doktora Gönder</span>
        </button>

        {/* Open Detailed Printable Modal */}
        <button
          type="button"
          onClick={() => { triggerHaptic(15); onOpenDetailedReport(); }}
          className="touch-active py-3 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Klinik Raporu Yazdır / PDF</span>
        </button>

        {/* Excel / CSV Export */}
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="touch-active py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Excel (CSV) Raporu İndir</span>
        </button>

      </div>

    </section>
  );
}
