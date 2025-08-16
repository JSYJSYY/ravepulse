'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Zap, Brain, Activity, Wifi, Shield, Lock } from 'lucide-react';

export default function AuthSuccess() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { icon: Wifi, label: 'ESTABLISHING_CONNECTION', duration: 300 },
    { icon: Shield, label: 'AUTHENTICATING_CREDENTIALS', duration: 400 },
    { icon: Brain, label: 'INITIALIZING_PULSE_MATRIX', duration: 500 },
    { icon: Activity, label: 'SYNCING_MUSIC_DNA', duration: 400 },
    { icon: Zap, label: 'QUANTUM_LINK_ACTIVE', duration: 300 },
    { icon: Lock, label: 'SECURE_CHANNEL_ESTABLISHED', duration: 300 }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (currentStep < steps.length) {
      timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, steps[currentStep].duration);
    } else {
      setIsComplete(true);
      // Auto redirect to dashboard after showing complete state
      timer = setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    }

    return () => clearTimeout(timer);
  }, [currentStep, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Matrix background */}
      <div className="matrix-bg"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-cyan-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main Status Display */}
        <div className="cyber-border bg-black/90 backdrop-blur-lg p-8 tech-pattern relative">
          <div className="scan-line"></div>
          
          {!isComplete ? (
            <>
              {/* Connection Status */}
              <div className="mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 animate-pulse flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black" />
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-spin border-t-transparent"></div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-mono font-bold  mb-2" style={{color: 'var(--cyber-cyan)'}}>
                  PULSE_LINK_INITIALIZATION
                </h1>
                <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
                  {'>> Establishing secure connection to Spotify pulse network...'}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 mb-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded cyber-border transition-all duration-300 ${
                        isActive ? 'bg-cyan-900/30' : isCompleted ? 'bg-green-900/20' : 'bg-gray-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          className={`w-5 h-5 ${isActive ? 'animate-spin' : ''}`} 
                          style={{
                            color: isCompleted ? 'var(--cyber-neon-green)' : 
                                   isActive ? 'var(--cyber-cyan)' : 'var(--cyber-magenta)'
                          }}
                        />
                        <span 
                          className="font-mono text-sm"
                          style={{
                            color: isCompleted ? 'var(--cyber-neon-green)' : 
                                   isActive ? 'var(--cyber-cyan)' : 'var(--cyber-magenta)'
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                      <div>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" style={{color: 'var(--cyber-neon-green)'}} />
                        ) : isActive ? (
                          <div className="w-4 h-4 border-2 border-cyan-400 rounded-full animate-spin border-t-transparent"></div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Status */}
              <div className="cyber-border bg-black/50 p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="font-mono text-xs" style={{color: 'var(--cyber-cyan)'}}>
                    {currentStep < steps.length ? steps[currentStep].label : 'FINALIZING...'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-black" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"></div>
                  </div>
                </div>
                
                <h1 className="text-4xl font-mono font-bold  mb-4" style={{color: 'var(--cyber-neon-green)'}}>
                  PULSE_LINK_ESTABLISHED
                </h1>
                <p className="font-mono text-lg mb-2" style={{color: 'var(--cyber-cyan)'}}>
                  {'>> Connection successful. Welcome to the matrix.'}
                </p>
                <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
                  {'>> Redirecting to neural command center...'}
                </p>
              </div>

              {/* System Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="cyber-border bg-green-900/20 p-4">
                  <Brain className="w-6 h-6 mb-2 mx-auto" style={{color: 'var(--cyber-neon-green)'}} />
                  <div className="font-mono text-xs" style={{color: 'var(--cyber-neon-green)'}}>
                    PULSE_STATUS: ONLINE
                  </div>
                </div>
                
                <div className="cyber-border bg-cyan-900/20 p-4">
                  <Activity className="w-6 h-6 mb-2 mx-auto" style={{color: 'var(--cyber-cyan)'}} />
                  <div className="font-mono text-xs" style={{color: 'var(--cyber-cyan)'}}>
                    SYNC_STATUS: ACTIVE
                  </div>
                </div>
                
                <div className="cyber-border bg-pink-900/20 p-4">
                  <Shield className="w-6 h-6 mb-2 mx-auto" style={{color: 'var(--cyber-hot-pink)'}} />
                  <div className="font-mono text-xs" style={{color: 'var(--cyber-hot-pink)'}}>
                    SECURITY: ENCRYPTED
                  </div>
                </div>
              </div>

              {/* Manual Continue Button */}
              <button
                onClick={() => router.push('/dashboard')}
                className="cyber-border px-8 py-3 font-mono font-bold transition-all transform hover:scale-105 cyber-hologram"
                style={{
                  background: 'var(--cyber-gradient-1)',
                  color: 'black',
                  clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
                }}
              >
                ENTER_PULSE_INTERFACE
              </button>
            </>
          )}
        </div>

        {/* Status Bar */}
        <div className="mt-6 cyber-border bg-black/60 backdrop-blur-sm p-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span style={{color: 'var(--cyber-cyan)'}}>SYSTEM: RAVEPULSE_v2.077</span>
            <span style={{color: 'var(--cyber-magenta)'}}>PROTOCOL: OAUTH2_SECURE</span>
            <span style={{color: 'var(--cyber-neon-green)'}}>ENCRYPTION: AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}