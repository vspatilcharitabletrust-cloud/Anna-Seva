'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FoodPhotoUploader from '@/components/FoodPhotoUploader';

export default function AdminSankalpPage() {
  const [sankalps, setSankalps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSankalp, setSelectedSankalp] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [banner, setBanner] = useState('');

  // Update modal state
  const [editForm, setEditForm] = useState({
    status: 'completed',
    conducted_date: '',
    meals_served: 100,
    drive_location_name: '',
    drive_photos: []
  });

  useEffect(() => {
    fetchSankalps();
  }, [statusFilter]);

  const fetchSankalps = async () => {
    try {
      const url = statusFilter === 'all' ? '/api/sankalp' : `/api/sankalp?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setSankalps(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (item) => {
    setSelectedSankalp(item);
    setEditForm({
      status: item.status || 'completed',
      conducted_date: item.conducted_date || item.event_date || new Date().toISOString().slice(0, 10),
      meals_served: item.meals_served || item.meals_target || 50,
      drive_location_name: item.drive_location_name || item.preferred_beneficiary || '',
      drive_photos: Array.isArray(item.drive_photos) ? item.drive_photos : []
    });
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSankalp) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/sankalp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSankalp.id,
          status: editForm.status,
          conducted_date: editForm.conducted_date,
          meals_served: Number(editForm.meals_served),
          drive_location_name: editForm.drive_location_name,
          drive_photos: editForm.drive_photos
        })
      });

      if (res.ok) {
        setIsUpdateModalOpen(false);
        setBanner(`Annadan Sankalp #${selectedSankalp.id} successfully updated!`);
        setTimeout(() => setBanner(''), 5000);
        fetchSankalps();
      } else {
        alert('Failed to update sankalp.');
      }
    } catch (err) {
      alert('Error updating sankalp.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Annadan Sankalp?')) return;
    try {
      const res = await fetch(`/api/sankalp?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSankalps();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendWhatsAppNotification = (item) => {
    const cleanMobile = (item.donor_mobile || '').replace(/\D/g, '');
    const phoneWithCountry = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;
    const certUrl = typeof window !== 'undefined' ? `${window.location.origin}/annadan-sankalp/certificate/${item.certificate_code}` : '';

    const text = `🙏 *Namaste ${item.donor_name}! Greetings from Anna Seva.*\n\nWe are pleased to inform you that your *Annadan Sankalp* in auspicious dedication of *${item.honoree_name}* has been successfully conducted!\n\n🍲 *Meals Served:* ${item.meals_served || item.meals_target} Wholesome Meals\n📍 *Drive Venue:* ${item.drive_location_name || item.preferred_beneficiary || 'Designated Shelter'}\n📅 *Conducted Date:* ${item.conducted_date || item.event_date}\n\n📜 *View and Download your Branded Digital Commemorative Certificate & Drive Photos:*\n${certUrl}\n\nMay this auspicious Annadan bring peace, prosperity, and blessings to your family!`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');

    // Update whatsapp_sent flag
    fetch('/api/sankalp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, whatsapp_sent: 1 })
    }).then(() => fetchSankalps());
  };

  const handleSendEmailNotification = (item) => {
    const certUrl = typeof window !== 'undefined' ? `${window.location.origin}/annadan-sankalp/certificate/${item.certificate_code}` : '';
    const subject = `Your Anna Seva Commemorative Certificate — Dedication for ${item.honoree_name}`;
    const body = `Dear ${item.donor_name},\n\nWe are honored to confirm that your Annadan Sankalp dedicated to ${item.honoree_name} has been successfully conducted.\n\nMeals Served: ${item.meals_served || item.meals_target}\nLocation: ${item.drive_location_name || item.preferred_beneficiary}\n\nYou can view and download your official Digital Commemorative Certificate here:\n${certUrl}\n\nWith Gratitude,\nAnna Seva Coordination Team`;

    window.location.href = `mailto:${item.donor_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Update email_sent flag
    fetch('/api/sankalp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, email_sent: 1 })
    }).then(() => fetchSankalps());
  };

  const handleQuickApprove = async (id) => {
    try {
      const res = await fetch('/api/sankalp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' })
      });
      if (res.ok) {
        setBanner(`Annadan Sankalp #${id} approved! Digital Commemorative Certificate is now generated & active.`);
        setTimeout(() => setBanner(''), 6000);
        fetchSankalps();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve sankalp.');
      }
    } catch (e) {
      console.error(e);
      alert('Error approving sankalp.');
    }
  };

  const filtered = sankalps.filter(
    (s) =>
      s.honoree_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.certificate_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.donor_mobile?.includes(search)
  );

  const totalMeals = sankalps.reduce((acc, s) => acc + (s.meals_served || s.meals_target || 0), 0);
  const completedCount = sankalps.filter((s) => ['completed', 'conducted', 'approved'].includes(s.status)).length;
  const pendingCount = sankalps.filter((s) => ['pending_approval', 'pledged', 'confirmed'].includes(s.status)).length;

  return (
    <div className="animate-fade-in">
      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', margin: 0 }}>
            🎂 Annadan Sankalp Management
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>
            Coordinate commemorative meal dedications, approve certificate generation, verify drives & WhatsApp updates
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending_approval">⏳ Pending Approval</option>
            <option value="approved">✓ Approved (Cert Active)</option>
            <option value="pledged">Pledged (New)</option>
            <option value="confirmed">Confirmed</option>
            <option value="conducted">Conducted</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="text"
            placeholder="Search honoree / donor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
            style={{ width: '220px' }}
          />

          <Link
            href="/annadan-sankalp"
            target="_blank"
            className="theme-btn"
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>🌐</span> Public Portal
          </Link>
        </div>
      </div>

      {banner && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ {banner}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TOTAL SANKALPS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{sankalps.length}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>MEALS COMMITTED / SERVED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0d9488', marginTop: '0.25rem' }}>{totalMeals.toLocaleString()}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>APPROVED / COMPLETED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{completedCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>PENDING APPROVAL / REVIEW</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>{pendingCount}</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Annadan Sankalps...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>No Annadan Sankalp records found.</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Honoree & Occasion</th>
                <th>Event Date</th>
                <th>Meals</th>
                <th>Sponsor / Donor</th>
                <th>Target Beneficiary</th>
                <th>Status</th>
                <th>Notifications</th>
                <th style={{ width: '260px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isApproved = ['approved', 'conducted', 'completed'].includes(item.status);
                return (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.honoree_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#d97706', textTransform: 'capitalize', fontWeight: 600 }}>
                        {item.occasion_type === 'birthday' ? '🎂 Birthday' : item.occasion_type === 'memorial' ? '🕊️ Smrutidin' : item.occasion_type === 'anniversary' ? '💍 Anniversary' : '🪔 Dedication'} {item.honoree_relation ? `(${item.honoree_relation})` : ''}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{item.conducted_date || item.event_date}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0d9488' }}>
                        {item.meals_served || item.meals_target} Meals
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.donor_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.donor_mobile}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{item.drive_location_name || item.preferred_beneficiary}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.city_name ? `${item.city_name}, ${item.state_name}` : ''}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status === 'pending_approval' ? '⏳ Pending' : item.status === 'approved' ? '✓ Approved' : item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem' }}>
                        <span title={item.whatsapp_sent ? 'WhatsApp notification sent' : 'WhatsApp not yet triggered'} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: item.whatsapp_sent ? '#dcfce7' : '#f1f5f9', color: item.whatsapp_sent ? '#15803d' : '#94a3b8', fontWeight: 700 }}>
                          WA {item.whatsapp_sent ? '✓' : '—'}
                        </span>
                        <span title={item.email_sent ? 'Email notification sent' : 'Email not yet sent'} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: item.email_sent ? '#e0f2fe' : '#f1f5f9', color: item.email_sent ? '#0369a1' : '#94a3b8', fontWeight: 700 }}>
                          Email {item.email_sent ? '✓' : '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {!isApproved && (
                          <button
                            onClick={() => handleQuickApprove(item.id)}
                            className="action-btn"
                            style={{
                              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                              color: '#ffffff',
                              padding: '0.28rem 0.55rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                            }}
                            title="Approve & Generate Certificate immediately"
                          >
                            ✓ Approve Cert
                          </button>
                        )}

                        <button
                          onClick={() => openUpdateModal(item)}
                          className="action-btn edit"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                        >
                          ⚙️ Edit
                        </button>

                        <Link
                          href={`/annadan-sankalp/certificate/${item.certificate_code}`}
                          target="_blank"
                          className="action-btn view"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.78rem',
                            textDecoration: 'none',
                            color: isApproved ? '#0d9488' : '#64748b',
                            borderColor: isApproved ? 'rgba(13, 148, 136, 0.4)' : '#cbd5e1'
                          }}
                          title={isApproved ? 'View active certificate' : 'View pending approval status'}
                        >
                          📜 {isApproved ? 'Cert' : 'Review'}
                        </Link>

                        <button
                          onClick={() => handleSendWhatsAppNotification(item)}
                          title="Send WhatsApp update with certificate link"
                          style={{
                            background: '#25d366',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '0.25rem 0.45rem',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          📲 WA
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="action-btn delete"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.78rem' }}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>


      {/* Drive Fulfillment & Photo Upload Modal */}
      {isUpdateModalOpen && selectedSankalp && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div
            className="modal-content animate-fade-in"
            style={{
              maxWidth: '680px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              color: '#0f172a'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                  Fulfill & Update Annadan Drive #{selectedSankalp.id}
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Dedication for <strong>{selectedSankalp.honoree_name}</strong> by {selectedSankalp.donor_name}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsUpdateModalOpen(false)}
                style={{ fontSize: '1.6rem', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Drive Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="pending_approval">⏳ Pending Approval (Certificate Locked)</option>
                    <option value="approved">✓ Approved (Certificate Generated & Unlocked)</option>
                    <option value="pledged">Pledged (Pending Scheduling)</option>
                    <option value="confirmed">Confirmed (Scheduled with Shelter)</option>
                    <option value="conducted">Conducted (Meals Distributed)</option>
                    <option value="completed">Completed (Certificate & Updates Issued)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Conducted Date
                  </label>
                  <input
                    type="date"
                    value={editForm.conducted_date}
                    onChange={(e) => setEditForm({ ...editForm, conducted_date: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Actual Meals Served Count
                  </label>
                  <input
                    type="number"
                    value={editForm.meals_served}
                    onChange={(e) => setEditForm({ ...editForm, meals_served: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Venue / Shelter Name (Printed on Certificate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Matoshree Vrudhashram & Orphanage, Pune"
                    value={editForm.drive_location_name}
                    onChange={(e) => setEditForm({ ...editForm, drive_location_name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Photos from Live Distribution */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.45rem' }}>
                  📸 Live Meal Distribution Photos (Up to 5 Photos)
                </label>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem' }}>
                  These photos will appear on the donor's certificate page and can be shared via WhatsApp.
                </p>
                <FoodPhotoUploader
                  photos={editForm.drive_photos}
                  onChange={(newPhotos) => setEditForm({ ...editForm, drive_photos: newPhotos })}
                  maxPhotos={5}
                />
              </div>

              {/* Notification Triggers */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem', color: '#0f172a' }}>
                  📲 Quick Donor Notifications
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppNotification(selectedSankalp)}
                    style={{
                      background: '#25d366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Send WhatsApp Update to {selectedSankalp.donor_mobile}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendEmailNotification(selectedSankalp)}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Draft Email to {selectedSankalp.donor_email}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: updating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {updating ? 'Saving Changes...' : '💾 Save & Update Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
