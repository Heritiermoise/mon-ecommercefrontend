'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Loader from './Loader';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return <Loader fullScreen size="lg" text="Chargement..." />;
}