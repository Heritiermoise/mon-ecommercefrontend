'use client';

import { Loader2 } from 'lucide-react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loader({ fullScreen = false, size = 'md', text }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
      {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {loader}
    </div>
  );
}