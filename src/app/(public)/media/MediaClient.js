'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const newsArticles = [
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
    image: "/news/news-6.jpg",
    featured: false,
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
    image: "/news/news-2.jpg",
    featured: false,
    description: "श्री विश्वनाथराव शामराव पाटील चॅरिटेबल ट्रस्ट अंतर्गत 'अन्न सेवा' या नावीन्यपूर्ण डिजिटल अन्नदान उपक्रमाची सुरुवात करण्यात आली आहे. याकरिता ट्रस्टचे प्रमुख हृदयनाथ पाटील या तरुणाने पुढाकार घेतला.",
    englishDesc: "Prominent coverage in Sakal newspaper spotlighting youth innovator Hridaynath Patil and the Shri Vishwanathrao Shamrao Patil Charitable Trust for developing a unified portal to streamline food rescue."
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
    featured: false,
    description: "लातूर व मराठवाड्यातील पहिलेच स्वयंचलित डिजिटल पोर्टल 'अन्नसेवा' सुरू झाले आहे. २५ संस्था या उपक्रमासाठी जोडल्या गेल्या असून गरिबांसाठी अन्न वाटप सोपे झाले आहे.",
    englishDesc: "Ekmat newspaper highlights the network of 25 verified NGOs onboarded to receive immediate alerts when banquet halls and food businesses list surplus meal batches."
  },
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeClipIndex, setActiveClipIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filtered articles
  const filteredArticles = newsArticles.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'dailies') return item.category === 'dailies';
    if (activeFilter === 'tech') return item.category === 'tech';
    if (activeFilter === 'founder') return item.category === 'founder';
    return true;
  });

  const featuredArticle = newsArticles.find((item) => item.featured) || newsArticles[0];

  // Open modal
  const openLightbox = (index) => {
    setActiveClipIndex(index);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setActiveClipIndex(null);
    setZoomLevel(1);
  };

  const nextClip = () => {
    if (activeClipIndex !== null) {
      setActiveClipIndex((prev) => (prev + 1) % newsArticles.length);
      setZoomLevel(1);
    }
  };

  const prevClip = () => {
    if (activeClipIndex !== null) {
      setActiveClipIndex((prev) => (prev - 1 + newsArticles.length) % newsArticles.length);
      setZoomLevel(1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeClipIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextClip();
      if (e.key === 'ArrowLeft') prevClip();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeClipIndex]);

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

        {/* Featured Editorial Spotlight Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(13, 148, 136, 0.25)',
          padding: 'clamp(1.5rem, 4vw, 2.75rem)',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          marginBottom: '3.5rem'
        }}>
          {/* Left Column: Info */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--accent-teal)', color: '#ffffff', padding: '0.35rem 0.95rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
              <span>⭐</span> {t('media.featured_badge', 'FEATURED EDITORIAL STORY')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: featuredArticle.badgeBg,
                color: featuredArticle.badgeColor,
                fontWeight: '800',
                fontSize: '0.88rem',
                padding: '0.3rem 0.85rem',
                borderRadius: '8px',
                border: `1px solid ${featuredArticle.badgeColor}30`
              }}>
                {featuredArticle.source}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600' }}>
                📅 {featuredArticle.date}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal-dark)', fontWeight: '700', backgroundColor: 'rgba(13, 148, 136, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
                ✓ Verified Press
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
              color: 'var(--primary-navy)',
              fontFamily: 'var(--font-title)',
              fontWeight: '800',
              lineHeight: 1.35,
              marginBottom: '1rem'
            }}>
              {featuredArticle.title}
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: '#334155',
              lineHeight: 1.75,
              marginBottom: '1.75rem'
            }}>
              {featuredArticle.description}
            </p>

            <button
              onClick={() => openLightbox(newsArticles.findIndex(n => n.id === featuredArticle.id))}
              style={{
                background: 'linear-gradient(135deg, var(--accent-teal), #0f766e)',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1.85rem',
                borderRadius: '50px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)',
                transition: 'all 0.25s ease'
              }}
            >
              <span>🔍</span> {t('media.view_clip_btn', '📰 View Full Newspaper Clip')}
            </button>
          </div>

          {/* Right Column: Interactive Image Preview */}
          <div
            onClick={() => openLightbox(newsArticles.findIndex(n => n.id === featuredArticle.id))}
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
              cursor: 'pointer',
              backgroundColor: '#ffffff',
              border: '4px solid #ffffff'
            }}
          >
            <img
              src={featuredArticle.image}
              alt={featuredArticle.title}
              style={{
                width: '100%',
                maxHeight: '340px',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '50px',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}>
              <span>🔍</span> {t('media.zoom_badge', 'Click to Zoom')}
            </div>
          </div>
        </div>

        {/* Section Heading & Interactive Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', fontFamily: 'var(--font-title)', fontWeight: 800, margin: 0 }}>
              {language === 'mr' ? 'वृत्तपत्र प्रसिद्धी संग्रह' : 'Press Archive & Clippings'}
            </h3>
            <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
              {t('media.inspect_hint', 'Click on any clipping to view in high-resolution zoom mode')}
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '50px',
                border: activeFilter === 'all' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-light)',
                backgroundColor: activeFilter === 'all' ? 'var(--accent-teal)' : '#ffffff',
                color: activeFilter === 'all' ? '#ffffff' : '#475569',
                fontWeight: activeFilter === 'all' ? '800' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === 'all' ? '0 4px 12px rgba(13, 148, 136, 0.2)' : 'none'
              }}
            >
              {t('media.filter_all', 'All Coverage')} ({newsArticles.length})
            </button>

            <button
              onClick={() => setActiveFilter('dailies')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '50px',
                border: activeFilter === 'dailies' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-light)',
                backgroundColor: activeFilter === 'dailies' ? 'var(--accent-teal)' : '#ffffff',
                color: activeFilter === 'dailies' ? '#ffffff' : '#475569',
                fontWeight: activeFilter === 'dailies' ? '800' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === 'dailies' ? '0 4px 12px rgba(13, 148, 136, 0.2)' : 'none'
              }}
            >
              📰 {t('media.filter_dailies', 'Leading Dailies')}
            </button>

            <button
              onClick={() => setActiveFilter('tech')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '50px',
                border: activeFilter === 'tech' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-light)',
                backgroundColor: activeFilter === 'tech' ? 'var(--accent-teal)' : '#ffffff',
                color: activeFilter === 'tech' ? '#ffffff' : '#475569',
                fontWeight: activeFilter === 'tech' ? '800' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === 'tech' ? '0 4px 12px rgba(13, 148, 136, 0.2)' : 'none'
              }}
            >
              💡 {t('media.filter_tech', 'Digital Initiative & Tech')}
            </button>

            <button
              onClick={() => setActiveFilter('founder')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '50px',
                border: activeFilter === 'founder' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-light)',
                backgroundColor: activeFilter === 'founder' ? 'var(--accent-teal)' : '#ffffff',
                color: activeFilter === 'founder' ? '#ffffff' : '#475569',
                fontWeight: activeFilter === 'founder' ? '800' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === 'founder' ? '0 4px 12px rgba(13, 148, 136, 0.2)' : 'none'
              }}
            >
              👤 {t('media.filter_founder', "President's Message")}
            </button>
          </div>
        </div>

        {/* Press Articles Gallery Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '2rem'
        }}>
          {filteredArticles.map((article) => {
            const articleIndex = newsArticles.findIndex(n => n.id === article.id);
            return (
              <div
                key={article.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 18px 36px rgba(15, 23, 42, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.04)';
                }}
              >
                {/* Article Clipping Image Frame */}
                <div
                  onClick={() => openLightbox(articleIndex)}
                  style={{
                    position: 'relative',
                    height: '220px',
                    backgroundColor: '#0f172a',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />

                  {/* Publication Badge Tag */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#ffffff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderLeft: `4px solid ${article.badgeColor}`
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: article.badgeColor }}>
                      {article.publicationName}
                    </span>
                  </div>

                  {/* Floating Zoom Indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <span>🔍</span> {t('media.zoom_badge', 'Zoom')}
                  </div>
                </div>

                {/* Card Content Details */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* Date & Bureau metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                      📅 {article.date}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal-dark)', fontWeight: '700', backgroundColor: 'rgba(13, 148, 136, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      ✓ Verified Press
                    </span>
                  </div>

                  {/* Headline */}
                  <h4 style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: 'var(--primary-navy)',
                    lineHeight: 1.4,
                    marginBottom: '0.85rem',
                    fontFamily: 'var(--font-title)'
                  }}>
                    {article.title}
                  </h4>

                  {/* Summary */}
                  <p style={{
                    fontSize: '0.92rem',
                    color: '#475569',
                    lineHeight: 1.65,
                    marginBottom: '1.5rem',
                    flex: 1
                  }}>
                    {article.description}
                  </p>

                  {/* Card Action Footer */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => openLightbox(articleIndex)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1.5px solid var(--accent-teal)',
                        color: 'var(--accent-teal-dark)',
                        padding: '0.5rem 1.1rem',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-teal)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--accent-teal-dark)';
                      }}
                    >
                      <span>📰</span> {t('media.view_clip_btn', 'Read Clipping')}
                    </button>

                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                      {article.source}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

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

      {/* Full-Screen Interactive Lightbox Modal */}
      {activeClipIndex !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Modal Top Control Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '960px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                backgroundColor: newsArticles[activeClipIndex].badgeColor,
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px'
              }}>
                {newsArticles[activeClipIndex].source}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                {activeClipIndex + 1} of {newsArticles.length} • {newsArticles[activeClipIndex].date}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Zoom In/Out Toggle */}
              <button
                type="button"
                onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : z === 1.5 ? 2 : 1))}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🔍 {zoomLevel}x Zoom
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Main Viewport with Navigation */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '75vh',
              overflow: 'auto',
              borderRadius: '16px',
              backgroundColor: '#000000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <img
              src={newsArticles[activeClipIndex].image}
              alt={newsArticles[activeClipIndex].title}
              style={{
                maxWidth: zoomLevel === 1 ? '100%' : 'none',
                maxHeight: zoomLevel === 1 ? '75vh' : 'none',
                width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                transition: 'width 0.2s ease'
              }}
              onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : z === 1.5 ? 2 : 1))}
            />

            {/* Prev Navigation Button */}
            <button
              type="button"
              onClick={prevClip}
              style={{
                position: 'fixed',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                fontSize: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                zIndex: 10000
              }}
              aria-label="Previous article"
            >
              ‹
            </button>

            {/* Next Navigation Button */}
            <button
              type="button"
              onClick={nextClip}
              style={{
                position: 'fixed',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                fontSize: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                zIndex: 10000
              }}
              aria-label="Next article"
            >
              ›
            </button>
          </div>

          {/* Modal Bottom Caption Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '960px',
              marginTop: '1rem',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              color: '#ffffff',
              textAlign: 'center'
            }}
          >
            <div style={{ fontWeight: '800', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
              {newsArticles[activeClipIndex].title}
            </div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              {newsArticles[activeClipIndex].description}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
