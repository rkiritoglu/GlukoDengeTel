@echo off
title GlukoDenge Mobil - Android Sunucusu
cls
echo ==============================================================
echo    GlukoDenge Mobil - Android Telefon Erisim Sunucusu
echo ==============================================================
echo.
echo  Android telefonunuzun Chrome tarayicisindan su adresi acin:
echo.
echo         http://192.168.1.102:5173
echo.
echo  [!] Onemli Notlar:
echo   1. Telefonunuz ile bilgisayariniz ayni Wi-Fi aginda olmalidir.
echo   2. Sayfa acilinca Chrome'un sag ustteki uc noktasina (⋮) basin.
echo   3. "Ana Ekrana Ekle" veya "Uygulamayi Yukle" secin.
echo.
echo ==============================================================
echo  Sunucu baslatiliyor, lutfen bu pencereyi acik tutun...
echo ==============================================================
echo.
call npm.cmd run dev -- --host
pause
