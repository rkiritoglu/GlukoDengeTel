# 🤖 2. Aşama: Android Kaynak Kodları & Capacitor Mimarisi

Bu klasör, GlukoDenge web uygulamasını yerel bir Android uygulamasına (APK ve Google Play AAB) dönüştüren **tam Android Studio ve Capacitor kaynak projesidir**.

## 🏗️ Mimari ve Bileşenler
- **`android/`**: Resmi Android Studio projesi.
  - `app/src/main/java/com/rifat/glukodenge/MainActivity.java`: Android WebView ile yerel Android API'leri arasındaki köprü (`AndroidBridge`). Yerel yazdırma (`PrintManager`) ve dosya paylaşımını (`FileProvider`) yönetir.
  - `app/src/main/res/`: Uygulama ikonları, adaptive simgeler ve tema ayarları.
  - `app/src/main/AndroidManifest.xml`: Uygulama izinleri ve dosya sağlayıcı konfigürasyonu.
- **`capacitor.config.json`**: Capacitor mobil yapılandırma dosyası (`com.rifat.glukodenge`).
- **`package.json`**: Gerekli npm paketleri ve derleme komutları.
- **`src/` & `public/`**: Modüler React bileşenleri, PWA servis işçisi (`sw.js`) ve web manifesti.

## 🔨 Derleme Adımları
```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Web varlıklarını Android projesine senkronize edin
npx cap sync android

# 3. Android paketlerini derleyin
cd android
./gradlew assembleRelease bundleRelease
```
Derleme sonucunda `app-release.apk` ve `app-release.aab` paketleri üretilir.
