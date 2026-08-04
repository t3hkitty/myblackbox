import React from 'react';
import { Droplet, Plus, Flame, Settings, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SipTrackerWidget({
  sipSettings,
  onLogSip,
  onLogPee,
  onOpenSettings
}) {
  const sipCount = sipSettings.todaySipCount || 0;
  const peeCount = sipSettings.todayPeeCount || 0;
  const sipVolume = sipSettings.sipVolumeMl || 15;
  const targetSips = sipSettings.dailySipTarget || 40;
  const unit = sipSettings.unit || 'ml';

  const totalVolume = sipCount * sipVolume;
  const targetVolume = targetSips * sipVolume;
  const progressPercent = Math.min(100, Math.round((sipCount / targetSips) * 100));

  // Compute Sips-to-Pee Ratio
  const sipsToPeeRatio = peeCount > 0 ? (sipCount / peeCount).toFixed(1) : sipCount > 0 ? sipCount.toFixed(1) : 0;
  const isInsufficientBeverage = peeCount > 0 && (sipCount / peeCount) < 3.0;

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplet size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Hydration Telemetry & Sips-to-Pee Ratio
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Micro-sip tracking & fluid excretion manager
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Configure sip volume"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Insufficient Beverage Warning Notice */}
      {isInsufficientBeverage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.65rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fca5a5', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertTriangle size={15} color="#ef4444" />
            ⚠️ Insufficient Beverage Notice!
          </div>
          <p style={{ fontSize: '0.73rem', color: '#fee2e2', lineHeight: '1.4' }}>
            Your Sips-to-Pee ratio is currently <strong>{sipsToPeeRatio} sips/pee</strong> (below recommended 3.0+). You are excreting fluid faster than refueling. Drink +4 sips now!
          </p>
        </div>
      )}

      {/* Main Hydration Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          <span>Daily Hydration Target ({targetSips} sips)</span>
          <span style={{ color: '#fff', fontWeight: '700' }}>
            {sipCount} / {targetSips} sips ({totalVolume} {unit})
          </span>
        </div>

        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Sips-to-Pee Metrics & Quick Triggers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
        
        {/* Sips Control */}
        <div className="glass-card" style={{ padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today Sips</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#60a5fa' }}>{sipCount} sips</div>
          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', justifyContent: 'center' }}>
            <button onClick={() => onLogSip(1)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>+1 Sip</button>
            <button onClick={() => onLogSip(4)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>+4 Sips</button>
          </div>
        </div>

        {/* Pee Excretion Control */}
        <div className="glass-card" style={{ padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pee Excretions & Ratio</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fcd34d' }}>{peeCount} 🚽 ({sipsToPeeRatio} s/p)</div>
          <div style={{ marginTop: '0.4rem' }}>
            <button onClick={onLogPee} className="btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              🚽 +1 Pee Log
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
