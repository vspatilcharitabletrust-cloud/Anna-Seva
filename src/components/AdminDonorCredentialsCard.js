'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminDonorCredentialsCard({ initialDonors = [] }) {
  const [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const togglePassword = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPassword = (id, pass) => {
    if (!pass) return;
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = (initialDonors || []).filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.mobile?.includes(search)
  );

  return (
    <div
      style={{
        marginTop: '2.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(13, 148, 136, 0.12)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 700
            }}
          >
            🔑
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
              Registered Donors & Login Passwords
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Direct access to donor login credentials for verification and administrative assistance
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search donor / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              width: '200px'
            }}
          />
          <Link
            href="/admin/donors"
            style={{
              fontSize: '0.85rem',
              color: '#0d9488',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            Manage All Donors →
          </Link>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            No registered donors found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Donor Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Mobile Number</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, minWidth: '190px' }}>Donor Password</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>City & State</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor, idx) => (
                <tr
                  key={donor.id}
                  style={{
                    borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}
                >
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>
                    {donor.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                    {donor.email}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    {donor.mobile || 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#f1f5f9',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <code
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: revealed[donor.id] ? '#0d9488' : '#64748b',
                          letterSpacing: revealed[donor.id] ? 'normal' : '2px',
                          minWidth: '85px',
                          display: 'inline-block'
                        }}
                      >
                        {revealed[donor.id] ? (donor.password || 'Hriday@1234') : '••••••••'}
                      </code>
                      <button
                        type="button"
                        onClick={() => togglePassword(donor.id)}
                        title={revealed[donor.id] ? "Hide password" : "Show password"}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0 2px',
                          fontSize: '0.95rem',
                          lineHeight: 1
                        }}
                      >
                        {revealed[donor.id] ? '🙈' : '👁️'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyPassword(donor.id, donor.password || 'Hriday@1234')}
                        title="Copy password to clipboard"
                        style={{
                          background: copiedId === donor.id ? '#0d9488' : '#ffffff',
                          color: copiedId === donor.id ? '#ffffff' : '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          fontWeight: 600,
                          transition: 'all 0.15s'
                        }}
                      >
                        {copiedId === donor.id ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    {donor.city_name ? `${donor.city_name}, ${donor.state_name}` : donor.state_name || 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '50px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        backgroundColor:
                          donor.status === 'approved'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : donor.status === 'rejected'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          donor.status === 'approved'
                            ? '#059669'
                            : donor.status === 'rejected'
                            ? '#dc2626'
                            : '#d97706'
                      }}
                    >
                      {donor.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
