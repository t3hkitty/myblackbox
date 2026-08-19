import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Flame, Settings, AlertTriangle, CheckCircle, RefreshCw, Coffee, Sun, Thermometer, ShieldAlert, Heart, Zap, Clock, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

const BEVERAGE_OPTIONS = [
  { id: 'water', label: 'Water Glass', emoji: '💧', color: '#3b82f6', defaultSips: 10 },
  { id: 'diet_soda', label: '12oz Can Soda', emoji: '🥫', color: '#ec4899', defaultSips: 12 },
  { id: 'bottle', label: 'Water Bottle', emoji: '🍾', color: '#10b981', defaultSips: 15 },
  { id: 'coffee', label: 'Coffee Cup', emoji: '☕', color: '#b45309', defaultSips: 10 },
  { id: 'tea', label: 'Tea Mug', emoji: '🍵', color: '#059669', defaultSips: 10 },
  { id: 'electrolytes', label: 'Electrolytes / Juice', emoji: '🧃', color: '#f59e0b', defaultSips: 12 }
];

const WEATHER_MODES = [
  { id: 'hot', label: '🥵 Hot (>85°F)', icon: '🥵', targetMult: 1.25, advice: 'Hot day detected: Target boosted +25%!' },
  { id: 'moderate', label: '🌤️ Moderate (65-84°F)', icon: '🌤️', targetMult: 1.0, advice: 'Normal hydration pace.' },
  { id: 'cold', label: '🥶 Cold (<60°F)', icon: '🥶', targetMult: 1.0, advice: 'Cold air reduces thirst cues. Drink warm tea/water!' }
];

export default function SipTrackerWidget({
  sipSettings,
  onLogSip,
  onLogPee,
  onLogPoo,
  onOpenSettings,
  onSaveSipSettings
}) {
  const [selectedBeverage, setSelectedBeverage] = useState(BEVERAGE_OPTIONS[0]);

  const initialWeatherMode = WEATHER_MODES.find(wm => wm.id === sipSettings.weatherModeId) || WEATHER_MODES[1];
  const [weatherMode, setWeatherModeState] = useState(initialWeatherMode);
  const [isColdSensitive, setIsColdSensitiveState] = useState(sipSettings.isColdSensitive ?? false);

  useEffect(() => {
    if (sipSettings.weatherModeId) {
      const mode = WEATHER_MODES.find(wm => wm.id === sipSettings.weatherModeId);
      if (mode) setWeatherModeState(mode);
    }
    if (typeof sipSettings.isColdSensitive === 'boolean') {
      setIsColdSensitiveState(sipSettings.isColdSensitive);
    }
  }, [sipSettings]);

  const handleSelectWeatherMode = (mode) => {
    setWeatherModeState(mode);
    if (onSaveSipSettings) {
      onSaveSipSettings({
        ...sipSettings,
        weatherModeId: mode.id,
        isHeatSensitive: mode.id === 'hot'
      });
    }
  };

  const handleToggleColdSensitive = (val) => {
    setIsColdSensitiveState(val);
    if (onSaveSipSettings) {
      onSaveSipSettings({
        ...sipSettings,
        isColdSensitive: val
      });
    }
  };

  // Time-based Drink Completion Math & Calibration State
  const [drinkStartTime, setDrinkStartTime] = useState(Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [calibratedSipRate, setCalibratedSipRate] = useState(null); // Sips per minute
  const [lastFinishedContainerMsg, setLastFinishedContainerMsg] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.max(1, Math.round((Date.now() - drinkStartTime) / 60000));
      setElapsedMinutes(mins);
    }, 10000);
    return () => clearInterval(timer);
  }, [drinkStartTime]);

  const sipCount = sipSettings.todaySipCount || 0;
  const peeCount = sipSettings.todayPeeCount || 0;
  const pooCount = sipSettings.todayPooCount || 0;
  const sipVolume = sipSettings.sipVolumeMl || 15;
  const baseTargetSips = sipSettings.dailySipTarget || 40;
  const targetSips = Math.round(baseTargetSips * weatherMode.targetMult);
  const unit = sipSettings.unit || 'ml';

  const totalVolume = sipCount * sipVolume;
  const progressPercent = Math.min(100, Math.round((sipCount / targetSips) * 100));

  // Compute Sips-to-Pee Ratio
  const sipsToPeeRatio = peeCount > 0 ? (sipCount / peeCount).toFixed(1) : sipCount > 0 ? sipCount.toFixed(1) : 0;
  const isInsufficientBeverage = peeCount > 0 && (sipCount / peeCount) < 3.0;

  const handleSipClick = (amount) => {
    onLogSip(amount, {
      ...selectedBeverage,
      weatherContext: weatherMode.label,
      isColdSensitive
    });
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.85 } });
  };

  // Can / Bottle Container Completion with Automatic Sip-Math Calibration
  const handleCompleteContainer = (sipsAmount, containerName) => {
    const now = Date.now();
    const durationMins = Math.max(1, Math.round((now - drinkStartTime) / 60000));
    const rate = (sipsAmount / durationMins).toFixed(2); // sips per minute

    setCalibratedSipRate(rate);
    setDrinkStartTime(now);
    setElapsedMinutes(0);

    const msg = `🎉 Finished ${containerName} (${sipsAmount} sips over ${durationMins}m ➔ Sip Velocity: ${rate} sips/min)`;
    setLastFinishedContainerMsg(msg);

    onLogSip(sipsAmount, {
      ...selectedBeverage,
      containerCompleted: containerName,
      durationMinutes: durationMins,
      sipVelocity: rate
    });

    confetti({ particleCount: 50, spread: 80, origin: { y: 0.8 } });
  };

  // 🔄 Refreshed Drink: Auto-completes current beverage and resets drink timer!
  const handleRefreshDrink = () => {
    const sipsToLog = selectedBeverage.defaultSips;
    handleCompleteContainer(sipsToLog, `Refreshed ${selectedBeverage.label}`);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      {/* Header */}
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
              Hydration Telemetry & Container Sip-Math Engine
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              1-Tap Can/Bottle Completion, Sip Velocity Calibration & Refreshed Drink Manager
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

      {/* Beverage Container Completion & Refresh Quick Bar */}
      <div className="glass-card" style={{ padding: '0.75rem', marginBottom: '0.8rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calculator size={15} color="#34d399" />
            <span>🥤 Container Completion & Sip-Math Velocity:</span>
          </span>

          <span style={{ fontSize: '0.7rem', color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
            ⏱️ Current Drink Open: {elapsedMinutes}m
          </span>
        </div>

        {/* Can / Bottle / Half Can Quick Completion Triggers */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
          <button
            onClick={() => handleCompleteContainer(12, '12oz Soda Can')}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(236, 72, 153, 0.5)', color: '#f472b6', background: 'rgba(236, 72, 153, 0.15)', fontWeight: '700' }}
            title="Log 12 sips + calculate sip velocity over open time"
          >
            🥫 Finished 12oz Can (+12)
          </button>

          <button
            onClick={() => handleCompleteContainer(6, 'Half Can/Bottle')}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.5)', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.15)', fontWeight: '700' }}
            title="Log 6 sips for half a soda can or bottle"
          >
            🥤 Finished Half Can (+6)
          </button>

          <button
            onClick={() => handleCompleteContainer(15, 'Full Bottle')}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.5)', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', fontWeight: '700' }}
            title="Log 15 sips for full water bottle"
          >
            🍾 Finished Bottle (+15)
          </button>

          <button
            onClick={handleRefreshDrink}
            className="btn-primary"
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', fontWeight: '700' }}
            title="Auto-completes last beverage and starts fresh drink timer"
          >
            <RefreshCw size={13} /> 🔄 Refreshed Drink
          </button>
        </div>

        {/* Sip Velocity Calculation Diagnostics */}
        {lastFinishedContainerMsg && (
          <div style={{ fontSize: '0.73rem', color: '#a7f3d0', background: 'rgba(0,0,0,0.2)', padding: '0.35rem 0.5rem', borderRadius: '4px', marginTop: '0.3rem' }}>
            {lastFinishedContainerMsg}
          </div>
        )}
      </div>

      {/* Weather Telemetry Context Bar */}
      <div className="glass-card" style={{ padding: '0.7rem', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sun size={14} color="#f59e0b" />
            <span>Weather Telemetry Context:</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#fef08a', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isColdSensitive}
              onChange={(e) => setIsColdSensitive(e.target.checked)}
              style={{ accentColor: '#fbbf24' }}
            />
            <span>🧊 Cold Drink Sensitive (Avoid thermal shock)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem' }}>
          {WEATHER_MODES.map(wm => (
            <button
              key={wm.id}
              onClick={() => setWeatherMode(wm)}
              className="btn-secondary"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.72rem',
                borderColor: weatherMode.id === wm.id ? '#f59e0b' : 'var(--border-color)',
                background: weatherMode.id === wm.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: weatherMode.id === wm.id ? '#fcd34d' : 'var(--text-muted)'
              }}
            >
              {wm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Beverage Quick Selector */}
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          Selected Beverage Type:
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {BEVERAGE_OPTIONS.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBeverage(b)}
              className="btn-secondary"
              style={{
                padding: '0.3rem 0.55rem',
                fontSize: '0.72rem',
                borderColor: selectedBeverage.id === b.id ? b.color : 'var(--border-color)',
                background: selectedBeverage.id === b.id ? `${b.color}25` : 'transparent',
                color: selectedBeverage.id === b.id ? b.color : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>{b.emoji}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>
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
          <span>Daily Hydration Target ({targetSips} sips for {weatherMode.label})</span>
          <span style={{ color: '#fff', fontWeight: '700' }}>
            {sipCount} / {targetSips} sips ({totalVolume} {unit})
          </span>
        </div>

        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Sips-to-Pee Metrics & Quick Triggers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
        
        {/* Sips Control */}
        <div className="glass-card" style={{ padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today Sips</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#60a5fa' }}>{sipCount} sips</div>
          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', justifyContent: 'center' }}>
            <button onClick={() => handleSipClick(1)} className="btn-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}>
              +1 {selectedBeverage.emoji}
            </button>
            <button onClick={() => handleSipClick(4)} className="btn-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}>
              +4 {selectedBeverage.emoji}
            </button>
          </div>
        </div>

        {/* Pee Excretion Control */}
        <div className="glass-card" style={{ padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pee & Ratio</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fcd34d' }}>{peeCount} 🚽 ({sipsToPeeRatio} s/p)</div>
          <div style={{ marginTop: '0.4rem' }}>
            <button onClick={onLogPee} className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              🚽 +1 Pee
            </button>
          </div>
        </div>

        {/* Poo Excretion Control */}
        <div className="glass-card" style={{ padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Poo Excretion</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#a78bfa' }}>{pooCount} 💩</div>
          <div style={{ marginTop: '0.4rem' }}>
            <button onClick={onLogPoo} className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}>
              💩 +1 Poo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
