'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LightSheenButton from '@/components/ui/light-sheen-button';
import AnimatedElement from '@/components/ui/animated-element';
import api from '@/lib/api';

// Validation rules match backend exactly (name ≥ 2, message ≥ 10)
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/contact', data);
      toast.success('Your message has been sent successfully!');
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit contact form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-secondary">
          <div className="w-full max-w-2xl mx-auto px-4 lg:px-8 text-center">
            <AnimatedElement animationType="fadeIn">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-4">
                Get In Touch
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </AnimatedElement>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 px-4 lg:px-8">
          {/* Form — narrow 600px */}
          <div className="w-full max-w-[600px] mx-auto mb-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <input
                      id="name"
                      {...form.register('name')}
                      type="text"
                      className={`w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        form.formState.errors.name ? 'border-destructive' : 'border-border'
                      }`}
                      placeholder="John Doe"
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      id="email"
                      {...form.register('email')}
                      type="email"
                      className={`w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        form.formState.errors.email ? 'border-destructive' : 'border-border'
                      }`}
                      placeholder="john@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    id="message"
                    {...form.register('message')}
                    rows={6}
                    className={`w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      form.formState.errors.message ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Your message here..."
                  ></textarea>
                  {form.formState.errors.message && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <LightSheenButton
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full rounded-full px-8 py-3.5 text-sm font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </LightSheenButton>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Info cards — wider 3xl */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="text-muted-foreground text-sm mt-1">support@homestore.com</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Phone</h3>
                <p className="text-muted-foreground text-sm mt-1">+1 (555) 123-4567</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Address</h3>
                <p className="text-muted-foreground text-sm mt-1">123 Store St, City, State 12345</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
