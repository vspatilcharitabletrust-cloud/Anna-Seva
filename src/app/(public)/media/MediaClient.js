'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const newsArticles = [
  {
    id: 3,
    title: "'अन्नसेवा'मुळे उपाशी पोटाला मिळणार दोन घास!",
    englishTitle: "'Anna Seva' Ensures Wholesome Meals for the Hungry",
    source: "Lokmat (लोकमत)",
    publicationName: "लोकमत",
    date: "07 Jun 2026",
    category: "dailies",
    badgeColor: "#2563eb",
    badgeBg: "rgba(37, 99, 235, 0.1)",
    image: "/news/news-4.jpg",
    featured: true,
    description: "हॉटेल्स, केटर्स, मंगल कार्यालयात लग्न समारंभात वाया जाणाऱ्या अन्नाचा योग्य व पुरेपूर उपयोग व्हावा म्हणून 'अन्नसेवा' उपक्रम राबवला जात आहे. यामुळे हजारो उपाशी लोकांना अन्न मिळेल.",
    englishDesc: "Lokmat reports on preventing the waste of banquet and wedding food, channeling thousands of wholesome meal portions directly into local shelters."
  },
  {
    id: 2,
    title: "२५ स्वयंसेवी संस्थांच्या मदतीने गरिबांसाठी 'अन्नसेवा'",
    englishTitle: "25 Partner NGOs Unite Under 'Anna Seva' Initiative",
    source: "Ekmat (एकमत)",
    publicationName: "एकमत दैनिक",
    date: "08 Jun 2026",
    category: "dailies",
    badgeColor: "#0d9488",
    badgeBg: "rgba(13, 148, 136, 0.1)",
    image: "/news/news-3.jpg",
    featured: true,
    description: "लातूर व मराठवाड्यातील पहिलेच स्वयंचलित डिजिटल पोर्टल 'अन्नसेवा' सुरू झाले आहे. २५ संस्था या उपक्रमासाठी जोडल्या गेल्या असून गरिबांसाठी अन्न वाटप सोपे झाले आहे.",
    englishDesc: "Ekmat newspaper highlights the network of 25 verified NGOs onboarded to receive immediate alerts when banquet halls and food businesses list surplus meal batches."
  },
  {
    id: 6,
    title: "'अन्नसेवा' डिजिटल उपक्रमामुळे उपाशी पोटाला मिळणार आधार",
    englishTitle: "'Anna Seva' Digital Initiative Brings Relief to the Needy",
    source: "Apal Man (आपलं मन)",
    publicationName: "आपलं मन",
    date: "17 Jun 2026",
    category: "tech",
    badgeColor: "#d97706",
    badgeBg: "rgba(217, 119, 6, 0.1)",
    image: "/news/news-6.png",
    featured: true,
    description: "लातूर व मराठवाड्यातील पहिल्या 'डिजिटल अन्नदान' उपक्रमाचा प्रारंभ. २५ स्वयंसेवी संस्थांच्या मदतीने मंगल कार्यालये, हॉटेल्स व केटर्समधील अतिरिक्त अन्न गरजूंपर्यंत सुरक्षितपणे पोहोचवण्यासाठी 'अन्नसेवा' हे स्वयंचलित डिजिटल पोर्टल सुरू करण्यात आले आहे.",
    englishDesc: "Inauguration of Marathwada's first automated digital food redistribution portal, connecting 25+ partner NGOs to redirect surplus catering and banquet food to underprivileged families."
  },
  {
    id: 1,
    title: "डिजिटल तंत्रज्ञानातून अन्नदानाचा महायज्ञ",
    englishTitle: "Harnessing Digital Technology for Food Redistribution",
    source: "Sakal (सकाळ वृत्तसेवा)",
    publicationName: "सकाळ वृत्तसेवा",
    date: "09 Jun 2026",
    category: "dailies",
    badgeColor: "#dc2626",
    badgeBg: "rgba(220, 38, 38, 0.1)",
    image: "/news/news-2.png",
    featured: true,
    description: "श्री विश्वनाथराव शामराव पाटील चॅरिटेबल ट्रस्ट अंतर्गत 'अन्न सेवा' या नावीन्यपूर्ण डिजिटल अन्नदान उपक्रमाची सुरुवात करण्यात आली आहे. याकरिता ट्रस्टचे प्रमुख हृदयनाथ पाटील या तरुणाने पुढाकार घेतला.",
    englishDesc: "Prominent coverage in Sakal newspaper spotlighting youth innovator Hridaynath Patil and the Shri Vishwanathrao Shamrao Patil Charitable Trust for developing a unified portal to streamline food rescue."
  },
  {
    id: 4,
    title: "स्वयंचलित डिजिटल पोर्टल 'अन्न सेवा'",
    englishTitle: "Automated Regional Digital Food Portal 'Anna Seva'",
    source: "Trust Initiative Spotlight",
    publicationName: "डिजिटल उपक्रम",
    date: "07 Jun 2026",
    category: "tech",
    badgeColor: "#7c3aed",
    badgeBg: "rgba(124, 58, 237, 0.1)",
    image: "/news/news-1.jpg",
    featured: false,
    description: "लातूर आणि मराठवाड्यासारख्या निमशहरी व ग्रामीण भागांसाठी थेट स्वयंचलित काम करणारे हे पहिलेच डिजिटल पोर्टल ठरले आहे. संपूर्ण तांत्रिक रचना स्वतः विकसित केली आहे.",
    englishDesc: "Spotlighting the indigenous tech stack created specifically for tier-2 and rural regional networks, guaranteeing rapid donor-to-NGO allocation."
  },
  {
    id: 5,
    title: "संस्थापक अध्यक्ष संदेश - 'अन्नसेवा'",
    englishTitle: "Founding President's Message: Zero Waste, Zero Hunger",
    source: "President's Message (संस्थापक संदेश)",
    publicationName: "संस्थापक संदेश",
    date: "06 Jun 2026",
    category: "founder",
    badgeColor: "#0f172a",
    badgeBg: "rgba(15, 23, 42, 0.08)",
    image: "/news/news-5.jpg",
    featured: false,
    description: "संस्थेचे संस्थापक अध्यक्ष हृदयनाथ पाटील यांचा संदेश - आपल्या परिसरातील एकही व्यक्ती उपाशी राहू नये, तसेच अन्नाचा एकही कण वाया जाऊ नये म्हणून आमचा हा प्रामाणिक प्रयत्न आहे.",
    englishDesc: "A personal address from founding president Hridaynath Patil articulating the social commitment to ensure not a single grain is wasted while anyone goes hungry."
  }
];

export default function MediaClient() {
  const { t, language } = useLanguage();

  const featuredArticles = newsArticles.filter((item) => item.featured);
  const featuredArticle = featuredArticles[0] || newsArticles[0];

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* Hero Banner Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 50%, #f8fafc 100%)',
        borderBottom: '1px solid var(--border-light)',
        padding: '3.5rem 1.5rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Trust Subtitle Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.25rem', borderRadius: '50px', background: 'rgba(13, 148, 136, 0.08)', border: '1.5px solid rgba(13, 148, 136, 0.2)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem' }}>📰</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-teal-dark)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('media.tag', 'MEDIA SPOTLIGHT & COVERAGE')}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontFamily: 'var(--font-title)',
            fontWeight: '900',
            color: 'var(--primary-navy)',
            lineHeight: 1.2,
            marginBottom: '1rem'
          }}>
            {language === 'mr' ? 'अन्न सेवा वृत्तपत्र प्रसिद्धी' : (language === 'hi' ? 'अन्न सेवा मीडिया व समाचार' : 'Media Spotlight & Coverage')}
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: '#475569',
            lineHeight: 1.7,
            maxWidth: '780px',
            margin: '0 auto 2.25rem'
          }}>
            {t('media.page_subtitle', 'Documenting the food rescue revolution across Latur, Marathwada & Whole Maharashtra. Explore how Maharashtra\'s leading newspapers highlighted Anna Seva\'s digital initiative to feed the needy and eliminate food waste.')}
          </p>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1rem',
            maxWidth: '850px',
            margin: '0 auto'
          }}>
            <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-teal-dark)' }}>6+</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-navy)', marginTop: '0.15rem' }}>{t('media.stat_features', 'Press Features')}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{t('media.stat_features_desc', 'In leading Marathi dailies')}</div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-teal-dark)' }}>25+</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-navy)', marginTop: '0.15rem' }}>{t('media.stat_ngo', 'Partner NGOs')}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{t('media.stat_ngo_desc', 'Redistribution network')}</div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-teal-dark)' }}>100%</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-navy)', marginTop: '0.15rem' }}>{t('media.stat_region', 'Latur & Marathwada')}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{t('media.stat_region_desc', 'Regional outreach')}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Container */}
      <div className="public-container" style={{ maxWidth: '1200px', margin: '3rem auto 0', padding: '0 1.5rem' }}>

        {/* Featured Editorial Spotlight Section */}
        {featuredArticles.length > 0 && (
          <div style={{ marginBottom: '3.5rem' }}>
            {/* Section Badge & Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.75rem'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--accent-teal)',
                color: '#ffffff',
                padding: '0.4rem 1.15rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)'
              }}>
                <span>⭐</span> {t('media.featured_badge', 'FEATURED EDITORIAL STORY')}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>
                  {language === 'mr' ? 'संपादकीय विशेष प्रसिद्धी:' : (language === 'hi' ? 'विशेष कवरेज:' : 'Spotlight Editions:')}
                </span>
                {featuredArticles.map((art, idx) => (
                  <span
                    key={art.id}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      color: art.badgeColor,
                      backgroundColor: art.badgeBg,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      border: `1px solid ${art.badgeColor}35`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: art.badgeColor }} />
                    {idx + 1}. {art.publicationName}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured Articles List (Horizontal Format) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2.25rem'
            }}>
              {featuredArticles.map((art) => {
                return (
                  <div
                    key={art.id}
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                      borderRadius: '24px',
                      border: `1.5px solid ${art.badgeColor}35`,
                      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.06)',
                      overflow: 'hidden',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: 'clamp(1.5rem, 3vw, 2.5rem)',
                      alignItems: 'center',
                      padding: 'clamp(1.25rem, 2.5vw, 2rem)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 22px 45px rgba(15, 23, 42, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 16px 36px rgba(15, 23, 42, 0.06)';
                    }}
                  >
                    {/* Left Column: Direct Image Link */}
                    <a
                      href={art.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={art.title}
                      style={{
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
                        backgroundColor: '#ffffff',
                        border: '3px solid #ffffff',
                        height: '280px',
                        display: 'block',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                    >
                      <img
                        src={art.image}
                        alt={art.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top',
                          display: 'block',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    </a>

                    {/* Right Column: Editorial Content Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: art.badgeBg,
                          color: art.badgeColor,
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          padding: '0.3rem 0.85rem',
                          borderRadius: '8px',
                          border: `1px solid ${art.badgeColor}30`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: art.badgeColor }} />
                          {art.publicationName}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                          📅 {art.date}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal-dark)', fontWeight: '700', backgroundColor: 'rgba(13, 148, 136, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
                          ✓ Verified Press
                        </span>
                      </div>

                      <h2 style={{
                        fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
                        color: 'var(--primary-navy)',
                        fontFamily: 'var(--font-title)',
                        fontWeight: '800',
                        lineHeight: 1.35,
                        marginBottom: '0.85rem'
                      }}>
                        {art.title}
                      </h2>

                      <p style={{
                        fontSize: '0.98rem',
                        color: '#334155',
                        lineHeight: 1.75,
                        marginBottom: '1.5rem',
                        maxWidth: '720px'
                      }}>
                        {art.description}
                      </p>

                      <div>
                        <a
                          href={art.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent-teal), #0f766e)',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '0.85rem 1.85rem',
                            borderRadius: '50px',
                            fontSize: '0.92rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)',
                            transition: 'all 0.25s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <span>📰</span> {t('media.view_clip_btn', '📰 View Full Newspaper Clip')} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Press & Media Desk Callout Section */}
        <section style={{
          marginTop: '4.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal-light, #2dd4bf)', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span>🎙️</span> PRESS & JOURNALISM ENQUIRIES
            </div>
            <h3 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontFamily: 'var(--font-title)', fontWeight: 800, margin: '0 0 1rem', color: '#ffffff' }}>
              {t('media.press_inquiry_title', 'Press & Media Relations')}
            </h3>
            <p style={{ fontSize: '1.02rem', opacity: 0.85, lineHeight: 1.7, margin: 0, maxWidth: '580px' }}>
              {t('media.press_inquiry_desc', 'Are you a journalist or reporter covering social impact, technological innovation in charity, or food rescue? We welcome press coverage, interviews, and documentary inquiries.')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', justifySelf: 'start' }}>
            <Link
              href="/contact"
              style={{
                backgroundColor: 'var(--accent-teal)',
                color: '#ffffff',
                padding: '0.85rem 1.85rem',
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>✉️</span> {t('media.press_inquiry_btn', 'Contact Media Desk')}
            </Link>
            <div style={{ fontSize: '0.88rem', opacity: 0.75 }}>
              Official Trust Email: <strong style={{ color: '#ffffff' }}>vspatil.charitabletrust@gmail.com</strong>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
