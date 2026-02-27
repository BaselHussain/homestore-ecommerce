'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary';

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="flex gap-4">
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="container mx-auto px-4 lg:px-8 py-10 space-y-6">
        <div className="h-7 w-48 bg-muted rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="h-40 bg-muted rounded-lg" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      router.push(path ? `${redirectTo}?redirect=${encodeURIComponent(path)}` : redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated) return null;

  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
