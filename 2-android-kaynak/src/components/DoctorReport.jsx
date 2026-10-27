import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  User, 
  Calendar, 
  Activity, 
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { DIABETES_TYPES, MEAL_TIMINGS } from '../constants';
import { calculateStats, formatDateTr, formatDisplayValue, classifyGlucose } from '../utils/calculations';
import { generateWhatsAppShareUrl } from '../utils/storage';

export default function DoctorReport({ isOpen, onClose, records, profile }) {
  const [reportDays, setReportDays] = useState(14); // 7, 14, 30 days
  const unit = profile?.unit || 'mg/dL';

  if (!isOpen) return null;

  const stats = calculateStats(records, profile.targets, reportDays);
  const diabetesLabel = DIABETES_TYPES.find(d => d.id === profile.diabetesType)?.label || profile.diabetesType;

  // Filter records within chosen days
  let filteredRecords = records;
  if (reportDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - reportDays);
    filteredRecords = records.filter(r => new Date(r.timestamp) >= cutoff);
  }

  // Group records by calendar day
  const daysMap = {};
  filteredRecords.forEach((r) => {
    const dayKey = formatDateTr(r.timestamp);
    if (!daysMap[dayKey]) {
      daysMap[dayKey] = {
        dateStr: dayKey,
        rawDate: new Date(r.timestamp),
        readings: {},
        meds: [],
        notes: [],
      };
    }
    // store reading by timing category
    daysMap[dayKey].readings[r.timing] = r;
    if (r.medication || r.insulinBolus || r.insulinBasal) {
      const medParts = [];
      if (r.medicationTime) medParts.push(`[${r.medicationTime}]`);
      if (r.insulinBolus) medParts.push(`Bolus: ${r.insulinBolus}U`);
      if (r.insulinBasal) medParts.push(`Bazal: ${r.insulinBasal}U`);
      if (r.medication) medParts.push(r.medication);
      daysMap[dayKey].meds.push(medParts.join(' '));
    }
    if (r.notes) daysMap[dayKey].notes.push(r.notes);
  });

  const sortedDays = Object.values(daysMap).sort((a, b) => b.rawDate - a.rawDate);

  const handlePrint = () => {
    window.print();
  };

  const renderCell = (day, timingId) => {
    const r = day.readings[timingId];
    if (!r || !r.glucose || Number(r.glucose) <= 0) return <span className="text-slate-300">-</span>;
    const c = classifyGlucose(r.glucose, r.timing, profile.targets);
    if (!c) return <span className="text-slate-300">-</span>;
    const val = formatDisplayValue(r.glucose, unit);
    return (
      <span className={`inline-block font-mono font-bold text-xs ${c.textClass}`}>
        {val}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold tracking-wide">Hekim & Klinik Glukoz Raporu</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Days Filter */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setReportDays(d)}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition ${
                    reportDays === d ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Son {d} Gün
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const url = generateWhatsAppShareUrl(records, profile, reportDays);
                window.open(url, '_blank');
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
              title="Hekime WhatsApp ile Gönder"
            >
              <span>💬 WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 print:p-0 print:m-0">
          
          {/* Medical Header */}
          <div className="border-b-2 border-teal-600 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 m-0 tracking-tight">
                  GLUKODENGE KLİNİK RAPORU
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ayaktan Kan Şekeri Profili & Glisemik Değişkenlik Özeti
                </p>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-500">
                <div>Rapor Tarihi: <strong className="text-slate-800">{formatDateTr(new Date().toISOString())}</strong></div>
                <div>Rapor Kapsamı: <strong className="text-teal-700">Son {reportDays} Gün</strong></div>
              </div>
            </div>

            {/* Patient & Doctor Card */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Hasta Adı</span>
                <span className="font-bold text-slate-900">{profile.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tanı / Tip</span>
                <span className="font-semibold text-slate-800">{diabetesLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Takip Eden Doktor</span>
                <span className="font-semibold text-slate-800">{profile.doctorName || 'Belirtilmedi'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Acil İletişim</span>
                <span className="font-semibold text-slate-800">{profile.emergencyContact || 'Belirtilmedi'}</span>
              </div>
            </div>
          </div>

          {/* Key Clinical Indicators (ADA Standards) */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Klinik Glisemik İndeksler (ADA Standardı)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="text-[11px] text-teal-800 font-semibold block">Ortalama Glikoz</span>
                <div className="text-2xl font-black font-mono text-teal-900 mt-1">
                  {stats.average > 0 ? formatDisplayValue(stats.average, unit) : '--'}
                  <span className="text-xs font-normal text-teal-700 ml-1">{unit}</span>
                </div>
                <span className="text-[10px] text-teal-600">Hedef: 80 - 130 {unit}</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">Tahmini HbA1c</span>
                <div className="text-2xl font-black font-mono text-emerald-900 mt-1">
                  {stats.estimatedA1c > 0 ? `%${stats.estimatedA1c}` : '--'}
                </div>
                <span className="text-[10px] text-emerald-700">Klinik Hedef: &lt; %7.0</span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-800 font-semibold block">Hedefte Kalma (TIR)</span>
                <div className="text-2xl font-black font-mono text-blue-900 mt-1">
                  %{stats.tir.inRange}
                </div>
                <span className="text-[10px] text-blue-700">Hedef: &ge; %70 (70-180 mg/dL)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 font-semibold block">Değişkenlik (CV %)</span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  %{stats.cv}
                </div>
                <span className="text-[10px] text-slate-500">Hedef: &le; %36 (Stabilite)</span>
              </div>

            </div>
          </div>

          {/* Daily Table Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Günlük Ölçüm Çizelgesi
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3 text-left">Tarih</th>
                    <th className="py-2.5 px-2">Sabah Aç</th>
                    <th className="py-2.5 px-2">Kahv. Tok</th>
                    <th className="py-2.5 px-2">Öğle Aç</th>
                    <th className="py-2.5 px-2">Öğle Tok</th>
                    <th className="py-2.5 px-2">Akşam Aç</th>
                    <th className="py-2.5 px-2">Akşam Tok</th>
                    <th className="py-2.5 px-2">Yatış</th>
                    <th className="py-2.5 px-3 text-left">İlaç & İnsülin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedDays.map((day) => (
                    <tr key={day.dateStr} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-left font-semibold text-slate-900 whitespace-nowrap">
                        {day.dateStr}
                      </td>
                      <td className="py-2 px-2">{renderCell(day, 'fasting')}</td>
                      <td className="py-2 px-2">{renderCell(day, 'breakfast_post')}</td>
                      <td className="py-2 px-2">{renderCell(day, 'lunch_pre')}</td>
                      <td className="py-2 px-2">{renderCell(day, 'lunch_post')}</td>
                      <td className="py-2 px-2">{renderCell(day, 'dinner_pre')}</td>
                      <td className="py-2 px-2">{renderCell(day, 'dinner_post')}</td>
                      <td className="py-2 px-2">{renderCell(day, 'bedtime')}</td>
                      <td className="py-2 px-3 text-left text-[11px] text-slate-500 max-w-xs truncate">
                        {day.meds.length > 0 ? Array.from(new Set(day.meds)).join(' | ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Notes & Signature Section */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Hekim Değerlendirmesi & Tedavi Notları
            </h4>
            <div className="border border-slate-300 rounded-xl p-4 min-h-[90px] bg-slate-50/30 text-xs text-slate-400">
              Doz ayarlamaları, beslenme önerileri veya laboratuvar istekleri...
            </div>

            <div className="mt-6 flex justify-between items-end text-xs text-slate-500 pt-2">
              <div>
                Rapor Yazılımı: <span className="font-semibold text-slate-700">GlukoDenge Sağlık Takip Sistemi</span>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <span>Hekim Kaşe / İmza</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
