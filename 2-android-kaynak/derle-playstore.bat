@echo off
chcp 65001 >nul
echo ========================================================
echo   GlukoDenge - Google Play Store & APK Derleme Aracı
echo ========================================================
echo.

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"

echo [1/4] Web arayüzü derleniyor (Vite build)...
call npm.cmd run build
if %ERRORLEVEL% neq 0 (
    echo [HATA] Web derleme basarisiz oldu!
    pause
    exit /b %ERRORLEVEL%
)

echo [2/4] Capacitor Android varliklari senkronize ediliyor...
call npx.cmd cap sync android
if %ERRORLEVEL% neq 0 (
    echo [HATA] Capacitor senkronizasyonu basarisiz oldu!
    pause
    exit /b %ERRORLEVEL%
)

echo [3/4] Google Play Store paketi (.aab) ve APK derleniyor...
cd android
call gradlew.bat bundleRelease assembleRelease
if %ERRORLEVEL% neq 0 (
    echo [HATA] Android Gradle derlemesi basarisiz oldu!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo [4/4] Cikis paketleri kopyalaniyor...
if not exist "cikis-paketleri" mkdir "cikis-paketleri"
copy /y "android\app\build\outputs\bundle\release\app-release.aab" "cikis-paketleri\GlukoDenge-v1.0.0-PlayStore.aab" >nul
copy /y "android\app\build\outputs\apk\release\app-release.apk" "cikis-paketleri\GlukoDenge-v1.0.0-Yukleme.apk" >nul

echo.
echo ========================================================
echo   TEBRIKLER! Derleme basariyla tamamlandi.
echo.
echo   1) Play Store Yükleme Paketi:
echo      cikis-paketleri\GlukoDenge-v1.0.0-PlayStore.aab
echo.
echo   2) Telefon Dogrudan Kurulum Paketi (APK):
echo      cikis-paketleri\GlukoDenge-v1.0.0-Yukleme.apk
echo ========================================================
echo.
pause
