import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { subscription, city, role } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // Ensure push_subscriptions table exists
    try {
      await query.run(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          endpoint TEXT UNIQUE NOT NULL,
          p256dh TEXT,
          auth TEXT,
          city TEXT,
          role TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const p256dh = subscription.keys?.p256dh || '';
      const auth = subscription.keys?.auth || '';

      await query.run(
        `INSERT INTO push_subscriptions (endpoint, p256dh, auth, city, role)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET p256dh = ?, auth = ?, city = ?, role = ?`,
        [subscription.endpoint, p256dh, auth, city || 'All', role || 'volunteer', p256dh, auth, city || 'All', role || 'volunteer']
      );
    } catch (dbErr) {
      console.warn('[Anna Seva Push] DB subscription note:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription registered successfully with Anna Seva network.'
    });
  } catch (error) {
    console.error('[Anna Seva Push] Error in subscribe API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let count = 0;
    try {
      const res = await query.get('SELECT COUNT(*) as count FROM push_subscriptions');
      count = res ? res.count : 0;
    } catch (e) {
      // Table may not have been queried yet
    }

    return NextResponse.json({
      service: 'Anna Seva Push Dispatcher',
      status: 'active',
      active_subscriptions: count,
      capabilities: ['instant_food_listing_alert', 'donor_claim_update', 'emergency_broadcast']
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
