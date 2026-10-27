import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, PhoneCall, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { triggerHaptic } from '../constants';
import { formatDisplayValue } from '../utils/calculations';

export default function HypoEmergencyCard({ latestRecord, profile, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60); // 15 mins
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      triggerHaptic(50);
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('15 Dakika Doldu!', {
            body: 'Lütfen kan şekerinizi tekrar ölçün.',
          });
        }
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCallEmergency = () => {
    triggerHaptic(30);
    const tel = profile.emergencyContact || profile.doctorPhone || '112';
    window.location.href = `tel:${tel}`;
  };

  const handleRestartTimer = () => {
    triggerHaptic(15);
    setSecondsLeft(15 * 60);
    setIsTimerRunning(true);
  };

  return (
    <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl p-4 shadow-lg mb-4 border border-rose-400/40 relative overflow-hidden animate-pulse-slow">
      {/* Background wave accent */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur">
            <AlertTriangle className="w-6 h-6 text-yellow-200 animate-bounce" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
              Acil Durum Uyarısı
            </span>
            <h3 className="text-base font-extrabold leading-tight">
              Hipoglisemi: {formatDisplayValue(latestRecord?.glucose, profile.unit || 'mg/dL')} {profile.unit || 'mg/dL'}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Rule text */}
      <div className="mt-3 bg-black/15 rounded-xl p-3 text-xs leading-relaxed border border-white/10">
        <p className="font-semibold text-rose-100 flex items-center space-x-1 mb-1">
          <span>⚡</span>
          <span>15 - 15 Kuralı (Hemen Uygulayın):</span>
        </p>
        <p className="text-white/95">
          1. <strong>15 gram hızlı şeker</strong> alın (3-4 kesme şeker veya 150ml meyve suyu).
          <br />
          2. <strong>15 dakika</strong> dinlenin ve aşağıdaki sayaç bitince tekrar ölçün.
        </p>
      </div>

      {/* 15 Min Live Timer & Emergency Call Bar */}
      <div className="mt-3 flex items-center justify-between bg-white/20 backdrop-blur rounded-xl px-3 py-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-xs font-medium text-rose-100">Tekrar Ölçüm:</span>
          <span className="font-mono text-sm font-extrabold text-white tracking-wider">
            {timerStr}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleRestartTimer}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
            title="Sayacı Yeniden Başlat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCallEmergency}
            className="touch-active px-2.5 py-1 rounded-lg bg-white text-rose-700 font-bold text-xs flex items-center space-x-1 shadow"
          >
            <PhoneCall className="w-3 h-3 text-rose-700" />
            <span>Ara</span>
          </button>
        </div>
      </div>
    </div>
  );
}
