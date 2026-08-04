import React, { useState } from 'react';
import { CloudSun, Thermometer, Sparkles, Plus, Flame, Droplets, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const WEATHER_CONDITIONS = [
  { id: 'sunny', label: '☀️ Sunny', icon: '☀️' },
  { id: 'cloudy', label: '🌤️ Partly Cloudy', icon: '🌤️' },
  { id: 'heat', label: '🥵 Extreme Heat', icon: '🥵' },
  { id: 'rain', label: '🌧️ Rain', icon: '🌧️' },
  { id: 'storm', label: '🌩️ Thunderstorm', icon: '🌩️' },
  { id: 'freezing', label: '🥶 Freezing Cold', icon: '🥶' }
];

const HUMOR_PRESETS = [
  "Gallon of sweat here! 💦",
  "It's only 10???? 🥵",
  "Brain melting out of ears 🧠",
  "Human popsicle mode 🥶",
  "Sauna status confirmed 🧖",
  "Humidity index off the charts 📈"
];

export default function WeatherLoggerWidget({
  onLogWeatherZettel
}) {
  const [temp, setTemp] = useState(88);
  const [lastTemp, setLastTemp] = useState(84);
  const [condition, setCondition] = useState('heat');
  const [note, setNote] = useState("It's only 10???? 🥵");

  const tempDiff = temp - lastTemp;
  const diffNotation = tempDiff > 0 ? `+${tempDiff}°F` : tempDiff < 0 ? `${tempDiff}°F` : '0°F';

  const handleLogWeather = (e) => {
    e.preventDefault();
    const condObj = WEATHER_CONDITIONS.find(c => c.id === condition) || WEATHER_CONDITIONS[2];

    onLogWeatherZettel({
      title: `Hourly Weather: ${temp}°F ${condObj.icon} (${diffNotation})`,
      type: 'microlog',
      content: `**Temperature**: ${temp}°F (${diffNotation} change since last hour)\n**Condition**: ${condObj.label}\n**Commentary**: ${note.trim() || 'Hourly weather check'}`,
      tags: ['#weather', '#temperature', '#telemetry', '#climate']
    });

    setLastTemp(temp);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CloudSun size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Hourly Weather & Temp Telemetry
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Temperature change notation + humidity & sweat commentary
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          {temp}°F ({diffNotation})
        </span>
      </div>

      {/* Temperature & Change Form */}
      <form onSubmit={handleLogWeather} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <Thermometer size={15} color="#f59e0b" />
            <input
              type="number"
              value={temp}
              onChange={(e) => setTemp(parseInt(e.target.value, 10) || 0)}
              style={{ width: '55px', background: 'none', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: '700', outline: 'none' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>°F</span>
          </div>

          {/* Condition Selector */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={{ flex: 1, minWidth: '140px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem' }}
          >
            {WEATHER_CONDITIONS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <span style={{ fontSize: '0.75rem', color: tempDiff > 0 ? '#ef4444' : '#34d399', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            ({diffNotation} since last log)
          </span>
        </div>

        {/* Quick Humor Preset Chips */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            Quick Relatable Weather Presets:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {HUMOR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNote(preset)}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.45rem', fontSize: '0.71rem', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fcd34d' }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Commentary Input */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Weather commentary..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Zap size={14} /> Log Weather
          </button>
        </div>
      </form>
    </div>
  );
}
