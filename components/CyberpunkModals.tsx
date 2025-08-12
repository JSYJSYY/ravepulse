'use client';

import { useState } from 'react';
import { X, Brain, Zap, MapPin, Shield, Activity, Cpu, Database, Target, Lock, Globe, Radar } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Pulse Analysis Modal
export function PulseAnalysisModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl cyber-border bg-black/95 backdrop-blur-lg tech-pattern">
        <div className="scan-line"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'var(--cyber-cyan)'}}>
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" style={{color: 'var(--cyber-cyan)'}} />
            <h2 className="text-2xl font-mono font-bold " style={{color: 'var(--cyber-cyan)'}}>
              PULSE_ANALYSIS
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 transition-all transform hover:scale-110"
            style={{color: 'var(--cyber-hot-pink)'}}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Music DNA Scanner */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5" style={{color: 'var(--cyber-neon-green)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-neon-green)'}}>AI_MUSIC_DNA_SCANNER</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Advanced pulse networks analyze your Spotify listening patterns'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>BPM_ANALYSIS:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>128-140 BPM DETECTED</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>GENRE_MATRIX:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>HOUSE/TECHNO/TRANCE</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>MOOD_SIGNATURE:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>ENERGETIC/PROGRESSIVE</span>
                </div>
              </div>
            </div>

            {/* Neural Pattern Recognition */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5" style={{color: 'var(--cyber-hot-pink)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-hot-pink)'}}>PATTERN_RECOGNITION</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Identifies recurring themes in your music preference matrix'}
              </p>
              <div className="space-y-2">
                <div className="w-full bg-gray-800 h-2 rounded">
                  <div className="h-2 rounded" style={{background: 'var(--cyber-gradient-1)', width: '85%'}}></div>
                </div>
                <div className="font-mono text-xs" style={{color: 'var(--cyber-cyan)'}}>PATTERN_CONFIDENCE: 85%</div>
              </div>
            </div>

            {/* Artist DNA Mapping */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5" style={{color: 'var(--cyber-purple)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-purple)'}}>ARTIST_DNA_MAPPING</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Cross-references your top artists with event lineups globally'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div style={{color: 'var(--cyber-cyan)'}}>CALVIN_HARRIS: 94%</div>
                <div style={{color: 'var(--cyber-cyan)'}}>DEADMAU5: 87%</div>
                <div style={{color: 'var(--cyber-cyan)'}}>ABOVE_&_BEYOND: 92%</div>
                <div style={{color: 'var(--cyber-cyan)'}}>MARTIN_GARRIX: 89%</div>
              </div>
            </div>

            {/* Real-time Learning */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5" style={{color: 'var(--cyber-orange)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-orange)'}}>ADAPTIVE_LEARNING</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Pulse network evolves with your changing music taste'}
              </p>
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-transparent rounded-full" style={{borderTopColor: 'var(--cyber-orange)'}}></div>
                <span className="font-mono text-xs" style={{color: 'var(--cyber-orange)'}}>LEARNING_ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="cyber-border bg-black/30 p-4">
            <h3 className="font-mono font-bold mb-2" style={{color: 'var(--cyber-cyan)'}}>{'>> PULSE_SCAN_RESULTS'}</h3>
            <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
              Your pulse music profile has been analyzed. The AI has identified 47 compatible event signatures 
              in the current sector. Recommendation accuracy: 94.7%. Pulse link established successfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quantum Sync Modal
export function QuantumSyncModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl cyber-border bg-black/95 backdrop-blur-lg tech-pattern">
        <div className="scan-line"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'var(--cyber-hot-pink)'}}>
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8" style={{color: 'var(--cyber-hot-pink)'}} />
            <h2 className="text-2xl font-mono font-bold " style={{color: 'var(--cyber-hot-pink)'}}>
              QUANTUM_SYNC
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 transition-all transform hover:scale-110"
            style={{color: 'var(--cyber-cyan)'}}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real-time Matrix Matching */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5" style={{color: 'var(--cyber-hot-pink)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-hot-pink)'}}>MATRIX_MATCHING</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Quantum algorithms match your music DNA to event frequencies'}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-xs" style={{color: 'var(--cyber-neon-green)'}}>SYNC_STATUS: ACTIVE</span>
                </div>
                <div className="font-mono text-xs" style={{color: 'var(--cyber-cyan)'}}>QUANTUM_COHERENCE: 97.3%</div>
                <div className="font-mono text-xs" style={{color: 'var(--cyber-cyan)'}}>MATCH_FREQUENCY: 2.4Hz</div>
              </div>
            </div>

            {/* Event Probability Engine */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5" style={{color: 'var(--cyber-purple)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-purple)'}}>PROBABILITY_ENGINE</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Calculates quantum probability of event satisfaction'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>HIGH_MATCH:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>89.4%</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>MED_MATCH:</span>
                  <span style={{color: 'var(--cyber-orange)'}}>67.2%</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>LOW_MATCH:</span>
                  <span style={{color: 'var(--cyber-hot-pink)'}}>23.1%</span>
                </div>
              </div>
            </div>

            {/* Sync Algorithms */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5" style={{color: 'var(--cyber-neon-green)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-neon-green)'}}>SYNC_ALGORITHMS</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Multi-dimensional analysis across 47 data vectors'}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                <div style={{color: 'var(--cyber-cyan)'}}>GENRE_SYNC: ✓</div>
                <div style={{color: 'var(--cyber-cyan)'}}>ARTIST_SYNC: ✓</div>
                <div style={{color: 'var(--cyber-cyan)'}}>BPM_SYNC: ✓</div>
                <div style={{color: 'var(--cyber-cyan)'}}>MOOD_SYNC: ✓</div>
              </div>
            </div>

            {/* Quantum Entanglement */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5" style={{color: 'var(--cyber-orange)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-orange)'}}>ENTANGLEMENT_PROTOCOL</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Your preferences quantum-entangled with global event matrix'}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-ping" style={{backgroundColor: 'var(--cyber-orange)'}}></div>
                <span className="font-mono text-xs" style={{color: 'var(--cyber-orange)'}}>ENTANGLED</span>
              </div>
            </div>
          </div>

          <div className="cyber-border bg-black/30 p-4">
            <h3 className="font-mono font-bold mb-2" style={{color: 'var(--cyber-hot-pink)'}}>{'>> QUANTUM_SYNC_STATUS'}</h3>
            <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
              Quantum synchronization achieved. Your music preferences are now entangled with 
              the global event matrix. Real-time matching active across 12 dimensional vectors. 
              Probability calculations updating every 0.3 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Geo-Tracking Modal
export function GeoTrackingModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl cyber-border bg-black/95 backdrop-blur-lg tech-pattern">
        <div className="scan-line"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'var(--cyber-purple)'}}>
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8" style={{color: 'var(--cyber-purple)'}} />
            <h2 className="text-2xl font-mono font-bold " style={{color: 'var(--cyber-purple)'}}>
              GEO_TRACKING
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 transition-all transform hover:scale-110"
            style={{color: 'var(--cyber-hot-pink)'}}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Radar */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Radar className="w-5 h-5" style={{color: 'var(--cyber-purple)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-purple)'}}>LOCATION_RADAR</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Multi-spectrum location analysis and event proximity scanning'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>CURRENT_SECTOR:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>NYC_GRID_40.7128</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>SCAN_RADIUS:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>50KM</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>EVENTS_DETECTED:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>23_ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Proximity Engine */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5" style={{color: 'var(--cyber-cyan)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-cyan)'}}>PROXIMITY_ENGINE</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Calculates optimal travel vectors to event coordinates'}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--cyber-cyan)'}}></div>
                  <span className="font-mono text-xs" style={{color: 'var(--cyber-cyan)'}}>SCANNING...</span>
                </div>
                <div className="font-mono text-xs" style={{color: 'var(--cyber-neon-green)'}}>OPTIMAL_ROUTES: 3_FOUND</div>
              </div>
            </div>

            {/* Global Event Network */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5" style={{color: 'var(--cyber-neon-green)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-neon-green)'}}>GLOBAL_NETWORK</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Connected to 247 cities across 6 continents'}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                <div style={{color: 'var(--cyber-cyan)'}}>AMERICAS: 89</div>
                <div style={{color: 'var(--cyber-cyan)'}}>EUROPE: 76</div>
                <div style={{color: 'var(--cyber-cyan)'}}>ASIA: 54</div>
                <div style={{color: 'var(--cyber-cyan)'}}>OCEANIA: 28</div>
              </div>
            </div>

            {/* Transport Integration */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5" style={{color: 'var(--cyber-hot-pink)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-hot-pink)'}}>TRANSPORT_MATRIX</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Real-time integration with transport networks'}
              </p>
              <div className="space-y-1 text-xs font-mono">
                <div style={{color: 'var(--cyber-cyan)'}}>UBER_API: CONNECTED</div>
                <div style={{color: 'var(--cyber-cyan)'}}>TRANSIT_DATA: LIVE</div>
                <div style={{color: 'var(--cyber-cyan)'}}>TRAFFIC_ANALYSIS: ACTIVE</div>
              </div>
            </div>
          </div>

          <div className="cyber-border bg-black/30 p-4">
            <h3 className="font-mono font-bold mb-2" style={{color: 'var(--cyber-purple)'}}>{'>> GEO_TRACKING_STATUS'}</h3>
            <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
              Location radar active. Currently tracking 23 events within your specified radius. 
              Global network connected to 247 cities. Transport integration enabled for optimal 
              route calculation. Proximity engine running multi-vector analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data Vault Modal
export function DataVaultModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl cyber-border bg-black/95 backdrop-blur-lg tech-pattern">
        <div className="scan-line"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'var(--cyber-neon-green)'}}>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" style={{color: 'var(--cyber-neon-green)'}} />
            <h2 className="text-2xl font-mono font-bold " style={{color: 'var(--cyber-neon-green)'}}>
              DATA_VAULT
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 transition-all transform hover:scale-110"
            style={{color: 'var(--cyber-hot-pink)'}}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secure Archives */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5" style={{color: 'var(--cyber-neon-green)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-neon-green)'}}>SECURE_ARCHIVES</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Encrypted event history with military-grade security protocols'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>EVENTS_STORED:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>147_ENTRIES</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>ENCRYPTION:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>AES-256</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span style={{color: 'var(--cyber-cyan)'}}>BACKUP_STATUS:</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>REDUNDANT</span>
                </div>
              </div>
            </div>

            {/* Memory Bank */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5" style={{color: 'var(--cyber-purple)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-purple)'}}>MEMORY_BANK</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Neural memory storage with instant recall capabilities'}
              </p>
              <div className="space-y-2">
                <div className="w-full bg-gray-800 h-2 rounded">
                  <div className="h-2 rounded" style={{background: 'var(--cyber-gradient-2)', width: '73%'}}></div>
                </div>
                <div className="font-mono text-xs" style={{color: 'var(--cyber-purple)'}}>STORAGE_USED: 73%</div>
              </div>
            </div>

            {/* Event Analytics */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5" style={{color: 'var(--cyber-cyan)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-cyan)'}}>EVENT_ANALYTICS</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Deep learning analysis of your event attendance patterns'}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                <div style={{color: 'var(--cyber-cyan)'}}>ATTENDED: 23</div>
                <div style={{color: 'var(--cyber-cyan)'}}>WISHLIST: 14</div>
                <div style={{color: 'var(--cyber-cyan)'}}>AVG_RATING: 8.7</div>
                <div style={{color: 'var(--cyber-cyan)'}}>SATISFACTION: 94%</div>
              </div>
            </div>

            {/* Privacy Shield */}
            <div className="cyber-border bg-black/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5" style={{color: 'var(--cyber-hot-pink)'}} />
                <h3 className="font-mono font-bold" style={{color: 'var(--cyber-hot-pink)'}}>PRIVACY_SHIELD</h3>
              </div>
              <p className="font-mono text-sm mb-4" style={{color: 'var(--cyber-magenta)'}}>
                {'>> Zero-knowledge architecture protects your digital identity'}
              </p>
              <div className="space-y-1 text-xs font-mono">
                <div style={{color: 'var(--cyber-neon-green)'}}>ANONYMIZATION: ✓</div>
                <div style={{color: 'var(--cyber-neon-green)'}}>ZERO_LOGGING: ✓</div>
                <div style={{color: 'var(--cyber-neon-green)'}}>END_TO_END: ✓</div>
              </div>
            </div>
          </div>

          <div className="cyber-border bg-black/30 p-4">
            <h3 className="font-mono font-bold mb-2" style={{color: 'var(--cyber-neon-green)'}}>{'>> DATA_VAULT_STATUS'}</h3>
            <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
              Secure data vault operational. 147 events archived with AES-256 encryption. 
              Neural memory bank at 73% capacity with instant recall enabled. Privacy shield 
              active with zero-knowledge protocols. All systems green.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}