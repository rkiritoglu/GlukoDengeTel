import React from 'react';
import { 
  X, 
  HelpCircle, 
  Heart, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Info,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function InfoGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0">Diyabet & Kan Şekeri Rehberi</h3>
              <p className="text-xs text-teal-100/90 mt-0.5">Klinik öneriler, hedefler ve acil durum rehberi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Card 1: ADA Target Values */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Hedef Kan Şekeri Değerleri (ADA Standartları)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800 block text-xs">Sabah Açlık & Yemek Öncesi</span>
                <span className="text-lg font-black font-mono text-teal-700">80 - 130 mg/dL</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">(Diyabeti olmayanlarda: 70-99 mg/dL)</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800 block text-xs">Tokluk (Yemekten 2 Saat Sonra)</span>
                <span className="text-lg font-black font-mono text-teal-700">&lt; 180 mg/dL</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">(Diyabeti olmayanlarda: &lt; 140 mg/dL)</span>
              </div>
            </div>
          </div>

          {/* Card 2: 15-15 Rule */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
            <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Hipoglisemi (Düşük Şeker) ve 15-15 Kuralı
            </h4>
            <p className="text-rose-900/90 leading-relaxed">
              Kan şekeriniz <strong>70 mg/dL altına</strong> düştüğünde vücut titreme, soğuk terleme, çarpıntı ve baş dönmesi gibi uyarılar verir.
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-rose-950 font-medium">
              <li><strong>15 Gram Hızlı Karbonhidrat:</strong> 3-4 kesme şeker, 150ml meyve suyu veya 1 tatlı kaşığı bal tüketin. Çikolata veya yağlı besinlerden kaçının (yağ şekerin emilimini geciktirir).</li>
              <li><strong>15 Dakika Bekleyin:</strong> Dinlenin ve sayacı başlatın.</li>
              <li><strong>Tekrar Ölçün:</strong> Değer hâlâ &lt; 70 ise adımı tekrarlayın.</li>
            </ul>
          </div>

          {/* Card 3: HbA1c and TIR */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              HbA1c ve TIR (Time in Range) Nedir?
            </h4>
            <p className="leading-relaxed">
              <strong>HbA1c:</strong> Kırmızı kan hücrelerindeki hemoglobine bağlanan glikoz miktarını ölçer ve son 2-3 aylık ortalama kan şekerinizi yansıtır. Genellikle &lt; %7.0 hedeflenir.
            </p>
            <p className="leading-relaxed">
              <strong>Time in Range (TIR):</strong> Günün yüzde kaçını hedef aralıkta (70-180 mg/dL) geçirdiğinizi gösterir. Uluslararası kılavuzlar TIR oranının en az %70 olmasını hedefler.
            </p>
          </div>

          {/* Card 4: Measuring Technique */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Doğru Kan Şekeri Ölçüm Adımları
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Ellerinizi ılık su ve sabunla yıkayın ve iyice kurulayın (ıslak el kanı seyreltir).</li>
              <li>Alkol mendili kullandıysanız cildin tamamen kurumasını bekleyin.</li>
              <li>Parmağınızın tam ortasından değil, yan kenarlarından delin (daha az acıtır).</li>
              <li>İlk çıkan küçük damlayı pamukla silip ikinci damlayı çubuğa değdirmeniz ölçüm doğruluğunu artırır.</li>
              <li>Stripleri nemden ve aşırı sıcaktan koruyarak kutusunda saklayın.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer transition text-xs shadow-xs"
          >
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
