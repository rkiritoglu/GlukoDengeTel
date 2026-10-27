import React from 'react';
import { 
  Plus, 
  CheckCircle2, 
  CalendarCheck
} from 'lucide-react';
import { triggerHaptic } from '../constants';
import { classifyGlucose, formatDisplayValue } from '../utils/calculations';

// The 7 primary daily checkpoints
const DAILY_CHECKPOINTS = [
  { id: 'fasting', label: 'Sabah Açlık' },
  { id: 'breakfast_post', label: 'Kahvaltı Tokluk' },
  { id: 'lunch_pre', label: 'Öğle Açlık' },
  { id: 'lunch_post', label: 'Öğle Tokluk' },
  { id: 'dinner_pre', label: 'Akşam Açlık' },
  { id: 'dinner_post', label: 'Akşam Tokluk' },
  { id: 'bedtime', label: 'Gece Yatış' },
];

export default function TodayPlanSection({ 
  records, 
  profile, 
  onSelectSlot, 
  onSelectRecord 
}) {
  const unit = profile?.unit || 'mg/dL';
  const now = new Date();
  
  // Filter records belonging to today
  const todayRecords = records.filter((r) => {
    const d = new Date(r.timestamp);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  // Calculate completed count among daily checkpoints
  const completedCheckpoints = DAILY_CHECKPOINTS.filter((slot) =>
    todayRecords.some((r) => r.timing === slot.id)
  );

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/90 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
            <CalendarCheck className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
                Bugünün Ölçüm Planı
              </h2>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">
                Ölçüm Vakti / Durumu Bağlantılı
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Öğün saatlerine göre açlık ve tokluk ölçümlerinizi takip edin
            </p>
          </div>
        </div>

        {/* Completion Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 px-3 py-1 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>
              <strong>{completedCheckpoints.length}</strong> / {DAILY_CHECKPOINTS.length} Tamamlandı
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 7 Standard Checkpoints */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {DAILY_CHECKPOINTS.map((slot) => {
          // Find matching record with this timing slot
          const recorded = todayRecords.find((r) => r.timing === slot.id);
          const hasGlucose = recorded && recorded.glucose !== null && recorded.glucose !== undefined && Number(recorded.glucose) > 0;
          const classification = hasGlucose 
            ? classifyGlucose(recorded.glucose, recorded.timing, profile?.targets) 
            : null;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                triggerHaptic(15);
                if (recorded) {
                  onSelectRecord(recorded);
                } else {
                  onSelectSlot(slot.id);
                }
              }}
              className={`touch-active group w-full h-10 px-2.5 rounded-xl border flex items-center justify-between text-left transition cursor-pointer ${
                recorded
                  ? 'bg-teal-50/60 hover:bg-teal-100/70 border-teal-200/90 shadow-2xs'
                  : 'bg-white hover:bg-teal-50/40 border-slate-200/90 hover:border-teal-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                {/* Daire şeklinde değil, sadece yeşil + ve yazı ile aynı boyda */}
                <span className="text-emerald-600 font-black text-[11px] sm:text-xs leading-none shrink-0 select-none">
                  +
                </span>

                {/* Tek satıra sığan durum yazısı */}
                <span className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-none whitespace-nowrap truncate group-hover:text-teal-700 transition">
                  {slot.label}
                </span>
              </div>

              {/* Ölçüm Değeri */}
              {recorded && hasGlucose && (
                <span 
                  className="text-[10.5px] sm:text-xs font-black font-mono shrink-0 ml-1.5"
                  style={{ color: classification?.dotColor || '#0f766e' }}
                >
                  {formatDisplayValue(recorded.glucose, unit)}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </section>
  );
}
