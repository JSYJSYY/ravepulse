'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after successful authentication
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="cyber-border p-8 bg-black/50 backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4 cyber-neon" style={{color: 'var(--cyber-cyan)'}}>
            Authentication Successful!
          </h1>
          <p className="text-gray-300 font-mono">
            Redirecting to your dashboard...
          </p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{borderColor: 'var(--cyber-hot-pink)'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}