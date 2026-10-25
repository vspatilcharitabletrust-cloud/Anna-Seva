import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import CommemorativeCertificate from '@/components/CommemorativeCertificate';
import Link from 'next/link';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { code } = await params;
  return {
    title: `Commemorative Certificate • ${code} | Anna Seva`,
    description: 'Official Digital Commemorative Certificate of Annadan Sankalp (Dedicated Meal Sponsorship) conducted under Anna Seva.'
  };
}

export default async function CertificateViewPage({ params }) {
  const { code } = await params;
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  let sankalp = null;
  try {
    const raw = await query.get(`
      SELECT s.*, st.name as state_name, c.name as city_name
      FROM annadan_sankalps s
      LEFT JOIN states st ON s.state_id = st.id
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE s.certificate_code = ?
    `, [code]);

    if (raw) {
      let photos = [];
      try {
        photos = typeof raw.drive_photos === 'string' ? JSON.parse(raw.drive_photos) : (raw.drive_photos || []);
      } catch (e) {
        photos = [];
      }
      sankalp = { ...raw, drive_photos: photos };
    }
  } catch (e) {
    console.error('Error fetching certificate by code:', e);
  }

  if (!sankalp) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
        <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.5rem' }}>Certificate Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          We could not locate any Annadan Sankalp certificate with reference code <strong>{code}</strong>.
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
          ← Return to Annadan Sankalp
        </Link>
      </div>
    );
  }

  return <CommemorativeCertificate sankalp={sankalp} isAdmin={isAdmin} />;
}

