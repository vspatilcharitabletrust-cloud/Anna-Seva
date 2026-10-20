'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePageClient({ donorCount, foodCount, completedCount }) {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#ffffff' }}>

      {/* Immersive Hero Section */}
      <section className="public-banner" style={{ minHeight: '520px' }}>
        <div className="public-banner-content" style={{ maxWidth: '980px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <span className="hero-trust-badge" style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              color: 'var(--accent-teal-dark)',
              borderRadius: '50px',
              border: '1.5px solid rgba(13, 148, 136, 0.25)',
              fontWeight: '800',
              lineHeight: '1.4',
              boxShadow: '0 4px 16px rgba(13, 148, 136, 0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🏛️</span>
              <span>{t('home.trust_badge_mr', 'श्री. विश्वनाथराव शामराव पाटील चॅरिटेबल ट्रस्ट उपक्रम')}</span>
            </span>
            <span className="hero-trust-badge-en" style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              color: 'var(--primary-navy-light)',
              borderRadius: '50px',
              border: '1.5px solid rgba(15, 23, 42, 0.08)',
              fontWeight: '700',
              letterSpacing: '1.8px',
              lineHeight: '1.4',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
            }}>
              {t('home.trust_badge_en', 'SHRI VISHWANATHRAO SHAMRAO PATIL CHARITABLE TRUST INITIATIVE')}
            </span>
          </div>
          <h1>
            {t('home.hero_title_1', 'Empowering Communities.')} <br />
            <span style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              {t('home.hero_title_2', 'Reducing Food Waste.')}
            </span>
          </h1>
          <p>
            {t('home.hero_desc', 'We bridge the gap between food abundance and hunger. Through local action and trusted coordination, we redirect surplus meals to families and shelters who need them most.')}
          </p>
          <div className="hero-cta-row" style={{ marginTop: '2.5rem' }}>
            <Link
              href="/available-food"
              className="form-submit-btn"
              style={{
                width: 'auto',
                padding: '0.85rem 2.2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                margin: 0,
                fontSize: '0.96rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)'
              }}
            >
              <span>🍲</span>
              <span>{t('home.req_food_btn', 'Request Food Assistance')}</span>
            </Link>
            <Link
              href="/donor/register"
              style={{
                padding: '0.85rem 2.2rem',
                borderRadius: '50px',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border-light)',
                color: 'var(--primary-navy)',
                fontWeight: '700',
                fontSize: '0.96rem',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-teal)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.04)';
              }}
            >
              <span>🤝</span>
              <span>{t('home.become_donor_btn', 'Become a Verified Donor')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Media Spotlight Banner */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '1px solid var(--border-light)',
        padding: '3.5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.15rem',
            borderRadius: '50px',
            background: 'rgba(13, 148, 136, 0.08)',
            border: '1.5px solid rgba(13, 148, 136, 0.2)',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.05)'
          }}>
            <span style={{ fontSize: '0.95rem' }}>📰</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-teal-dark)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('media.tag', 'MEDIA SPOTLIGHT & COVERAGE')}
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.35rem)', color: 'var(--primary-navy)', fontFamily: 'var(--font-title)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            {t('media.title', 'अन्न सेवा वृत्तपत्र प्रसिद्धी')}
          </h2>

          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '700px', margin: 0, lineHeight: 1.65 }}>
            {t('media.desc', 'See what leading newspapers say about our efforts to reduce food waste and coordinate deliveries to feed the needy across Latur, Marathwada & Whole Maharashtra.')}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', margin: '0.5rem 0' }}>
            <span style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(220, 38, 38, 0.25)', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', color: '#dc2626', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)' }}>✓ सकाळ वृत्तसेवा</span>
            <span style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(37, 99, 235, 0.25)', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', color: '#2563eb', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)' }}>✓ लोकमत</span>
            <span style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(13, 148, 136, 0.25)', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', color: '#0d9488', boxShadow: '0 2px 8px rgba(13, 148, 136, 0.06)' }}>✓ एकमत</span>
            <span style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(217, 119, 6, 0.25)', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', color: '#d97706', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.06)' }}>✓ आपलं मन</span>
          </div>

          <Link
            href="/media"
            style={{
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              padding: '0.8rem 2rem',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '0.94rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              boxShadow: '0 6px 18px rgba(13, 148, 136, 0.3)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(13, 148, 136, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(13, 148, 136, 0.3)';
            }}
          >
            <span>📰</span>
            <span>{t('media.view_all', 'View All Media Coverage →')}</span>
          </Link>
        </div>
      </section>

      {/* Core Mission Callout */}
      <section style={{ padding: '5.5rem 2rem', borderBottom: '1px solid var(--border-light)', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              OUR FOUNDATIONAL PILLARS
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', color: 'var(--primary-navy)', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              {t('home.commitment_title', 'Our Commitment to Social Welfare')}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
            textAlign: 'left'
          }}>

            <div style={{
              background: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.85)',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 6px 20px -3px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 900,
                flexShrink: 0
              }}>✓</span>
              <div>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '1.15rem', display: 'block', marginBottom: '0.4rem', fontWeight: 800 }}>
                  {t('home.commitment_2_title', 'Collaborative Local Alliances')}
                </strong>
                <span style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.6', display: 'block' }}>
                  {t('home.commitment_2_desc', 'Partnering directly with Restaurants and local volunteers to map and verify surplus food availability.')}
                </span>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.85)',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 6px 20px -3px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 900,
                flexShrink: 0
              }}>✓</span>
              <div>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '1.15rem', display: 'block', marginBottom: '0.4rem', fontWeight: 800 }}>
                  {t('home.commitment_3_title', 'Wide-Reaching Food Distribution')}
                </strong>
                <span style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.6', display: 'block' }}>
                  {t('home.commitment_3_desc', 'Delivering fresh, quality-checked meals to families, orphanages, homes across Maharashtra.')}
                </span>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.85)',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 6px 20px -3px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(5, 150, 105, 0.2))',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 900,
                flexShrink: 0
              }}>✓</span>
              <div>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '1.15rem', display: 'block', marginBottom: '0.4rem', fontWeight: 800 }}>
                  {t('home.commitment_4_title', 'Direct & Transparent Impact')}
                </strong>
                <span style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.6', display: 'block' }}>
                  {t('home.commitment_4_desc', 'Enabling real-time request tracking and direct coordination between verified donors and organizations for total accountability.')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard Section */}
      <section className="public-container" style={{ margin: '5.5rem auto 3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {t('home.impact_tag', 'TRACKING REAL CHANGE')}
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.4rem', fontFamily: 'var(--font-title)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t('home.impact_title', 'Our Impact Dashboard')}
          </h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{
            minHeight: '200px',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            color: 'var(--text-main)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            borderTop: '4px solid #2563eb',
            boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.08)'
          }}>
            <span className="stat-card-title" style={{ color: '#64748b', fontWeight: 700 }}>
              {t('home.active_donors', 'Active Donors')}
            </span>
            <span className="stat-card-value" style={{ color: 'var(--primary-navy)' }}>{donorCount}</span>
            <div style={{ fontSize: '0.92rem', marginTop: '0.65rem', color: '#64748b', fontWeight: 500 }}>
              {t('home.active_donors_desc', 'Sponsors backing our distribution')}
            </div>
            <span className="stat-card-icon" style={{ color: '#2563eb', opacity: 0.07 }}>👥</span>
          </div>

          <div className="stat-card" style={{
            minHeight: '200px',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            color: 'var(--text-main)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            borderTop: '4px solid #d97706',
            boxShadow: '0 8px 24px -4px rgba(217, 119, 6, 0.08)'
          }}>
            <span className="stat-card-title" style={{ color: '#64748b', fontWeight: 700 }}>
              {t('home.food_listed', 'Food Batches Listed')}
            </span>
            <span className="stat-card-value" style={{ color: 'var(--primary-navy)' }}>{foodCount}</span>
            <div style={{ fontSize: '0.92rem', marginTop: '0.65rem', color: '#64748b', fontWeight: 500 }}>
              {t('home.food_listed_desc', 'Total surplus allocations cataloged')}
            </div>
            <span className="stat-card-icon" style={{ color: '#d97706', opacity: 0.07 }}>🍎</span>
          </div>

          <div className="stat-card" style={{
            minHeight: '200px',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            color: 'var(--text-main)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            borderTop: '4px solid #059669',
            boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.08)'
          }}>
            <span className="stat-card-title" style={{ color: '#64748b', fontWeight: 700 }}>
              {t('home.fulfillments', 'Fulfillments Handled')}
            </span>
            <span className="stat-card-value" style={{ color: 'var(--primary-navy)' }}>{completedCount}</span>
            <div style={{ fontSize: '0.92rem', marginTop: '0.65rem', color: '#64748b', fontWeight: 500 }}>
              {t('home.fulfillments_desc', 'Direct deliveries successfully completed')}
            </div>
            <span className="stat-card-icon" style={{ color: '#059669', opacity: 0.07 }}>✅</span>
          </div>
        </div>
      </section>

      {/* Modern Three Pillar Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '6.5rem 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="public-container">
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {t('home.pillars_tag', 'HOW WE COORDINATE')}
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.4rem', fontFamily: 'var(--font-title)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t('home.pillars_title', 'Operating Pillars')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem' }}>

            {/* Donor */}
            <div style={{
              background: '#ffffff',
              padding: '3rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)'
              }}>
                01
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {t('home.pillar_1_title', 'List Surplus Food')}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.75', flex: 1 }}>
                {t('home.pillar_1_desc', 'Registered donors specify the type of food, quantity (number of plates), collection location, and contact mobile. The listing instantly displays on the public directory.')}
              </p>
              <Link href="/donor/login" style={{ color: 'var(--accent-teal-dark)', fontWeight: 700, textDecoration: 'none', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                {t('home.pillar_1_link', 'Donor Login →')}
              </Link>
            </div>

            {/* Requester */}
            <div style={{
              background: '#ffffff',
              padding: '3rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(217, 119, 6, 0.3)'
              }}>
                02
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {t('home.pillar_2_title', 'Request & Collect')}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.75', flex: 1 }}>
                {t('home.pillar_2_desc', 'NGOs, shelter homes, and volunteers filter listed food by state and city. They submit claims specifying the quantity, purpose, and delivery address.')}
              </p>
              <Link href="/available-food" style={{ color: '#b45309', fontWeight: 700, textDecoration: 'none', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                {t('home.pillar_2_link', 'Browse Food List →')}
              </Link>
            </div>

            {/* Admin */}
            <div style={{
              background: '#ffffff',
              padding: '3rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #090e1a 0%, #1e293b 100%)',
                color: '#ffffff',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)'
              }}>
                03
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {t('home.pillar_3_title', 'Audit & Monitor')}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.75', flex: 1 }}>
                {t('home.pillar_3_desc', 'System administrators manage regional coverage (states/cities), monitor donor enrollments, approve claims where needed, and compile performance audit reports.')}
              </p>
              <Link href="/donor/login" style={{ color: 'var(--primary-navy)', fontWeight: 700, textDecoration: 'none', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                {t('home.pillar_3_link', 'Donor Login →')}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Charitable Trust CTA block */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 50%, #fef3c7 100%)',
        color: 'var(--primary-navy)',
        padding: '6.5rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-light)'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.1rem, 4.5vw, 2.85rem)', color: 'var(--primary-navy)', marginBottom: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t('home.trust_cta_title', 'Help Us Prevent Hunger')}
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: '1.8', marginBottom: '2.75rem' }}>
            {t('home.trust_cta_desc', 'Whether you represent a banquet hall with surplus catering or an NGO looking for support, Anna Seva provides a modern, direct, and verified platform to coordinate logistics and distribute fresh meals.')}
          </p>
          <div style={{ display: 'flex', gap: '1.15rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/donate"
              className="form-submit-btn"
              style={{
                width: 'auto',
                padding: '1rem 2.6rem',
                borderRadius: '50px',
                textDecoration: 'none',
                margin: 0,
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: '0 6px 20px rgba(217, 119, 6, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                fontWeight: 700
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{t('home.donate_now', 'Donate Now')}</span>
            </Link>
            <Link
              href="/donor/register"
              className="form-submit-btn"
              style={{
                width: 'auto',
                padding: '1rem 2.6rem',
                borderRadius: '50px',
                textDecoration: 'none',
                margin: 0,
                fontWeight: 700
              }}
            >
              {t('home.reg_as_donor', 'Register as Donor')}
            </Link>
            <Link
              href="/contact"
              style={{
                padding: '1rem 2.6rem',
                borderRadius: '50px',
                backgroundColor: '#ffffff',
                border: '2px solid var(--primary-navy)',
                color: 'var(--primary-navy)',
                fontWeight: '700',
                fontSize: '1rem',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-navy)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = 'var(--primary-navy)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('home.contact_office', 'Contact Trust Office')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
