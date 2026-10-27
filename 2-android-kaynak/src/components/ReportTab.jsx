import React, { useState } from 'react';
import { 
  FileText, 
  Share2, 
  Download, 
  Printer, 
  MessageCircle, 
  Calendar, 
  UserCheck,
  CheckCircle,
  Database
} from 'lucide-react';
import { calculateStats, formatDateTr } from '../utils/calculations';
import { 
  exportToCSV, 
  exportToJSON, 
  generateWhatsAppShareUrl 
} from '../utils/storage';
import { triggerHaptic } from '../constants';

export default function ReportTab({ records, profile, reminders }) {
  const [reportDays, setReportDays] = useState(14);
  const stats = calculateStats(records, profile.targets, reportDays);

  const handleWhatsApp = () => {
    triggerHaptic(25);
    const url = generateWhatsAppShareUrl(records, profile, reportDays);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    triggerHaptic(15);
    window.print();
  };

  const handleDownloadCSV = () => {
    triggerHaptic(20);
    exportToCSV(records, profile.targets, profile.unit);
  };

  const handleDownloadBackup = () => {
    triggerHaptic(20);
    exportToJSON(records, profile, reminders);
  };

  return (
    <div className="space-y-3">
      
      {/* WhatsApp Share Card (Mobile Highlight) */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black">Hekime WhatsApp ile Gönder</h3>
            <p className="text-[11px] text-emerald-100">
              Son {reportDays} günün ortalama, eA1c ve son ölçümlerini tek tıkla mesaj atın.
            </p>
          </div>
        </div>

        <button
          onClick={handleWhatsApp}
          className="touch-active w-full py-3 bg-white text-emerald-800 font-extrabold text-xs rounded-2xl shadow flex items-center justify-center space-x-2"
        >
          <Share2 className="w-4 h-4 text-emerald-700" />
          <span>WhatsApp'ta Paylaş</span>
        </button>
      </div>

      {/* Days Period Selector */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Rapor Dönemi:</span>
        </span>

        <div className="flex items-center space-x-1">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => {
                triggerHaptic(15);
                setReportDays(d);
              }}
              className={`touch-active px-2.5 py-1 rounded-xl text-xs font-bold ${
                reportDays === d
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {d}g
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Summary Preview Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800">{profile.name}</h4>
            <p className="text-[11px] text-slate-400">
              Doktor: {profile.doctorName || 'Belirtilmedi'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            ADA Uyumlu
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 text-[10px] block font-semibold">Ortalama Şeker</span>
            <span className="text-base font-extrabold text-slate-800">
              {stats.average} {profile.unit}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 text-[10px] block font-semibold">Tahmini HbA1c</span>
            <span className="text-base font-extrabold text-teal-600">
              %{stats.estimatedA1c}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 text-[10px] block font-semibold">Hedefte Kalma (TIR)</span>
            <span className="text-base font-extrabold text-emerald-600">
              %{stats.tir.inRange}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 text-[10px] block font-semibold">Toplam Ölçüm</span>
            <span className="text-base font-extrabold text-slate-800">
              {stats.count} Adet
            </span>
          </div>
        </div>

        {/* TIR Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-rose-600">Düşük: %{stats.tir.low}</span>
            <span className="text-emerald-600">Hedefte: %{stats.tir.inRange}</span>
            <span className="text-amber-600">Yüksek: %{stats.tir.high}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${stats.tir.low}%` }} className="bg-rose-500 h-full" />
            <div style={{ width: `${stats.tir.inRange}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${stats.tir.high}%` }} className="bg-amber-500 h-full" />
          </div>
        </div>
      </div>

      {/* Export & Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handlePrint}
          className="touch-active w-full py-3 bg-white text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center space-x-2"
        >
          <Printer className="w-4 h-4 text-teal-600" />
          <span>Hekim Raporu Yazdır / PDF</span>
        </button>

        <button
          onClick={handleDownloadCSV}
          className="touch-active w-full py-3 bg-white text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Excel / CSV Tablosu İndir</span>
        </button>

        <button
          onClick={handleDownloadBackup}
          className="touch-active w-full py-3 bg-white text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center space-x-2"
        >
          <Database className="w-4 h-4 text-teal-600" />
          <span>Tüm Verileri Yedekle (JSON)</span>
        </button>
      </div>

    </div>
  );
}
