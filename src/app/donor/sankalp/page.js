'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DonorSankalpPage() {
  const [sankalps, setSankalps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sankalp?my_sankalps=true')
      .then((res) => res.json())
      .then((data) => setSankalps(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', margin: 0 }}>
            🎂 My Annadan Sankalps (अन्नदान संकल्प)
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
            Track your commemorative meal dedications, download digital certificates, and view distribution updates
          </p>
        </div>

        <Link
          href="/annadan-sankalp"
          className="theme-btn"
          style={{
            backgroundColor: '#0d9488',
            color: '#ffffff',
            padding: '0.65rem 1.3rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 10px rgba(13, 148, 136, 0.25)'
          }}
        >
          <span>➕</span> Pledge New Annadan Sankalp
        </Link>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your dedications...</div>
        ) : sankalps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎂</div>
            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Commemorative Sankalps Yet</h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
              Celebrate upcoming birthdays, wedding anniversaries, or honor departed ancestors by sponsoring meal drives for orphanages and shelters.
            </p>
            <Link
              href="/annadan-sankalp"
              style={{
                backgroundColor: '#0d9488',
                color: '#ffffff',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Pledge Your First Sankalp →
            </Link>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.NO</th>
                <th>Dedicated In Honor Of</th>
                <th>Occasion</th>
                <th>Event Date</th>
                <th>Meals</th>
                <th>Target Beneficiary</th>
                <th>Status</th>
                <th style={{ width: '220px' }}>Commemorative Actions</th>
              </tr>
            </thead>
            <tbody>
              {sankalps.map((s, index) => {
                const isApproved = ['approved', 'conducted', 'completed'].includes(s.status);
                return (
                  <tr key={s.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                        {s.honoree_name}
                      </div>
                      {s.honoree_relation && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Relation: {s.honoree_relation}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '50px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#fffbeb',
                        color: '#b45309'
                      }}>
                        {s.occasion_type === 'birthday' ? '🎂 Birthday' : s.occasion_type === 'memorial' ? '🕊️ Smrutidin' : s.occasion_type === 'anniversary' ? '💍 Anniversary' : '🪔 Dedication'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                      {s.conducted_date || s.event_date}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0d9488' }}>
                        {s.meals_served || s.meals_target} Meals
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{s.drive_location_name || s.preferred_beneficiary}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{s.city_name ? `${s.city_name}, ${s.state_name}` : ''}</div>
                    </td>
                    <td>
                      {isApproved ? (
                        <span className={`status-badge ${s.status}`}>
                          {s.status === 'approved' ? '✓ Approved' : s.status}
                        </span>
                      ) : (
                        <span className="status-badge pending_approval" title="Awaiting Admin Review & Approval before Certificate Generation">
                          ⏳ Under Review
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link
                          href={`/annadan-sankalp/certificate/${s.certificate_code}`}
                          target="_blank"
                          className="action-btn view"
                          style={{
                            textDecoration: 'none',
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: isApproved ? '#0d9488' : '#f8fafc',
                            color: isApproved ? '#ffffff' : '#64748b',
                            border: isApproved ? 'none' : '1px solid #cbd5e1'
                          }}
                        >
                          {isApproved ? '📜 View Certificate' : '⏳ Review Status'}
                        </Link>

                        {isApproved ? (
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/annadan-sankalp/certificate/${s.certificate_code}`;
                              const text = `🙏 In auspicious dedication of *${s.honoree_name}*, a commemorative meal drive of *${s.meals_served || s.meals_target} meals* was conducted with Anna Seva. View official digital certificate here:\n${url}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            style={{
                              background: '#25d366',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Share certificate on WhatsApp"
                          >
                            📲 Share
                          </button>
                        ) : (
                          <span
                            title="WhatsApp sharing unlocks once the certificate is approved by an administrator"
                            style={{
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.78rem',
                              color: '#94a3b8',
                              background: '#f1f5f9',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            🔒 Locked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
