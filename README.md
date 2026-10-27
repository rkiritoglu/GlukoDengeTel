# 🩸 GlukoDenge - Android Mobil Kan Şekeri & Diyabet Takip Sistemi

**GlukoDenge**, diyabet hastalarının kan şekeri, insülin dozu, besin (karbonhidrat), fiziksel aktivite (spor) ve sağlık belirtilerini zahmetsizce kaydedip analiz edebilecekleri, **çevrimdışı (internetsiz)** çalışabilen tam teşekküllü bir mobil sağlık uygulamasıdır.

Bu GitHub deposu, projenin ilk web prototiplerinden Google Play Store için derlenen resmi Android paketlerine kadar **tüm aşamalarını** eksiksiz ve şeffaf bir biçimde içermektedir.

---

## 🌟 Öne Çıkan Özellikler

- 🌐 **Çok Dilli Destek (Multilingual):** Cihazın sistem dilini otomatik algılama (Türkçe 🇹🇷, English 🇬🇧, Deutsch 🇩🇪, Français 🇫🇷, Español 🇪🇸, العربية 🇸🇦, Русский 🇷🇺) ve alt gezinme çubuğundan anında isteğe bağlı dil değiştirme.
- 🩸 **Kapsamlı Veri Girişi:** Kan şekeri, bolus/bazal insülin, ağızdan ilaç, yemek & karbonhidrat (g), spor & egzersiz süresi, belirti ve notlar.
- 🚨 **Akıllı Hipoglisemi Uyarısı (15-15 Kuralı):** 70 mg/dL altındaki ölçümlerde otomatik açılan yüksek kontrastlı acil durum kartı ve rehberlik.
- 📋 **Kategori Bazlı Kayıt Takibi:** Girilen her bilgi, kendi başlığı (🩸 Şeker, 💉 İlaç, 🥗 Besin, 🏃 Spor, 📝 Not) altında net ve düzenli listelenir.
- ✏️ **Kayıt Düzenleme:** Tüm geçmiş kayıtlar tek dokunuşla düzenlenebilir ve anında güncellenir.
- 🩺 **Hekim Muayene Özeti & ADA Standartları:** Tahmini HbA1c, TIR (Hedefte Kalma Oranı), Ortalama Şeker ve son 14 günlük ayrıntılı hekim çizelgesi.
- 💬 **WhatsApp & Rapor Paylaşımı:** Tek tıkla doktora WhatsApp üzerinden rapor gönderme, yerel PDF yazdırma ve Excel (CSV) / JSON yedekleme.
- 📴 **%100 İnternetsiz (Offline) Çalışma:** Hiçbir sunucuya bağımlı değildir; veriler cihazın güvenli yerel hafızasında (`localStorage`) korunur.

---

## 📂 Projenin Gelişim Aşamaları ve Dizin Yapısı

Proje, gelişim kronolojisine ve teknik mimarisine göre 4 ana aşamada düzenlenmiştir:

```text
GlukoDengeTel/
├── README.md                      -> Ana proje tanıtımı ve dokümantasyon (bu dosya)
├── GOOGLE_PLAY_STORE_REHBERI.md   -> Google Play Console adım adım yayınlama rehberi
├── gizlilik-politikasi.html       -> Play Store ve mobil gizlilik politikası sayfası
├── GlukoDenge-Mobil.html          -> Kök dizindeki güncel mobil uygulama (Hızlı erişim)
├── GlukoDenge-v1.0.0.apk          -> Telefona doğrudan yüklenebilir Android APK (3.49 MB)
├── GlukoDenge-v1.0.0-PlayStore.aab-> Google Play Store yükleme paketi AAB (3.35 MB)
│
├── 📁 1-mobil-web/                -> 1. AŞAMA: Tek Dosya Mobil Web Uygulaması & PWA
│   ├── GlukoDenge-Mobil.html      -> Bağımsız, sıfır kurulumlu, çevrimdışı mobil arayüz
│   ├── gizlilik-politikasi.html   -> Resmi gizlilik sözleşmesi
│   └── README.md                  -> Mobil web aşaması detayları
│
├── 📁 2-android-kaynak/           -> 2. AŞAMA: Android Studio & Capacitor Kaynak Kodları
│   ├── android/                   -> Yerel Android Studio projesi (Java, Gradle, Manifest)
│   │   ├── app/src/main/
│   │   │   ├── java/com/rifat/glukodenge/MainActivity.java -> Android Bridge (Native Yazdır & Paylaş)
│   │   │   ├── res/               -> Mobil uygulama simgeleri, splash ve kaynaklar
│   │   │   └── AndroidManifest.xml-> Android sistem izinleri ve paket tanımı
│   │   └── build.gradle           -> Android Gradle derleme yapılandırması
│   ├── capacitor.config.json      -> Capacitor mobil köprü ayarları
│   ├── package.json               -> Bağımlılıklar ve derleme betikleri
│   ├── src/ & public/             -> Modüler React / PWA kaynak bileşenleri
│   └── README.md                  -> Android projesi derleme ve kurulum adımları
│
├── 📁 3-cikis-paketleri/          -> 3. AŞAMA: Hazır Dağıtım Paketleri (APK & AAB)
│   ├── GlukoDenge-v1.0.0.apk      -> Android telefona doğrudan yükleme paketi
│   ├── GlukoDenge-v1.0.0-PlayStore.aab -> Google Play Store resmi dağıtım paketi
│   └── README.md                  -> Telefona yükleme (sideloading) ve mağaza rehberi
│
└── 📁 4-onceki-surumler/          -> 4. AŞAMA: Projenin Tarihçesi ve Erken Sürümleri
    ├── web-prototip/              -> İlk web ve masaüstü prototipi (Seker)
    ├── veri-tabanlari/            -> İlk metin tabanlı yerel veritabanı denemeleri (Web)
    ├── ilk-taslaklar/             -> İlk HTML taslakları ve diyet listesi prototipleri
    └── README.md                  -> Projenin gelişim sürecini anlatan tarihçe
```

---

## 🚀 Hızlı Başlangıç ve Kullanım

### 1. Doğrudan Telefona Yüklemek (APK)
1. [3-cikis-paketleri/GlukoDenge-v1.0.0.apk](file:///c:/Users/user001/Documents/Rifat/ŞekerDurumu/GlukoDengeTel/3-cikis-paketleri/GlukoDenge-v1.0.0.apk) dosyasını telefonunuza indirin veya aktarın.
2. Telefonda dosyaya dokunarak yüklemeyi başlatın *(Bilinmeyen kaynaklara izin ver seçeneğini onaylayın)*.
3. Uygulama telefonunuza kurulacak ve ana ekranınızda ikonu görünecektir.

### 2. Tarayıcıda Sıfır Kurulumla Açmak
- [1-mobil-web/GlukoDenge-Mobil.html](file:///c:/Users/user001/Documents/Rifat/ŞekerDurumu/GlukoDengeTel/1-mobil-web/GlukoDenge-Mobil.html) dosyasını herhangi bir mobil veya masaüstü tarayıcıda çift tıklayarak açabilirsiniz.
- Chrome üzerinde **"Ana Ekrana Ekle"** seçeneğiyle telefonunuza PWA olarak da kurabilirsiniz.

### 3. Android Studio ile Sıfırdan Derlemek
```bash
cd 2-android-kaynak
npm install
npx cap sync android
cd android
./gradlew assembleRelease bundleRelease
```

---

## 🏷️ Sürüm Etiketleri (Git Tags)

Projenin her aşaması Git üzerinde resmi olarak etiketlenmiştir:
- `v1.0.0`: Resmi ilk tam sürüm (APK + AAB + Mobil Web)
- `v1.0.0-mobil-web`: 1. Aşama - Tek dosya bağımsız mobil web sürümü
- `v1.0.0-android`: 2. Aşama - Android kaynak kodları ve yerel köprü
- `v1.0.0-playstore`: 3. Aşama - Google Play Store yayın paketi

---

## 📄 Lisans & Telif Hakkı

© 2026 Rıfat Kırıcıoğlu. Tüm hakları saklıdır. Sağlık verileriniz yalnızca kendi cihazınızda depolanır; hiçbir üçüncü taraf sunucuya iletilmez.
