export const MEAL_TIMINGS = [
  { id: 'fasting', label: 'Sabah Açlık', isFasting: true, icon: 'Sun', short: 'Sabah Açlık' },
  { id: 'breakfast_post', label: 'Kahvaltı Tokluk (+2s)', isFasting: false, icon: 'Coffee', short: 'Kahvaltı Tokluk' },
  { id: 'lunch_pre', label: 'Öğle Açlık', isFasting: true, icon: 'Utensils', short: 'Öğle Açlık' },
  { id: 'lunch_post', label: 'Öğle Tokluk (+2s)', isFasting: false, icon: 'Utensils', short: 'Öğle Tokluk' },
  { id: 'dinner_pre', label: 'Akşam Açlık', isFasting: true, icon: 'Moon', short: 'Akşam Açlık' },
  { id: 'dinner_post', label: 'Akşam Tokluk (+2s)', isFasting: false, icon: 'Moon', short: 'Akşam Tokluk' },
  { id: 'bedtime', label: 'Gece Yatış', isFasting: false, icon: 'Bed', short: 'Gece Yatış' },
  { id: 'night', label: 'Gece Yarısı (03:00)', isFasting: true, icon: 'Clock', short: 'Gece 03:00' },
  { id: 'exercise_pre', label: 'Egzersiz Öncesi', isFasting: false, icon: 'Activity', short: 'Spor Öncesi' },
  { id: 'exercise_post', label: 'Egzersiz Sonrası', isFasting: false, icon: 'Activity', short: 'Spor Sonrası' },
  { id: 'random', label: 'Rastgele / Ara Kontrol', isFasting: false, icon: 'Sparkles', short: 'Rastgele' },
];

export const DIABETES_TYPES = [
  { id: 'type2', label: 'Tip 2 Diyabet' },
  { id: 'type1', label: 'Tip 1 Diyabet' },
  { id: 'gestational', label: 'Gebelik Diyabeti (Gestasyonel)' },
  { id: 'prediabetes', label: 'Prediyabet (Gizli Şeker)' },
  { id: 'healthy', label: 'Genel Sağlık & Önlem' },
];

export const DEFAULT_PROFILE = {
  name: 'Rıfat Bey',
  diabetesType: 'type2',
  diagnosisYear: '2022',
  doctorName: 'Dr. Zeynep Kaya (Endokrinolog)',
  doctorPhone: '+90 532 555 0123',
  emergencyContact: '+90 532 555 0123',
  unit: 'mg/dL', // 'mg/dL' or 'mmol/L'
  targets: {
    hypoCritical: 54,
    hypo: 70,
    fastingMin: 80,
    fastingMax: 130,
    postMealMax: 180,
    hyperCritical: 250,
  },
};

export const COMMON_SYMPTOMS = [
  'Normal / İyi',
  'Titreme',
  'Soğuk Terleme',
  'Baş Dönmesi',
  'Açlık Krizi',
  'Çarpıntı',
  'Bulanık Görme',
  'Aşırı Susama',
  'Halsizlik / Yorgunluk',
  'Baş Ağrısı',
  'Sinirlilik / Huzursuzluk',
];

export const ACTIVITY_LEVELS = [
  'Yok / Dinlenme',
  'Hafif (15-30 dk yürüyüş)',
  'Orta (30-45 dk egzersiz)',
  'Yoğun (Koşu / Ağır spor)',
];

export const DEFAULT_REMINDERS = [
  { id: 'rem-1', time: '08:00', label: 'Sabah Açlık Şekeri', active: true, type: 'measurement' },
  { id: 'rem-2', time: '10:30', label: 'Kahvaltı 2. Saat Tokluk', active: true, type: 'measurement' },
  { id: 'rem-3', time: '13:00', label: 'Öğle İlacı / İnsülin', active: true, type: 'medication' },
  { id: 'rem-4', time: '19:30', label: 'Akşam İlacı / İnsülin', active: true, type: 'medication' },
  { id: 'rem-5', time: '22:30', label: 'Gece Yatış Ölçümü', active: true, type: 'measurement' },
];

// Android Native Haptic Feedback helper
export const triggerHaptic = (ms = 18) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {}
  }
};

// Generate realistic starting demo records
export const generateDemoRecords = () => {
  const records = [];
  const now = new Date();

  const patterns = [
    { hour: 8, minute: 15, timing: 'fasting', base: 96, carbs: 0, insulin: 0, meal: 'Aç karnına su', mood: 'Normal / İyi' },
    { hour: 10, minute: 30, timing: 'breakfast_post', base: 138, carbs: 45, insulin: 4, meal: 'Yumurta, tam buğday, peynir, çay', mood: 'Normal / İyi' },
    { hour: 13, minute: 0, timing: 'lunch_pre', base: 105, carbs: 0, insulin: 0, meal: 'Öğle öncesi', mood: 'Normal / İyi' },
    { hour: 15, minute: 15, timing: 'lunch_post', base: 152, carbs: 55, insulin: 5, meal: 'Izgara tavuk, bol salata, ayran', mood: 'Normal / İyi' },
    { hour: 19, minute: 30, timing: 'dinner_pre', base: 110, carbs: 0, insulin: 0, meal: 'Akşam öncesi', mood: 'Normal / İyi' },
    { hour: 21, minute: 45, timing: 'dinner_post', base: 162, carbs: 60, insulin: 6, meal: 'Zeytinyağlı taze fasulye, yoğurt', mood: 'Normal / İyi' },
    { hour: 23, minute: 15, timing: 'bedtime', base: 120, carbs: 10, insulin: 12, meal: '1 bardak kefir, bazal insülin', mood: 'Normal / İyi' },
  ];

  for (let d = 5; d >= 0; d--) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - d);

    patterns.forEach((pat, idx) => {
      const variation = Math.floor((Math.sin(d * 4 + idx) * 16) + (Math.random() * 8 - 4));
      let val = pat.base + variation;

      if (d === 1 && pat.timing === 'lunch_post') {
        val = 208; // High spike
      }
      if (d === 3 && pat.timing === 'dinner_pre') {
        val = 68; // Mild hypo
      }

      const recDate = new Date(dayDate);
      recDate.setHours(pat.hour, pat.minute, 0, 0);

      if (recDate.getTime() <= now.getTime()) {
        records.push({
          id: `rec-${d}-${idx}-${Date.now()}`,
          entryType: 'glucose',
          glucose: val,
          timing: pat.timing,
          timestamp: recDate.toISOString(),
          insulinBolus: pat.insulin || 0,
          insulinBasal: pat.timing === 'bedtime' ? 14 : 0,
          medication: 'Metformin 1000mg',
          medicationTime: `${String(pat.hour).padStart(2, '0')}:${String(pat.minute).padStart(2, '0')}`,
          carbs: pat.carbs || 0,
          mealNote: pat.meal || '',
          mealTime: `${String(pat.hour).padStart(2, '0')}:${String(pat.minute).padStart(2, '0')}`,
          activity: idx === 3 ? 'Hafif (15-30 dk yürüyüş)' : 'Yok / Dinlenme',
          symptoms: val < 70 ? 'Titreme, Soğuk Terleme' : (val > 200 ? 'Aşırı Susama' : 'Normal / İyi'),
          notes: val < 70 ? '15-15 Kuralı uygulandı, meyve suyu alındı.' : '',
        });
      }
    });
  }

  return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
