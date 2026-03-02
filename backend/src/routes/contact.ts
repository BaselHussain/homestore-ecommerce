import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/contact
router.post('/', async (req: AuthRequest, res: Response) => {
  const ContactFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
    email: z.string().email('Please provide a valid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be at most 1000 characters'),
  });

  const parsed = ContactFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parsed.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (!acc[field]) acc[field] = [];
        acc[field].push(error.message);
        return acc;
      }, {} as Record<string, string[]>)
    });
    return;
  }

  const { name, email, message } = parsed.data;

  try {
    // Store the contact submission in the database
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        message,
      },
    });

    res.json({
      success: true,
      message: 'Thank you for contacting us. We\'ll get back to you soon.'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form. Please try again.'
    });
  }
});

export default router;