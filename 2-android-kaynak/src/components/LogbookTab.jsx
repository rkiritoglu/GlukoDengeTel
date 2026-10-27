import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Syringe, 
  Utensils, 
  ChevronRight,
  Sparkles,
  Droplet,
  Activity,
  FileText
} from 'lucide-react';
import { classifyGlucose, formatDateTr, formatTimeTr } from '../utils/calculations';
import { MEAL_TIMINGS, triggerHaptic } from '../constants';

export default function LogbookTab({ 
  records, 
  profile, 
  onEditRecord, 
  onDeleteRecord 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'glucose' | 'insulin' | 'food' | 'activity' | 'notes'

  // Filter records
  const filtered = records.filter((rec) => {
    const hasG = rec.glucose !== null && rec.glucose !== undefined && rec.glucose !== '' && Number(rec.glucose) > 0;
    
    // Type filter
    if (activeFilter === 'glucose' && !hasG) return false;
    if (activeFilter === 'insulin' && (hasG || (!rec.medication && !rec.insulinBolus && !rec.insulinBasal))) return false;
    if (activeFilter === 'food' && (hasG || (!rec.carbs && !rec.mealNote))) return false;
    if (activeFilter === 'activity' && (hasG || (!rec.activity && !rec.activityDetails))) return false;
    if (activeFilter === 'notes' && (hasG || (!rec.notes && (!rec.symptoms || rec.symptoms === 'Normal / İyi')))) return false;

    // Search query
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const timingObj = MEAL_TIMINGS.find((t) => t.id === rec.timing);
    return (
      (hasG && String(rec.glucose).includes(term)) ||
      (timingObj?.label && timingObj.label.toLowerCase().includes(term)) ||
      (rec.mealNote && rec.mealNote.toLowerCase().includes(term)) ||
      (rec.medication && rec.medication.toLowerCase().includes(term)) ||
      (rec.notes && rec.notes.toLowerCase().includes(term)) ||
      (rec.symptoms && rec.symptoms.toLowerCase().includes(term))
    );
  });

  // Group by date string
  const groupedByDate = filtered.reduce((acc, rec) => {
    const dStr = formatDateTr(rec.timestamp);
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(rec);
    return acc;
  }, {});

  const dateKeys = Object.keys(groupedByDate);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    triggerHaptic(30);
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      onDeleteRecord(id);
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ölçüm, ilaç, yemek veya not ara..."
          className="w-full bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 border border-slate-200/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'glucose', label: '🩸 Şeker' },
          { id: 'insulin', label: '💉 İlaç/İnsülin' },
          { id: 'food', label: '🥗 Yemek' },
          { id: 'activity', label: '🏃 Spor' },
          { id: 'notes', label: '📝 Not' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              triggerHaptic(15);
              setActiveFilter(f.id);
            }}
            className={`touch-active px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeFilter === f.id
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Records Count Badge */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Kayıt Geçmişi
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {filtered.length} Kayıt
        </span>
      </div>

      {/* Grouped Date Sections */}
      {dateKeys.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-600">Eşleşen kayıt bulunamadı</p>
          <p className="text-[11px] text-slate-400 mt-1">Farklı bir arama veya filtre deneyebilirsiniz.</p>
        </div>
      ) : (
        dateKeys.map((dateStr) => (
          <div key={dateStr} className="space-y-2">
            
            {/* Date Header Sticky Pill */}
            <div className="sticky top-14 z-10 py-1">
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-teal-800 bg-teal-100/90 px-3 py-1 rounded-full shadow-xs border border-teal-200/60 backdrop-blur">
                <Calendar className="w-3 h-3 text-teal-600" />
                <span>{dateStr}</span>
              </span>
            </div>

            {/* Day's Records Cards */}
            <div className="space-y-2">
              {groupedByDate[dateStr].map((rec) => {
                const hasG = rec.glucose !== null && rec.glucose !== undefined && rec.glucose !== '' && Number(rec.glucose) > 0;
                const c = hasG ? classifyGlucose(rec.glucose, rec.timing, profile.targets) : null;
                const timingObj = MEAL_TIMINGS.find((t) => t.id === rec.timing);

                return (
                  <div
                    key={rec.id}
                    onClick={() => {
                      triggerHaptic(15);
                      onEditRecord(rec);
                    }}
                    className="touch-active bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2 relative"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div 
                          className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-base text-white shadow-sm shrink-0"
                          style={{ backgroundColor: c ? c.dotColor : '#0d9488' }}
                        >
                          {hasG ? (
                            <>
                              <span>{rec.glucose}</span>
                              <span className="text-[8px] font-semibold opacity-90 -mt-0.5">
                                {profile.unit}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl">
                              {rec.entryType === 'insulin' ? '💉' : rec.entryType === 'food' ? '🥗' : rec.entryType === 'activity' ? '🏃' : '📝'}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-800">
                              {timingObj?.label || rec.timing}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 mt-0.5">
                            {c ? (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${c.badgeClass}`}>
                                {c.label}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                                {rec.entryType === 'insulin' ? 'İlaç/İnsülin Kaydı' : rec.entryType === 'food' ? 'Öğün Kaydı' : rec.entryType === 'activity' ? 'Aktivite' : 'Özel Not'}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 flex items-center space-x-0.5 font-medium">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatTimeTr(rec.timestamp)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => handleDelete(e, rec.id)}
                          className="touch-active p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags (Insulin, Carbs, Activity, Symptoms) */}
                    {(rec.medication || rec.insulinBolus > 0 || rec.insulinBasal > 0 || rec.carbs > 0 || rec.mealNote || (rec.symptoms && rec.symptoms !== 'Normal / İyi')) && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px]">
                        {rec.medication && (
                          <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg font-semibold border border-sky-100 flex items-center space-x-1">
                            <Syringe className="w-2.5 h-2.5" />
                            <span>{rec.medication} {rec.medicationTime ? `(${rec.medicationTime})` : ''}</span>
                          </span>
                        )}
                        {rec.insulinBolus > 0 && (
                          <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg font-semibold border border-sky-100">
                            Bolus: {rec.insulinBolus}U
                          </span>
                        )}
                        {rec.insulinBasal > 0 && (
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-semibold border border-indigo-100">
                            Bazal: {rec.insulinBasal}U
                          </span>
                        )}
                        {rec.carbs > 0 && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg font-semibold border border-amber-100 flex items-center space-x-1">
                            <Utensils className="w-2.5 h-2.5" />
                            <span>{rec.carbs}g Karb {rec.mealTime ? `(${rec.mealTime})` : ''}</span>
                          </span>
                        )}
                        {rec.mealNote && (
                          <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-100 truncate max-w-[200px]">
                            🍽️ {rec.mealNote}
                          </span>
                        )}
                        {rec.symptoms && rec.symptoms !== 'Normal / İyi' && (
                          <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-100 font-semibold">
                            ⚠️ {rec.symptoms}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes if any */}
                    {rec.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                        "{rec.notes}"
                      </p>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        ))
      )}

    </div>
  );
}
