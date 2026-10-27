import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  RefreshCw,
  Utensils,
  Syringe,
  Activity,
  AlertCircle,
  Dumbbell,
  FileText,
  Droplet
} from 'lucide-react';
import { MEAL_TIMINGS } from '../constants';
import { classifyGlucose, formatDateTr, formatTimeTr, formatDisplayValue } from '../utils/calculations';

export default function LogbookTable({ 
  records, 
  targets, 
  profile, 
  onEdit, 
  onDelete, 
  onExportCSV,
  onLoadDemo,
  onClearAll 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'glucose' | 'insulin' | 'food' | 'activity' | 'note'
  const [timingFilter, setTimingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const unit = profile?.unit || 'mg/dL';

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Entry Type filter
      if (typeFilter !== 'all') {
        const hasGlucose = r.glucose !== null && r.glucose !== undefined && r.glucose !== '' && Number(r.glucose) > 0;
        if (typeFilter === 'glucose' && !hasGlucose) return false;
        if (typeFilter === 'insulin' && (hasGlucose || (!r.medication && !r.insulinBolus && !r.insulinBasal))) return false;
        if (typeFilter === 'food' && (hasGlucose || (!r.carbs && !r.mealNote))) return false;
        if (typeFilter === 'activity' && (hasGlucose || (r.activity === 'Yok / Dinlenme' && !r.activityDetails))) return false;
        if (typeFilter === 'note' && (hasGlucose || (!r.notes && (!r.symptoms || r.symptoms === 'Normal / İyi')))) return false;
      }

      // 2. Timing filter
      if (timingFilter !== 'all' && r.timing !== timingFilter) return false;

      // 3. Status filter
      const classification = classifyGlucose(r.glucose, r.timing, targets);
      if (statusFilter !== 'all') {
        if (!classification) return false;
        if (statusFilter === 'normal' && classification.status !== 'normal') return false;
        if (statusFilter === 'low' && !['low', 'critical-low'].includes(classification.status)) return false;
        if (statusFilter === 'high' && !['high', 'critical-high'].includes(classification.status)) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const meal = (r.mealNote || '').toLowerCase();
        const med = (r.medication || '').toLowerCase();
        const symp = (r.symptoms || '').toLowerCase();
        const notes = (r.notes || '').toLowerCase();
        const act = (r.activity || '').toLowerCase();
        const actDet = (r.activityDetails || '').toLowerCase();
        const timingLabel = (MEAL_TIMINGS.find((t) => t.id === r.timing)?.label || '').toLowerCase();
        const matches = meal.includes(q) || med.includes(q) || symp.includes(q) || notes.includes(q) || act.includes(q) || actDet.includes(q) || timingLabel.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [records, typeFilter, timingFilter, statusFilter, searchQuery, targets]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-12">
      
      {/* Header & Tool Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 m-0">Kayıt Defteri & Günlük Geçmişi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Filtrelenmiş {filteredRecords.length} kayıt (Toplam: {records.length})
          </p>
        </div>

        {/* Action Buttons: Export & Demo Load */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExportCSV}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Excel / CSV İndir</span>
          </button>

          <button
            type="button"
            onClick={onLoadDemo}
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Örnek takip verilerini yükler"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>Örnek Veri Yükle</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İlaç, yemek, spor, not ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        {/* Entry Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Tüm Kayıt Türleri (Hepsi)</option>
            <option value="glucose">Yalnızca Şeker Ölçümleri</option>
            <option value="insulin">Yalnızca İlaç & İnsülin Kayıtları</option>
            <option value="food">Yalnızca Öğün & Besin Kayıtları</option>
            <option value="activity">Yalnızca Spor & Aktivite Kayıtları</option>
            <option value="note">Yalnızca Sağlık Notları</option>
          </select>
        </div>

        {/* Timing Dropdown */}
        <div>
          <select
            value={timingFilter}
            onChange={(e) => {
              setTimingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 cursor-pointer"
          >
            <option value="all">Tüm Vakitler (Açlık, Tokluk...)</option>
            {MEAL_TIMINGS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 cursor-pointer"
          >
            <option value="all">Tüm Durumlar (Hedef / Risk)</option>
            <option value="normal">Yalnızca Hedefte Olanlar (Normal)</option>
            <option value="low">Yalnızca Düşükler (Hipoglisemi)</option>
            <option value="high">Yalnızca Yüksekler (Hiperglisemi)</option>
          </select>
        </div>
      </div>

      {/* Clear Filters bar if applied */}
      {(searchQuery || typeFilter !== 'all' || timingFilter !== 'all' || statusFilter !== 'all') && (
        <div className="px-5 py-2 bg-teal-50/50 border-b border-teal-100/60 flex items-center justify-between text-xs">
          <span className="text-teal-800 font-medium">Aktif filtreler uygulanıyor.</span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setTimingFilter('all');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
          >
            Tüm Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Table Data */}
      {paginatedRecords.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Eşleşen kayıt bulunamadı</p>
          <p className="text-xs text-slate-400 mt-1">Filtre kriterlerinizi değiştirmeyi deneyebilirsiniz.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4 sm:px-6">Tarih & Saat</th>
                <th className="py-3 px-4">Vakit</th>
                <th className="py-3 px-4">Kayıt / Değer</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 hidden md:table-cell">İnsülin / İlaç</th>
                <th className="py-3 px-4 hidden lg:table-cell">Besin & Karbonhidrat</th>
                <th className="py-3 px-4 hidden xl:table-cell">Aktivite & Not</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedRecords.map((r) => {
                const hasGlucose = r.glucose !== null && r.glucose !== undefined && r.glucose !== '' && Number(r.glucose) > 0;
                const c = hasGlucose ? classifyGlucose(r.glucose, r.timing, targets) : null;
                const timingObj = MEAL_TIMINGS.find((t) => t.id === r.timing);
                const valDisplay = hasGlucose ? formatDisplayValue(r.glucose, unit) : null;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    {/* Date & Time */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{formatDateTr(r.timestamp)}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{formatTimeTr(r.timestamp)}</div>
                    </td>

                    {/* Timing Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {timingObj?.label || r.timing}
                      </span>
                    </td>

                    {/* Glucose Value or Independent Record Tag */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {hasGlucose ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black font-mono text-slate-900">{valDisplay}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
                        </div>
                      ) : (
                        <div>
                          {(r.entryType === 'insulin' || r.insulinBolus > 0 || r.insulinBasal > 0 || r.medication) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80">
                              <Syringe className="w-3 h-3 text-teal-600 shrink-0" /> İlaç Kaydı
                            </span>
                          ) : (r.entryType === 'food' || r.carbs > 0 || r.mealNote) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                              <Utensils className="w-3 h-3 text-amber-600 shrink-0" /> Öğün Kaydı
                            </span>
                          ) : (r.entryType === 'activity' || (r.activity && r.activity !== 'Yok / Dinlenme') || r.activityDetails) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/80">
                              <Dumbbell className="w-3 h-3 text-sky-600 shrink-0" /> Spor / Aktivite
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/80">
                              <FileText className="w-3 h-3 text-purple-600 shrink-0" /> Sağlık Notu
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c ? (
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.badgeClass}`}>
                          {c.label}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                          Ölçüm Harici
                        </span>
                      )}
                    </td>

                    {/* Insulin / Meds */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      {(r.insulinBolus > 0 || r.insulinBasal > 0 || r.medication || r.medicationTime) ? (
                        <div className="space-y-0.5">
                          {r.insulinBolus > 0 && (
                            <span className="inline-block bg-teal-50 text-teal-800 text-[11px] font-semibold px-2 py-0.5 rounded-md mr-1">
                              Bolus: {r.insulinBolus}U
                            </span>
                          )}
                          {r.insulinBasal > 0 && (
                            <span className="inline-block bg-sky-50 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded-md mr-1">
                              Bazal: {r.insulinBasal}U
                            </span>
                          )}
                          {r.medication && (
                            <div className="text-[11px] text-slate-700 font-medium truncate max-w-xs">{r.medication}</div>
                          )}
                          {r.medicationTime && (
                            <div className="text-[10px] text-slate-400 font-mono">Alım Saati: {r.medicationTime}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Food & Carbs */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      {(r.carbs > 0 || r.mealNote || r.mealTime) ? (
                        <div>
                          {r.carbs > 0 && (
                            <span className="text-[11px] font-bold text-slate-800 block">
                              {r.carbs}g Karb
                            </span>
                          )}
                          {r.mealNote && (
                            <div className="text-[11px] text-slate-600 truncate max-w-xs">{r.mealNote}</div>
                          )}
                          {r.mealTime && (
                            <div className="text-[10px] text-slate-400 font-mono">Yemek: {r.mealTime}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Activity, Symptoms & Notes */}
                    <td className="py-3.5 px-4 hidden xl:table-cell">
                      <div className="max-w-xs truncate text-[11px] space-y-0.5">
                        {(r.activity && r.activity !== 'Yok / Dinlenme') && (
                          <div className="text-sky-700 font-semibold truncate flex items-center gap-1">
                            <Dumbbell className="w-3 h-3 inline shrink-0" />
                            {r.activity}
                          </div>
                        )}
                        {r.activityDetails && (
                          <div className="text-slate-600 truncate">{r.activityDetails}</div>
                        )}
                        {r.symptoms && r.symptoms !== 'Normal / İyi' && (
                          <span className="text-amber-700 font-medium block truncate">{r.symptoms}</span>
                        )}
                        {r.notes && <span className="text-slate-500 truncate block">{r.notes}</span>}
                        {!r.activityDetails && (!r.activity || r.activity === 'Yok / Dinlenme') && (!r.symptoms || r.symptoms === 'Normal / İyi') && !r.notes && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(r)}
                          title="Düzenle"
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                              onDelete(r.id);
                            }
                          }}
                          title="Sil"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Sayfa <span className="font-bold">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Önceki
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
