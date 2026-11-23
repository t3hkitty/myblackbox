import React, { useState, useEffect } from 'react';
import {
  StageDirectorProfile,
  StageProfileItem
} from '../types';
import {
  loadStageProfiles,
  saveStageProfiles,
  FASTING_PRESET,
  WORKOUT_PRESET,
  HYDRATION_TICKER_PRESET,
  BLANK_CUSTOM_PRESET
} from '../stageDirector';

export const StageDirectorSettingsPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<StageDirectorProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('fasting');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadStageProfiles();
    setProfiles(loaded);
    if (loaded.length > 0) {
      setSelectedProfileId(loaded[0].id);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApplyPreset = (preset: StageDirectorProfile) => {
    // Generate fresh unique ID or overwrite existing preset ID if same
    const newProfile: StageDirectorProfile = JSON.parse(JSON.stringify(preset));
    newProfile.id = `${preset.id}_${Date.now().toString(36).substring(3)}`;
    newProfile.name = `${preset.name} (Copy)`;

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveStageProfiles(updated);
    setSelectedProfileId(newProfile.id);
    showToast(`✨ Loaded editable preset: ${preset.name}`);
  };

  const currentProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const handleUpdateCurrentProfile = (field: keyof StageDirectorProfile, val: any) => {
    if (!currentProfile) return;
    const updated = profiles.map((p) => {
      if (p.id === currentProfile.id) {
        return { ...p, [field]: val };
      }
      return p;
    });
    setProfiles(updated);
    saveStageProfiles(updated);
  };

  const handleUpdateStage = (idx: number, field: keyof StageProfileItem, val: any) => {
    if (!currentProfile) return;
    const stages = [...currentProfile.stages];
    stages[idx] = { ...stages[idx], [field]: val };
    handleUpdateCurrentProfile('stages', stages);
  };

  const handleAddStage = () => {
    if (!currentProfile) return;
    const stages = [
      ...currentProfile.stages,
      {
        stage_key: `stage_${Date.now().toString(36).substring(4)}`,
        threshold: 30,
        label: 'New Stage',
        done_message: 'Milestone reached for {title}: {duration} ({hours}h)!'
      }
    ];
    handleUpdateCurrentProfile('stages', stages);
    showToast('Added new stage row');
  };

  const handleDeleteStage = (idx: number) => {
    if (!currentProfile) return;
    const stages = currentProfile.stages.filter((_, i) => i !== idx);
    handleUpdateCurrentProfile('stages', stages);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      showToast('⚠️ Must keep at least one profile');
      return;
    }
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);
    saveStageProfiles(filtered);
    setSelectedProfileId(filtered[0].id);
    showToast('Profile deleted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#1E1E2E' }}>
      {/* Header & Preset Buttons */}
      <div style={{ borderBottom: '2px dashed #CBD5E1', paddingBottom: '12px' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎯</span> Stage Director Profiles
        </h3>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#64748B' }}>
          Configure custom milestones for timers and Roman numeral tickers. Use one-click presets to populate editable rows.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleApplyPreset(FASTING_PRESET)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#EDE9FE',
              border: '2px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              boxShadow: '1px 1px 0px #000'
            }}
          >
            🥗 Fasting Preset
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(WORKOUT_PRESET)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FEF3C7',
              border: '2px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              boxShadow: '1px 1px 0px #000'
            }}
          >
            🏋️ Workout Preset
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(HYDRATION_TICKER_PRESET)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#E0F2FE',
              border: '2px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              boxShadow: '1px 1px 0px #000'
            }}
          >
            💊 Ticker Preset
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(BLANK_CUSTOM_PRESET)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#F1F5F9',
              border: '2px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              boxShadow: '1px 1px 0px #000'
            }}
          >
            ✨ Blank Custom
          </button>
        </div>
      </div>

      {/* Profile Selector & Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '2px solid #000',
            borderRadius: '8px',
            fontWeight: 'bold',
            backgroundColor: '#FFF'
          }}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.trigger_type === 'duration_minutes' ? '⏱️ Time' : '🔢 Ticks'})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleDeleteProfile(selectedProfileId)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#FEE2E2',
            border: '2px solid #000',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🗑️
        </button>
      </div>

      {currentProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Profile Name & Type */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={currentProfile.name}
              onChange={(e) => handleUpdateCurrentProfile('name', e.target.value)}
              placeholder="Profile Name"
              style={{
                flex: 2,
                padding: '6px 10px',
                border: '2px solid #000',
                borderRadius: '8px',
                fontWeight: 600
              }}
            />
            <select
              value={currentProfile.trigger_type}
              onChange={(e) => handleUpdateCurrentProfile('trigger_type', e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '2px solid #000',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              <option value="duration_minutes">⏱️ Duration (Mins)</option>
              <option value="tick_count">🔢 Tick Count</option>
            </select>
          </div>

          {/* Stage Items Table / Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
              Stages & Done Message Tokens: <code>{'{title}'}</code>, <code>{'{duration}'}</code>, <code>{'{hours}'}</code>, <code>{'{count}'}</code>, <code>{'{roman}'}</code>
            </div>

            {currentProfile.stages.map((stg, idx) => (
              <div
                key={stg.stage_key || idx}
                style={{
                  border: '2px solid #000',
                  borderRadius: '8px',
                  padding: '8px',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={stg.threshold}
                    onChange={(e) => handleUpdateStage(idx, 'threshold', Number(e.target.value))}
                    placeholder="Threshold"
                    style={{
                      width: '80px',
                      padding: '4px 8px',
                      border: '1px solid #000',
                      borderRadius: '6px',
                      fontWeight: 'bold'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {currentProfile.trigger_type === 'duration_minutes' ? 'mins' : 'ticks'}
                  </span>
                  <input
                    type="text"
                    value={stg.label}
                    onChange={(e) => handleUpdateStage(idx, 'label', e.target.value)}
                    placeholder="Stage Label"
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      border: '1px solid #000',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteStage(idx)}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: '#FEE2E2',
                      border: '1px solid #000',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="text"
                  value={stg.done_message}
                  onChange={(e) => handleUpdateStage(idx, 'done_message', e.target.value)}
                  placeholder="Done Message Template"
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    backgroundColor: '#FFF'
                  }}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddStage}
              style={{
                alignSelf: 'flex-start',
                padding: '6px 12px',
                backgroundColor: '#DCFCE7',
                border: '2px solid #000',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.8rem',
                boxShadow: '1px 1px 0px #000'
              }}
            >
              + Add Stage Milestone
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: '#2E1A47',
            color: '#FFF',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
