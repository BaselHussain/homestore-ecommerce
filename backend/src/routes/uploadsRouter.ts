import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { adminOnly } from '../middlewares/adminOnly';
import prisma from '../lib/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

function uploadToCloudinary(buffer: Buffer): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'homestore', resource_type: 'image' },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// POST /api/admin/uploads — upload up to 20 images
router.post('/', adminOnly, upload.array('images', 20), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, error: 'No files uploaded' });
    return;
  }

  try {
    const uploaded = await Promise.all(
      files.map(async (f) => {
        const { secure_url, public_id } = await uploadToCloudinary(f.buffer);
        // Store in DB for fast listing
        await prisma.upload.create({ data: { id: public_id.replace(/\//g, '-'), public_id, url: secure_url } });
        return { filename: public_id, url: secure_url, size: f.size };
      })
    );
    res.json({ success: true, uploaded });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? 'Upload failed' });
  }
});

// DELETE /api/admin/uploads/:encodedId — delete image from Cloudinary + DB
router.delete('/:encodedId', adminOnly, async (req: Request, res: Response) => {
  const publicId = Buffer.from(req.params.encodedId, 'base64').toString('utf8');

  try {
    await cloudinary.uploader.destroy(publicId); // ok if already deleted

    // Remove from uploads table
    await prisma.upload.deleteMany({ where: { public_id: publicId } });

    // Remove URL from all products that reference it (non-blocking)
    prisma.$executeRawUnsafe(
      `UPDATE "products"
       SET images = COALESCE(
         (SELECT jsonb_agg(elem) FROM jsonb_array_elements_text(images::jsonb) AS elem WHERE elem NOT LIKE $1),
         '[]'::jsonb
       )
       WHERE images::text LIKE $1`,
      `%${publicId}%`
    ).catch((err: any) => console.error('[UPLOADS] DB cleanup error:', err.message));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? 'Delete failed' });
  }
});

// GET /api/admin/uploads — list from DB (fast, no Cloudinary API call)
router.get('/', adminOnly, async (_req: Request, res: Response) => {
  try {
    const records = await prisma.upload.findMany({ orderBy: { created_at: 'desc' } });
    const images = records.map((r) => ({ filename: r.public_id, url: r.url }));
    res.json({ success: true, images });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? 'List failed' });
  }
});

export default router;
