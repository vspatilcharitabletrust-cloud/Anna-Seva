'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="public-footer">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
        <img 
          src="/trust_logo.jpg" 
          alt="Shri Vishwanathrao Shamrao Patil Charitable Trust Logo" 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '8px', 
            objectFit: 'contain',
            backgroundColor: '#ffffff',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center' }}>
          <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
            {t('footer.trust_title', 'Shri Vishwanathrao Shamrao Patil Charitable Trust, Latur')}
          </h4>
        </div>

        {/* Official Instagram Account */}
        <a
          href="https://www.instagram.com/shri.vishwanathrao.patil_trust?vrfl=bGpvbGcxaGlsNHF1&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            padding: '0.65rem 1.35rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(225, 48, 108, 0.35)',
            textDecoration: 'none',
            color: '#ffffff',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            maxWidth: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(225, 48, 108, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(225, 48, 108, 0.7)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(225, 48, 108, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(225, 48, 108, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
          }}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(225, 48, 108, 0.4)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
              {t('footer.insta_official_title', 'Official Account of Trust')}
            </span>
            <span style={{
              fontSize: '0.72rem',
              backgroundColor: 'rgba(225, 48, 108, 0.22)',
              color: '#ff7597',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              fontWeight: 700,
              border: '1px solid rgba(225, 48, 108, 0.35)'
            }}>
              {t('footer.follow_updates', 'Follow for Updates')}
            </span>
            <span style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>
              @shri.vishwanathrao.patil_trust ↗
            </span>
          </div>
        </a>

        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.92rem', lineHeight: '1.5' }}>
          {t('footer.rights', '© 2026 Anna Seva. All rights reserved. Connecting Donors & Feeding the Needy.')}
        </p>
      </div>
    </footer>
  );
}
