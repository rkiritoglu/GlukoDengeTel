import React from 'react';
import { 
  Droplet, 
  Clock, 
  Activity, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Heart,
  Syringe,
  Utensils
} from 'lucide-react';
import { 
  classifyGlucose, 
  formatRelativeTime, 
  formatTimeTr, 
  formatDisplayValue 
} from '../utils/calculations';
import { MEAL_TIMINGS, triggerHaptic } from '../constants';

export default function TodayTab({ 
  records, 
  profile, 
  stats, 
  onOpenAdd, 
  onSelectSlot, 
  onSelectRecord 
}) {
  // Find latest record WITH glucose
  const latestGlucoseRecord = records.find(
    (r) => r.glucose !== null && r.glucose !== undefined && r.glucose !== '' && Number(r.glucose) > 0
  );

  const classification = latestGlucoseRecord 
    ? classifyGlucose(latestGlucoseRecord.glucose, latestGlucoseRecord.timing, profile.targets) 
    : null;

  // Filter today's records
  const now = new Date();
  const todayRecords = records.filter((r) => {
    const d = new Date(r.timestamp);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  // Today's main slots to track
  const keySlots = [
    { id: 'fasting', label: 'Sabah Açlık', short: 'Sabah Aç' },
    { id: 'breakfast_post', label: 'Kahvaltı Tokluk', short: 'Kahvaltı +2s' },
    { id: 'lunch_post', label: 'Öğle Tokluk', short: 'Öğle +2s' },
    { id: 'dinner_post', label: 'Akşam Tokluk', short: 'Akşam +2s' },
    { id: 'bedtime', label: 'Gece Yatış', short: 'Yatış' },
  ];

  return (
    <div className="space-y-4">

      {/* Hero Latest Measurement Card */}
      {latestGlucoseRecord ? (
        <div 
          onClick={() => {
            triggerHaptic(15);
            onSelectRecord(latestGlucoseRecord);
          }}
          className="touch-active bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden"
        >
          {/* Subtle colored accent strip at top */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5" 
            style={{ backgroundColor: classification?.dotColor || '#10b981' }} 
          />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Son Ölçüm • {formatRelativeTime(latestGlucoseRecord.timestamp)}</span>
            </span>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${classification?.badgeClass}`}>
              {classification?.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black tracking-tight text-slate-800">
                {formatDisplayValue(latestGlucoseRecord.glucose, profile.unit)}
              </span>
              <span className="text-sm font-bold text-slate-500">
                {profile.unit}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                {MEAL_TIMINGS.find((t) => t.id === latestGlucoseRecord.timing)?.label || latestGlucoseRecord.timing}
              </span>
            </div>
          </div>

          {/* Clinical Advice Pill */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: classification?.dotColor }} />
            <p className="text-xs text-slate-600 leading-snug">
              {classification?.advice}
            </p>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => onOpenAdd('glucose')}
          className="bg-white rounded-3xl p-6 text-center shadow-sm border border-dashed border-slate-300"
        >
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Henüz Şeker Kaydı Yok</h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">Günün ilk kan şekeri veya ilaç kaydını hemen ekleyin.</p>
          <button className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm">
            + İlk Kaydı Ekle
          </button>
        </div>
      )}

      {/* Quick Clinical Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* TIR */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block">Hedefte (TIR)</span>
          <span className="text-xl font-black text-emerald-600 tracking-tight mt-0.5 block">
            %{stats.tir.inRange}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Hedef: %70+</span>
        </div>

        {/* eA1c */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block">Tahmini HbA1c</span>
          <span className="text-xl font-black text-teal-600 tracking-tight mt-0.5 block">
            %{stats.estimatedA1c}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">ADA Formülü</span>
        </div>

        {/* Ortalama */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block">Ortalama</span>
          <span className="text-xl font-black text-slate-800 tracking-tight mt-0.5 block">
            {stats.average || '-'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{profile.unit}</span>
        </div>
      </div>

      {/* Today's Schedule & Slot Checklist */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Günün Ölçüm Durumu
          </h2>
          <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
            {todayRecords.length} Giriş Yapıldı
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {keySlots.map((slot) => {
            const recorded = todayRecords.find((r) => r.timing === slot.id);
            const hasGlucose = recorded && recorded.glucose !== null && recorded.glucose !== undefined && Number(recorded.glucose) > 0;
            const slotClass = hasGlucose 
              ? classifyGlucose(recorded.glucose, recorded.timing, profile.targets) 
              : null;

            return (
              <button
                key={slot.id}
                onClick={() => {
                  triggerHaptic(15);
                  if (recorded) {
                    onSelectRecord(recorded);
                  } else {
                    onSelectSlot(slot.id);
                  }
                }}
                className={`touch-active flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border text-center transition-all ${
                  recorded
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-dashed border-slate-200 hover:border-teal-400'
                }`}
              >
                <span className="text-[10px] font-semibold text-slate-500 truncate w-full mb-1">
                  {slot.short}
                </span>

                {recorded ? (
                  <>
                    <span 
                      className="text-xs font-extrabold"
                      style={{ color: slotClass?.dotColor || '#0d9488' }}
                    >
                      {hasGlucose ? recorded.glucose : '✓'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                      {formatTimeTr(recorded.timestamp)}
                    </span>
                  </>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 my-0.5">
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Recent Logs List */}
      {todayRecords.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Bugünkü Kayıtlar ({todayRecords.length})
          </h2>

          <div className="space-y-2">
            {todayRecords.map((r) => {
              const hasG = r.glucose !== null && r.glucose !== undefined && Number(r.glucose) > 0;
              const c = hasG ? classifyGlucose(r.glucose, r.timing, profile.targets) : null;
              const timingObj = MEAL_TIMINGS.find((t) => t.id === r.timing);

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    triggerHaptic(15);
                    onSelectRecord(r);
                  }}
                  className="touch-active bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: c ? c.dotColor : '#0d9488' }}
                    >
                      {hasG ? r.glucose : (r.entryType === 'insulin' ? '💉' : r.entryType === 'food' ? '🥗' : '🏃')}
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {timingObj?.label || r.timing}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatTimeTr(r.timestamp)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                        {r.medication && (
                          <span className="bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-medium">
                            {r.medication} {r.medicationTime ? `(${r.medicationTime})` : ''}
                          </span>
                        )}
                        {r.insulinBolus > 0 && (
                          <span className="bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-medium">
                            {r.insulinBolus}U Bolus
                          </span>
                        )}
                        {r.carbs > 0 && (
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-medium">
                            {r.carbs}g Karb {r.mealTime ? `(${r.mealTime})` : ''}
                          </span>
                        )}
                        {r.mealNote && (
                          <span className="truncate max-w-[130px] italic">
                            {r.mealNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational / Health Tip Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/5 border border-teal-200/60 rounded-2xl p-3.5 flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 leading-relaxed">
          <strong>İpucu:</strong> Artık şeker ölçümü yapmadan da sadece aldığınız ilaçları, yediğiniz yemeği veya yaptığınız sporu saatiyle kaydedebilirsiniz.
        </div>
      </div>

    </div>
  );
}
