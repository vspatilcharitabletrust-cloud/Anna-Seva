'use client';

import Image from 'next/image';
import hridaynathImg from './hridaynath.jpg';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutClient({ dbAboutText }) {
  const { t, language } = useLanguage();

  // If dbAboutText is default English and user selected Hindi/Marathi, use translated mission
  const missionText = (language !== 'en' && (dbAboutText === 'Loading...' || dbAboutText?.startsWith('Anna Seva')))
    ? t('about.default_mission')
    : (dbAboutText || t('about.default_mission'));

  return (
    <div className="public-container animate-fade-in" style={{ maxWidth: '980px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          SHRI VISHWANATHRAO SHAMRAO PATIL CHARITABLE TRUST
        </span>
        <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.2rem)', fontFamily: 'var(--font-title)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em', marginTop: '0.4rem' }}>
          {t('about.title', 'About Anna Seva')}
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--accent-teal), #10b981)', borderRadius: '999px', margin: '1rem auto 0' }} />
      </div>

      <div style={{
        background: '#ffffff',
        padding: '3rem',
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.05)',
        lineHeight: '1.8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🎯</span>
          <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            {t('about.mission_title', 'Our Mission')}
          </h2>
        </div>
        <p style={{ fontSize: '1.12rem', color: '#475569', whiteSpace: 'pre-line', marginBottom: '2.5rem', lineHeight: '1.8' }}>
          {missionText}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '1.4rem' }}>💎</span>
          <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            {t('about.values_title', 'Core Value Propositions')}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            border: '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              flexShrink: 0
            }}>✓</span>
            <div>
              <strong style={{ display: 'block', color: 'var(--primary-navy)', fontSize: '1.02rem', marginBottom: '0.2rem' }}>
                {t('about.val_1_title', 'Zero Waste:')}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.55' }}>
                {t('about.val_1_desc', 'Ensuring surplus food goes to stomachs, not landfills.')}
              </span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            border: '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              flexShrink: 0
            }}>✓</span>
            <div>
              <strong style={{ display: 'block', color: 'var(--primary-navy)', fontSize: '1.02rem', marginBottom: '0.2rem' }}>
                {t('about.val_2_title', 'Safety First:')}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.55' }}>
                {t('about.val_2_desc', 'Connecting verified donors who maintain food quality standards.')}
              </span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            border: '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              flexShrink: 0
            }}>✓</span>
            <div>
              <strong style={{ display: 'block', color: 'var(--primary-navy)', fontSize: '1.02rem', marginBottom: '0.2rem' }}>
                {t('about.val_3_title', 'Localized Impact:')}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.55' }}>
                {t('about.val_3_desc', 'Filtering requests by State and City to optimize delivery ranges.')}
              </span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            border: '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              flexShrink: 0
            }}>✓</span>
            <div>
              <strong style={{ display: 'block', color: 'var(--primary-navy)', fontSize: '1.02rem', marginBottom: '0.2rem' }}>
                {t('about.val_4_title', 'Direct Approvals:')}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.55' }}>
                {t('about.val_4_desc', 'Donors maintain full control over who receives their listed food.')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Managing Trustee Section */}
      <div style={{
        marginTop: '2.5rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '2.75rem',
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'row',
        gap: '2.5rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          width: '170px',
          height: '170px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '4px solid #ffffff',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          margin: '0 auto'
        }}>
          <Image
            src={hridaynathImg}
            alt="Shri. Hridaynath Bhagwat Patil"
            placeholder="blur"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
        </div>

        <div className="about-trustee-info" style={{ flex: '1', minWidth: '280px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            color: 'var(--accent-teal-dark)',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            <span></span>
            <span>{t('about.trustee_role', 'Founding President')}</span>
          </div>

          <h2 style={{
            color: 'var(--primary-navy)',
            marginBottom: '0.35rem',
            fontSize: '1.9rem',
            fontWeight: 800,
            fontFamily: 'var(--font-title)',
            letterSpacing: '-0.02em'
          }}>
            {t('about.trustee_name', 'Shri. Hridaynath Bhagwat Patil')}
          </h2>

          <div className="about-trustee-list" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: '1', width: '1.5rem', display: 'flex', justifyContent: 'center' }}>🏛️</span>
              <span style={{ color: '#334155', fontSize: '0.98rem', lineHeight: '1.5', fontWeight: 600 }}>
                {t('about.trustee_org', 'Founding President at Shri. Vishwanathrao Shamrao Patil Trust, Latur')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: '1', width: '1.5rem', display: 'flex', justifyContent: 'center' }}>💻</span>
              <span style={{ color: '#475569', fontSize: '0.96rem', lineHeight: '1.5' }}>
                {t('about.trustee_job', 'Software Developer at zCon Solutions Pvt. Ltd, Kothrud')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: '1', width: '1.5rem', display: 'flex', justifyContent: 'center' }}>🎓</span>
              <span style={{ color: '#475569', fontSize: '0.96rem', lineHeight: '1.5' }}>
                {t('about.trustee_edu', "B.Tech CSE'25 Graduate from Vellore Institute of Technology")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Instagram Account Card */}
      <div style={{
        marginTop: '2.5rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #fff7f9 100%)',
        padding: '2rem 2.25rem',
        borderRadius: '16px',
        border: '1px solid rgba(225, 48, 108, 0.2)',
        boxShadow: '0 10px 25px rgba(225, 48, 108, 0.06)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1', minWidth: '280px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 18px rgba(225, 48, 108, 0.35)',
            flexShrink: 0
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {t('about.insta_official_title', 'Official Account of Trust')}
              </h3>
              <span style={{
                fontSize: '0.72rem',
                backgroundColor: 'rgba(225, 48, 108, 0.12)',
                color: '#e1306c',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontWeight: 700,
                border: '1px solid rgba(225, 48, 108, 0.2)'
              }}>
                {t('about.follow_updates', 'Follow for Updates')}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 0.35rem 0', lineHeight: 1.4 }}>
              {t('about.insta_desc', 'Stay connected with daily redistribution activities, volunteer stories & trust initiatives.')}
            </p>
            <a
              href="https://www.instagram.com/shri.vishwanathrao.patil_trust?vrfl=bGpvbGcxaGlsNHF1&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#e1306c',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              @shri.vishwanathrao.patil_trust
            </a>
          </div>
        </div>

        <div>
          <a
            href="https://www.instagram.com/shri.vishwanathrao.patil_trust?vrfl=bGpvbGcxaGlsNHF1&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.4rem',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 6px 16px rgba(225, 48, 108, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 22px rgba(225, 48, 108, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 48, 108, 0.3)';
            }}
          >
            <span>{t('about.follow_btn', 'Follow on Instagram ↗')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
