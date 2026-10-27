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
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Clock, 
  Info,
  ChevronRight
} from 'lucide-react';
import { MEAL_TIMINGS } from '../constants';
import { formatDateTr, formatTimeTr, classifyGlucose } from '../utils/calculations';

// Register Chart.js plugins
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

export default function ChartsView({ records, targets, profile }) {
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' | 'meal_averages' | 'tir_donut' | 'hourly'
  const unit = profile.unit || 'mg/dL';

  const glucoseRecords = records.filter(
    (r) => r.glucose !== null && r.glucose !== undefined && r.glucose !== '' && Number(r.glucose) > 0
  );

  if (!records || records.length === 0 || glucoseRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center text-slate-400 mb-8">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="text-base font-semibold text-slate-700">Grafik için henüz kan şekeri ölçümü yok</h3>
        <p className="text-xs text-slate-400 mt-1">Grafikleri görüntülemek için kan şekeri ölçümü ekleyin veya örnek verileri yükleyin.</p>
      </div>
    );
  }

  // 1. Prepare chronological records for Trend Chart (oldest to newest)
  const sortedRecords = [...glucoseRecords].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Limit to last 35 measurements for readability in line chart
  const recentTrendRecords = sortedRecords.slice(-35);

  const trendLabels = recentTrendRecords.map((r) => {
    return `${formatDateTr(r.timestamp).slice(0, 6)} ${formatTimeTr(r.timestamp)}`;
  });

  const trendValues = recentTrendRecords.map((r) => {
    return unit === 'mmol/L' ? Number((r.glucose / 18.018).toFixed(1)) : r.glucose;
  });

  const pointBackgroundColors = recentTrendRecords.map((r) => {
    const c = classifyGlucose(r.glucose, r.timing, targets);
    return c.dotColor;
  });

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: `Kan Şekeri (${unit})`,
        data: trendValues,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      // Target range lower band guide
      {
        label: `Hedef Alt Sınır (${unit === 'mmol/L' ? (70 / 18.018).toFixed(1) : 70})`,
        data: trendValues.map(() => (unit === 'mmol/L' ? Number((70 / 18.018).toFixed(1)) : 70)),
        borderColor: 'rgba(239, 68, 68, 0.4)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      // Target range upper band guide
      {
        label: `Hedef Üst Sınır (${unit === 'mmol/L' ? (180 / 18.018).toFixed(1) : 180})`,
        data: trendValues.map(() => (unit === 'mmol/L' ? Number((180 / 18.018).toFixed(1)) : 180)),
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 11, family: 'system-ui' },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          afterBody: (context) => {
            const index = context[0].dataIndex;
            const r = recentTrendRecords[index];
            const lines = [];
            const timing = MEAL_TIMINGS.find((t) => t.id === r.timing)?.label || r.timing;
            lines.push(`Ölçüm Zamanı: ${timing}`);
            if (r.mealNote) lines.push(`Besin: ${r.mealNote}`);
            if (r.carbs) lines.push(`Karbonhidrat: ${r.carbs}g`);
            if (r.insulinBolus) lines.push(`Bolus İnsülin: ${r.insulinBolus}U`);
            if (r.medication) lines.push(`İlaç: ${r.medication}`);
            return lines;
          },
        },
      },
    },
    scales: {
      y: {
        min: unit === 'mmol/L' ? 2 : 40,
        max: unit === 'mmol/L' ? 18 : 300,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } },
      },
    },
  };

  // 2. Prepare Meal Timing Averages Bar Chart
  const mealGroups = {};
  MEAL_TIMINGS.forEach((t) => {
    mealGroups[t.id] = { label: t.label, total: 0, count: 0 };
  });

  glucoseRecords.forEach((r) => {
    if (mealGroups[r.timing]) {
      mealGroups[r.timing].total += Number(r.glucose);
      mealGroups[r.timing].count += 1;
    }
  });

  const activeMealTimings = MEAL_TIMINGS.filter((t) => mealGroups[t.id].count > 0);
  const barLabels = activeMealTimings.map((t) => t.label);
  const barValues = activeMealTimings.map((t) => {
    const avg = mealGroups[t.id].total / mealGroups[t.id].count;
    return unit === 'mmol/L' ? Number((avg / 18.018).toFixed(1)) : Math.round(avg);
  });

  const barColors = activeMealTimings.map((t) => {
    const avg = mealGroups[t.id].total / mealGroups[t.id].count;
    const c = classifyGlucose(avg, t.id, targets);
    return c.dotColor;
  });

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: `Ortalama Kan Şekeri (${unit})`,
        data: barValues,
        backgroundColor: barColors,
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        callbacks: {
          afterLabel: (ctx) => {
            const t = activeMealTimings[ctx.dataIndex];
            return `Toplam Ölçüm Sayısı: ${mealGroups[t.id].count}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: unit === 'mmol/L' ? 3 : 50,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
    },
  };

  // 3. Prepare TIR Donut Chart
  let tirLow = 0;
  let tirNormal = 0;
  let tirHigh = 0;
  glucoseRecords.forEach((r) => {
    const g = Number(r.glucose);
    if (g < (targets?.hypo || 70)) tirLow++;
    else if (g > (targets?.postMealMax || 180)) tirHigh++;
    else tirNormal++;
  });

  const donutData = {
    labels: ['Hedefte (70 - 180)', 'Düşük (< 70)', 'Yüksek (> 180)'],
    datasets: [
      {
        data: [tirNormal, tirLow, tirHigh],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 14, font: { size: 11, family: 'system-ui' } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.parsed;
            const pct = Math.round((count / glucoseRecords.length) * 100);
            return ` ${context.label}: ${count} ölçüm (%${pct})`;
          },
        },
      },
    },
  };

  // 4. Hourly Profile (Scatter line across 24h)
  const hourlyBuckets = Array(24).fill(0).map(() => ({ total: 0, count: 0 }));
  glucoseRecords.forEach((r) => {
    const hour = new Date(r.timestamp).getHours();
    hourlyBuckets[hour].total += Number(r.glucose);
    hourlyBuckets[hour].count += 1;
  });

  const hourlyLabels = hourlyBuckets.map((_, i) => `${String(i).padStart(2, '0')}:00`);
  const hourlyValues = hourlyBuckets.map((b) => {
    if (b.count === 0) return null;
    const avg = b.total / b.count;
    return unit === 'mmol/L' ? Number((avg / 18.018).toFixed(1)) : Math.round(avg);
  });

  const hourlyData = {
    labels: hourlyLabels,
    datasets: [
      {
        label: `Günün Saatlerine Göre Ortalama (${unit})`,
        data: hourlyValues,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        spanGaps: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        fill: true,
      },
    ],
  };

  const hourlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const h = ctx.dataIndex;
            const b = hourlyBuckets[h];
            return `Ortalama: ${ctx.parsed.y} ${unit} (${b.count} ölçüm)`;
          },
        },
      },
    },
    scales: {
      y: {
        min: unit === 'mmol/L' ? 3 : 50,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-8">
      {/* Chart Nav Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0">Görsel Analiz & Grafikler</h3>
            <p className="text-xs text-slate-500">Kişiselleştirilmiş glisemik eğilimler</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'trend' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Zaman Eğilimi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meal_averages')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'meal_averages' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Öğün Ortalamaları
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tir_donut')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'tir_donut' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Hedefte Kalma (TIR)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'hourly' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            24 Saat Dağılımı
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="mt-5 h-72 sm:h-80 w-full relative">
        {activeTab === 'trend' && <Line data={trendData} options={trendOptions} />}
        {activeTab === 'meal_averages' && <Bar data={barData} options={barOptions} />}
        {activeTab === 'tir_donut' && (
          <div className="h-full flex items-center justify-center relative">
            <Doughnut data={donutData} options={donutOptions} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-7 pointer-events-none text-center">
              <span className="text-2xl font-black text-slate-800 font-mono">
                %{Math.round((tirNormal / glucoseRecords.length) * 100)}
              </span>
              <span className="block text-[11px] font-semibold text-slate-400">Hedefte</span>
            </div>
          </div>
        )}
        {activeTab === 'hourly' && <Line data={hourlyData} options={hourlyOptions} />}
      </div>

      {/* Chart Explanatory Footer Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          {activeTab === 'trend' && (
            <span>Yeşil noktalar hedef aralığı, sarı/kırmızı noktalar sınır dışı ölçümleri gösterir.</span>
          )}
          {activeTab === 'meal_averages' && (
            <span>Hangi öğün sonrasında şekerin yükseldiğini belirleyerek karbonhidrat veya insülin dozu ayarlanabilir.</span>
          )}
          {activeTab === 'tir_donut' && (
            <span>Uluslararası klinik rehberler zamanın en az %70'inin hedef aralıkta (70-180 mg/dL) geçirilmesini önerir.</span>
          )}
          {activeTab === 'hourly' && (
            <span>Sabah erken saatlerdeki yükselişler şafak fenomenini (Dawn effect) tespit etmenize yardımcı olur.</span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">Son {recentTrendRecords.length} ölçüm baz alınmıştır</span>
      </div>
    </div>
  );
}
