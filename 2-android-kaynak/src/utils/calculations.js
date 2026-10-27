import { MEAL_TIMINGS } from '../constants';

export const classifyGlucose = (val, timingId, targets) => {
  if (val === null || val === undefined || val === '' || isNaN(Number(val)) || Number(val) <= 0) {
    return null;
  }

  const timing = MEAL_TIMINGS.find((t) => t.id === timingId);
  const isFasting = timing ? timing.isFasting : false;

  const t = targets || {
    hypoCritical: 54,
    hypo: 70,
    fastingMin: 80,
    fastingMax: 130,
    postMealMax: 180,
    hyperCritical: 250,
  };

  const num = Number(val);

  if (num < t.hypoCritical) {
    return {
      status: 'critical-low',
      label: 'Kritik Düşük',
      badgeClass: 'bg-red-600 text-white',
      borderClass: 'border-red-500',
      bgLight: 'bg-red-50 text-red-700',
      textClass: 'text-red-700 font-bold',
      dotColor: '#dc2626',
      advice: 'Acil! 15g hızlı şeker alın (3-4 kesme şeker veya meyve suyu). 15 dk sonra tekrar ölçün.',
    };
  }

  if (num < t.hypo) {
    return {
      status: 'low',
      label: 'Düşük (Hipoglisemi)',
      badgeClass: 'bg-rose-500 text-white',
      borderClass: 'border-rose-400',
      bgLight: 'bg-rose-50 text-rose-700',
      textClass: 'text-rose-600 font-semibold',
      dotColor: '#f43f5e',
      advice: 'Kan şekeriniz düşük. 15-15 kuralını uygulayın ve dinlenin.',
    };
  }

  if (num >= t.hyperCritical) {
    return {
      status: 'critical-high',
      label: 'Kritik Yüksek',
      badgeClass: 'bg-purple-700 text-white',
      borderClass: 'border-purple-600',
      bgLight: 'bg-purple-50 text-purple-700',
      textClass: 'text-purple-700 font-bold',
      dotColor: '#7e22ce',
      advice: 'Değer çok yüksek! Bol su için, insülin dozunu ve hekiminizi arayın.',
    };
  }

  if (isFasting) {
    if (num > t.fastingMax) {
      return {
        status: 'high',
        label: 'Açlık Yüksek',
        badgeClass: 'bg-amber-500 text-white',
        borderClass: 'border-amber-400',
        bgLight: 'bg-amber-50 text-amber-700',
        textClass: 'text-amber-700 font-semibold',
        dotColor: '#f59e0b',
        advice: 'Açlık hedefinin (80-130) üzerinde. Beslenme & akşam bazal dozu kontrol edilmeli.',
      };
    }
    return {
      status: 'normal',
      label: 'Hedefte (Normal)',
      badgeClass: 'bg-emerald-500 text-white',
      borderClass: 'border-emerald-400',
      bgLight: 'bg-emerald-50 text-emerald-700',
      textClass: 'text-emerald-700 font-medium',
      dotColor: '#10b981',
      advice: 'Mükemmel! Açlık şekeriniz hedeflenen ideal aralıkta.',
    };
  } else {
    if (num > t.postMealMax) {
      return {
        status: 'high',
        label: 'Tokluk Yüksek',
        badgeClass: 'bg-amber-500 text-white',
        borderClass: 'border-amber-400',
        bgLight: 'bg-amber-50 text-amber-700',
        textClass: 'text-amber-700 font-semibold',
        dotColor: '#f59e0b',
        advice: 'Tokluk hedefinin (180 mg/dL) üzerinde. Karbonhidrat & bolus kontrol edilmeli.',
      };
    }
    return {
      status: 'normal',
      label: 'Hedefte (Normal)',
      badgeClass: 'bg-emerald-500 text-white',
      borderClass: 'border-emerald-400',
      bgLight: 'bg-emerald-50 text-emerald-700',
      textClass: 'text-emerald-700 font-medium',
      dotColor: '#10b981',
      advice: 'Tebrikler! Tokluk şekeriniz sağlıklı hedef aralıkta.',
    };
  }
};

export const calculateStats = (records, targets, daysFilter = 0) => {
  if (!records || records.length === 0) {
    return {
      count: 0,
      totalEntries: 0,
      average: 0,
      estimatedA1c: 0,
      sd: 0,
      cv: 0,
      min: 0,
      max: 0,
      tir: { inRange: 0, low: 0, high: 0 },
      counts: { inRange: 0, low: 0, high: 0 },
    };
  }

  let filtered = records;
  if (daysFilter > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysFilter);
    filtered = records.filter((r) => new Date(r.timestamp) >= cutoff);
  }

  // Filter ONLY records that have actual blood sugar readings
  const glucoseRecords = filtered.filter(
    (r) => r.glucose !== null && r.glucose !== undefined && r.glucose !== '' && Number(r.glucose) > 0
  );

  if (glucoseRecords.length === 0) {
    return {
      count: 0,
      totalEntries: filtered.length,
      average: 0,
      estimatedA1c: 0,
      sd: 0,
      cv: 0,
      min: 0,
      max: 0,
      tir: { inRange: 0, low: 0, high: 0 },
      counts: { inRange: 0, low: 0, high: 0 },
    };
  }

  const values = glucoseRecords.map((r) => Number(r.glucose));
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = Math.round(sum / values.length);

  // ADA formula: eA1c (%) = (average + 46.7) / 28.7
  const estimatedA1c = Number(((average + 46.7) / 28.7).toFixed(1));

  // Standard Deviation
  const variance = values.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) / values.length;
  const sd = Math.round(Math.sqrt(variance));

  // Coefficient of Variation (%)
  const cv = average > 0 ? Number(((sd / average) * 100).toFixed(1)) : 0;

  // Time in Range (ADA: 70 - 180 mg/dL)
  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;

  glucoseRecords.forEach((r) => {
    const g = Number(r.glucose);
    if (g < (targets?.hypo || 70)) {
      lowCount++;
    } else if (g > (targets?.postMealMax || 180)) {
      highCount++;
    } else {
      inRangeCount++;
    }
  });

  const total = glucoseRecords.length;
  const tir = {
    low: Math.round((lowCount / total) * 100),
    inRange: Math.round((inRangeCount / total) * 100),
    high: Math.round((highCount / total) * 100),
  };

  return {
    count: total,
    totalEntries: filtered.length,
    average,
    estimatedA1c,
    sd,
    cv,
    min: Math.min(...values),
    max: Math.max(...values),
    tir,
    counts: {
      low: lowCount,
      inRange: inRangeCount,
      high: highCount,
    },
  };
};

export const formatDisplayValue = (glucoseMgDl, unit = 'mg/dL') => {
  if (glucoseMgDl === null || glucoseMgDl === undefined || glucoseMgDl === '') return '-';
  if (unit === 'mmol/L') {
    return (Number(glucoseMgDl) / 18.018).toFixed(1);
  }
  return String(Math.round(Number(glucoseMgDl)));
};

export const formatDateTr = (isoString) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const formatTimeTr = (isoString) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const formatRelativeTime = (isoString) => {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHour < 24 && d.getDate() === now.getDate()) {
      return `Bugün ${formatTimeTr(isoString)}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth()) {
      return `Dün ${formatTimeTr(isoString)}`;
    }
    return formatDateTr(isoString);
  } catch {
    return '';
  }
};

export const formatDateTimeTr = (isoString) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};
