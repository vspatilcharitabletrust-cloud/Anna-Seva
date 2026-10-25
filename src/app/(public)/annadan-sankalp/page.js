'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CommemorativeCertificate from '@/components/CommemorativeCertificate';

export const categoryDedicationMessages = {
  birthday: 'Wishing a blessed, joyous, and long life filled with radiant health, peace, and prosperity.',
  anniversary: 'Celebrating eternal love, sacred companionship, mutual respect, and lifelong harmony.',
  memorial: 'In sacred and everlasting loving memory, honoring a cherished soul whose noble blessings live on forever.',
  achievement: 'Honoring outstanding milestone achievement with pride, and wishing distinguished success and triumph ahead.',
  festival: 'May the divine grace and auspicious warmth of this holy festival bring peace and abundance to all.',
  other: 'Dedicated with humble devotion, heartfelt gratitude, and prayers for universal peace and nourishment.'
};

export default function AnnadanSankalpPage() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [wallSankalps, setWallSankalps] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [error, setError] = useState('');
  const [honoreePhotoUrl, setHonoreePhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Reference Code Verification & Certificate Lookup State
  const [refCodeInput, setRefCodeInput] = useState('');
  const [searchingRef, setSearchingRef] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Occasion List Grid Dropdown State
  const [occasionDropdownOpen, setOccasionDropdownOpen] = useState(false);
  const occasionDropdownRef = useRef(null);

  // Certificate Lightbox Modal State (Wall of Blessings)
  const [modalCertificate, setModalCertificate] = useState(null);
  const [loadingModalCert, setLoadingModalCert] = useState(false);

  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_mobile: '',
    occasion_type: 'birthday',
    honoree_name: '',
    honoree_relation: '',
    event_date: '',
    meals_target: 100,
    meal_type: 'Festive Thali & Sweets',
    state_id: '',
    city_id: '',
    preferred_beneficiary: 'Orphanage / Children Shelters',
    dedication_message: categoryDedicationMessages.birthday
  });

  useEffect(() => {
    // 1. Fetch States
    fetch('/api/states')
      .then((res) => res.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch(console.error);

    // 2. Fetch Wall of Blessings (Public Sankalps)
    fetch('/api/sankalp?public=true')
      .then((res) => res.json())
      .then((data) => setWallSankalps(Array.isArray(data) ? data : []))
      .catch(console.error);

    // 3. Pre-fill donor if logged in
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFormData((prev) => ({
            ...prev,
            donor_name: data.user.name || '',
            donor_email: data.user.email || '',
            donor_mobile: data.user.mobile || '',
            state_id: data.user.state_id ? String(data.user.state_id) : '',
            city_id: data.user.city_id ? String(data.user.city_id) : ''
          }));
          if (data.user.state_id) {
            fetch(`/api/cities?state_id=${data.user.state_id}`)
              .then((r) => r.json())
              .then((c) => setCities(Array.isArray(c) ? c : []));
          }
        }
      })
    // 4. Auto-detect ref code from URL query param (?ref=... or ?code=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('ref') || params.get('code') || params.get('certificate');
      if (codeParam) {
        setRefCodeInput(codeParam);
        lookupReference(codeParam);
      }
    }

    // 5. Close occasion dropdown on click outside
    const handleClickOutside = (event) => {
      if (occasionDropdownRef.current && !occasionDropdownRef.current.contains(event.target)) {
        setOccasionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lookupReference = async (rawCode) => {
    const code = (rawCode || '').trim();
    if (!code) {
      setSearchError('Please enter a valid Reference ID (e.g. AS-SANKALP-2026-1001).');
      setSearchResult(null);
      return;
    }

    setSearchingRef(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/sankalp?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setSearchError(data.error || `No Annadan Sankalp record found for Reference ID "${code}". Please verify and try again.`);
      } else {
        setSearchResult(data);
      }
    } catch (err) {
      console.error(err);
      setSearchError('Error looking up Reference ID. Please check your network and try again.');
    } finally {
      setSearchingRef(false);
    }
  };

  const handleSearchRefSubmit = (e) => {
    e.preventDefault();
    lookupReference(refCodeInput);
  };

  const handleStateChange = async (stateId) => {
    setFormData((prev) => ({ ...prev, state_id: stateId, city_id: '' }));
    setCities([]);
    if (stateId) {
      try {
        const res = await fetch(`/api/cities?state_id=${stateId}`);
        const data = await res.json();
        setCities(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenCertificate = async (item) => {
    setLoadingModalCert(true);
    try {
      const res = await fetch(`/api/sankalp?code=${encodeURIComponent(item.certificate_code)}`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setModalCertificate(data);
      } else {
        setModalCertificate(item);
      }
    } catch {
      setModalCertificate(item);
    } finally {
      setLoadingModalCert(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP)');
      return;
    }

    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setHonoreePhotoUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload photo.');
      }
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.honoree_name.trim()) {
      setError('Please provide the name of the person being honored.');
      return;
    }
    if (!formData.donor_mobile.trim()) {
      setError('WhatsApp mobile number is required for receiving certificate and photo updates.');
      return;
    }
    if (!formData.event_date) {
      setError('Please select the date for the commemorative food drive.');
      return;
    }

    const finalDedication = (formData.dedication_message || '').trim() || categoryDedicationMessages[formData.occasion_type] || categoryDedicationMessages.other;

    setSubmitting(true);
    try {
      const res = await fetch('/api/sankalp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dedication_message: finalDedication,
          honoree_photo: honoreePhotoUrl || null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedResult({
          certificate_code: data.certificate_code,
          honoree_name: formData.honoree_name,
          occasion_type: formData.occasion_type,
          meals_target: formData.meals_target
        });
        window.scrollTo({ top: 400, behavior: 'smooth' });
      } else {
        setError(data.error || 'Failed to register Annadan Sankalp.');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const occasionCards = [
    { type: 'birthday', icon: '🎂', title: 'Birthday (वाढदिवस)', desc: 'Bless someone on their special day with meals for children & the elderly.' },
    { type: 'anniversary', icon: '💍', title: 'Anniversary (लग्नाचा वाढदिवस)', desc: 'Commemorate marriage milestones by sharing abundance with underprivileged families.' },
    { type: 'memorial', icon: '🕊️', title: 'In Loving Memory (स्मृतीदिन)', desc: 'Honor departed ancestors & loved ones through the sacred virtue of Smruti Annadan.' },
    { type: 'achievement', icon: '🌟', title: 'Achievement (यशस्वी क्षण)', desc: 'Express gratitude for new jobs, promotions, graduations, or family milestones.' },
    { type: 'festival', icon: '🪔', title: 'Festival / Holy Day (सण)', desc: 'Celebrate Diwali, Ganeshotsav, Eid, or holy tithis with special festive feasts.' },
    { type: 'other', icon: '🙏', title: 'General Sankalp (संकल्प)', desc: 'Fulfill personal prayers (नवस / संकल्प) by feeding hungry souls.' }
  ];

  const selectedOccasion = occasionCards.find((c) => c.type === formData.occasion_type) || occasionCards[0];

  return (
    <div className="sankalp-page">
      {/* Hero Section */}
      <section className="sankalp-hero">
        <div className="sankalp-hero-content animate-fade-in">
          <div className="sankalp-badge">
            <span>🎂</span>
            <span>अन्नदान संकल्प • COMMEMORATIVE MEAL DEDICATIONS</span>
          </div>
          <h1 className="sankalp-title">
            Celebrate Life’s Most Auspicious Moments with the Gift of Food
          </h1>
          <p className="sankalp-subtitle">
            Dedicate a nutritious meal distribution drive in honor of your loved ones on Birthdays, Wedding Anniversaries, or in Sacred Memory of Departed Souls (स्मृतीदिन अन्नदान). Receive an official Digital Commemorative Certificate and live photo updates via WhatsApp.
          </p>
          <div className="sankalp-shloka-banner">
            ॥ अन्नदानं परं दानं विद्यादानात् परं ततः । अन्नेन क्षणिका तृप्तिः यावज्जीवं च विद्यया ॥
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#schedule-form"
              className="theme-btn"
              style={{
                backgroundColor: '#0d9488',
                color: '#ffffff',
                padding: '0.7rem 1.5rem',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)'
              }}
            >
              ➕ Pledge New Annadan Sankalp
            </a>
            <a
              href="#track-certificate"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                padding: '0.7rem 1.5rem',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backdropFilter: 'blur(6px)'
              }}
            >
              <span>🔍</span> Track Certificate by Reference ID ↓
            </a>
          </div>
        </div>
      </section>


      {/* SECTION: Track / Verify Certificate by Reference ID */}
      <section id="track-certificate" className="verify-certificate-section">
        <div className="verify-card-container">
          <div className="verify-header-block">
            <span className="verify-badge">
              📜 CERTIFICATE VERIFICATION & DOWNLOAD
            </span>
            <h2 className="verify-main-heading">
              Track Certificate by Reference ID
            </h2>
            <p className="verify-subheading">
              Enter your unique Annadan Sankalp reference code to check admin approval status, view your official digital certificate, and download it as a 1-Page PDF or PNG.
            </p>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchRefSubmit} className="verify-search-form">
            <div className="verify-search-box">
              <span className="verify-search-icon">🔍</span>
              <input
                type="text"
                value={refCodeInput}
                onChange={(e) => setRefCodeInput(e.target.value)}
                placeholder="Enter Reference ID (e.g. AS-SANKALP-2026-1001)"
                className="verify-input"
                autoCapitalize="characters"
              />
              {refCodeInput && (
                <button
                  type="button"
                  onClick={() => { setRefCodeInput(''); setSearchResult(null); setSearchError(''); }}
                  className="verify-clear-btn"
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={searchingRef}
              className="verify-submit-btn"
            >
              {searchingRef ? 'Verifying...' : 'Search Certificate'}
            </button>
          </form>

          {/* Loading indicator */}
          {searchingRef && (
            <div className="verify-loading-card animate-fade-in">
              <div className="verify-spinner"></div>
              <div>Checking Trust records & admin approval status for Reference ID...</div>
            </div>
          )}

          {/* Error Message */}
          {searchError && (
            <div className="verify-error-card animate-fade-in">
              <div className="error-icon">❌</div>
              <div className="error-text">{searchError}</div>
            </div>
          )}

          {/* Result 1: NOT APPROVED YET */}
          {searchResult && !searchResult.is_approved && (
            <div className="verify-pending-card animate-fade-in">
              <div className="pending-badge-row">
                <span className="pending-status-pill">
                  ⏳ STATUS: PENDING APPROVAL FROM ADMIN
                </span>
                <span className="pending-code-tag">
                  REF: {searchResult.certificate_code}
                </span>
              </div>

              <div className="pending-icon-header">
                <span className="pending-big-icon">⏳</span>
                <div>
                  <h3 className="pending-title">
                    Commemorative Certificate Under Review • मंजुरीच्या प्रतीक्षेत
                  </h3>
                  <p className="pending-desc">
                    The Annadan Sankalp in sacred honor of <strong>{searchResult.honoree_name}</strong> has been registered. As per trust policy, the official Digital Commemorative Certificate is generated and unlocked for PDF & PNG download immediately once approved by an Anna Seva Trust admin.
                  </p>
                </div>
              </div>

              {/* 4-Step Workflow Progress Tracker */}
              <div className="pending-workflow-grid">
                <div className="workflow-card step-done">
                  <span className="step-num">STEP 1</span>
                  <strong>Pledge Registered</strong>
                  <div className="step-status">✓ Completed</div>
                </div>

                <div className="workflow-card step-active">
                  <span className="step-num">STEP 2</span>
                  <strong>Admin Review</strong>
                  <div className="step-status">⏳ In Progress</div>
                </div>

                <div className="workflow-card step-locked">
                  <span className="step-num">STEP 3</span>
                  <strong>Certificate Unlocked</strong>
                  <div className="step-status">🔒 Unlocks on Approval</div>
                </div>

                <div className="workflow-card step-scheduled">
                  <span className="step-num">STEP 4</span>
                  <strong>Meal Drive Seva</strong>
                  <div className="step-status">🍲 Scheduled ({searchResult.event_date})</div>
                </div>
              </div>

              {/* Dedication Summary Box */}
              <div className="pending-summary-box">
                <div className="summary-title">📋 Registered Dedication Details</div>
                <div className="summary-grid">
                  <div><strong>Honoree:</strong> {searchResult.honoree_name} {searchResult.honoree_relation ? `(${searchResult.honoree_relation})` : ''}</div>
                  <div><strong>Pledged Meals:</strong> {searchResult.meals_target} Meals</div>
                  <div><strong>Event Date:</strong> {searchResult.event_date}</div>
                  <div><strong>Pledged By:</strong> {searchResult.donor_name}</div>
                  <div><strong>Meal Type:</strong> {searchResult.meal_type || 'Festive Meals'}</div>
                  <div><strong>Target Location:</strong> {searchResult.drive_location_name || searchResult.preferred_beneficiary || `${searchResult.city_name || 'Pune'}, ${searchResult.state_name || 'Maharashtra'}`}</div>
                </div>
              </div>

              <div className="pending-helpline-note">
                Need urgent admin approval assistance? Contact Trust Operations Helpline: <strong>+91 1800-111-222</strong>
              </div>
            </div>
          )}

          {/* Result 2: APPROVED BY ADMIN */}
          {searchResult && searchResult.is_approved && (
            <div className="verify-approved-container animate-fade-in">
              <div className="approved-notification-bar">
                <div className="approved-info-left">
                  <div className="approved-badge">
                    <span>✓</span> SANKALP APPROVED BY ADMIN • CERTIFICATE UNLOCKED
                  </div>
                  <h3 className="approved-honoree-name">
                    Dedicated in Sacred Honor of {searchResult.honoree_name}
                  </h3>
                  <div className="approved-meta-line">
                    Reference Code: <strong>{searchResult.certificate_code}</strong> • Meals: <strong>{searchResult.meals_served || searchResult.meals_target} Wholesome Meals</strong>
                  </div>
                </div>

                <div className="approved-actions-right">
                  <Link
                    href={`/annadan-sankalp/certificate/${searchResult.certificate_code}`}
                    target="_blank"
                    className="approved-direct-btn"
                  >
                    📜 Open Fullscreen View ↗
                  </Link>
                </div>
              </div>

              {/* Official Certificate with Download PNG & 1-Page PDF options */}
              <div className="embedded-cert-wrapper">
                <CommemorativeCertificate sankalp={searchResult} showBackLink={false} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Booking Form or Success Result */}
      <section className="sankalp-form-section" id="schedule-form">
        <div className="form-wrapper">
          {submittedResult ? (
            <div className="sankalp-success-card animate-fade-in">
              <div className="success-icon">🎉</div>
              <h2 className="success-title">Annadan Sankalp Successfully Pledged!</h2>
              <p className="success-desc">
                Thank you for your noble dedication in honor of <strong>{submittedResult.honoree_name}</strong> for {submittedResult.meals_target} wholesome meals.
              </p>
              <div className="certificate-code-box">
                <span className="code-label">YOUR CERTIFICATE REFERENCE ID:</span>
                <span className="code-val">{submittedResult.certificate_code}</span>
              </div>
              <div style={{ margin: '1rem 0', color: '#b45309', background: '#fffbeb', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.88rem' }}>
                ⏳ <strong>Note:</strong> Your dedication is now under administrative review. Once approved by the trust admin, your official Digital Certificate will unlock for 1-page PDF & PNG download.
              </div>
              <div className="success-action-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setRefCodeInput(submittedResult.certificate_code);
                    lookupReference(submittedResult.certificate_code);
                    const el = document.getElementById('track-certificate');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="theme-btn view-cert-btn"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  🔍 Track Approval Status by Ref ID ↓
                </button>
                <Link
                  href={`/annadan-sankalp/certificate/${submittedResult.certificate_code}`}
                  target="_blank"
                  className="theme-btn"
                  style={{ background: '#0f766e', color: '#fff', textDecoration: 'none', padding: '0.75rem 1.4rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  📜 Dedicated Tracker Page ↗
                </Link>
                <button
                  onClick={() => setSubmittedResult(null)}
                  className="theme-btn new-sankalp-btn"
                >
                  Pledge Another Dedication
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sankalp-form">
              <div className="form-header">
                <h2>Schedule an Annadan Sankalp</h2>
                <p>Fill in the details below to dedicate a commemorative meal drive.</p>
              </div>

              {error && <div className="form-error-alert">{error}</div>}

              {/* Step 1: Occasion Selection */}
              <div className="form-step">
                <div className="step-label">
                  <span className="step-num">1</span>
                  <span>Select Auspicious Occasion (प्रसंग निवडा)</span>
                </div>

                <div className="occasion-dropdown-wrapper" ref={occasionDropdownRef}>
                  {/* Dropdown Trigger Button */}
                  <div
                    className={`occasion-dropdown-trigger ${occasionDropdownOpen ? 'open' : ''}`}
                    onClick={() => setOccasionDropdownOpen(!occasionDropdownOpen)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={occasionDropdownOpen}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOccasionDropdownOpen(!occasionDropdownOpen);
                      }
                    }}
                  >
                    <div className="trigger-main-row">
                      <div className="trigger-identity">
                        <span className="trigger-icon">{selectedOccasion.icon}</span>
                        <div className="trigger-title-group">
                          <strong className="trigger-title">{selectedOccasion.title}</strong>
                          <span className="trigger-badge">Active Selection</span>
                        </div>
                      </div>
                      <div className="trigger-action">
                        <span className="trigger-change-hint">
                          {occasionDropdownOpen ? 'Close Menu ▲' : 'Choose Occasion ▼'}
                        </span>
                      </div>
                    </div>

                    <div className="trigger-desc-row">
                      <p className="trigger-desc">{selectedOccasion.desc}</p>
                    </div>
                  </div>

                  {/* Dropdown Menu (List Grid of 6 Occasions) */}
                  {occasionDropdownOpen && (
                    <div className="occasion-dropdown-menu animate-fade-in">
                      <div className="dropdown-menu-header">
                        <span>SELECT AUSPICIOUS OCCASION (6 CATEGORIES)</span>
                        <small>Click any category to apply</small>
                      </div>
                      <div className="occasion-grid-menu">
                        {occasionCards.map((c) => {
                          const isSelected = formData.occasion_type === c.type;
                          return (
                            <div
                              key={c.type}
                              className={`dropdown-grid-card ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  occasion_type: c.type,
                                  dedication_message: categoryDedicationMessages[c.type] || prev.dedication_message
                                }));
                                setOccasionDropdownOpen(false);
                              }}
                            >
                              <div className="card-icon">{c.icon}</div>
                              <div className="card-info">
                                <div className="card-title-row">
                                  <strong className="card-title">{c.title}</strong>
                                  {isSelected && <span className="card-check">✓ Active</span>}
                                </div>
                                <div className="card-desc">{c.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Honoree Details */}
              <div className="form-step">
                <div className="step-label">
                  <span className="step-num">2</span>
                  <span>Honoree & Dedication Details (कोणाच्या नावे अन्नदान?)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>
                      Name of Honoree / Loved One <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Late Shamrao Patil / चि. आरव पाटील"
                      value={formData.honoree_name}
                      onChange={(e) => setFormData({ ...formData, honoree_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Relationship / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Grandfather, Son, Parents, Self"
                      value={formData.honoree_relation}
                      onChange={(e) => setFormData({ ...formData, honoree_relation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>
                      Occasion / Drive Date <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Honoree Photo (Optional, shown on Certificate)</label>
                    <div className="photo-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        id="honoree-photo-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="honoree-photo-input" className="photo-upload-btn">
                        {uploadingPhoto ? 'Uploading...' : honoreePhotoUrl ? '✓ Photo Uploaded (Change)' : '📷 Upload Photo'}
                      </label>
                      {honoreePhotoUrl && (
                        <div className="photo-preview">
                          <img src={honoreePhotoUrl} alt="Honoree Preview" />
                          <button
                            type="button"
                            onClick={() => setHonoreePhotoUrl('')}
                            className="remove-photo-btn"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ margin: 0, fontWeight: 700 }}>
                      Personalized Blessing / Dedication Message <span className="req">*</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 800, background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.2rem 0.65rem', borderRadius: '50px' }}>
                      Fixed 1-Line for {occasionCards.find((c) => c.type === formData.occasion_type)?.title || 'Category'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={formData.dedication_message}
                    onChange={(e) => setFormData({ ...formData, dedication_message: e.target.value })}
                    placeholder={categoryDedicationMessages[formData.occasion_type]}
                    required
                    style={{
                      width: '100%',
                      padding: '0.78rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#f8fafc',
                      transition: 'border-color 0.2s ease'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      Official fixed 1-line dedication for this category, permanently inscribed on your Digital Certificate.
                    </small>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          dedication_message: categoryDedicationMessages[formData.occasion_type] || categoryDedicationMessages.birthday
                        })
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0d9488',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Reset to Category Default
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Meal Drive Preferences */}
              <div className="form-step">
                <div className="step-label">
                  <span className="step-num">3</span>
                  <span>Meal Drive Scope & Location (अन्नदान प्रमाण व स्थान)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Target Number of Meals</label>
                    <select
                      value={formData.meals_target}
                      onChange={(e) => setFormData({ ...formData, meals_target: Number(e.target.value) })}
                    >
                      <option value="50">50 Wholesome Meals</option>
                      <option value="100">100 Wholesome Meals</option>
                      <option value="200">200 Wholesome Meals</option>
                      <option value="500">500 Wholesome Meals (Grand Annadan)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Meal Type / Feast Category</label>
                    <select
                      value={formData.meal_type}
                      onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                    >
                      <option value="Festive Thali & Sweets">Festive Pure Ghee Thali & Sweets</option>
                      <option value="Nutritious Khichdi, Fruits & Sweets">Nutritious Khichdi, Seasonal Fruits & Sweets</option>
                      <option value="Puri Bhaji & Kheer / Halwa">Puri Bhaji & Kheer / Shira</option>
                      <option value="Traditional Maharashtrian Feast">Traditional Maharashtrian Feast</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Preferred Beneficiary Community</label>
                    <select
                      value={formData.preferred_beneficiary}
                      onChange={(e) => setFormData({ ...formData, preferred_beneficiary: e.target.value })}
                    >
                      <option value="Orphanage / Children Shelters">Orphanage / Children Shelters</option>
                      <option value="Old Age Homes (वृद्धाश्रम)">Old Age Homes (वृद्धाश्रम)</option>
                      <option value="Slum & Roadside Communities">Slum & Roadside Communities</option>
                      <option value="Civil Hospital Patient Relatives">Civil Hospital Patient Relatives</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred State</label>
                    <select
                      value={formData.state_id}
                      onChange={(e) => handleStateChange(e.target.value)}
                    >
                      <option value="">-- Choose State --</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred City</label>
                    <select
                      value={formData.city_id}
                      onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                      disabled={!formData.state_id}
                    >
                      <option value="">-- Choose City --</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Donor Details */}
              <div className="form-step">
                <div className="step-label">
                  <span className="step-num">4</span>
                  <span>Your Contact Details (संकल्पकर्ता माहिती)</span>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>
                      Your Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hridaynath Patil"
                      value={formData.donor_name}
                      onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      WhatsApp Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9822000000"
                      value={formData.donor_mobile}
                      onChange={(e) => setFormData({ ...formData, donor_mobile: e.target.value })}
                      required
                    />
                    <small style={{ color: '#0d9488' }}>
                      📲 Live photos & digital certificate will be delivered to this WhatsApp.
                    </small>
                  </div>

                  <div className="form-group">
                    <label>
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      value={formData.donor_email}
                      onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="form-submit-row">
                <button type="submit" disabled={submitting} className="sankalp-submit-btn">
                  {submitting ? 'Registering Sankalp...' : '🙏 Confirm & Pledge Annadan Sankalp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Wall of Blessings (Recent & Completed Sankalps) */}
      {wallSankalps.length > 0 && (
        <section className="wall-section">
          <div className="wall-container">
            <div className="wall-header">
              <span className="wall-tag">INSPIRING COMPASSION</span>
              <h2>Wall of Blessings (संकल्प गौरव दालन)</h2>
              <p>Commemorative meals pledged and conducted by generous souls across Maharashtra.</p>
            </div>

            <div className="wall-grid">
              {wallSankalps.map((item) => (
                <div key={item.id} className="wall-card">
                  <div className="wall-card-badge">
                    <span>
                      {item.occasion_type === 'birthday' ? '🎂 Birthday' : item.occasion_type === 'memorial' ? '🕊️ Smrutidin' : item.occasion_type === 'anniversary' ? '💍 Anniversary' : '🪔 Dedication'}
                    </span>
                    <span className={`status-pill ${item.status}`}>{item.status}</span>
                  </div>

                  <h3 className="wall-honoree">{item.honoree_name}</h3>
                  {item.honoree_relation && (
                    <div className="wall-relation">In honor of {item.honoree_relation}</div>
                  )}

                  <p className="wall-quote">"{item.dedication_message}"</p>

                  <div className="wall-meta">
                    <div>
                      <span className="meta-lbl">Pledged By</span>
                      <span className="meta-val">{item.donor_name}</span>
                    </div>
                    <div>
                      <span className="meta-lbl">Meals Served</span>
                      <span className="meta-val highlight">{item.meals_served || item.meals_target} Meals</span>
                    </div>
                  </div>

                  <div className="wall-card-footer">
                    <button
                      type="button"
                      onClick={() => handleOpenCertificate(item)}
                      className="wall-cert-btn"
                    >
                      📜 View Certificate →
                    </button>
                    <Link
                      href={`/annadan-sankalp/certificate/${item.certificate_code}`}
                      target="_blank"
                      className="wall-cert-newtab-btn"
                      title="Open Certificate in New Tab ↗"
                    >
                      ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Certificate Modal (Instant View from Wall of Blessings) */}
      {modalCertificate && (
        <div className="sankalp-modal-backdrop animate-fade-in" onClick={() => setModalCertificate(null)}>
          <div className="sankalp-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="sankalp-modal-header">
              <div className="modal-header-left">
                <span className="modal-seal-badge">★ VERIFIED COMMEMORATIVE CERTIFICATE</span>
                <strong>ID: {modalCertificate.certificate_code}</strong>
              </div>
              <button
                type="button"
                className="sankalp-modal-close"
                onClick={() => setModalCertificate(null)}
                aria-label="Close Certificate Modal"
              >
                ✕
              </button>
            </div>
            <div className="sankalp-modal-body">
              <CommemorativeCertificate sankalp={modalCertificate} showBackLink={false} />
            </div>
          </div>
        </div>
      )}

      {/* Page CSS */}
      <style jsx>{`
        .sankalp-page {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
        }

        /* Hero */
        .sankalp-hero {
          background: radial-gradient(circle at 50% 20%, #134e4a 0%, #042f2e 100%);
          color: #ffffff;
          padding: 4.5rem 1.5rem 5.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .sankalp-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35px;
          background: #f8fafc;
          clip-path: polygon(0 100%, 100% 100%, 100% 0);
        }

        .sankalp-hero-content {
          max-width: 860px;
          margin: 0 auto;
        }

        .sankalp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.4rem 1.25rem;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #5eead4;
          margin-bottom: 1.5rem;
        }

        .sankalp-title {
          font-size: 2.8rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 1.25rem;
          font-family: var(--font-title, serif);
        }

        .sankalp-subtitle {
          font-size: 1.15rem;
          line-height: 1.7;
          color: #ccfbf1;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .sankalp-shloka-banner {
          font-family: serif;
          font-size: 1.05rem;
          color: #fde047;
          background: rgba(0, 0, 0, 0.25);
          display: inline-block;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          border: 1px solid rgba(253, 224, 71, 0.35);
          letter-spacing: 0.5px;
        }



        /* Form */
        .sankalp-form-section {
          max-width: 960px;
          margin: 3.5rem auto;
          padding: 0 1.5rem;
        }

        .form-wrapper {
          background: #ffffff;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.06);
          border: 1px solid #e2e8f0;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1.5rem;
        }

        .form-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }

        .form-header p {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }

        .form-error-alert {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.75rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .form-step {
          margin-bottom: 2.5rem;
        }

        .step-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1.25rem;
        }

        .step-label .step-num {
          width: 34px;
          height: 34px;
          min-width: 34px;
          min-height: 34px;
          border-radius: 50%;
          background: #0d9488;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 800;
          line-height: 1;
          text-align: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
        }

        /* Occasions List Grid Dropdown Menu */
        .occasion-dropdown-wrapper {
          position: relative;
          width: 100%;
        }

        .occasion-dropdown-trigger {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          background: #ffffff;
          border: 2px solid #0d9488;
          border-radius: 12px;
          padding: 0.95rem 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.08);
          width: 100%;
        }

        .occasion-dropdown-trigger:hover,
        .occasion-dropdown-trigger.open {
          background: #f0fdfa;
          box-shadow: 0 4px 16px rgba(13, 148, 136, 0.16);
        }

        .trigger-main-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .trigger-identity {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-width: 0;
          flex: 1;
        }

        .trigger-icon {
          font-size: 2rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .trigger-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          min-width: 0;
        }

        .trigger-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.3;
        }

        .trigger-badge {
          background: #ccfbf1;
          color: #0f766e;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.15rem 0.55rem;
          border-radius: 50px;
          white-space: nowrap;
        }

        .trigger-action {
          flex-shrink: 0;
        }

        .trigger-change-hint {
          display: inline-flex;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 700;
          color: #0d9488;
          background: #f0fdfa;
          border: 1px solid #ccfbf1;
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .occasion-dropdown-trigger:hover .trigger-change-hint,
        .occasion-dropdown-trigger.open .trigger-change-hint {
          background: #0d9488;
          color: #ffffff;
        }

        .trigger-desc-row {
          width: 100%;
          padding-top: 0.45rem;
          border-top: 1px dashed #e2e8f0;
        }

        .trigger-desc {
          font-size: 0.84rem;
          color: #475569;
          margin: 0;
          line-height: 1.45;
          text-align: left;
        }

        .occasion-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
          padding: 1rem;
          z-index: 100;
        }

        .dropdown-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.65rem;
          margin-bottom: 0.85rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #475569;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .dropdown-menu-header small {
          color: #0d9488;
          font-weight: 700;
        }

        .occasion-grid-menu {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.75rem;
        }

        .dropdown-grid-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .dropdown-grid-card:hover {
          border-color: #0d9488;
          background: #f0fdfa;
          transform: translateY(-1px);
        }

        .dropdown-grid-card.active {
          border-color: #0d9488;
          background: #f0fdfa;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.15);
        }

        .card-icon {
          font-size: 1.8rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .card-info {
          min-width: 0;
          flex: 1;
        }

        .card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.2rem;
        }

        .card-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
        }

        .card-check {
          font-size: 0.72rem;
          font-weight: 800;
          color: #059669;
          background: #ecfdf5;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
        }

        .card-desc {
          font-size: 0.76rem;
          color: #64748b;
          line-height: 1.35;
        }

        /* Form Fields */
        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }

        .form-group label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #334155;
        }

        .req {
          color: #ef4444;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.7rem 0.9rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.92rem;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #0d9488;
        }

        .photo-upload-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .photo-upload-btn {
          display: inline-block;
          padding: 0.65rem 1.2rem;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px dashed #94a3b8;
          color: #475569;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
        }

        .photo-upload-btn:hover {
          background: #e2e8f0;
        }

        .photo-preview {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #0d9488;
        }

        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-photo-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        /* Submit */
        .form-submit-row {
          text-align: center;
          margin-top: 2rem;
        }

        .sankalp-submit-btn {
          background: #0d9488;
          color: #ffffff;
          padding: 1rem 3rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(13, 148, 136, 0.35);
          transition: all 0.2s;
        }

        .sankalp-submit-btn:hover {
          background: #0f766e;
          transform: translateY(-2px);
        }

        /* Success Card */
        .sankalp-success-card {
          text-align: center;
          padding: 2rem 1rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .success-title {
          font-size: 2.2rem;
          color: #0d9488;
          font-weight: 800;
          margin-bottom: 0.75rem;
        }

        .success-desc {
          font-size: 1.1rem;
          color: #475569;
          margin-bottom: 2rem;
        }

        .certificate-code-box {
          display: inline-block;
          background: #fffbeb;
          border: 2px dashed #d97706;
          padding: 1rem 2rem;
          border-radius: 12px;
          margin-bottom: 2.5rem;
        }

        .code-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 800;
          color: #92400e;
          letter-spacing: 1px;
          margin-bottom: 0.3rem;
        }

        .code-val {
          font-size: 1.6rem;
          font-family: monospace;
          font-weight: 800;
          color: #0f172a;
        }

        .success-action-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .view-cert-btn {
          background: #0d9488;
          color: #ffffff;
          padding: 0.85rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
        }

        .new-sankalp-btn {
          background: #f1f5f9;
          color: #334155;
          padding: 0.85rem 2rem;
          border-radius: 50px;
          border: 1px solid #cbd5e1;
          font-weight: 700;
          cursor: pointer;
        }

        /* Wall of Blessings */
        .wall-section {
          padding: 4rem 1.5rem;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
        }

        .wall-container {
          max-width: 1140px;
          margin: 0 auto;
        }

        .wall-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .wall-tag {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0d9488;
          letter-spacing: 1.5px;
          display: block;
          margin-bottom: 0.5rem;
        }

        .wall-header h2 {
          font-size: 2.2rem;
          color: #0f172a;
          font-weight: 800;
          margin: 0 0 0.5rem;
        }

        .wall-header p {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
        }

        .wall-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .wall-card {
          background: #f8fafc;
          border-radius: 14px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s;
        }

        .wall-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
        }

        .wall-card-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #d97706;
          margin-bottom: 0.75rem;
        }

        .status-pill {
          padding: 0.15rem 0.55rem;
          border-radius: 50px;
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .status-pill.completed {
          background: #ecfdf5;
          color: #059669;
        }

        .status-pill.confirmed,
        .status-pill.pledged {
          background: #fffbeb;
          color: #d97706;
        }

        .wall-honoree {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.2rem;
        }

        .wall-relation {
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .wall-quote {
          font-size: 0.92rem;
          color: #334155;
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          background: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border-left: 3px solid #0d9488;
        }

        .wall-meta {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.85rem;
          margin-bottom: 1rem;
        }

        .meta-lbl {
          display: block;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .meta-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
        }

        .meta-val.highlight {
          color: #0d9488;
        }

        .wall-card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          margin-top: auto;
        }

        .wall-cert-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #0d9488;
          color: #ffffff;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wall-cert-btn:hover {
          background: #0f766e;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
        }

        .wall-cert-newtab-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          text-decoration: none;
          font-weight: 800;
          font-size: 1rem;
          border: 1px solid #cbd5e1;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .wall-cert-newtab-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #94a3b8;
        }

        /* Certificate Modal Overlay */
        .sankalp-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .sankalp-modal-container {
          background: #ffffff;
          border-radius: 20px;
          max-width: 980px;
          width: 100%;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          border: 2px solid #fed7aa;
          animation: modalSlideUp 0.25s ease-out;
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .sankalp-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.75rem;
          background: #fffbeb;
          border-bottom: 1.5px solid #fed7aa;
          flex-shrink: 0;
        }

        .modal-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.92rem;
          color: #92400e;
        }

        .modal-seal-badge {
          background: #d97706;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.65rem;
          border-radius: 50px;
          letter-spacing: 0.5px;
        }

        .sankalp-modal-close {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sankalp-modal-close:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        .sankalp-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
          background: #f8fafc;
        }

        /* Verification & Certificate Tracker Section */
        .verify-certificate-section {
          background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 40%, #f8fafc 100%);
          padding: 4.5rem 1.5rem 5rem;
          border-top: 1px solid #ccfbf1;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
        }

        .verify-card-container {
          max-width: 1040px;
          margin: 0 auto;
        }

        .verify-header-block {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 2.5rem;
        }

        .verify-badge {
          display: inline-block;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }

        .verify-main-heading {
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.75rem;
        }

        .verify-subheading {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
        }

        .verify-search-form {
          display: flex;
          gap: 0.75rem;
          max-width: 680px;
          margin: 0 auto 1rem;
        }

        .verify-search-box {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .verify-search-icon {
          position: absolute;
          left: 1rem;
          font-size: 1.1rem;
          pointer-events: none;
        }

        .verify-input {
          width: 100%;
          padding: 0.85rem 2.5rem 0.85rem 2.85rem;
          border-radius: 12px;
          border: 2px solid #cbd5e1;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .verify-input:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.15);
        }

        .verify-clear-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.25rem;
        }

        .verify-submit-btn {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          color: #ffffff;
          border: none;
          padding: 0.85rem 1.85rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
          transition: all 0.2s ease;
        }

        .verify-submit-btn:hover {
          background: #0f766e;
          transform: translateY(-1px);
        }

        .verify-samples-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          font-size: 0.82rem;
        }

        .sample-label {
          color: #64748b;
          font-weight: 600;
        }

        .sample-btn {
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sample-btn.approved {
          color: #059669;
          border: 1px dashed #a7f3d0;
          background: #ecfdf5;
        }

        .sample-btn.approved:hover {
          background: #d1fae5;
        }

        .sample-btn.pending {
          color: #d97706;
          border: 1px dashed #fde68a;
          background: #fffbeb;
        }

        .sample-btn.pending:hover {
          background: #fef3c7;
        }

        .verify-loading-card {
          text-align: center;
          padding: 2.5rem;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .verify-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f1f5f9;
          border-top-color: #0d9488;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 0.75rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .verify-error-card {
          background: #fff1f2;
          border: 1.5px solid #fecdd3;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #be123c;
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        /* Pending View Card */
        .verify-pending-card {
          background: #ffffff;
          border: 2px solid #fed7aa;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          margin-bottom: 2rem;
        }

        .pending-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #fef3c7;
          padding-bottom: 0.75rem;
        }

        .pending-status-pill {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
          padding: 0.35rem 0.85rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .pending-code-tag {
          font-family: monospace;
          background: #f1f5f9;
          color: #334155;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .pending-icon-header {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          margin-bottom: 1.75rem;
        }

        .pending-big-icon {
          font-size: 2.75rem;
          line-height: 1;
        }

        .pending-title {
          font-size: 1.5rem;
          color: #0f172a;
          margin: 0 0 0.5rem;
          font-weight: 800;
        }

        .pending-desc {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        .pending-workflow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 1.75rem;
        }

        .workflow-card {
          padding: 0.5rem;
        }

        .workflow-card .step-num {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          margin-bottom: 0.2rem;
        }

        .step-done .step-num { color: #059669; }
        .step-active .step-num { color: #d97706; }
        .step-locked .step-num { color: #64748b; }
        .step-scheduled .step-num { color: #0284c7; }

        .step-status {
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .step-done .step-status { color: #059669; font-weight: 700; }
        .step-active .step-status { color: #d97706; font-weight: 700; }
        .step-locked .step-status { color: #64748b; }
        .step-scheduled .step-status { color: #0284c7; font-weight: 600; }

        .pending-summary-box {
          background: #fffbeb;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          padding: 1.25rem;
          font-size: 0.88rem;
          margin-bottom: 1.5rem;
        }

        .summary-title {
          font-weight: 800;
          color: #92400e;
          margin-bottom: 0.6rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.65rem;
          color: #1e293b;
        }

        .pending-helpline-note {
          font-size: 0.85rem;
          color: #64748b;
          text-align: center;
        }

        /* Approved View Container */
        .verify-approved-container {
          margin-top: 1rem;
        }

        .approved-notification-bar {
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          border-radius: 14px;
          padding: 1.25rem 1.75rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .approved-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #059669;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }

        .approved-honoree-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #065f46;
          margin: 0 0 0.25rem;
        }

        .approved-meta-line {
          font-size: 0.85rem;
          color: #047857;
        }

        .approved-direct-btn {
          background: #0d9488;
          color: #ffffff;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .approved-direct-btn:hover {
          background: #0f766e;
        }

        .embedded-cert-wrapper {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          background: #ffffff;
        }

        @media (max-width: 768px) {
          .sankalp-title {
            font-size: 2rem;
          }
          .form-wrapper {
            padding: 1.25rem 1rem;
          }
          .step-label {
            font-size: 1.05rem;
            gap: 0.6rem;
          }
          .step-label .step-num {
            width: 30px;
            height: 30px;
            min-width: 30px;
            min-height: 30px;
            font-size: 0.9rem;
          }
          .occasion-dropdown-trigger {
            padding: 0.8rem 0.9rem;
            gap: 0.5rem;
          }
          .trigger-icon {
            font-size: 1.6rem;
          }
          .trigger-title {
            font-size: 0.95rem;
          }
          .trigger-change-hint {
            font-size: 0.75rem;
            padding: 0.25rem 0.6rem;
          }
          .trigger-desc {
            font-size: 0.8rem;
          }
          .occasion-dropdown-menu {
            max-height: 70vh;
            overflow-y: auto;
            padding: 0.75rem;
          }
          .occasion-grid-menu {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .dropdown-grid-card {
            padding: 0.7rem 0.85rem;
          }
          .verify-search-form {
            flex-direction: column;
          }
          .pending-icon-header {
            flex-direction: column;
            gap: 0.5rem;
          }
          .approved-notification-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
