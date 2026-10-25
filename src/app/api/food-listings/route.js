import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const myListings = searchParams.get('my_listings') === 'true';
    const stateId = searchParams.get('state_id');
    const cityId = searchParams.get('city_id');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // e.g. 'available', 'claimed', etc.

    const session = await getSession();

    const formatListingsWithPhotos = (rawListings) => {
      return (rawListings || []).map((l) => {
        let photos = [];
        try {
          if (Array.isArray(l.photos)) {
            photos = l.photos;
          } else if (typeof l.photos === 'string' && l.photos.trim()) {
            photos = JSON.parse(l.photos);
          }
        } catch (e) {
          photos = [];
        }
        return { ...l, photos: Array.isArray(photos) ? photos : [] };
      });
    };

    if (myListings) {
      if (!session || session.role !== 'donor') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Fetch donor's own listings
      const listings = await query.all(`
        SELECT f.*, s.name as state_name, c.name as city_name 
        FROM food_listings f
        JOIN states s ON f.state_id = s.id
        JOIN cities c ON f.city_id = c.id
        WHERE f.donor_id = ?
        ORDER BY f.created_at DESC
      `, [session.id]);

      return Response.json(formatListingsWithPhotos(listings));
    }

    // Otherwise, fetch general listings (public search or admin list)
    let sql = `
      SELECT f.*, s.name as state_name, c.name as city_name, u.name as donor_name, u.email as donor_email
      FROM food_listings f
      JOIN states s ON f.state_id = s.id
      JOIN cities c ON f.city_id = c.id
      JOIN users u ON f.donor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status (public view sees 'available', 'approved', and 'claimed' by default)
    if (status) {
      if (status === 'available') {
        sql += " AND f.status IN ('available', 'approved', 'claimed')";
      } else {
        sql += ' AND f.status = ?';
        params.push(status);
      }
    } else if (!session || session.role !== 'admin') {
      sql += " AND f.status IN ('available', 'approved', 'claimed')";
    }

    if (stateId) {
      sql += ' AND f.state_id = ?';
      params.push(stateId);
    }

    if (cityId) {
      sql += ' AND f.city_id = ?';
      params.push(cityId);
    }

    if (search) {
      sql += ' AND (f.food_items LIKE ? OR f.contact_person LIKE ? OR f.description LIKE ? OR f.address LIKE ?)';
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    sql += ' ORDER BY f.created_at DESC';

    const listings = await query.all(sql, params);
    return Response.json(formatListingsWithPhotos(listings));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'donor' && session.role !== 'admin')) {
      return Response.json({ error: 'Only logged-in donors or admins can list food' }, { status: 403 });
    }

    const { 
      donor_id,
      contact_person, 
      mobile, 
      food_items, 
      description, 
      address, 
      state_id, 
      city_id, 
      photos,
      status: customStatus,
      created_at: customCreatedAt
    } = await request.json();

    let targetDonorId = session.id;
    if (session.role === 'admin') {
      if (!donor_id) {
        return Response.json({ error: 'Please select a registered donor for this listing' }, { status: 400 });
      }
      targetDonorId = donor_id;
    }

    if (!contact_person || !mobile || !food_items || !address || !state_id || !city_id) {
      return Response.json({ error: 'All fields except description are required' }, { status: 400 });
    }

    let photosJson = null;
    if (Array.isArray(photos)) {
      photosJson = JSON.stringify(photos.slice(0, 5));
    } else if (typeof photos === 'string' && photos.trim()) {
      photosJson = photos;
    }

    const listingStatus = customStatus || 'available';

    // Handle back-dated created_at
    let createdAtValue = null;
    if (customCreatedAt) {
      const d = new Date(customCreatedAt);
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        createdAtValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      }
    }

    let result;
    if (createdAtValue) {
      result = await query.run(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status, photos, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [targetDonorId, contact_person, mobile, food_items, description || null, address, state_id, city_id, listingStatus, photosJson, createdAtValue]);
    } else {
      result = await query.run(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [targetDonorId, contact_person, mobile, food_items, description || null, address, state_id, city_id, listingStatus, photosJson]);
    }

    return Response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, status, food_items, contact_person, mobile, address, description, state_id, city_id, photos } = await request.json();

    if (!id) {
      return Response.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Check ownership if not admin
    const listing = await query.get('SELECT * FROM food_listings WHERE id = ?', [id]);
    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && listing.donor_id !== session.id) {
      return Response.json({ error: 'Unauthorized to edit this listing' }, { status: 403 });
    }

    let photosJson = undefined;
    if (photos !== undefined) {
      if (Array.isArray(photos)) {
        photosJson = JSON.stringify(photos.slice(0, 5));
      } else if (typeof photos === 'string') {
        photosJson = photos;
      }
    }

    if (food_items || contact_person || mobile || photos !== undefined) {
      const finalPhotos = photosJson !== undefined ? photosJson : listing.photos;
      // General edit (can also update status if provided)
      await query.run(`
        UPDATE food_listings 
        SET contact_person = ?, mobile = ?, food_items = ?, description = ?, address = ?, state_id = ?, city_id = ?, status = ?, photos = ?
        WHERE id = ?
      `, [contact_person || listing.contact_person, mobile || listing.mobile, food_items || listing.food_items, description !== undefined ? description : listing.description, address || listing.address, state_id || listing.state_id, city_id || listing.city_id, status || listing.status, finalPhotos, id]);
    } else if (status) {
      // Status-only update
      await query.run('UPDATE food_listings SET status = ? WHERE id = ?', [status, id]);
    } else {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const listing = await query.get('SELECT * FROM food_listings WHERE id = ?', [id]);
    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && listing.donor_id !== session.id) {
      return Response.json({ error: 'Unauthorized to delete this listing' }, { status: 403 });
    }

    await query.run('DELETE FROM food_listings WHERE id = ?', [id]);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
