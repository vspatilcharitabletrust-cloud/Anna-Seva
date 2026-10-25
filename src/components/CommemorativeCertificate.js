'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';

export default function CommemorativeCertificate({ sankalp, showBackLink = true, isAdmin = false }) {
  const [copied, setCopied] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [approving, setApproving] = useState(false);
  const [localStatus, setLocalStatus] = useState(sankalp?.status || 'pledged');

  const certRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (sankalp?.status) {
      setLocalStatus(sankalp.status);
    }
  }, [sankalp?.status]);

  if (!sankalp) return null;

  const isApproved = ['approved', 'conducted', 'completed'].includes(localStatus);

  const occasionMeta = {
    birthday: {
      titleEn: 'Birthday Annadan Dedication',
      titleMr: 'वाढदिवस अन्नदान संकल्प',
      icon: '🎂',
      color: '#d97706',
      leadText: 'In Joyous & Auspicious Celebration of the Birthday of',
      fixedBlessing: 'Wishing a blessed, joyous, and long life filled with radiant health, peace, and prosperity.'
    },
    anniversary: {
      titleEn: 'Wedding Anniversary Dedication',
      titleMr: 'लग्नाचा वाढदिवस अन्नदान संकल्प',
      icon: '💍',
      color: '#0d9488',
      leadText: 'In Sacred Celebration of the Wedding Anniversary of',
      fixedBlessing: 'Celebrating eternal love, sacred companionship, mutual respect, and lifelong harmony.'
    },
    memorial: {
      titleEn: 'In Sacred & Loving Memory (Smrutidin)',
      titleMr: 'पुण्यस्मरण व स्मृतीदिन अन्नदान संकल्प',
      icon: '🕊️',
      color: '#475569',
      leadText: 'In Everlasting Love & Sacred Remembrance of',
      fixedBlessing: 'In sacred and everlasting loving memory, honoring a cherished soul whose noble blessings live on forever.'
    },
    achievement: {
      titleEn: 'Celebration of Achievement & Milestones',
      titleMr: 'यशस्वी क्षण व कर्तृत्व अन्नदान संकल्प',
      icon: '🌟',
      color: '#7c3aed',
      leadText: 'In Grateful Honor of the Grand Milestone of',
      fixedBlessing: 'Honoring outstanding milestone achievement with pride, and wishing distinguished success and triumph ahead.'
    },
    festival: {
      titleEn: 'Auspicious Festival & Holy Day Seva',
      titleMr: 'सण व शुभ प्रसंग अन्नदान संकल्प',
      icon: '🪔',
      color: '#b45309',
      leadText: 'On the Auspicious & Blessed Occasion of',
      fixedBlessing: 'May the divine grace and auspicious warmth of this holy festival bring peace and abundance to all.'
    },
    other: {
      titleEn: 'Commemorative Meal Dedication',
      titleMr: 'अन्नदान संकल्प',
      icon: '🙏',
      color: '#0f766e',
      leadText: 'In Honor and Dedication of',
      fixedBlessing: 'Dedicated with humble devotion, heartfelt gratitude, and prayers for universal peace and nourishment.'
    }
  };

  const meta = occasionMeta[sankalp.occasion_type] || occasionMeta.other;

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `🙏 *अन्नदान संकल्प सन्मान पत्र (Anna Seva)*\n\nIn auspicious dedication of *${sankalp.honoree_name}* (${meta.titleMr}), a commemorative meal drive of *${sankalp.meals_served || sankalp.meals_target} meals* has been officially approved & conducted via Anna Seva.\n\nView and download the verified commemorative certificate & drive photos here:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPng = async () => {
    if (!certRef.current) return;
    setDownloadingPng(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Anna_Seva_Certificate_${sankalp.certificate_code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('Could not export PNG. You can also use Print / Save as PDF.');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleAdminApproveNow = async () => {
    if (!confirm('Approve this Annadan Sankalp and officially generate the Commemorative Certificate?')) return;
    setApproving(true);
    try {
      const res = await fetch('/api/sankalp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sankalp.id, status: 'approved' })
      });
      if (res.ok) {
        setLocalStatus('approved');
        alert('Annadan Sankalp approved! Digital Certificate is now officially active and unlocked.');
      } else {
        alert('Failed to approve.');
      }
    } catch (e) {
      alert('Error approving sankalp.');
    } finally {
      setApproving(false);
    }
  };

  const drivePhotos = Array.isArray(sankalp.drive_photos) ? sankalp.drive_photos : [];

  // IF NOT YET APPROVED: DISPLAY PENDING APPROVAL NOTIFICATION
  if (!isApproved) {
    return (
      <div className="certificate-page-container">
        {/* Navigation Toolbar */}
        <div className="certificate-toolbar no-print">
          {showBackLink && (
            <Link href="/annadan-sankalp" className="toolbar-back-btn">
              ← Back to Annadan Sankalp
            </Link>
          )}
          <div className="toolbar-actions">
            <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700, padding: '0.35rem 0.85rem', borderRadius: '50px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              ⏳ Pending Admin Approval
            </span>
            <button onClick={handleCopyLink} className="toolbar-btn copy-btn">
              {copied ? '✓ Link Copied!' : '🔗 Copy Reference Link'}
            </button>
          </div>
        </div>

        {/* Pending Approval Notice Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #fed7aa',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          maxWidth: '780px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            padding: '0.35rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            APPROVAL PENDING • मंजुरीच्या प्रतीक्षेत
          </div>

          <h2 style={{ fontSize: '1.9rem', color: '#0f172a', fontWeight: 800, margin: '0 0 0.75rem' }}>
            Commemorative Certificate Under Review
          </h2>

          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto 2rem' }}>
            The Annadan Sankalp in sacred honor of <strong>{sankalp.honoree_name}</strong> has been successfully registered. As per trust policy, the official <strong>Digital Commemorative Certificate</strong> is generated and unlocked immediately once approved by the Anna Seva administration.
          </p>

          {/* Workflow Status Tracker */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, display: 'block' }}>STEP 1</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Pledge Registered</strong>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.2rem' }}>✓ Completed</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 800, display: 'block' }}>STEP 2</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Admin Review</strong>
              <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.2rem' }}>⏳ In Progress</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, display: 'block' }}>STEP 3</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Certificate Unlocked</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>🔒 Unlocks on Approval</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, display: 'block' }}>STEP 4</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Meal Drive Seva</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>🍲 On {sankalp.event_date}</div>
            </div>
          </div>

          {/* Registered Details Summary */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fed7aa',
            borderRadius: '10px',
            padding: '1.25rem',
            textAlign: 'left',
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              📋 Sankalp Overview
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><strong>Honoree:</strong> {sankalp.honoree_name} {sankalp.honoree_relation ? `(${sankalp.honoree_relation})` : ''}</div>
              <div><strong>Occasion:</strong> {meta.titleMr}</div>
              <div><strong>Meals Target:</strong> {sankalp.meals_target} Meals</div>
              <div><strong>Scheduled Date:</strong> {sankalp.event_date}</div>
              <div><strong>Pledged By:</strong> {sankalp.donor_name} ({sankalp.donor_mobile})</div>
              <div><strong>Reference ID:</strong> <code>{sankalp.certificate_code}</code></div>
            </div>
          </div>

          {/* Admin Approval Quick Action (If Admin viewing) */}
          {isAdmin ? (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleAdminApproveNow}
                disabled={approving}
                style={{
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 2.25rem',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: approving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(13, 148, 136, 0.35)'
                }}
              >
                {approving ? 'Approving...' : '✓ Approve & Generate Certificate Now'}
              </button>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              Need urgent assistance? Contact Anna Seva Coordination Helpline: <strong>+91 1800-111-222</strong>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ONCE APPROVED: FULL ROYAL DIGITAL COMMEMORATIVE CERTIFICATE
  return (
    <div className="certificate-page-container">
      {/* Action Toolbar */}
      <div className="certificate-toolbar no-print">
        {showBackLink && (
          <Link href="/annadan-sankalp" className="toolbar-back-btn">
            ← Back to Annadan Sankalp
          </Link>
        )}
        <div className="toolbar-actions">
          <button onClick={handlePrint} className="toolbar-btn print-btn" title="Save as 1-Page PDF">
            🖨️ Save as 1-Page PDF
          </button>
          <button onClick={handleDownloadPng} disabled={downloadingPng} className="toolbar-btn png-btn" title="Download High-Res PNG Image">
            {downloadingPng ? 'Generating PNG...' : '🖼️ Download PNG'}
          </button>
          <button onClick={handleWhatsAppShare} className="toolbar-btn whatsapp-btn" title="Share Certificate on WhatsApp">
            📲 Share on WhatsApp
          </button>
          <button onClick={handleCopyLink} className="toolbar-btn copy-btn" title="Copy Certificate Link">
            {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
          </button>
        </div>
      </div>

      {/* Main Printed Certificate (Target for PDF & PNG capture) */}
      <div className="certificate-frame" ref={certRef}>
        <div className="certificate-inner-border">
          <div className="certificate-watermark">अन्न सेवा</div>

          {/* Top Sanskrit Shloka */}
          <div className="certificate-shloka">
            ॥ अन्नदानं परं दानं विद्यादानात् परं ततः । अन्नेन क्षणिका तृप्तिः यावज्जीवं च विद्यया ॥
          </div>

          {/* Organization Header */}
          <div className="certificate-org-header">
            <div className="cert-logo-seal">
              <img src="/icon.png" alt="Anna Seva Emblem" />
            </div>
            <div className="cert-org-details">
              <span className="cert-trust-name">SHRI VISHWANATHRAO SHAMRAO PATIL CHARITABLE TRUST</span>
              <h1 className="cert-brand-title">अन्न सेवा • ANNA SEVA</h1>
              <span className="cert-subtitle">National Surplus Food Coordination & Humanitarian Meal Network</span>
            </div>
          </div>

          {/* Certificate Award Ribbon */}
          <div className="certificate-ribbon">
            <div className="ribbon-line" />
            <div className="ribbon-badge">
              <span className="ribbon-icon">{meta.icon}</span>
              <span className="ribbon-text">अन्नदान संकल्प सन्मान पत्र • CERTIFICATE OF COMMEMORATIVE DEDICATION</span>
            </div>
            <div className="ribbon-line" />
          </div>

          {/* Lead Text */}
          <p className="cert-lead-text">{meta.leadText}</p>

          {/* Honoree Showcase */}
          <div className="cert-honoree-showcase">
            {sankalp.honoree_photo ? (
              <div className="cert-honoree-photo-frame">
                <img src={sankalp.honoree_photo} alt={sankalp.honoree_name} />
              </div>
            ) : (
              <div className="cert-honoree-avatar-frame">
                <span style={{ fontSize: '2.5rem' }}>{meta.icon}</span>
              </div>
            )}
            <h2 className="cert-honoree-name">{sankalp.honoree_name}</h2>
            {sankalp.honoree_relation && (
              <div className="cert-honoree-relation">({sankalp.honoree_relation})</div>
            )}
          </div>

          {/* Dedication Blessing Message */}
          <div className="cert-dedication-box">
            <p className="cert-dedication-text">"{sankalp.dedication_message || meta.fixedBlessing}"</p>
          </div>

          {/* Verified Drive Details Table */}
          <div
            className="cert-details-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0.85rem'
            }}
          >
            <div className="cert-detail-item">
              <span className="detail-label">संकल्पकर्ता (PLEDGED BY)</span>
              <span className="detail-value">{sankalp.donor_name}</span>
            </div>
            <div className="cert-detail-item">
              <span className="detail-label">अन्नदान प्रमाण (MEALS SERVED)</span>
              <span className="detail-value highlight">{sankalp.meals_served || sankalp.meals_target} Wholesome Meals</span>
            </div>
            <div className="cert-detail-item">
              <span className="detail-label">सेवा स्थान (LOCATION / SHELTER)</span>
              <span className="detail-value">{sankalp.drive_location_name || sankalp.preferred_beneficiary || `${sankalp.city_name || 'Pune'}, ${sankalp.state_name || 'Maharashtra'}`}</span>
            </div>
            <div className="cert-detail-item">
              <span className="detail-label">शुभ दिनांक (EVENT DATE)</span>
              <span className="detail-value">{sankalp.conducted_date || sankalp.event_date}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="cert-status-row">
            <span className="cert-status-badge">
              ✓ Officially Approved & Certified Food Drive ({localStatus.toUpperCase()})
            </span>
          </div>

          {/* Signatures & Seal */}
          <div className="cert-footer-row">
            <div className="cert-signature-block">
              <div className="cert-sig-line">
                <span className="sig-handwritten">H. B. Patil</span>
              </div>
              <span className="cert-sig-role">Managing Trustee</span>
            </div>

            <div className="cert-golden-seal">
              <div className="seal-circle">
                <div className="seal-inner">
                  <span>★ OFFICIAL ★</span>
                  <strong>ANNA SEVA</strong>
                  <span>VERIFIED</span>
                </div>
              </div>
              <div className="cert-code-tag">ID: {sankalp.certificate_code}</div>
            </div>

            <div className="cert-signature-block">
              <div className="cert-sig-line">
                <span className="sig-handwritten">V. B. Patil</span>
              </div>
              <span className="cert-sig-role">Food Drive Coordinator</span>
              <span className="cert-sig-org">Seva Operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drive Photos Section (Screen Only) */}
      {drivePhotos.length > 0 && (
        <div className="drive-photos-section no-print">
          <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📸</span> Live Meal Distribution Photos from the Drive
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Glimpses of beneficiaries receiving fresh meals in honor of {sankalp.honoree_name}.
          </p>
          <div className="photos-gallery-grid">
            {drivePhotos.map((photo, idx) => (
              <div key={idx} className="photo-card" onClick={() => setActivePhoto(photo)}>
                <img src={photo} alt={`Distribution ${idx + 1}`} />
                <div className="photo-overlay">🔍 Click to zoom</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="cert-lightbox-modal" onClick={() => setActivePhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto} alt="Drive Photo Full" />
            <button className="lightbox-close" onClick={() => setActivePhoto(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Certificate Styling (Scoped & Strictly 1-Page Print Optimized) */}
      <style jsx>{`
        .certificate-page-container {
          max-width: 980px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
          font-family: var(--font-body, system-ui, sans-serif);
        }

        .certificate-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          background: #ffffff;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .toolbar-back-btn {
          color: #0d9488;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .toolbar-btn {
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .print-btn {
          background: #0f172a;
          color: #ffffff;
        }
        .print-btn:hover {
          background: #1e293b;
        }

        .png-btn {
          background: #0d9488;
          color: #ffffff;
        }
        .png-btn:hover {
          background: #0f766e;
        }

        .whatsapp-btn {
          background: #25d366;
          color: #ffffff;
        }
        .whatsapp-btn:hover {
          background: #20ba5a;
        }

        .copy-btn {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .copy-btn:hover {
          background: #e2e8f0;
        }

        /* Certificate Frame */
        .certificate-frame {
          position: relative;
          background: #ffffff;
          border: 14px solid #b45309;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12), inset 0 0 0 3px #fbbf24;
          border-radius: 16px;
          padding: 18px;
          color: #0f172a;
          box-sizing: border-box;
        }

        .certificate-inner-border {
          position: relative;
          border: 2px dashed #d97706;
          border-radius: 10px;
          padding: 2.5rem 3rem;
          background: radial-gradient(circle at center, #ffffff 40%, #fffbeb 100%);
          overflow: hidden;
          box-sizing: border-box;
        }

        .certificate-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: 7rem;
          font-weight: 900;
          color: rgba(217, 119, 6, 0.035);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 0;
        }

        .certificate-shloka {
          text-align: center;
          font-size: 0.92rem;
          color: #b45309;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(217, 119, 6, 0.25);
          padding-bottom: 0.75rem;
          font-family: serif;
        }

        .certificate-org-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          text-align: center;
          margin-bottom: 1.75rem;
          position: relative;
          z-index: 1;
        }

        .cert-logo-seal img {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 3px solid #d97706;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(217, 119, 6, 0.2);
        }

        .cert-trust-name {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #92400e;
          display: block;
        }

        .cert-brand-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0.2rem 0;
          letter-spacing: 0.5px;
          font-family: var(--font-title, serif);
        }

        .cert-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
          display: block;
        }

        .certificate-ribbon {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin: 1.5rem 0 1.25rem;
          position: relative;
          z-index: 1;
        }

        .ribbon-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d97706, transparent);
        }

        .ribbon-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #b45309;
          color: #ffffff;
          padding: 0.4rem 1.4rem;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25);
        }

        .cert-lead-text {
          text-align: center;
          font-size: 1.05rem;
          color: #475569;
          font-style: italic;
          margin: 1rem 0 0.5rem;
          position: relative;
          z-index: 1;
        }

        .cert-honoree-showcase {
          text-align: center;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .cert-honoree-photo-frame {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 4px solid #d97706;
          margin: 0 auto 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .cert-honoree-photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cert-honoree-avatar-frame {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px dashed #d97706;
          margin: 0 auto 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fffbeb;
        }

        .cert-honoree-name {
          font-size: 2.1rem;
          font-weight: 800;
          color: #b45309;
          margin: 0;
          letter-spacing: 0.5px;
          font-family: var(--font-title, serif);
        }

        .cert-honoree-relation {
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 600;
          margin-top: 0.2rem;
        }

        .cert-dedication-box {
          max-width: 720px;
          margin: 0 auto 1.75rem;
          background: rgba(254, 243, 199, 0.5);
          border-left: 4px solid #d97706;
          border-right: 4px solid #d97706;
          padding: 1rem 1.75rem;
          border-radius: 8px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cert-dedication-text {
          font-size: 1.05rem;
          color: #334155;
          font-style: italic;
          line-height: 1.6;
          margin: 0;
          font-family: serif;
        }

        .cert-details-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.85rem;
          background: #ffffff;
          padding: 1.1rem 1.25rem;
          border-radius: 12px;
          border: 1px solid #fed7aa;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .cert-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .detail-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.4px;
          color: #9a3412;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .detail-value {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          word-break: break-word;
        }

        .detail-value.highlight {
          color: #0d9488;
        }

        .cert-status-row {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .cert-status-badge {
          display: inline-block;
          padding: 0.35rem 1.25rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .cert-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-top: 1.5rem;
          border-top: 1px solid #fed7aa;
          position: relative;
          z-index: 1;
        }

        .cert-signature-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 170px;
        }

        .cert-sig-line {
          width: 100%;
          border-bottom: 1.5px solid #64748b;
          margin-bottom: 0.4rem;
          height: 38px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .sig-handwritten {
          font-family: 'Brush Script MT', cursive, serif;
          font-size: 1.6rem;
          color: #1e293b;
          opacity: 0.9;
        }

        .cert-sig-role {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        .cert-sig-org {
          font-size: 0.72rem;
          color: #64748b;
        }

        .cert-golden-seal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
        }

        .seal-circle {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: radial-gradient(circle, #fbbf24 30%, #b45309 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(180, 83, 9, 0.4);
          border: 2px solid #ffffff;
        }

        .seal-inner {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 1px dashed #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 0.55rem;
          font-weight: 800;
          text-align: center;
          line-height: 1.1;
        }

        .cert-code-tag {
          font-size: 0.7rem;
          font-family: monospace;
          color: #64748b;
          font-weight: 700;
        }

        /* Drive Photos Section */
        .drive-photos-section {
          margin-top: 3rem;
          background: #ffffff;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .photos-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .photo-card {
          position: relative;
          height: 140px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease;
        }

        .photo-card:hover {
          transform: translateY(-3px);
        }

        .photo-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .photo-card:hover .photo-overlay {
          opacity: 1;
        }

        /* Lightbox */
        .cert-lightbox-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
        }

        .lightbox-content {
          position: relative;
          max-width: 900px;
          max-height: 85vh;
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 85vh;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .lightbox-close {
          position: absolute;
          top: -15px;
          right: -15px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          color: #0f172a;
          border: none;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        /* STRICTLY 1-PAGE PDF PRINT STYLES */
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }

          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          header,
          footer,
          .public-header,
          .public-footer,
          .drive-photos-section,
          .certificate-toolbar {
            display: none !important;
          }

          .certificate-page-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            padding: 0 !important;
            margin: 0 auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }

          .certificate-frame {
            width: 100% !important;
            max-width: 280mm !important; /* A4 width 297mm minus 12mm margins */
            height: 195mm !important; /* A4 height 210mm minus 12mm margins */
            max-height: 195mm !important;
            border-width: 8px !important;
            box-shadow: none !important;
            border-radius: 4px !important;
            padding: 6px !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }

          .certificate-inner-border {
            height: 100% !important;
            padding: 1rem 1.75rem !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }

          .certificate-shloka {
            font-size: 0.8rem !important;
            margin-bottom: 0.5rem !important;
            padding-bottom: 0.35rem !important;
          }

          .certificate-org-header {
            margin-bottom: 0.6rem !important;
            gap: 0.75rem !important;
          }

          .cert-logo-seal img {
            width: 52px !important;
            height: 52px !important;
          }

          .cert-brand-title {
            font-size: 1.7rem !important;
            margin: 0 !important;
          }

          .certificate-ribbon {
            margin: 0.5rem 0 !important;
          }

          .cert-lead-text {
            font-size: 0.92rem !important;
            margin: 0.35rem 0 !important;
          }

          .cert-honoree-showcase {
            margin-bottom: 0.6rem !important;
          }

          .cert-honoree-name {
            font-size: 1.7rem !important;
            margin: 0 !important;
          }

          .cert-honoree-photo-frame,
          .cert-honoree-avatar-frame {
            width: 56px !important;
            height: 56px !important;
            margin-bottom: 0.3rem !important;
          }

          .cert-dedication-box {
            margin: 0.4rem auto 0.75rem !important;
            padding: 0.5rem 1rem !important;
          }

          .cert-dedication-text {
            font-size: 0.88rem !important;
            line-height: 1.4 !important;
          }

          .cert-details-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            padding: 0.5rem 0.75rem !important;
            margin-bottom: 0.6rem !important;
            gap: 0.5rem !important;
          }

          .detail-label {
            font-size: 0.62rem !important;
            white-space: nowrap !important;
          }

          .detail-value {
            font-size: 0.85rem !important;
          }

          .cert-status-row {
            margin-bottom: 0.6rem !important;
          }

          .cert-footer-row {
            padding-top: 0.5rem !important;
          }

          .seal-circle {
            width: 64px !important;
            height: 64px !important;
          }

          .seal-inner {
            width: 52px !important;
            height: 52px !important;
          }
        }

        @media (max-width: 768px) {
          .certificate-inner-border {
            padding: 1.5rem 1rem;
          }
          .cert-brand-title {
            font-size: 1.6rem;
          }
          .cert-honoree-name {
            font-size: 1.6rem;
          }
          .cert-footer-row {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }
          .cert-signature-block {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
