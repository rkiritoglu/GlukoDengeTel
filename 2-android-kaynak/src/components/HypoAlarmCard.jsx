import React, { useState, useEffect } from 'react';
import { AlertTriangle, Play, Pause, RotateCcw, CheckCircle2, ShieldAlert, HeartPulse } from 'lucide-react';
import { formatDisplayValue } from '../utils/calculations';

export default function HypoAlarmCard({ latestRecord, profile, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60); // 15 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            setTimerFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(15 * 60);
    setTimerFinished(false);
  };

  return (
    <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-red-500/20 mb-8 border border-red-400 relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-md">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Acil Durum Rehberi
                </span>
                <span className="text-xs text-red-100 font-medium">
                  Son Ölçüm: {formatDisplayValue(latestRecord?.glucose, profile?.unit || 'mg/dL')} {profile?.unit || 'mg/dL'}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight mt-0.5">
                Hipoglisemi Uyarısı: 15-15 Kuralı
              </h3>
            </div>
          </div>

          {/* 15 Minute Timer Widget */}
          <div className="bg-red-950/40 backdrop-blur-md rounded-xl p-3 px-4 flex items-center gap-4 border border-white/15">
            <div className="text-center">
              <div className="text-xs text-red-200 font-medium">15 Dk Kontrol Sayacı</div>
              <div className="text-2xl font-black font-mono tracking-widest text-white">
                {formattedTime}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={() => setIsRunning(true)}
                  className="bg-white text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Başlat
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRunning(false)}
                  className="bg-amber-400 text-amber-950 hover:bg-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" /> Duraklat
                </button>
              )}
              <button
                type="button"
                onClick={resetTimer}
                title="Sıfırla"
                className="bg-white/15 hover:bg-white/25 text-white p-1.5 rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {timerFinished && (
          <div className="mt-4 p-3 bg-emerald-500/90 rounded-xl flex items-center gap-3 text-white border border-emerald-300 shadow">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="text-sm font-semibold">
              15 dakika doldu! Lütfen kan şekerinizi hemen tekrar ölçün ve aşağıdaki butondan yeni ölçümü kaydedin.
            </div>
          </div>
        )}

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-sm text-red-100 mb-1">
              <span className="w-5 h-5 rounded-full bg-white text-red-600 flex items-center justify-center text-xs">1</span>
              15g Hızlı Karbonhidrat Alın
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              3-4 adet kesme şeker, 1 çay bardağı meyve suyu veya 1 tatlı kaşığı bal/reçel tüketin. Yağlı gıdalar (çikolata) şekeri yavaş yükseltir, tercih etmeyin.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-sm text-red-100 mb-1">
              <span className="w-5 h-5 rounded-full bg-white text-red-600 flex items-center justify-center text-xs">2</span>
              15 Dakika Dinlenin & Bekleyin
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              Yukarıdaki sayacı başlatın, oturup dinlenin. Hareket etmek kan şekerinizin daha da düşmesine sebep olabilir.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-sm text-red-100 mb-1">
              <span className="w-5 h-5 rounded-full bg-white text-red-600 flex items-center justify-center text-xs">3</span>
              Tekrar Ölçün & Stabilize Edin
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              15 dk sonra değer hâlâ 70'in altındaysa adımı tekrarlayın. Düzelmişse bir sonraki öğüne kadar küçük bir parça peynir veya ekmek alın.
            </p>
          </div>
        </div>

        {onClose && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-white/80 hover:text-white underline cursor-pointer"
            >
              Uygulamayı anladım, uyarıyı kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
