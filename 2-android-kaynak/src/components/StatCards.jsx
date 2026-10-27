import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  PieChart, 
  Award, 
  HelpCircle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatDisplayValue } from '../utils/calculations';

export default function StatCards({ stats, daysFilter, onDaysFilterChange, profile }) {
  const { average, estimatedA1c, tir, cv, sd, min, max, count } = stats;
  const unit = profile.unit || 'mg/dL';

  // Format display numbers
  const avgDisplay = average > 0 ? formatDisplayValue(average, unit) : '--';
  const minDisplay = min > 0 ? formatDisplayValue(min, unit) : '--';
  const maxDisplay = max > 0 ? formatDisplayValue(max, unit) : '--';

  // Clinical evaluation helpers
  const isA1cGood = estimatedA1c > 0 && estimatedA1c <= 7.0;
  const isTirGood = tir.inRange >= 70;
  const isCvGood = cv > 0 && cv <= 36;

  const timeRanges = [
    { label: 'Son 7 Gün', value: 7 },
    { label: 'Son 14 Gün', value: 14 },
    { label: 'Son 30 Gün', value: 30 },
    { label: 'Son 90 Gün', value: 90 },
    { label: 'Tüm Kayıtlar', value: 0 },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Header row with Title & Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 m-0">Klinik Göstergeler & İstatistikler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {count > 0 ? `Toplam ${count} ölçüm analiz edildi` : 'Henüz ölçüm kaydedilmedi'}
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs self-start sm:self-auto overflow-x-auto">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => onDaysFilterChange(range.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                daysFilter === range.value
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ortalama Kan Şekeri */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ortalama Şeker</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">{avgDisplay}</span>
            <span className="text-xs font-medium text-slate-400">{unit}</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>En Düşük: <strong className="text-slate-700">{minDisplay}</strong></span>
            <span>En Yüksek: <strong className="text-slate-700">{maxDisplay}</strong></span>
          </div>
        </div>

        {/* Card 2: Tahmini HbA1c */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tahmini HbA1c</span>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isA1cGood ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {estimatedA1c > 0 ? `%${estimatedA1c}` : '--'}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isA1cGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isA1cGood ? 'Hedefte (≤ %7.0)' : 'Hedef Üstü'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Klinik Hedef: <strong className="text-slate-700">&lt; %7.0</strong></span>
            <span className="text-[11px] text-slate-400">ADA eA1c Formülü</span>
          </div>
        </div>

        {/* Card 3: Time in Range (TIR) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hedefte Kalma (TIR)</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isTirGood ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              %{tir.inRange}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isTirGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isTirGood ? 'Başarılı (≥ %70)' : 'Geliştirilmeli'}
            </span>
          </div>

          {/* Micro Bar */}
          <div className="mt-3 pt-2">
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
              <div style={{ width: `${tir.low}%` }} className="bg-red-500" title={`Düşük: %${tir.low}`} />
              <div style={{ width: `${tir.inRange}%` }} className="bg-emerald-500" title={`Hedefte: %${tir.inRange}`} />
              <div style={{ width: `${tir.high}%` }} className="bg-amber-500" title={`Yüksek: %${tir.high}`} />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
              <span className="text-red-600 font-medium">% {tir.low} Düşük</span>
              <span className="text-emerald-700 font-bold">% {tir.inRange} Hedef</span>
              <span className="text-amber-600 font-medium">% {tir.high} Yüksek</span>
            </div>
          </div>
        </div>

        {/* Card 4: Değişkenlik Katsayısı (CV) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Glisemik Değişkenlik</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCvGood ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              %{cv}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isCvGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isCvGood ? 'Stabil (≤ %36)' : 'Yüksek Dalgalanma'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Standart Sapma: <strong className="text-slate-700">±{sd} {unit}</strong></span>
            <span className="text-[11px] text-slate-400">Hedef: ≤ %36</span>
          </div>
        </div>

      </div>
    </div>
  );
}
