import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { triggerHaptic } from '../constants';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    triggerHaptic(25);
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="mx-4 my-2 p-3 bg-gradient-to-r from-teal-800 to-teal-700 text-white rounded-2xl shadow-md flex items-center justify-between border border-teal-600/50 animate-slide-up">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-teal-200" />
        </div>
        <div>
          <h4 className="text-xs font-bold leading-tight">GlukoDenge'yi Telefona Yükle</h4>
          <p className="text-[10px] text-teal-200/90 leading-tight">
            Ana ekrana ekleyip internetsiz kullanın
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={handleInstall}
          className="touch-active px-3 py-1.5 bg-white text-teal-800 font-extrabold text-[11px] rounded-xl shadow-xs"
        >
          Yükle
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-teal-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
