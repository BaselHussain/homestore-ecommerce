'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Furniture Buyer',
    rating: 5,
    text: 'The quality of the products exceeded my expectations. Delivery was fast and packaging was perfect! Will definitely be ordering again.',
    date: 'January 2026',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Regular Customer',
    rating: 5,
    text: "I've been shopping here for years and have never been disappointed. Great customer service and everything arrives exactly as described.",
    date: 'February 2026',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Gift Buyer',
    rating: 5,
    text: 'The variety of products is amazing. I found exactly what I was looking for at a great price. The gift wrapping option was a lovely touch.',
    date: 'January 2026',
  },
  {
    id: 4,
    name: 'David Williams',
    role: 'Home Decorator',
    rating: 4,
    text: 'Beautiful selection of home goods. The outdoor furniture I ordered transformed my patio completely. Sturdy, stylish, and great value.',
    date: 'December 2025',
  },
  {
    id: 5,
    name: 'Priya Nair',
    role: 'Interior Designer',
    rating: 5,
    text: 'As a professional, I recommend HomeStore to all my clients. Consistent quality, fair pricing, and a team that truly cares about customers.',
    date: 'February 2026',
  },
  {
    id: 6,
    name: 'Tom Hassan',
    role: 'First-Time Buyer',
    rating: 5,
    text: "Wasn't sure what to expect but I was blown away. The pots and pans set is phenomenal — looks and performs like something three times the price.",
    date: 'January 2026',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
    <StarRating rating={review.rating} />
    <p className="text-foreground mt-4 mb-6 leading-relaxed flex-1">&quot;{review.text}&quot;</p>
    <div>
      <p className="font-semibold text-foreground text-sm">{review.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {review.role} · {review.date}
      </p>
    </div>
  </div>
);

const ROTATION_INTERVAL = 5000;
const DESKTOP_VISIBLE = 3;

export default function ReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const total = reviews.length;

  const next = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [next, paused]);

  // Visible reviews on desktop: 3 starting at current index (wrapping)
  const visibleReviews = Array.from({ length: DESKTOP_VISIBLE }, (_, i) =>
    reviews[(index + i) % total]
  );

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section
      className="py-20 bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it — hear from our satisfied customers
          </p>
        </div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:block relative overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-3 gap-6"
            >
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile: 1 card */}
        <div className="md:hidden relative overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <ReviewCard review={reviews[index]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="p-2 rounded-full border border-border bg-card hover:border-primary hover:text-primary transition-colors"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-primary w-5' : 'bg-border'
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-2 rounded-full border border-border bg-card hover:border-primary hover:text-primary transition-colors"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
