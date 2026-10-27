import React, { useState, useEffect } from 'react';
import { 
  X, 
  Droplet, 
  Clock, 
  Calendar, 
  Utensils, 
  Syringe, 
  Activity, 
  AlertCircle, 
  Check, 
  FileText,
  HeartPulse,
  ChevronDown,
  Sparkles,
  Dumbbell,
  ArrowLeftRight
} from 'lucide-react';
import { MEAL_TIMINGS, COMMON_SYMPTOMS, ACTIVITY_LEVELS } from '../constants';
import { classifyGlucose } from '../utils/calculations';

export default function GlucoseModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingRecord, 
  targets, 
  profile,
  defaultType = 'glucose',
  defaultTiming = null,
  onToggleUnit
}) {
  const unit = profile?.unit || 'mg/dL';

  // Entry Category: 'glucose' | 'insulin' | 'food' | 'activity' | 'note'
  const [entryType, setEntryType] = useState(defaultType);

  // Form State
  const [glucose, setGlucose] = useState('');
  const [timing, setTiming] = useState('fasting');
  const [timestamp, setTimestamp] = useState('');
  const [insulinBolus, setInsulinBolus] = useState('');
  const [insulinBasal, setInsulinBasal] = useState('');
  const [medication, setMedication] = useState('');
  const [medicationTime, setMedicationTime] = useState('');
  const [carbs, setCarbs] = useState('');
  const [mealNote, setMealNote] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[1]);
  const [activityDetails, setActivityDetails] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Normal / İyi']);
  const [notes, setNotes] = useState('');
  const [showOptionalGlucose, setShowOptionalGlucose] = useState(false);
  const [error, setError] = useState('');

  // Populate fields on edit or initialize on new
  useEffect(() => {
    if (editingRecord) {
      // Infer entryType if not explicitly stored
      let inferredType = editingRecord.entryType;
      if (!inferredType) {
        if (editingRecord.glucose && Number(editingRecord.glucose) > 0) inferredType = 'glucose';
        else if (editingRecord.insulinBolus || editingRecord.insulinBasal || editingRecord.medication) inferredType = 'insulin';
        else if (editingRecord.carbs || editingRecord.mealNote) inferredType = 'food';
        else if (editingRecord.activity && editingRecord.activity !== 'Yok / Dinlenme') inferredType = 'activity';
        else inferredType = 'note';
      }
      setEntryType(inferredType);

      if (editingRecord.glucose && Number(editingRecord.glucose) > 0) {
        const gVal = unit === 'mmol/L' 
          ? (editingRecord.glucose / 18.018).toFixed(1) 
          : String(editingRecord.glucose);
        setGlucose(gVal);
        setShowOptionalGlucose(true);
      } else {
        setGlucose('');
        setShowOptionalGlucose(false);
      }

      setTiming(editingRecord.timing || 'fasting');
      
      try {
        const d = new Date(editingRecord.timestamp);
        const pad = (n) => String(n).padStart(2, '0');
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setTimestamp(localIso);
      } catch {
        setTimestamp(new Date().toISOString().slice(0, 16));
      }

      setInsulinBolus(editingRecord.insulinBolus ? String(editingRecord.insulinBolus) : '');
      setInsulinBasal(editingRecord.insulinBasal ? String(editingRecord.insulinBasal) : '');
      setMedication(editingRecord.medication || '');
      setMedicationTime(editingRecord.medicationTime || '');
      setCarbs(editingRecord.carbs ? String(editingRecord.carbs) : '');
      setMealNote(editingRecord.mealNote || '');
      setMealTime(editingRecord.mealTime || '');
      setActivity(editingRecord.activity || ACTIVITY_LEVELS[1]);
      setActivityDetails(editingRecord.activityDetails || '');
      
      if (editingRecord.symptoms) {
        setSelectedSymptoms(editingRecord.symptoms.split(', '));
      } else {
        setSelectedSymptoms(['Normal / İyi']);
      }
      setNotes(editingRecord.notes || '');
    } else {
      // New record defaults
      setEntryType(defaultType || 'glucose');
      setGlucose('');
      setShowOptionalGlucose(false);
      
      let chosenTiming = defaultTiming;
      if (!chosenTiming) {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) chosenTiming = 'fasting';
        else if (hour >= 10 && hour < 12) chosenTiming = 'breakfast_post';
        else if (hour >= 12 && hour < 14) chosenTiming = 'lunch_pre';
        else if (hour >= 14 && hour < 17) chosenTiming = 'lunch_post';
        else if (hour >= 17 && hour < 20) chosenTiming = 'dinner_pre';
        else if (hour >= 20 && hour < 23) chosenTiming = 'dinner_post';
        else chosenTiming = 'bedtime';
      }

      setTiming(chosenTiming);
      
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const localNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      setTimestamp(localNow);
      setMedicationTime(timeStr);
      setMealTime(timeStr);
      setInsulinBolus('');
      setInsulinBasal('');
      setMedication('');
      setCarbs('');
      setMealNote('');
      setActivity(ACTIVITY_LEVELS[1]);
      setActivityDetails('');
      setSelectedSymptoms(['Normal / İyi']);
      setNotes('');
    }
    setError('');
  }, [editingRecord, isOpen, unit, defaultType]);

  if (!isOpen) return null;

  // Numeric validation
  const numericValue = parseFloat(glucose);
  let glucoseInMgDl = null;
  if (!isNaN(numericValue) && numericValue > 0) {
    glucoseInMgDl = unit === 'mmol/L' ? Math.round(numericValue * 18.018) : Math.round(numericValue);
  }

  const liveClassification = glucoseInMgDl ? classifyGlucose(glucoseInMgDl, timing, targets) : null;

  const handleUnitToggle = () => {
    const newUnit = unit === 'mg/dL' ? 'mmol/L' : 'mg/dL';
    if (glucose && !isNaN(numericValue) && numericValue > 0) {
      if (newUnit === 'mmol/L') {
        setGlucose((numericValue / 18.018).toFixed(1));
      } else {
        setGlucose(String(Math.round(numericValue * 18.018)));
      }
    }
    if (onToggleUnit) {
      onToggleUnit(newUnit);
    }
  };

  const handleSymptomSelect = (symp) => {
    if (symp === 'Normal / İyi') {
      setSelectedSymptoms(['Normal / İyi']);
      return;
    }
    let updated = selectedSymptoms.filter((s) => s !== 'Normal / İyi');
    if (!updated.includes(symp)) {
      updated.push(symp);
    }
    setSelectedSymptoms(updated);
  };

  const removeSymptom = (symp) => {
    const updated = selectedSymptoms.filter((s) => s !== symp);
    if (updated.length === 0) {
      setSelectedSymptoms(['Normal / İyi']);
    } else {
      setSelectedSymptoms(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Specific Validation based on entryType:
    if (entryType === 'glucose') {
      if (!glucose || isNaN(numericValue) || numericValue <= 0) {
        setError('Lütfen geçerli bir kan şekeri değeri giriniz.');
        return;
      }
      if (unit === 'mg/dL' && (numericValue < 20 || numericValue > 650)) {
        setError('Kan şekeri değeri 20 ile 650 mg/dL aralığında olmalıdır.');
        return;
      }
      if (unit === 'mmol/L' && (numericValue < 1.1 || numericValue > 36)) {
        setError('Kan şekeri değeri 1.1 ile 36.0 mmol/L aralığında olmalıdır.');
        return;
      }
    } else if (entryType === 'insulin') {
      if (!medication.trim() && !insulinBolus && !insulinBasal) {
        setError('Lütfen en az bir ilaç adı veya insülin dozu giriniz.');
        return;
      }
    } else if (entryType === 'food') {
      if (!mealNote.trim() && !carbs) {
        setError('Lütfen tüketilen yemek açıklamasını veya karbonhidrat miktarını giriniz.');
        return;
      }
    } else if (entryType === 'activity') {
      if (!activity && !activityDetails.trim() && !notes.trim()) {
        setError('Lütfen yapılan aktiviteyi veya açıklamayı belirtiniz.');
        return;
      }
    } else if (entryType === 'note') {
      if (!notes.trim() && selectedSymptoms[0] === 'Normal / İyi') {
        setError('Lütfen en az bir belirti seçin veya bir not yazın.');
        return;
      }
    }

    const payload = {
      id: editingRecord ? editingRecord.id : `entry-${Date.now()}`,
      entryType,
      glucose: (entryType === 'glucose' || showOptionalGlucose) && glucoseInMgDl ? glucoseInMgDl : null,
      timing,
      timestamp: new Date(timestamp).toISOString(),
      insulinBolus: insulinBolus ? parseFloat(insulinBolus) : 0,
      insulinBasal: insulinBasal ? parseFloat(insulinBasal) : 0,
      medication: medication.trim(),
      medicationTime: medicationTime.trim(),
      carbs: carbs ? parseFloat(carbs) : 0,
      mealNote: mealNote.trim(),
      mealTime: mealTime.trim(),
      activity: entryType === 'activity' ? activity : (activity || 'Yok / Dinlenme'),
      activityDetails: activityDetails.trim(),
      symptoms: selectedSymptoms.join(', '),
      notes: notes.trim(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 px-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-teal-200">
                {entryType === 'glucose' && <Droplet className="w-5 h-5 fill-current" />}
                {entryType === 'insulin' && <Syringe className="w-5 h-5" />}
                {entryType === 'food' && <Utensils className="w-5 h-5" />}
                {entryType === 'activity' && <Dumbbell className="w-5 h-5" />}
                {entryType === 'note' && <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white m-0">
                  {editingRecord ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
                </h3>
                <p className="text-xs text-teal-100/90 mt-0.5">
                  Şeker ölçümü yapmadan da ilaç, öğün veya spor bilgisi girebilirsiniz
                </p>
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

          {/* Entry Category Selector Tabs */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 bg-teal-950/40 p-1 rounded-2xl border border-white/10 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => { setEntryType('glucose'); setError(''); }}
              className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                entryType === 'glucose' ? 'bg-white text-teal-800 font-bold shadow' : 'text-teal-100 hover:text-white'
              }`}
            >
              <Droplet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Şeker</span>
            </button>

            <button
              type="button"
              onClick={() => { setEntryType('insulin'); setError(''); }}
              className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                entryType === 'insulin' ? 'bg-white text-teal-800 font-bold shadow' : 'text-teal-100 hover:text-white'
              }`}
            >
              <Syringe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">İlaç</span>
            </button>

            <button
              type="button"
              onClick={() => { setEntryType('food'); setError(''); }}
              className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                entryType === 'food' ? 'bg-white text-teal-800 font-bold shadow' : 'text-teal-100 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Besin</span>
            </button>

            <button
              type="button"
              onClick={() => { setEntryType('activity'); setError(''); }}
              className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                entryType === 'activity' ? 'bg-white text-teal-800 font-bold shadow' : 'text-teal-100 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Spor</span>
            </button>

            <button
              type="button"
              onClick={() => { setEntryType('note'); setError(''); }}
              className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                entryType === 'note' ? 'bg-white text-teal-800 font-bold shadow' : 'text-teal-100 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Not</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. GLUCOSE MODE */}
          {entryType === 'glucose' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Kan Şekeri Değeri ({unit})
                    </label>
                    <div className="flex items-baseline gap-2">
                      <input
                        type="number"
                        step={unit === 'mmol/L' ? '0.1' : '1'}
                        autoFocus
                        placeholder={unit === 'mmol/L' ? '6.5' : '110'}
                        value={glucose}
                        onChange={(e) => setGlucose(e.target.value)}
                        className="text-4xl font-black font-mono tracking-tight text-slate-900 bg-white border border-slate-300 rounded-xl px-4 py-2 w-44 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                      {onToggleUnit ? (
                        <button
                          type="button"
                          onClick={handleUnitToggle}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs flex items-center gap-1 transition cursor-pointer"
                          title="Birim Değiştir (mg/dL <-> mmol/L)"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />
                          <span>{unit}</span>
                        </button>
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">{unit}</span>
                      )}
                    </div>
                  </div>

                  {liveClassification && (
                    <div className="sm:text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${liveClassification.badgeClass} shadow-xs`}>
                        {liveClassification.label}
                      </span>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 leading-tight sm:text-right">
                        {liveClassification.advice}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timing Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Ölçüm Vakti / Durumu
                </label>
                <div className="relative">
                  <select
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden appearance-none pr-10 cursor-pointer shadow-xs"
                  >
                    {MEAL_TIMINGS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* 2. INSULIN / MEDICATION ONLY MODE (Completely decoupled from glucose) */}
          {entryType === 'insulin' && (
            <div className="space-y-4">
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 text-teal-900 text-xs flex items-center gap-2.5">
                <Syringe className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <span className="font-bold block">Bağımsız İlaç / İnsülin Girişi</span>
                  <span className="text-teal-700 text-[11px]">Kan şekeri ölçümü yapmanıza gerek yoktur; aldığınız ilaç ve dozu kaydedebilirsiniz.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Oral İlaç Adı
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="örn: Metformin 1000mg, Januvia"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> İlaç Alım Saati
                  </label>
                  <input
                    type="time"
                    value={medicationTime}
                    onChange={(e) => setMedicationTime(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bolus (Hızlı Etkili) İnsülin
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={insulinBolus}
                      onChange={(e) => setInsulinBolus(e.target.value)}
                      className="w-full text-sm font-bold font-mono border border-slate-300 rounded-lg p-2 bg-white"
                    />
                    <span className="text-xs font-semibold text-slate-500">Ünite</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bazal (Uzun Etkili) İnsülin
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={insulinBasal}
                      onChange={(e) => setInsulinBasal(e.target.value)}
                      className="w-full text-sm font-bold font-mono border border-slate-300 rounded-lg p-2 bg-white"
                    />
                    <span className="text-xs font-semibold text-slate-500">Ünite</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. FOOD / CARBOHYDRATE ONLY MODE (Completely decoupled from glucose) */}
          {entryType === 'food' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-amber-950 text-xs flex items-center gap-2.5">
                <Utensils className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">Bağımsız Öğün & Besin Girişi</span>
                  <span className="text-amber-800 text-[11px]">Şeker ölçümü yapmadan yediğiniz öğünü ve karbonhidrat miktarını kaydedebilirsiniz.</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Yenilen Yemek / Besin Açıklaması
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="örn: 1 kase mercimek çorbası, 1 dilim tam buğday ekmeği, mevsim salata"
                  value={mealNote}
                  onChange={(e) => setMealNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tahmini Karbonhidrat
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="0"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full text-sm font-bold font-mono border border-slate-300 rounded-xl p-2.5 bg-white"
                    />
                    <span className="text-xs font-semibold text-slate-500">Gram</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Yemek Saati
                  </label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. ACTIVITY & SPORTS ONLY MODE (Completely decoupled from glucose) */}
          {entryType === 'activity' && (
            <div className="space-y-4">
              <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 text-sky-950 text-xs flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <span className="font-bold block">Bağımsız Egzersiz & Spor Girişi</span>
                  <span className="text-sky-800 text-[11px]">Yaptığınız yürüyüş, koşu, spor veya aktiviteleri kaydedin.</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Aktivite Seviyesi / Yoğunluğu
                </label>
                <div className="relative">
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white appearance-none pr-8 cursor-pointer font-medium"
                  >
                    {ACTIVITY_LEVELS.filter(a => a !== 'Yok / Dinlenme').map((act) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Aktivite Açıklaması & Süresi
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="örn: 40 dakika açık havada tempolu yürüyüş yapıldı"
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* 5. HEALTH NOTE & SYMPTOMS ONLY MODE (Completely decoupled from glucose) */}
          {entryType === 'note' && (
            <div className="space-y-4">
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 text-purple-950 text-xs flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold block">Sağlık Notu & Belirti Girişi</span>
                  <span className="text-purple-800 text-[11px]">Tansiyon, stres, uyku, hastalık veya doktor tavsiyelerinizi not alın.</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                  Hissedilen Belirtiler (Açılır Menü)
                </label>
                <div className="relative">
                  <select
                    value={selectedSymptoms.length === 1 ? selectedSymptoms[0] : (selectedSymptoms[0] || 'Normal / İyi')}
                    onChange={(e) => handleSymptomSelect(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 bg-white appearance-none pr-8 cursor-pointer font-medium"
                  >
                    {COMMON_SYMPTOMS.map((symp) => (
                      <option key={symp} value={symp}>{symp}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {selectedSymptoms.length > 0 && selectedSymptoms[0] !== 'Normal / İyi' && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {selectedSymptoms.map((symp) => (
                      <span
                        key={symp}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        {symp}
                        <button
                          type="button"
                          onClick={() => removeSymptom(symp)}
                          className="hover:text-teal-950 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Date & Time Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Kayıt Tarihi ve Saati
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Common General Notes Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              {entryType === 'note' ? 'Detaylı Sağlık Notu' : 'Ek Açıklama & Not (İsteğe Bağlı)'}
            </label>
            <textarea
              rows="2"
              placeholder={entryType === 'note' ? 'Tansiyon 120/80, iyi uyundu, hafif baş ağrısı vardı...' : 'Gerekirse ek açıklamalar...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 resize-none bg-white"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition cursor-pointer"
            >
              {editingRecord ? 'Değişiklikleri Kaydet' : 'Bilgiyi Kaydet'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
