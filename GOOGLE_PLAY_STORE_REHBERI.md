# 🚀 Google Play Store Dağıtım & Yayınlama Rehberi

Bu rehber, **GlukoDenge** uygulamasının Google Play Store'a yüklenmeye hazır **`.aab` (Android App Bundle)** ve doğrudan telefona kurulabilir **`.apk`** paketlerinin detaylarını ve Play Store yayınlama adımlarını içerir.

---

## 📦 Hazır Çıktı Dosyaları (Hazır ve İmzalı)

Uygulamanız başarıyla derlenmiş, 27 yıllık resmi sürüm anahtarı (*Keystore*) ile imzalanmış ve dağıtıma hazır hale getirilmiştir:

| Dosya | Konum | Boyut | Kullanım Amacı |
| :--- | :--- | :--- | :--- |
| **`GlukoDenge-v1.0.0-PlayStore.aab`** | `cikis-paketleri/` | ~3.2 MB | **Google Play Console'a yüklenecek resmi dağıtım paketi** |
| **`GlukoDenge-v1.0.0-Yukleme.apk`** | `cikis-paketleri/` | ~3.3 MB | Kendi telefonunuza veya test edenlere doğrudan gönderebileceğiniz imzalı APK |

> [!TIP]
> Gelecekte kodlarda veya tasarımda değişiklik yaptığınızda, projenin ana dizinindeki **`derle-playstore.bat`** dosyasına çift tıklamanız yeterlidir. Tüm web ve mobil dosyaları otomatik derlenip bu klasöre güncellenir.

---

## 🔐 İmza ve Anahtar Bilgileri (Keystore)

Google Play Store ve Android güncellemeleri için oluşturulan imza anahtarı:
- **Dosya Konumu:** `android/app/glukodenge-release-key.jks`
- **Konfigürasyon Dosyası:** `android/keystore.properties`
- **Key Alias:** `glukodenge`
- **Store & Key Şifresi:** `GlukoDenge2026Play!`
- **Geçerlilik Süresi:** 10.000 Gün (~27 yıl)

> [!IMPORTANT]
> `glukodenge-release-key.jks` dosyasını asla silmeyin ve güvenli bir yerde yedekleyin. Google Play Store'a ileride güncelleme gönderirken bu anahtar kullanılır.

---

## 🌍 Başka İnsanların Telefonlarında Nasıl Çalışır?

- Uygulama **Capacitor Native Android** mimarisindedir. Tüm arayüz ve mantık kodları uygulamanın içine gömülüdür (`assets/public`).
- **Kendi bilgisayarınızın açık olmasına veya Wi-Fi ağına kesinlikle ihtiyaç yoktur.**
- Kullanıcı Google Play Store'dan indirdiğinde, uygulama doğrudan kullanıcının telefonunda bağımsız çalışır.
- Tüm veriler yerel hafızada (*Local Storage / SQLite*) güvenle tutulur; internetsiz (uçak modunda, hastanede) dahi %100 çalışır.

---

## 📝 Google Play Console'a Yükleme Adımları

### 1. Google Play Console Hesabı Açma
1. [Google Play Console](https://play.google.com/console) sayfasına gidin.
2. Google hesabınızla oturum açın (Geliştirici hesabı için 25$ tek seferlik kayıt ücreti bulunur).
3. Sağ üstteki **"Uygulama Oluştur"** (Create App) butonuna tıklayın:
   - **Uygulama Adı:** `GlukoDenge - Kan Şekeri & Diyabet Takip`
   - **Varsayılan Dil:** `Türkçe (tr-TR)`
   - **Tür:** `Uygulama (App)`
   - **Ücretsiz/Ücretli:** `Ücretsiz (Free)`
   - Kullanım şartlarını işaretleyip oluşturun.

---

### 2. Uygulama İçeriği ve Sağlık Beyanları (Politika Kontrol Listesi)

Google Play, sağlık kategorisindeki uygulamalar için sol menüdeki **"Uygulama İçeriği" (App Content)** kısmındaki şu formları doldurmanızı ister:

1. **Gizlilik Politikası (Privacy Policy):**
   - Projenizde bulunan [`gizlilik-politikasi.html`](file:///c:/Users/user001/Documents/Rifat/ŞekerDurumu/GeminiŞeker/TestTel/gizlilik-politikasi.html) dosyasını herhangi bir ücretsiz alana (örn. GitHub Pages, kişisel web sitesi veya Notion/Google Docs açık link) yükleyip linkini girin.
   - *Not: Politikada sağlık verilerinin hiçbir yere gönderilmediği, yalnızca cihazda kaldığı açıkça belirtilmiştir.*
2. **Hedef Kitle ve İçerik:**
   - 18 yaş ve üzeri (Yetişkinler).
3. **Sağlık Uygulaması Beyanı (Health Apps Declaration):**
   - Bu uygulamanın bir tıbbi tanı/tedavi cihazı olmadığını, kişisel veri takip ve hekimle paylaşım amaçlı bir kayıt asistanı olduğunu seçin.
4. **Reklamlar:**
   - "Hayır, uygulamamda reklam yok" (No ads).
5. **Uygulama Erişimi (App Access):**
   - "Tüm işlevler herhangi bir kimlik doğrulaması olmadan kullanılabilir" (Kullanıcı adı/şifre gerekmez).
6. **Veri Güvenliği (Data Safety):**
   - "Uygulama veri topluyor mu?": **Hayır** (Tüm veriler cihaz üzerinde yerel olarak tutulur, üçüncü taraf sunuculara aktarılmaz).

---

### 3. Mağaza Girişi Detayları (Store Listing)

- **Uygulama Adı:** GlukoDenge - Kan Şekeri & Diyabet Takip
- **Kısa Açıklama (80 karakter):**  
  *Hızlı, hekim standartlarına uyumlu akıllı kan şekeri ve diyabet yönetim asistanı.*
- **Tam Açıklama:**  
  *GlukoDenge, diyabetli bireyler ve kan şekerini düzenli takip etmek isteyenler için tasarlanmış modern, güvenli ve kullanımı kolay bir sağlık günlüğüdür.*  
  *Öne çıkan özellikler:*  
  • Açlık, tokluk ve gece ölçümlerini pratik kaydetme  
  • ADA (Amerikan Diyabet Cemiyeti) standartlarında tahmini HbA1c ve TIR (Hedef Aralıkta Kalma) analizi  
  • Renkli trend grafikleri ve durum istatistikleri  
  • 15-15 Hipoglisemi Kuralı: Acil şeker düşüşü durumunda sesli ve görsel zamanlayıcı  
  • Tek tıkla WhatsApp veya e-posta ile hekiminize detaylı rapor gönderme  
  • %100 Çevrimdışı ve Gizli: Tüm veriler yalnızca sizin cihazınızda kalır, internet gerekmez.
- **Grafik Varlıkları:**
  - Uygulama ikonu (512x512 PNG)
  - Özellik grafiği (Feature Graphic - 1024x500 PNG/JPG)
  - Telefon ekran görüntüleri (en az 2 adet)

---

### 4. Sürüm Oluşturma ve Yayına Alma (Production Release)

1. Google Play Console sol menüsünden **Sürüm > Üretim (Production)** sekmesine tıklayın.
2. Sağ üstten **"Yeni Sürüm Oluştur" (Create new release)** butonuna basın.
3. **Uygulama Paketleri (App Bundles)** alanına şu dosyayı sürükleyip bırakın:
   ```text
   C:\Users\user001\Documents\Rifat\ŞekerDurumu\GeminiŞeker\TestTel\cikis-paketleri\GlukoDenge-v1.0.0-PlayStore.aab
   ```
4. **Sürüm Adı:** `1.0.0` (otomatik tanınacaktır).
5. **Sürüm Notu (Release Notes):**  
   *GlukoDenge ilk resmi sürüm: Kan şekeri takibi, HbA1c tahmini, 15-15 hipoglisemi acil rehberi ve hekim paylaşımı özellikleri.*
6. **Kaydet > Sürümü İncele > Üretim Kanalına Sunmayı Başlat (Start rollout to Production)** butonuna tıklayın.

---

### 5. Google İnceleme Süreci

Google ekibi genellikle 1 ila 3 iş günü içinde uygulamayı inceler ve onaylar. Onaylandığı andan itibaren tüm dünyada Google Play Store üzerinden indirilebilir hale gelir.
