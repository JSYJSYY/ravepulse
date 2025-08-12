'use client';

import { useState } from 'react';
import { Brain, Zap, MapPin, Shield } from 'lucide-react';
import { PulseAnalysisModal, QuantumSyncModal, GeoTrackingModal, DataVaultModal } from './CyberpunkModals';

export default function CyberpunkFeatures() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const features = [
    {
      id: 'pulse',
      icon: Brain,
      title: 'PULSE',
      subtitle: 'ANALYSIS',
      description: 'AI scans your music DNA patterns',
      color: 'var(--cyber-cyan)',
      gradient: 'var(--cyber-gradient-1)'
    },
    {
      id: 'quantum',
      icon: Zap,
      title: 'QUANTUM',
      subtitle: 'SYNC',
      description: 'Real-time event matrix matching',
      color: 'var(--cyber-hot-pink)',
      gradient: 'var(--cyber-gradient-2)'
    },
    {
      id: 'geo',
      icon: MapPin,
      title: 'GEO-TRACKING',
      subtitle: '',
      description: 'Location-based event radar',
      color: 'var(--cyber-purple)',
      gradient: 'var(--cyber-gradient-1)'
    },
    {
      id: 'vault',
      icon: Shield,
      title: 'DATA',
      subtitle: 'VAULT',
      description: 'Secure event history archives',
      color: 'var(--cyber-neon-green)',
      gradient: 'var(--cyber-gradient-2)'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              onClick={() => setActiveModal(feature.id)}
              className="cyber-border bg-black/80 backdrop-blur-sm p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden tech-pattern group"
            >
              <div className="scan-line"></div>
              <div className="relative z-10">
                <Icon 
                  className="w-12 h-12 mb-4 mx-auto transition-all duration-300 group-hover:scale-110" 
                  style={{color: feature.color}} 
                />
                <h3 className="font-mono font-bold text-center mb-1" style={{color: feature.color}}>
                  {feature.title}
                </h3>
                {feature.subtitle && (
                  <h3 className="font-mono font-bold text-center mb-3" style={{color: feature.color}}>
                    {feature.subtitle}
                  </h3>
                )}
                <p className="text-sm font-mono text-center" style={{color: 'var(--cyber-magenta)'}}>
                  {feature.description}
                </p>
              </div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{background: feature.gradient}}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <PulseAnalysisModal 
        isOpen={activeModal === 'pulse'} 
        onClose={() => setActiveModal(null)} 
      />
      <QuantumSyncModal 
        isOpen={activeModal === 'quantum'} 
        onClose={() => setActiveModal(null)} 
      />
      <GeoTrackingModal 
        isOpen={activeModal === 'geo'} 
        onClose={() => setActiveModal(null)} 
      />
      <DataVaultModal 
        isOpen={activeModal === 'vault'} 
        onClose={() => setActiveModal(null)} 
      />
    </>
  );
}