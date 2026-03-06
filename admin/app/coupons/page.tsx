'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/framerVariants';
import { Ticket, Gift, Percent, Tag } from 'lucide-react';

export default function CouponsPage() {
  const features = [
    {
      icon: Percent,
      title: 'Percentage Discounts',
      description: 'Create coupons that apply a % discount to the order total (e.g. 10% off)',
    },
    {
      icon: Tag,
      title: 'Fixed Amount Discounts',
      description: 'Create coupons for a fixed $ amount off (e.g. $15 off orders over $100)',
    },
    {
      icon: Gift,
      title: 'Free Shipping',
      description: 'Offer free shipping coupon codes to incentivise conversions',
    },
    {
      icon: Ticket,
      title: 'Usage Limits',
      description: 'Set per-coupon and per-user usage limits with expiry dates',
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Discount codes and promotional offers</p>
      </div>

      {/* Coming soon banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Coupon management is not yet implemented. It was listed as a sidebar item in the spec but not included in the current user stories.
        </p>
      </div>

      {/* Planned features */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Planned Features</h3>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              className="bg-card border border-border rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
