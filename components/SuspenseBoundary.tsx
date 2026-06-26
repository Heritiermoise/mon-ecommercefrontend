'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SuspenseBoundary({ children, fallback }: SuspenseBoundaryProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}