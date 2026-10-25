'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Close mobile menu and language dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Close language dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { label: t('nav.about', 'ABOUT'), path: '/about' },
    { label: t('nav.media', 'MEDIA'), path: '/media' },
    { label: t('nav.available_food', 'AVAILABLE FOOD LIST'), path: '/available-food' },
    { label: '🎂 ANNADAN SANKALP', path: '/annadan-sankalp' },
    { label: t('nav.donate', 'DONATE'), path: '/donate' },
    { label: t('nav.contact', 'CONTACT'), path: '/contact' }
  ];

  return (
    <header className={`public-header ${language === 'en' ? 'public-header-en' : ''}`}>
      <nav className="public-nav">
        <Link href="/" className="public-logo">
          <img 
            src="/icon.png" 
            alt="Anna Seva Logo" 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--accent-teal)',
              flexShrink: 0
            }} 
          />
          <span className="public-logo-devanagari">अन्न सेवा</span>
          <span>ANNA SEVA</span>
        </Link>

        {/* Hamburger Toggle Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`public-menu${menuOpen ? ' mobile-menu-open' : ''}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={isActive ? 'active-link' : ''}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          
          {user ? (
            <li className="nav-dashboard-item">
              <Link
                href={user.role === 'admin' ? '/admin/dashboard' : '/donor/dashboard'}
                className="dashboard-badge-link"
                style={{
                  backgroundColor: '#12181b',
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}
              >
                {t('nav.dashboard', 'DASHBOARD')}
              </Link>
            </li>
          ) : (
            <li>
              <Link
                href="/donor/login"
                className={pathname.startsWith('/donor') ? 'active-link' : ''}
              >
                {t('nav.donor', 'DONOR')}
              </Link>
            </li>
          )}

          {/* Language Selector Feature Button */}
          <li ref={langRef} className="language-selector-item" style={{ position: 'relative' }}>
            <div className="language-selector-wrapper" style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="language-selector-btn"
                style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(15, 118, 110, 0.12))',
                  border: '1.2px solid var(--accent-teal)',
                  color: 'var(--accent-teal-dark)',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '50px',
                  fontWeight: '700',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  outline: 'none',
                  boxShadow: '0 1px 4px rgba(13, 148, 136, 0.1)',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.2
                }}
                title="Select Language / भाषा निवडा"
              >
                <span style={{ fontSize: '0.82rem', lineHeight: 1 }}>🌐</span>
                <span>{language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'}</span>
                <span style={{ fontSize: '0.55rem', transition: 'transform 0.2s', transform: langOpen ? 'rotate(180deg)' : 'none', opacity: 0.8 }}>▼</span>
              </button>

              {langOpen && (
                <div
                  className="language-dropdown-menu animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                    border: '1px solid var(--border-light)',
                    minWidth: '155px',
                    zIndex: 1000,
                    overflow: 'hidden',
                    padding: '0.3rem 0'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setLanguage('en'); setLangOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.85rem',
                      border: 'none',
                      background: language === 'en' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                      color: language === 'en' ? 'var(--accent-teal-dark)' : 'var(--text-main)',
                      fontWeight: language === 'en' ? '800' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>🇬🇧</span> English
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('hi'); setLangOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.85rem',
                      border: 'none',
                      background: language === 'hi' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                      color: language === 'hi' ? 'var(--accent-teal-dark)' : 'var(--text-main)',
                      fontWeight: language === 'hi' ? '800' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>🇮🇳</span> हिंदी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('mr'); setLangOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.85rem',
                      border: 'none',
                      background: language === 'mr' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                      color: language === 'mr' ? 'var(--accent-teal-dark)' : 'var(--text-main)',
                      fontWeight: language === 'mr' ? '800' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>🚩</span> मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
