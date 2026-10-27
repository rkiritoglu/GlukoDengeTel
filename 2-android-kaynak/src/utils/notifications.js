/**
 * Audio Chime using Web Audio API (Synthesizes a gentle two-tone chime)
 */
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (D5 - 587 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('AudioContext not allowed or not supported:', e);
  }
};

/**
 * Sends a native browser / mobile notification with chime and vibration
 */
export const sendDesktopNotification = async (title, body, options = {}) => {
  // Always trigger sound chime and haptic vibration
  playNotificationChime();
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch {}
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      supported: false,
      permission: 'unsupported',
      message: 'Cihazınız sistem bildirimlerini desteklemiyor.',
    };
  }

  let permission = Notification.permission;

  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      console.error('Notification permission request error:', e);
    }
  }

  if (permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        silent: false,
        requireInteraction: false,
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return {
        supported: true,
        permission: 'granted',
        message: 'Bildirim başarıyla gönderildi!',
      };
    } catch (err) {
      console.error('Notification constructor error:', err);
      return {
        supported: true,
        permission: 'granted',
        message: 'Bildirim oluşturulurken hata oluştu: ' + err.message,
      };
    }
  } else if (permission === 'denied') {
    return {
      supported: true,
      permission: 'denied',
      message: 'Bildirim izinleri engellenmiş. Tarayıcı veya uygulama ayarlarından izin veriniz.',
    };
  }

  return {
    supported: true,
    permission: 'default',
    message: 'Bildirim izni onaylanmadı.',
  };
};
