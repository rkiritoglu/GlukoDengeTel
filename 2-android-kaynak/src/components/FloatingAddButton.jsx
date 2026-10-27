import React from 'react';
import { Plus } from 'lucide-react';
import { triggerHaptic } from '../constants';

export default function FloatingAddButton({ onClick }) {
  const handleClick = () => {
    triggerHaptic(25);
    onClick();
  };

  return (
    <div className="fixed bottom-20 right-4 z-20 pointer-events-auto">
      <button
        onClick={handleClick}
        className="touch-active group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-teal-600 to-teal-500 text-white shadow-[0_8px_25px_rgba(13,148,136,0.45)] hover:shadow-[0_10px_30px_rgba(13,148,136,0.6)] active:scale-95 transition-all focus:outline-none"
        aria-label="Yeni Ölçüm Ekle"
      >
        {/* Subtle breathing glow */}
        <span className="absolute -inset-1 rounded-full bg-teal-400 opacity-30 blur-sm group-hover:opacity-50 animate-pulse pointer-events-none" />
        
        <Plus className="w-7 h-7 stroke-[2.6] transition-transform group-hover:rotate-90 duration-200" />
      </button>
    </div>
  );
}
