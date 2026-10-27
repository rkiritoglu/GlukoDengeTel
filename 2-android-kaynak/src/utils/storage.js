import { DEFAULT_PROFILE, DEFAULT_REMINDERS, generateDemoRecords, MEAL_TIMINGS } from '../constants';
import { classifyGlucose, formatDateTr, formatTimeTr, calculateStats } from './calculations';

const KEYS = {
  RECORDS: 'gluco_tel_records_v1',
  PROFILE: 'gluco_tel_profile_v1',
  REMINDERS: 'gluco_tel_reminders_v1',
  INITIALIZED: 'gluco_tel_has_init_v1',
};

export const loadInitialData = () => {
  const hasInit = localStorage.getItem(KEYS.INITIALIZED);
  let records = [];
  let profile = { ...DEFAULT_PROFILE };
  let reminders = [...DEFAULT_REMINDERS];

  if (!hasInit) {
    records = generateDemoRecords();
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  } else {
    try {
      const recJson = localStorage.getItem(KEYS.RECORDS);
      records = recJson ? JSON.parse(recJson) : [];
    } catch {
      records = [];
    }

    try {
      const profJson = localStorage.getItem(KEYS.PROFILE);
      profile = profJson ? { ...DEFAULT_PROFILE, ...JSON.parse(profJson) } : DEFAULT_PROFILE;
    } catch {
      profile = DEFAULT_PROFILE;
    }

    try {
      const remJson = localStorage.getItem(KEYS.REMINDERS);
      reminders = remJson ? JSON.parse(remJson) : DEFAULT_REMINDERS;
    } catch {
      reminders = DEFAULT_REMINDERS;
    }
  }

  return { records, profile, reminders };
};

export const saveRecords = (records) => {
  try {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Kaydedilemedi:', e);
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Profil kaydedilemedi:', e);
  }
};

export const saveReminders = (reminders) => {
  try {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) {
    console.error('Hatırlatıcılar kaydedilemedi:', e);
  }
};

export const exportToCSV = (records, targets, unit = 'mg/dL') => {
  if (!records || records.length === 0) {
    alert('Dışa aktarılacak kayıt bulunmuyor.');
    return;
  }

  const timingMap = MEAL_TIMINGS.reduce((acc, t) => {
    acc[t.id] = t.label;
    return acc;
  }, {});

  const headers = [
    'Tarih',
    'Saat',
    'Ölçüm Durumu',
    `Kan Şekeri (${unit})`,
    'Sınıflandırma',
    'Bolus İnsülin (U)',
    'Bazal İnsülin (U)',
    'İlaç',
    'İlaç Saati',
    'Karbonhidrat (gr)',
    'Yemek Saati',
    'Aktivite',
    'Belirtiler',
    'Notlar',
  ];

  const rows = records.map((r) => {
    const classification = classifyGlucose(r.glucose, r.timing, targets);
    const date = formatDateTr(r.timestamp);
    const time = formatTimeTr(r.timestamp);
    const timingLabel = timingMap[r.timing] || r.timing;
    const glucoseVal = unit === 'mmol/L' ? (r.glucose / 18.018).toFixed(1) : r.glucose;

    const cleanField = (txt) => {
      if (txt === undefined || txt === null) return '""';
      const str = String(txt).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      cleanField(date),
      cleanField(time),
      cleanField(timingLabel),
      cleanField(glucoseVal),
      cleanField(classification.label),
      cleanField(r.insulinBolus || 0),
      cleanField(r.insulinBasal || 0),
      cleanField(r.medication || ''),
      cleanField(r.medicationTime || ''),
      cleanField(r.carbs || 0),
      cleanField(r.mealTime || ''),
      cleanField(r.activity || ''),
      cleanField(r.symptoms || ''),
      cleanField(r.notes || ''),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kan-sekeri-mobil-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (records, profile, reminders) => {
  const data = {
    app: 'GlukoDenge Mobile',
    version: '1.1.0',
    exportDate: new Date().toISOString(),
    profile,
    records,
    reminders,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `glukodenge-mobil-yedek-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Android Instant WhatsApp Report Formatter
export const generateWhatsAppShareUrl = (records, profile, days = 7) => {
  const stats = calculateStats(records, profile.targets, days);
  const last5 = records.slice(0, 5);

  const timingMap = MEAL_TIMINGS.reduce((acc, t) => {
    acc[t.id] = t.short || t.label;
    return acc;
  }, {});

  let text = `🩺 *GlukoDenge Kan Şekeri Özeti* (${profile.name || 'Hasta'})\n`;
  text += `📅 Son ${days} Günlük Veriler:\n`;
  text += `• *Ortalama Şeker:* ${stats.average} ${profile.unit}\n`;
  text += `• *Tahmini HbA1c:* %${stats.estimatedA1c}\n`;
  text += `• *Hedefte Kalma (TIR):* %${stats.tir.inRange}\n`;
  text += `• *Düşük Oranı:* %${stats.tir.low} | *Yüksek Oranı:* %${stats.tir.high}\n\n`;

  text += `📋 *Son Ölçümler:*\n`;
  last5.forEach((r) => {
    const time = `${formatDateTr(r.timestamp)} ${formatTimeTr(r.timestamp)}`;
    const slot = timingMap[r.timing] || r.timing;
    text += `▫️ ${time} [${slot}]: *${r.glucose} ${profile.unit}*`;
    if (r.insulinBolus || r.insulinBasal) {
      text += ` (İnsülin: ${r.insulinBolus || 0}B / ${r.insulinBasal || 0}Bz`;
      if (r.medicationTime) text += ` @ ${r.medicationTime}`;
      text += `)`;
    }
    if (r.carbs) {
      text += ` (${r.carbs}g Karb`;
      if (r.mealTime) text += ` @ ${r.mealTime}`;
      text += `)`;
    }
    text += `\n`;
  });

  text += `\n_GlukoDenge Mobil Takip Sistemi ile gönderildi._`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};
