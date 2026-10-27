import React from 'react';
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Settings 
} from 'lucide-react';
import { triggerHaptic } from '../constants';

export default function BottomNavBar({ activeTab, onChangeTab }) {
  const tabs = [
    { id: 'today', label: 'Bugün', icon: Home },
    { id: 'logbook', label: 'Kayıtlar', icon: BookOpen },
    { id: 'charts', label: 'Grafik', icon: TrendingUp },
    { id: 'report', label: 'Rapor', icon: FileText },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleSelect = (id) => {
    triggerHaptic(15);
    onChangeTab(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`touch-active relative flex flex-col items-center justify-center h-full w-full transition-colors ${
                isActive ? 'text-teal-600 font-semibold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-8 h-1 bg-teal-600 rounded-full animate-fade-in" />
              )}
              <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-110 text-teal-600' : ''}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.9} />
              </div>
              <span className="text-[10px] leading-tight mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
