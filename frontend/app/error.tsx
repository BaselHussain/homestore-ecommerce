'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-border px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
