import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  PlusCircle, 
  Calendar, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Bell,
  Volume2,
  X,
  Clock,
  TrendingUp,
  BookOpen,
  FileText,
  Home,
  Sliders,
  Settings,
  Stethoscope
} from 'lucide-react';

import Header from './components/Header';
import StatCards from './components/StatCards';
import ChartsView from './components/ChartsView';
import LogbookTable from './components/LogbookTable';
import HypoAlarmCard from './components/HypoAlarmCard';
import TodayPlanSection from './components/TodayPlanSection';
import DoctorReportSection from './components/DoctorReportSection';
import SettingsSection from './components/SettingsSection';
import GlucoseModal from './components/GlucoseModal';
import DoctorReport from './components/DoctorReport';
import RemindersModal from './components/RemindersModal';
import SettingsModal from './components/SettingsModal';
import InfoGuideModal from './components/InfoGuideModal';
import PWAInstallBanner from './components/PWAInstallBanner';

import { 
  loadInitialData, 
  saveRecords, 
  saveProfile, 
  saveReminders, 
  exportToCSV 
} from './utils/storage';
import { calculateStats, classifyGlucose } from './utils/calculations';
import { generateDemoRecords, triggerHaptic } from './constants';
import { sendDesktopNotification, playNotificationChime } from './utils/notifications';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState({});
  const [reminders, setReminders] = useState([]);
  const [daysFilter, setDaysFilter] = useState(14);

  // Modals state
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('glucose');
  const [modalDefaultTiming, setModalDefaultTiming] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [hypoDismissed, setHypoDismissed] = useState(false);

  // In-App Toast state
  const [activeToast, setActiveToast] = useState(null);
  const lastNotifiedMinuteRef = useRef({});

  // Section refs for smooth scrolling & navigation
  const statSectionRef = useRef(null);
  const chartsSectionRef = useRef(null);
  const logbookSectionRef = useRef(null);
  const reportSectionRef = useRef(null);
  const settingsSectionRef = useRef(null);

  // Active section state for highlighting in bottom nav
  const [activeSection, setActiveSection] = useState('stats');

  // Load data on start
  useEffect(() => {
    const initial = loadInitialData();
    setRecords(initial.records);
    setProfile(initial.profile);
    setReminders(initial.reminders);
    setDataLoaded(true);
  }, []);

  // Periodic reminder checking every 5 seconds (deduplicated by minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      reminders.forEach((r) => {
        if (r.active && r.time === currentTime) {
          if (lastNotifiedMinuteRef.current[r.id] !== currentTime) {
            lastNotifiedMinuteRef.current[r.id] = currentTime;

            // Trigger sound & haptic
            triggerHaptic(50);
            playNotificationChime();

            // Native Desktop / Android Push Notification
            sendDesktopNotification(
              `GlukoDenge Hatırlatıcı (${r.time})`,
              `${r.label} zamanı geldi! Lütfen ölçüm veya ilacınızı kaydedin.`
            );

            // In-App Interactive Toast Banner
            setActiveToast({
              id: r.id,
              label: r.label,
              time: r.time,
              type: r.type,
            });
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [reminders]);

  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">GlukoDenge yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = calculateStats(records, profile.targets, daysFilter);

  // Check latest reading for Hypoglycemia alert (only among actual glucose readings)
  const latestGlucoseRecord = records.find(
    (r) => r.glucose !== null && r.glucose !== undefined && r.glucose !== '' && Number(r.glucose) > 0
  );
  const isHypoActive = latestGlucoseRecord && Number(latestGlucoseRecord.glucose) < (profile.targets?.hypo || 70) && !hypoDismissed;

  // Measurement Handlers
  const handleOpenNewMeasurement = (type = 'glucose', timing = null) => {
    triggerHaptic(20);
    setEditingRecord(null);
    setModalDefaultType(type || 'glucose');
    setModalDefaultTiming(timing || null);
    setIsGlucoseModalOpen(true);
  };

  const handleEditRecord = (rec) => {
    triggerHaptic(15);
    setEditingRecord(rec);
    setIsGlucoseModalOpen(true);
  };

  const handleSaveMeasurement = (record) => {
    let updated;
    if (editingRecord) {
      updated = records.map((r) => (r.id === record.id ? record : r));
    } else {
      updated = [record, ...records];
      
      // Celebrate in-range result with confetti if blood glucose was entered
      if (record.glucose && Number(record.glucose) > 0) {
        const c = classifyGlucose(record.glucose, record.timing, profile.targets);
        if (c && c.status === 'normal') {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10b981', '#14b8a6', '#06b6d4'],
            });
          } catch {}
        }

        // If low, re-activate hypo alert
        if (Number(record.glucose) < (profile.targets?.hypo || 70)) {
          setHypoDismissed(false);
        }
      }
    }

    // Sort descending by timestamp
    updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setRecords(updated);
    saveRecords(updated);
  };

  const handleDeleteRecord = (id) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveRecords(updated);
  };

  // Profile & Settings Handlers
  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleToggleUnit = (newUnit) => {
    triggerHaptic(15);
    const updated = { ...profile, unit: newUnit };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleSaveReminders = (newReminders) => {
    setReminders(newReminders);
    saveReminders(newReminders);
  };

  const handleExportCSV = () => {
    exportToCSV(records, profile.targets, profile.unit);
  };

  const handleLoadDemo = () => {
    const demo = generateDemoRecords();
    setRecords(demo);
    saveRecords(demo);
    setHypoDismissed(false);
  };

  const handleClearAll = () => {
    setRecords([]);
    saveRecords([]);
  };

  const handleImportData = (parsedData) => {
    if (parsedData.records) {
      setRecords(parsedData.records);
      saveRecords(parsedData.records);
    }
    if (parsedData.profile) {
      setProfile(parsedData.profile);
      saveProfile(parsedData.profile);
    }
    if (parsedData.reminders) {
      setReminders(parsedData.reminders);
      saveReminders(parsedData.reminders);
    }
  };

  // Smooth scroll helper for section navigation
  const scrollToSection = (ref, sectionName) => {
    triggerHaptic(15);
    setActiveSection(sectionName);
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative pb-20 sm:pb-0">
      
      {/* Top Full Responsive Navigation Bar */}
      <Header
        profile={profile}
        onNewMeasurement={handleOpenNewMeasurement}
        onOpenReport={() => { triggerHaptic(15); scrollToSection(reportSectionRef, 'report'); }}
        onOpenReminders={() => { triggerHaptic(15); setIsRemindersModalOpen(true); }}
        onOpenSettings={() => { triggerHaptic(15); scrollToSection(settingsSectionRef, 'settings'); }}
        onOpenGuide={() => { triggerHaptic(15); setIsGuideModalOpen(true); }}
        onToggleUnit={handleToggleUnit}
      />

      {/* PWA Android Install Banner */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <PWAInstallBanner />
      </div>

      {/* In-App Floating Toast Reminder Notification */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-400 block">
                  Ölçüm & İlaç Vakti
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {activeToast.label}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Saat: {activeToast.time}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Daha Sonra
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveToast(null);
                handleOpenNewMeasurement('glucose');
              }}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Ölçüm Gir
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Emergency Hypo Card (Conditional) */}
        {isHypoActive && (
          <HypoAlarmCard
            latestRecord={latestGlucoseRecord}
            profile={profile}
            onClose={() => setHypoDismissed(true)}
          />
        )}

        {/* 1. Analytics & Stat Cards (Özet Bölümü) */}
        <div ref={statSectionRef} id="section-stats">
          <StatCards
            stats={stats}
            daysFilter={daysFilter}
            onDaysFilterChange={setDaysFilter}
            profile={profile}
          />
        </div>

        {/* 2. Today's Measurement Plan (Bugünün Ölçüm Planı - Ölçüm Vakti / Durumu Bağlantılı) */}
        <div id="section-today-plan">
          <TodayPlanSection
            records={records}
            profile={profile}
            onSelectSlot={(slotId) => handleOpenNewMeasurement('glucose', slotId)}
            onSelectRecord={handleEditRecord}
          />
        </div>

        {/* 3. Interactive Charts Area (Grafikler Bölümü) */}
        <div ref={chartsSectionRef} id="section-charts">
          <ChartsView
            records={records}
            targets={profile.targets}
            profile={profile}
          />
        </div>

        {/* 3. Logbook / Measurement History (Kayıtlar Bölümü) */}
        <div ref={logbookSectionRef} id="section-logbook">
          <LogbookTable
            records={records}
            targets={profile.targets}
            profile={profile}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
            onExportCSV={handleExportCSV}
            onLoadDemo={handleLoadDemo}
            onClearAll={handleClearAll}
          />
        </div>

        {/* 4. Doctor Report Section (Doktor Raporu Bölümü) */}
        <div ref={reportSectionRef} id="section-report">
          <DoctorReportSection
            records={records}
            profile={profile}
            onOpenDetailedReport={() => setIsReportModalOpen(true)}
          />
        </div>

        {/* 5. Settings & Profile Section (Ayarlar Bölümü) */}
        <div ref={settingsSectionRef} id="section-settings">
          <SettingsSection
            profile={profile}
            onSaveProfile={handleSaveProfile}
            records={records}
            reminders={reminders}
            onImportData={handleImportData}
            onLoadDemo={handleLoadDemo}
            onClearAll={handleClearAll}
            onOpenDetailedModal={() => setIsSettingsModalOpen(true)}
          />
        </div>

      </main>

      {/* Mobile Ergonomic Bottom Navigation Bar (Sticky on phones with all 6 main sections) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-6 h-16 items-center px-1">
          
          {/* 1. Özet */}
          <button
            type="button"
            onClick={() => scrollToSection(statSectionRef, 'stats')}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeSection === 'stats' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5">Özet</span>
          </button>

          {/* 2. Grafik */}
          <button
            type="button"
            onClick={() => scrollToSection(chartsSectionRef, 'charts')}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeSection === 'charts' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5">Grafik</span>
          </button>

          {/* 3. Kayıtlar */}
          <button
            type="button"
            onClick={() => scrollToSection(logbookSectionRef, 'logbook')}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeSection === 'logbook' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5">Kayıtlar</span>
          </button>

          {/* 4. Hatırlatıcı */}
          <button
            type="button"
            onClick={() => { triggerHaptic(15); setIsRemindersModalOpen(true); }}
            className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-teal-700 transition relative"
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-slate-600" />
              {reminders.some((r) => r.active) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full" />
              )}
            </div>
            <span className="text-[9px] font-semibold mt-0.5">Alarm</span>
          </button>

          {/* 5. Doktor Raporu */}
          <button
            type="button"
            onClick={() => scrollToSection(reportSectionRef, 'report')}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeSection === 'report' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-semibold mt-0.5">Rapor</span>
          </button>

          {/* 6. Ayarlar */}
          <button
            type="button"
            onClick={() => scrollToSection(settingsSectionRef, 'settings')}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeSection === 'settings' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5">Ayar</span>
          </button>

        </div>
      </nav>


      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">GlukoDenge Mobil</span>
            <span>&bull;</span>
            <span>Kişisel Kan Şekeri, İlaç & Glukoz Takip Uygulaması</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>ADA Standartları</span>
            <span>&bull;</span>
            <span>Veriler cihazınızda yerel olarak saklanır</span>
          </div>
        </div>
      </footer>

      {/* All Application Modals */}
      <GlucoseModal
        isOpen={isGlucoseModalOpen}
        onClose={() => setIsGlucoseModalOpen(false)}
        onSave={handleSaveMeasurement}
        editingRecord={editingRecord}
        targets={profile.targets}
        profile={profile}
        defaultType={modalDefaultType}
        defaultTiming={modalDefaultTiming}
        onToggleUnit={handleToggleUnit}
      />

      <DoctorReport
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        records={records}
        profile={profile}
      />

      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        reminders={reminders}
        onSaveReminders={handleSaveReminders}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        records={records}
        reminders={reminders}
        onImportData={handleImportData}
        onClearAll={handleClearAll}
      />

      <InfoGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
