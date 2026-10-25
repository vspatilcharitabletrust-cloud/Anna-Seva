import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    const uploadedUrls = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'food');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = formData.getAll('photos');

      if (!files || files.length === 0) {
        // Check if single 'photo' or 'file' key was used
        const singleFile = formData.get('photo') || formData.get('file');
        if (singleFile && typeof singleFile !== 'string') {
          files.push(singleFile);
        }
      }

      if (files.length === 0) {
        return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
      }

      if (files.length > 5) {
        return NextResponse.json({ error: 'You can upload a maximum of 5 photos.' }, { status: 400 });
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (typeof file === 'string') continue;

        const mime = file.type || '';
        let ext = 'jpg';
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('gif')) ext = 'gif';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
        else {
          // Check filename extension
          const originalExt = path.extname(file.name || '').toLowerCase().replace('.', '');
          if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(originalExt)) {
            ext = originalExt === 'jpeg' ? 'jpg' : originalExt;
          } else {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
          }
        }

        const safeFilename = `food_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const targetPath = path.join(uploadDir, safeFilename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.promises.writeFile(targetPath, buffer);

        uploadedUrls.push(`/uploads/food/${safeFilename}`);
      }
    } else {
      // JSON base64 upload support
      const body = await request.json();
      const images = body.images || (body.image ? [body.image] : []);

      if (images.length === 0) {
        return NextResponse.json({ error: 'No images provided' }, { status: 400 });
      }

      if (images.length > 5) {
        return NextResponse.json({ error: 'Maximum 5 photos allowed.' }, { status: 400 });
      }

      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i];
        if (typeof base64Data !== 'string') continue;

        // If it's already an existing URL, keep it
        if (base64Data.startsWith('/uploads/') || base64Data.startsWith('http')) {
          uploadedUrls.push(base64Data);
          continue;
        }

        const matches = base64Data.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          // If pure data without prefix
          continue;
        }

        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (!['jpg', 'png', 'webp', 'gif'].includes(ext)) ext = 'jpg';

        const buffer = Buffer.from(matches[2], 'base64');
        const safeFilename = `food_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const targetPath = path.join(uploadDir, safeFilename);

        await fs.promises.writeFile(targetPath, buffer);
        uploadedUrls.push(`/uploads/food/${safeFilename}`);
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });
  } catch (error) {
    console.error('[Anna Seva Upload Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload photo' }, { status: 500 });
  }
}
