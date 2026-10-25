'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function PwaManager() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationStatusMsg, setNotificationStatusMsg] = useState('');
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  
  // viewState can be: 'pill' (initial 10s compact banner), 'minimized' (compact floating circle icon), or 'panel' (expanded card)
  const [viewState, setViewState] = useState('pill');

  // Translations dictionary for PWA features
  const labels = {
    en: {
      installApp: 'Install Anna Seva App',
      installBtn: 'Install Now',
      installed: 'App Installed',
      alertsTitle: 'Surplus Food Push Alerts',
      alertsDesc: 'Get immediate notifications when fresh food is listed in your area.',
      enableAlerts: '🔔 Enable Push Alerts',
      alertsActive: '✓ Alerts Active',
      testAlert: '⚡ Test Alert Now',
      testing: 'Sending Alert...',
      iosTitle: 'Install on iPhone / iPad',
      iosStep: '1. Tap the Share button in Safari (icon at bottom) ➔ 2. Select "Add to Home Screen".',
      close: 'Close',
      dismiss: 'Dismiss',
      appReady: 'Anna Seva Mobile App',
      appPill: 'Anna Seva App'
    },
    mr: {
      installApp: 'अन्न सेवा ॲप इन्स्टॉल करा',
      installBtn: 'आता इन्स्टॉल करा',
      installed: 'ॲप इन्स्टॉल केले',
      alertsTitle: 'तातडीचे अन्न बचाव अलर्ट्स',
      alertsDesc: 'आपल्या परिसरात ताजे अन्न उपलब्ध होताच त्वरित मोबाईलवर सूचना मिळवा.',
      enableAlerts: '🔔 अलर्ट्स सुरू करा',
      alertsActive: '✓ नोटिफिकेशन्स सुरू आहेत',
      testAlert: '⚡ टेस्ट अलर्ट पाठवा',
      testing: 'अलर्ट पाठवत आहे...',
      iosTitle: 'iPhone / iPad वर इन्स्टॉल करा',
      iosStep: '१. Safari मध्ये खालील शेअर बटण दाबा ➔ २. "Add to Home Screen" निवडा.',
      close: 'बंद करा',
      dismiss: 'लपवा',
      appReady: 'अन्न सेवा मोबाईल ॲप',
      appPill: 'अन्न सेवा ॲप'
    },
    hi: {
      installApp: 'अन्न सेवा ऐप इंस्टॉल करें',
      installBtn: 'अभी इंस्टॉल करें',
      installed: 'ऐप इंस्टॉल किया गया',
      alertsTitle: 'अतिरिक्त भोजन पुश अलर्ट',
      alertsDesc: 'अपने क्षेत्र में भोजन उपलब्ध होते ही तुरंत मोबाइल पर सूचना प्राप्त करें।',
      enableAlerts: '🔔 अलर्ट चालू करें',
      alertsActive: '✓ नोटिफिकेशन्स चालू हैं',
      testAlert: '⚡ टेस्ट अलर्ट भेजें',
      testing: 'अलर्ट भेज रहा है...',
      iosTitle: 'iPhone / iPad पर इंस्टॉल करें',
      iosStep: '१. Safari में नीचे शेयर बटन दबाएं ➔ २. "Add to Home Screen" चुनें।',
      close: 'बंद करें',
      dismiss: 'छुपाएं',
      appReady: 'अन्न सेवा मोबाइल ऐप',
      appPill: 'अन्न सेवा ऐप'
    }
  };

  const t = labels[language] || labels.en;

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[Anna Seva PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Anna Seva PWA] Service Worker registration failed:', err);
        });

      // Check current Notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }

    // 2. Check standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowWidget(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show widget shortly after page load
    const timer = setTimeout(() => {
      setShowWidget(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  // Make visible only for 10 seconds, then automatically minimize
  useEffect(() => {
    if (showWidget && viewState === 'pill') {
      const autoMinimizeTimer = setTimeout(() => {
        setViewState('minimized');
      }, 10000); // 10 seconds

      return () => clearTimeout(autoMinimizeTimer);
    }
  }, [showWidget, viewState]);

  // Handle native install prompt
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosPrompt(true);
    }
  };

  // Enable Push Notifications
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationStatusMsg('Notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setNotificationStatusMsg('✓ Notifications enabled successfully!');

        // Dispatch test alert immediately via Service Worker
        sendTestNotification();

        // Register subscription with backend
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription: sub, city: 'Latur', role: 'public' })
            }).catch(() => {});
          }
        }
      } else {
        setNotificationStatusMsg('Notifications permission denied.');
      }
    } catch (err) {
      console.error('Permission request error:', err);
    }
  };

  // Trigger test notification
  const sendTestNotification = async () => {
    if (!('serviceWorker' in navigator)) return;
    setIsTestingPush(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const title = language === 'mr'
        ? '🚨 अन्न सेवा — नवीन अन्न उपलब्धता!'
        : (language === 'hi' ? '🚨 अन्न सेवा — नया भोजन उपलब्ध!' : '🚨 Anna Seva — New Food Listing Alert!');

      const body = language === 'mr'
        ? '५०+ ताजे जेवण लातूर भागात उपलब्ध झाले आहे. वाटपासाठी त्वरित दावा करा.'
        : (language === 'hi' ? '५०+ ताजा भोजन लातूर में उपलब्ध है। तुरंत दावा करें।' : '50+ fresh meal portions listed in Latur. Tap to view and claim.');

      if (reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/icon.png',
          badge: '/icon-192.png',
          tag: 'anna-seva-test-alert',
          renotify: true,
          vibrate: [200, 100, 200, 100, 200],
          data: { url: '/available-food' },
          actions: [
            { action: 'view_food', title: '🍲 अन्न यादी पहा' },
            { action: 'close', title: '✕ बंद करा' }
          ]
        });
      }
      setNotificationStatusMsg('✓ Test notification delivered to your device!');
    } catch (err) {
      console.error('Test notification failed:', err);
    } finally {
      setIsTestingPush(false);
    }
  };

  if (!showWidget) return null;

  return (
    <>
      {/* Floating PWA Launcher (Pill / Minimized Circle / Compact Panel) */}
      <div
        className="pwa-launcher animate-fade-in"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 9999,
          fontFamily: 'var(--font-body, system-ui, sans-serif)'
        }}
      >
        {viewState === 'minimized' ? (
          /* State 1: Minimized Sleek Floating Button */
          <button
            type="button"
            onClick={() => setViewState('panel')}
            aria-label={t.appReady}
            title={t.appReady}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#090e1a',
              border: '1.5px solid rgba(13, 148, 136, 0.5)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3), 0 0 10px rgba(13, 148, 136, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.15rem',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.borderColor = 'var(--accent-teal, #0d9488)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.5)';
            }}
          >
            <span style={{ lineHeight: 1 }}>📱</span>
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '1.5px solid #090e1a',
                boxShadow: '0 0 6px #10b981'
              }}
            />
          </button>
        ) : viewState === 'pill' ? (
          /* State 2: Small Popup Pill (Visible for 10s, then auto-minimizes) */
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#090e1a',
              color: '#ffffff',
              padding: '0.38rem 0.75rem',
              borderRadius: '999px',
              border: '1.5px solid rgba(13, 148, 136, 0.45)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 10px rgba(13, 148, 136, 0.25)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.25s ease'
            }}
          >
            <button
              type="button"
              onClick={() => setViewState('panel')}
              aria-label="Open PWA App & Alerts Panel"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  flexShrink: 0
                }}
              />
              <span>📱 {isInstalled ? t.alertsTitle : t.appPill}</span>
            </button>

            {/* Quick Minimize Button on Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewState('minimized');
              }}
              aria-label="Minimize"
              title="Minimize"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                color: '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.65rem',
                padding: 0,
                marginLeft: '0.25rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          /* State 3: Compact Panel */
          <div
            style={{
              width: '290px',
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 16px 36px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.9)',
              padding: '1.1rem',
              border: '1.5px solid rgba(13, 148, 136, 0.25)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <img
                  src="/icon.png"
                  alt="Anna Seva"
                  style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1.5px solid var(--accent-teal)' }}
                />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                  अन्न सेवा (PWA)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewState('minimized')}
                aria-label="Minimize"
                title="Minimize"
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            {/* Install Section */}
            {!isInstalled && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
                borderRadius: '10px',
                padding: '0.75rem',
                border: '1px solid rgba(13, 148, 136, 0.2)',
                marginBottom: '0.75rem'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-teal-dark)', marginBottom: '0.2rem' }}>
                  📱 {t.installApp}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.6rem', lineHeight: '1.35' }}>
                  {language === 'mr' ? 'अॅप डाऊनलोड न करता थेट मोबाईल स्क्रीनवर वापरा.' : 'Install directly to your home screen for quick access.'}
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--accent-teal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  ⚡ {t.installBtn}
                </button>
              </div>
            )}

            {/* Push Notifications Section */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.2rem' }}>
                🔔 {t.alertsTitle}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.6rem', lineHeight: '1.35' }}>
                {t.alertsDesc}
              </div>

              {notificationPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #090e1a, #1e293b)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(15, 23, 42, 0.15)'
                  }}
                >
                  {t.enableAlerts}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    {t.alertsActive}
                  </div>
                  <button
                    type="button"
                    onClick={sendTestNotification}
                    disabled={isTestingPush}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: 'var(--accent-teal-dark)',
                      border: '1px solid var(--accent-teal)',
                      borderRadius: '6px',
                      padding: '0.35rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isTestingPush ? t.testing : t.testAlert}
                  </button>
                </div>
              )}

              {notificationStatusMsg && (
                <div style={{
                  fontSize: '0.72rem',
                  color: notificationStatusMsg.includes('✓') ? '#059669' : '#dc2626',
                  marginTop: '0.4rem',
                  textAlign: 'center',
                  fontWeight: 600
                }}>
                  {notificationStatusMsg}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewState('minimized')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {t.dismiss}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* iOS Install Helper Modal */}
      {showIosPrompt && (
        <div className="modal-overlay" onClick={() => setShowIosPrompt(false)}>
          <div
            className="modal-content animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', textAlign: 'center', padding: '1.75rem' }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📱</div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', marginBottom: '0.5rem', fontWeight: 800 }}>
              {t.iosTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {t.iosStep}
            </p>
            <button
              type="button"
              className="form-submit-btn"
              onClick={() => setShowIosPrompt(false)}
              style={{ width: 'auto', padding: '0.55rem 1.5rem', margin: '0 auto', fontSize: '0.85rem' }}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
