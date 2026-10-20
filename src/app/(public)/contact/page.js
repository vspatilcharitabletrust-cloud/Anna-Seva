'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [pageText, setPageText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/pages')
      .then((res) => res.json())
      .then((data) => {
        if (data.contact_text) {
          setPageText(data.contact_text);
        }
      })
      .catch(() => { });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Your message has been sent successfully. We will get back to you soon!' });
        setFormData({ name: '', email: '', mobile: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  const contactDescription = language !== 'en'
    ? t('contact.desc_default')
    : (pageText || t('contact.desc_default'));

  return (
    <div className="public-container animate-fade-in responsive-grid-contact">

      {/* Contact Info Panel */}
      <div className="contact-info-panel">
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: 'var(--text-dark)', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>
          {t('contact.title', 'Contact Us')}
        </h1>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
          {contactDescription}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem', backgroundColor: 'var(--primary-teal-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary-teal-dark)' }}>✉</span>
            <div>
              <div style={{ fontWeight: 600 }}>{t('contact.email_title', 'Email Address')}</div>
              <div style={{ color: 'var(--text-muted)', wordBreak: 'break-word' }}>{t('contact.email_val', 'vspatil.charitabletrust@gmail.com')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem', backgroundColor: 'var(--primary-teal-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary-teal-dark)' }}>📍</span>
            <div>
              <div style={{ fontWeight: 600 }}>{t('contact.office_title', 'Central Office')}</div>
              <div style={{ color: 'var(--text-muted)', wordBreak: 'break-word' }}>{t('contact.office_val', 'Matoshree Empire, Latur, Maharashtra, India')}</div>
            </div>
          </div>
          <a
            href="https://www.instagram.com/shri.vishwanathrao.patil_trust?vrfl=bGpvbGcxaGlsNHF1&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(225, 48, 108, 0.25)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span>{t('contact.instagram_title', 'Official Account of Trust')}</span>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(225, 48, 108, 0.1)', color: '#e1306c', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                  {t('contact.follow_updates', 'Follow for Updates')}
                </span>
              </div>
              <div style={{ color: 'var(--accent-teal-dark)', wordBreak: 'break-word', fontWeight: 600, fontSize: '0.92rem', marginTop: '0.15rem' }}>
                @shri.vishwanathrao.patil_trust ↗
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Enquiry Form */}
      <div className="form-card" style={{ width: '100%', margin: '0' }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
          {t('contact.form_title', 'Send Message')}
        </h2>

        {status.message && (
          <div style={{
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: status.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontWeight: 500
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('contact.name_label', 'Full Name')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
              placeholder={t('contact.name_placeholder', 'Enter your name')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('contact.email_label', 'Email Address')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              placeholder={t('contact.email_placeholder', 'Enter your email')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">{t('contact.mobile_label', 'Mobile Number')}</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="form-input"
              required
              placeholder={t('contact.mobile_placeholder', 'Enter 10-digit mobile')}
              pattern="[0-9]{10}"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">{t('contact.message_label', 'Your Message')}</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="form-textarea"
              required
              rows="4"
              placeholder={t('contact.message_placeholder', 'Write your enquiry message here...')}
            ></textarea>
          </div>

          <button
            type="submit"
            className="form-submit-btn"
            disabled={submitting}
          >
            {submitting ? t('contact.submitting', 'Sending...') : t('contact.submit_btn', 'Submit Enquiry')}
          </button>
        </form>
      </div>

    </div>
  );
}
