import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const mySankalps = searchParams.get('my_sankalps') === 'true';
    const isPublicWall = searchParams.get('public') === 'true';
    const status = searchParams.get('status');

    // 1. Fetch single sankalp by certificate code (Public certificate view)
    if (code) {
      const sankalp = await query.get(`
        SELECT s.*, st.name as state_name, c.name as city_name
        FROM annadan_sankalps s
        LEFT JOIN states st ON s.state_id = st.id
        LEFT JOIN cities c ON s.city_id = c.id
        WHERE s.certificate_code = ?
      `, [code]);

      if (!sankalp) {
        return Response.json({ error: 'Certificate / Sankalp record not found' }, { status: 404 });
      }

      let drivePhotos = [];
      try {
        if (Array.isArray(sankalp.drive_photos)) {
          drivePhotos = sankalp.drive_photos;
        } else if (typeof sankalp.drive_photos === 'string' && sankalp.drive_photos.trim()) {
          drivePhotos = JSON.parse(sankalp.drive_photos);
        }
      } catch (e) {
        drivePhotos = [];
      }

      const isApproved = ['approved', 'conducted', 'completed'].includes(sankalp.status);

      return Response.json({ ...sankalp, drive_photos: drivePhotos, is_approved: isApproved });
    }

    const session = await getSession();

    // 2. Fetch logged-in donor's own sankalps
    if (mySankalps) {
      if (!session || session.role !== 'donor') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const rows = await query.all(`
        SELECT s.*, st.name as state_name, c.name as city_name
        FROM annadan_sankalps s
        LEFT JOIN states st ON s.state_id = st.id
        LEFT JOIN cities c ON s.city_id = c.id
        WHERE s.donor_id = ? OR s.donor_email = ?
        ORDER BY s.created_at DESC
      `, [session.id, session.email]);

      const formatted = (rows || []).map((r) => {
        let photos = [];
        try {
          photos = typeof r.drive_photos === 'string' ? JSON.parse(r.drive_photos) : (r.drive_photos || []);
        } catch (e) {
          photos = [];
        }
        return { ...r, drive_photos: photos };
      });

      return Response.json(formatted);
    }

    // 3. Public Wall of Blessings (Shows active & completed sankalps for inspiration)
    if (isPublicWall) {
      const rows = await query.all(`
        SELECT s.id, s.honoree_name, s.honoree_relation, s.honoree_photo, s.occasion_type,
               s.event_date, s.meals_target, s.meals_served, s.meal_type, s.drive_location_name,
               s.status, s.certificate_code, s.donor_name, s.dedication_message,
               st.name as state_name, c.name as city_name, s.drive_photos
        FROM annadan_sankalps s
        LEFT JOIN states st ON s.state_id = st.id
        LEFT JOIN cities c ON s.city_id = c.id
        WHERE s.status IN ('completed', 'conducted', 'approved')
        ORDER BY s.event_date DESC
        LIMIT 20
      `);

      const formatted = (rows || []).map((r) => {
        let photos = [];
        try {
          photos = typeof r.drive_photos === 'string' ? JSON.parse(r.drive_photos) : (r.drive_photos || []);
        } catch (e) {
          photos = [];
        }
        return { ...r, drive_photos: photos };
      });

      return Response.json(formatted);
    }

    // 4. Admin Management View (Requires Admin Session)
    if (!session || session.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let sql = `
      SELECT s.*, st.name as state_name, c.name as city_name
      FROM annadan_sankalps s
      LEFT JOIN states st ON s.state_id = st.id
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY s.event_date DESC, s.created_at DESC';

    const rows = await query.all(sql, params);
    const formatted = (rows || []).map((r) => {
      let photos = [];
      try {
        photos = typeof r.drive_photos === 'string' ? JSON.parse(r.drive_photos) : (r.drive_photos || []);
      } catch (e) {
        photos = [];
      }
      return { ...r, drive_photos: photos };
    });

    return Response.json(formatted);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      donor_name,
      donor_email,
      donor_mobile,
      occasion_type,
      honoree_name,
      honoree_relation,
      honoree_photo,
      event_date,
      meals_target,
      meal_type,
      state_id,
      city_id,
      preferred_beneficiary,
      dedication_message
    } = body;

    const categoryDedicationMessages = {
      birthday: 'Wishing a blessed, joyous, and long life filled with radiant health, peace, and prosperity.',
      anniversary: 'Celebrating eternal love, sacred companionship, mutual respect, and lifelong harmony.',
      memorial: 'In sacred and everlasting loving memory, honoring a cherished soul whose noble blessings live on forever.',
      achievement: 'Honoring outstanding milestone achievement with pride, and wishing distinguished success and triumph ahead.',
      festival: 'May the divine grace and auspicious warmth of this holy festival bring peace and abundance to all.',
      other: 'Dedicated with humble devotion, heartfelt gratitude, and prayers for universal peace and nourishment.'
    };

    const finalDedicationMessage = (dedication_message && dedication_message.trim()) || categoryDedicationMessages[occasion_type] || categoryDedicationMessages.other;

    if (!donor_name || !donor_email || !donor_mobile || !occasion_type || !honoree_name || !event_date || !finalDedicationMessage) {
      return Response.json({ error: 'Please provide all required fields.' }, { status: 400 });
    }

    // Generate unique Certificate Code: AS-SANKALP-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificate_code = `AS-SANKALP-${currentYear}-${randomSuffix}`;

    const donorId = session && session.role === 'donor' ? session.id : (body.donor_id || null);

    const result = await query.run(`
      INSERT INTO annadan_sankalps (
        donor_id, donor_name, donor_email, donor_mobile, occasion_type, honoree_name, honoree_relation,
        honoree_photo, event_date, meals_target, meal_type, state_id, city_id, preferred_beneficiary,
        dedication_message, status, certificate_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', ?)
    `, [
      donorId,
      donor_name.trim(),
      donor_email.trim().toLowerCase(),
      donor_mobile.trim(),
      occasion_type,
      honoree_name.trim(),
      honoree_relation ? honoree_relation.trim() : null,
      honoree_photo || null,
      event_date,
      meals_target ? Number(meals_target) : 50,
      meal_type || 'Festive Thali & Sweets',
      state_id ? Number(state_id) : null,
      city_id ? Number(city_id) : null,
      preferred_beneficiary || 'Orphanage & Old Age Homes',
      finalDedicationMessage,
      certificate_code
    ]);

    return Response.json({
      success: true,
      id: result.lastInsertRowid,
      certificate_code
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      status,
      conducted_date,
      meals_served,
      drive_location_name,
      drive_photos,
      whatsapp_sent,
      email_sent
    } = body;

    if (!id) {
      return Response.json({ error: 'Sankalp ID is required' }, { status: 400 });
    }

    let drivePhotosJson = null;
    if (Array.isArray(drive_photos)) {
      drivePhotosJson = JSON.stringify(drive_photos);
    } else if (typeof drive_photos === 'string') {
      drivePhotosJson = drive_photos;
    }

    await query.run(`
      UPDATE annadan_sankalps
      SET status = COALESCE(?, status),
          conducted_date = COALESCE(?, conducted_date),
          meals_served = COALESCE(?, meals_served),
          drive_location_name = COALESCE(?, drive_location_name),
          drive_photos = COALESCE(?, drive_photos),
          whatsapp_sent = COALESCE(?, whatsapp_sent),
          email_sent = COALESCE(?, email_sent)
      WHERE id = ?
    `, [
      status || null,
      conducted_date || null,
      meals_served !== undefined ? Number(meals_served) : null,
      drive_location_name || null,
      drivePhotosJson,
      whatsapp_sent !== undefined ? Number(whatsapp_sent) : null,
      email_sent !== undefined ? Number(email_sent) : null,
      id
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    await query.run('DELETE FROM annadan_sankalps WHERE id = ?', [id]);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
