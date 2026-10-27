import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  PlusCircle, 
  FileText, 
  Bell, 
  Settings, 
  HelpCircle, 
  User, 
  Droplet, 
  ShieldCheck, 
  ChevronDown, 
  Syringe, 
  Utensils, 
  Dumbbell 
} from 'lucide-react';
import { DIABETES_TYPES } from '../constants';

export default function Header({ 
  profile, 
  onNewMeasurement, 
  onOpenReport, 
  onOpenReminders, 
  onOpenSettings, 
  onOpenGuide, 
  onToggleUnit 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const diabetesLabel = DIABETES_TYPES.find((d) => d.id === profile.diabetesType)?.label || 'Diyabet Takibi';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Responsive flex-wrap container: When squeezed horizontally, options drop to next line cleanly */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 min-h-20 py-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight m-0 p-0 whitespace-nowrap">
                  Gluko<span className="text-teal-600">Denge</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200/60 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> ADA Standart
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Akıllı Kan Şekeri, İlaç & Yaşam Tarzı Yönetim Asistanı
              </p>
            </div>
          </div>

          {/* Options & Action Controls: Drops to bottom row smoothly when width is constrained */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Unit Selector Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => onToggleUnit('mg/dL')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  profile.unit === 'mg/dL'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                mg/dL
              </button>
              <button
                type="button"
                onClick={() => onToggleUnit('mmol/L')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  profile.unit === 'mmol/L'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                mmol/L
              </button>
            </div>

            {/* User Quick Info */}
            <div 
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition shrink-0"
              title="Profil Ayarlarını Düzenle"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                {profile.name ? profile.name.charAt(0) : 'U'}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-800 leading-tight">{profile.name}</div>
                <div className="text-slate-500 text-[11px] leading-none mt-0.5">{diabetesLabel}</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenReport}
                title="Hekim Raporu & Yazdır"
                className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-transparent hover:border-teal-200"
              >
                <FileText className="w-4 h-4 text-slate-500 group-hover:text-teal-600" />
                <span className="hidden md:inline">Doktor Raporu</span>
              </button>

              <button
                type="button"
                onClick={onOpenReminders}
                title="Hatırlatıcılar & İlaç Saatleri"
                className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-transparent hover:border-teal-200"
              >
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Hatırlatıcılar</span>
              </button>

              <button
                type="button"
                onClick={onOpenGuide}
                title="Kılavuz & Bilgi Rehberi"
                className="p-2 sm:px-2.5 sm:py-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                title="Ayarlar & Hedef Aralıklar"
                className="p-2 sm:px-2.5 sm:py-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Primary Action Button with Quick Category Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <div className="inline-flex rounded-xl shadow-md shadow-teal-600/20">
                <button
                  type="button"
                  onClick={() => onNewMeasurement('glucose')}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-l-xl flex items-center gap-2 transition cursor-pointer border-r border-teal-500/50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="whitespace-nowrap">Yeni Kayıt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-2 py-2 sm:py-2.5 rounded-r-xl transition cursor-pointer"
                  title="Hızlı Giriş Seçenekleri"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Quick Entry Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onNewMeasurement('glucose'); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 text-slate-700 hover:text-teal-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <span className="font-bold block">Kan Şekeri Ölçümü</span>
                      <span className="text-[10px] text-slate-400">Şeker değeri ve vakti</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onNewMeasurement('insulin'); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 text-slate-700 hover:text-teal-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Syringe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block">İlaç & İnsülin Girişi</span>
                      <span className="text-[10px] text-slate-400">Ölçüm yapmadan ilaç kaydı</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onNewMeasurement('food'); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 text-slate-700 hover:text-teal-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Öğün & Besin Girişi</span>
                      <span className="text-[10px] text-slate-400">Yemek ve karbonhidrat</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onNewMeasurement('activity'); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 text-slate-700 hover:text-teal-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Spor & Aktivite</span>
                      <span className="text-[10px] text-slate-400">Egzersiz ve yürüyüş</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onNewMeasurement('note'); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 text-slate-700 hover:text-teal-800 flex items-center gap-2.5 transition cursor-pointer border-t border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block">Sağlık Notu & Belirti</span>
                      <span className="text-[10px] text-slate-400">Semptom ve serbest not</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
