'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Music, MapPin, Calendar, Sparkles, Zap, Shield, Cpu } from 'lucide-react';
import CyberpunkFeatures from '@/components/CyberpunkFeatures';

export default function Home() {
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate matrix characters for background
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const matrixArray = Array.from({ length: 50 }, () => chars[Math.floor(Math.random() * chars.length)]);
    setMatrixChars(matrixArray);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Matrix Background */}
      <div className="absolute inset-0 opacity-20">
        {matrixChars.map((char, i) => (
          <div
            key={i}
            className="matrix-character absolute text-xs"
            style={{
              left: `${(i * 2) % 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            {char}
          </div>
        ))}
      </div>
      
      {/* Scan Line */}
      <div className="scan-line"></div>
      
      {/* Circuit Board Background */}
      <div className="absolute inset-0 tech-pattern opacity-30"></div>
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Cyberpunk Glow Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-30" style={{background: 'var(--cyber-gradient-1)'}}></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-30 animation-delay-2000" style={{background: 'var(--cyber-gradient-2)'}}></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-2xl opacity-20" style={{background: 'var(--cyber-cyan)'}}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo/Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold mb-6  cyber-neon" style={{color: 'var(--cyber-cyan)'}}>
              <span className="cyber-chrome">RAVE</span><span style={{color: 'var(--cyber-hot-pink)'}}>PULSE</span>
            </h1>
            <div className="cyber-border p-4 bg-black/50 backdrop-blur-sm">
              <p className="text-xl md:text-2xl font-mono" style={{color: 'var(--cyber-cyan)'}}>
                {'>> PULSE LINK ESTABLISHED'}
              </p>
              <p className="text-lg text-gray-300 font-mono mt-2">
                Real-time EDM event recommendations powered by AI
              </p>
            </div>
          </div>

          {/* Connect with Spotify button */}
          <Link 
            href="/api/auth/login"
            className={`inline-flex items-center gap-4 px-8 py-4 font-mono font-bold text-lg transition-all transform hover:scale-105 relative group cyber-hologram cyber-border ${
              pulseAnimation ? 'cyber-neon' : ''
            }`}
            style={{
              background: 'var(--cyber-gradient-1)',
              color: 'black',
              clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
            }}
          >
            <Zap className="w-6 h-6" />
            <span className="relative z-10">INITIALIZE PULSE LINK</span>
            <Shield className="w-6 h-6" />
          </Link>

          {/* Features */}
          <div className="mt-20">
            <CyberpunkFeatures />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-8 cyber-border bg-black/50 backdrop-blur-sm">
        <p className="font-mono" style={{color: 'var(--cyber-cyan)'}}>
          &copy; 2077 RavePulse Neural Networks. All rights reserved.
        </p>
        <p className="text-xs font-mono mt-2" style={{color: 'var(--cyber-magenta)'}}>
          Powered by Quantum AI • Pulse Link Technology
        </p>
      </footer>
    </div>
  );
}