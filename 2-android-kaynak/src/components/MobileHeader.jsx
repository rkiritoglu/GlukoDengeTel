import React from 'react';
import { HeartPulse, PlusCircle, ArrowLeftRight } from 'lucide-react';
import { triggerHaptic } from '../constants';

export default function MobileHeader({ profile, onToggleUnit, onNewMeasurement }) {
  const currentUnit = profile.unit || 'mg/dL';

  const handleUnitClick = () => {
    triggerHaptic(15);
    onToggleUnit(currentUnit === 'mg/dL' ? 'mmol/L' : 'mg/dL');
  };

  const handleAddMeasurement = () => {
    triggerHaptic(20);
    if (onNewMeasurement) {
      onNewMeasurement('glucose');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-teal-700 text-white shadow-md pt-safe">
      {/* Responsive flex-wrap container: When squeezed horizontally, controls drop to next row cleanly */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        
        {/* App Title & Logo */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
            <HeartPulse className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold tracking-tight leading-tight">GlukoDenge</h1>
              <span className="text-[10px] font-semibold bg-teal-500/40 text-teal-100 px-1.5 py-0.5 rounded-full border border-teal-400/30">
                Mobil
              </span>
            </div>
            <p className="text-[11px] text-teal-100/80 font-medium truncate max-w-[170px]">
              {profile.name || 'Hasta Profili'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Unit Switcher */}
          <button
            onClick={handleUnitClick}
            className="touch-active px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-800/80 hover:bg-teal-800 border border-teal-600/60 text-teal-100 flex items-center space-x-1 shadow-sm"
            title="Birim Değiştir (mg/dL <-> mmol/L)"
          >
            <ArrowLeftRight className="w-3 h-3 text-teal-300" />
            <span>{currentUnit}</span>
          </button>

          {/* Yeni Kayıt Ekle Butonu */}
          <button
            onClick={handleAddMeasurement}
            className="touch-active px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-800/80 hover:bg-teal-800 border border-teal-600/60 text-teal-100 flex items-center space-x-1 shadow-sm transition"
            title="Yeni Kayıt Ekle"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-300" />
            <span>Yeni Kayıt</span>
          </button>
        </div>

      </div>
    </header>
  );
}
