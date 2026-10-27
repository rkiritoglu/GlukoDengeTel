import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { calculateStats, formatDateTr, formatTimeTr } from '../utils/calculations';
import { MEAL_TIMINGS, triggerHaptic } from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartsTab({ records, profile }) {
  const [daysFilter, setDaysFilter] = useState(14);
  const [chartType, setChartType] = useState('trend'); // 'trend' | 'tir' | 'slots'

  const stats = calculateStats(records, profile.targets, daysFilter);

  // Filter records by days and only keep records that have actual blood sugar readings
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysFilter);
  const filteredRecords = records
    .filter((r) => new Date(r.timestamp) >= cutoff && r.glucose !== null && r.glucose !== undefined && Number(r.glucose) > 0)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // 1. Trend Line Chart Data
  const trendLabels = filteredRecords.map((r) => `${formatDateTr(r.timestamp).slice(0, 6)} ${formatTimeTr(r.timestamp)}`);
  const trendValues = filteredRecords.map((r) => r.glucose);
  const pointColors = filteredRecords.map((r) => {
    if (r.glucose < (profile.targets?.hypo || 70)) return '#f43f5e';
    if (r.glucose > (profile.targets?.postMealMax || 180)) return '#f59e0b';
    return '#10b981';
  });

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: `Kan Şekeri (${profile.unit})`,
        data: trendValues,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        pointHoverRadius: 6,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 11 },
        bodyFont: { size: 12, weight: 'bold' },
        padding: 8,
        cornerRadius: 10,
      },
    },
    scales: {
      y: {
        suggestedMin: 50,
        suggestedMax: 250,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 6, font: { size: 9 }, color: '#94a3b8' },
      },
    },
  };

  // 2. TIR Doughnut Data
  const tirData = {
    labels: ['Hedefte (70-180)', 'Yüksek (>180)', 'Düşük (<70)'],
    datasets: [
      {
        data: [stats.tir.inRange, stats.tir.high, stats.tir.low],
        backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const tirOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11, weight: '600' }, boxWidth: 12, padding: 12 },
      },
    },
  };

  // 3. Meal Slot Averages Data
  const slotGroups = {};
  filteredRecords.forEach((r) => {
    if (!slotGroups[r.timing]) slotGroups[r.timing] = [];
    slotGroups[r.timing].push(Number(r.glucose));
  });

  const slotLabels = [];
  const slotAverages = [];
  const slotColors = [];

  MEAL_TIMINGS.slice(0, 7).forEach((t) => {
    if (slotGroups[t.id] && slotGroups[t.id].length > 0) {
      slotLabels.push(t.short || t.label);
      const avg = Math.round(slotGroups[t.id].reduce((a, b) => a + b, 0) / slotGroups[t.id].length);
      slotAverages.push(avg);
      slotColors.push(avg > 180 ? '#f59e0b' : avg < 70 ? '#f43f5e' : '#0d9488');
    }
  });

  const slotBarData = {
    labels: slotLabels,
    datasets: [
      {
        label: 'Ortalama (mg/dL)',
        data: slotAverages,
        backgroundColor: slotColors,
        borderRadius: 8,
      },
    ],
  };

  const slotBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { suggestedMin: 60, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
    },
  };

  return (
    <div className="space-y-3">

      {/* Days Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        {[
          { days: 7, label: 'Son 7 Gün' },
          { days: 14, label: 'Son 14 Gün' },
          { days: 30, label: 'Son 30 Gün' },
          { days: 90, label: 'Son 90 Gün' },
        ].map((item) => (
          <button
            key={item.days}
            onClick={() => {
              triggerHaptic(15);
              setDaysFilter(item.days);
            }}
            className={`touch-active px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              daysFilter === item.days
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Stats Summary Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 grid grid-cols-2 gap-3 text-center">
        <div className="p-2 bg-slate-50 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 block">Ortalama Şeker</span>
          <span className="text-2xl font-black text-slate-800 tracking-tight">
            {stats.average || '-'}
          </span>
          <span className="text-[10px] text-slate-400 block">{profile.unit}</span>
        </div>

        <div className="p-2 bg-slate-50 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 block">Tahmini HbA1c</span>
          <span className="text-2xl font-black text-teal-600 tracking-tight">
            %{stats.estimatedA1c || '-'}
          </span>
          <span className="text-[10px] text-slate-400 block">Glukoz Yönetim Göstergesi</span>
        </div>
      </div>

      {/* Chart View Switcher Tabs */}
      <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center space-x-1">
        {[
          { id: 'trend', label: '📈 Trend Eğrisi' },
          { id: 'tir', label: '🎯 Hedefte Kalma (TIR)' },
          { id: 'slots', label: '🍽️ Öğün Ortalamaları' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic(15);
              setChartType(tab.id);
            }}
            className={`touch-active flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              chartType === tab.id
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Canvas Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 min-h-[290px] flex flex-col justify-center">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs font-bold text-slate-500">Bu aralıkta kan şekeri ölçümü bulunamadı</p>
          </div>
        ) : chartType === 'trend' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700">Zaman İçinde Şeker Değişimi</h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Hedef: 70 - 180 mg/dL
              </span>
            </div>
            <div className="h-60 w-full">
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>
        ) : chartType === 'tir' ? (
          <div>
            <h3 className="text-xs font-bold text-slate-700 text-center mb-2">
              TIR Dağılımı (ADA Standartları)
            </h3>
            <div className="h-56 w-full relative flex items-center justify-center">
              <Doughnut data={tirData} options={tirOptions} />
              <div className="absolute top-[40%] text-center pointer-events-none">
                <span className="text-2xl font-black text-emerald-600 block leading-tight">
                  %{stats.tir.inRange}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Hedefte
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Öğün Bazlı Ortalama Şeker</h3>
            <div className="h-60 w-full">
              <Bar data={slotBarData} options={slotBarOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Glycemic Variability Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-700 block">Glisemik Değişkenlik (CV)</span>
          <span className="text-[11px] text-slate-500">Hedef: %36 altı (Kararlı)</span>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black ${stats.cv <= 36 ? 'text-emerald-600' : 'text-amber-600'}`}>
            %{stats.cv}
          </span>
          <span className="text-[10px] text-slate-400 block">SD: ±{stats.sd}</span>
        </div>
      </div>

    </div>
  );
}
