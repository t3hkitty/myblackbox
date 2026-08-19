import React, { useState } from 'react';
import { X, Camera, Image, Sparkles, Check, Upload, Layers, Eye, Zap, UserCheck, History, ArrowRightLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_SELFIE_MEMORIES = [
  { id: 's_1', title: 'Selfie — 1 Year Ago', date: 'August 2025', mood: '😊 Happy & Energetic', vibe: 'Bright Morning Sun', avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🤳' },
  { id: 's_2', title: 'Selfie — 6 Months Ago', date: 'February 2026', mood: '😐 Focused', vibe: 'Cozy Workspace', avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🤳' },
  { id: 's_3', title: 'Selfie — Today', date: 'August 2026', mood: '😍 Super Happy', vibe: 'Fresh Air / Outdoors', avatarBg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', icon: '🤳' }
];

export default function PhotoSceneParserModal({
  isOpen,
  onClose,
  onSaveZettel
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upload_image'); // 'upload_image' | 'photo_scene' | 'selfie_memories'
  const [selectedSelfie, setSelectedSelfie] = useState(SAMPLE_SELFIE_MEMORIES[2]);
  const [comparisonTarget, setComparisonTarget] = useState(SAMPLE_SELFIE_MEMORIES[0]);
  const [customCaption, setCustomCaption] = useState('');
  const [isBioEventChecked, setIsBioEventChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Uploaded local image file state
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [originalFileObject, setOriginalFileObject] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);

  const processAndSetImage = (file, rotationAngle = 0) => {
    if (!file) return;

    setUploadedFileName(file.name);
    setOriginalFileObject(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1200; // Auto-scale to max 1200px dimension

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (rotationAngle === 90 || rotationAngle === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        const scaledDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        const kbSize = (scaledDataUrl.length * 0.75 / 1024).toFixed(1) + ' KB';
        setUploadedImagePreview(scaledDataUrl);
        setUploadedFileSize(`${kbSize} (Auto-Scaled from ${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageRotation(0);
    processAndSetImage(file, 0);
  };

  const handleRotateImage = () => {
    if (!originalFileObject) return;
    const newRotation = (imageRotation + 90) % 360;
    setImageRotation(newRotation);
    processAndSetImage(originalFileObject, newRotation);
  };

  const handleSaveUploadedImageZettel = () => {
    if (!uploadedImagePreview) {
      alert('Please select an image file first.');
      return;
    }

    onSaveZettel({
      title: `Photo Scene Import: ${uploadedFileName || 'Uploaded Image'}`,
      type: 'microlog',
      content: `### 📷 Imported Photo Scene Telemetry\n**File Name**: ${uploadedFileName}\n**Processed Size**: ${uploadedFileSize}\n**Orientation**: ${imageRotation}° rotated\n\n**Scene Notes & Atmosphere**: ${customCaption.trim() || 'Imported from local image file.'}${isBioEventChecked ? '\n\n*Bio Tie-in*: Linked to recent excretion/bio health event for gut correlation.' : ''}\n\n![Imported Image Preview](${uploadedImagePreview})`,
      tags: ['#photo_scene', '#image_import', '#telemetry', '#media_vault', isBioEventChecked ? '#bio_event' : null].filter(Boolean),
      metadata: { fileName: uploadedFileName, fileSize: uploadedFileSize }
    });

    confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });
    setUploadedImagePreview(null);
    setUploadedFileName('');
    setCustomCaption('');
    setOriginalFileObject(null);
    onClose();
  };

  const handleSaveSelfieZettel = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const tags = ['#selfie', '#memories', '#time_lapse', '#telemetry'];
      if (isBioEventChecked) {
        tags.push('#bio_event', '#health_telemetry', '#gut_health');
      }

      onSaveZettel({
        title: `Selfie Telemetry: ${selectedSelfie.title}${isBioEventChecked ? ' (Tied to Bio Event 💩)' : ''}`,
        type: 'microlog',
        content: `**Current Vibe**: ${selectedSelfie.vibe}\n**Mood State**: ${selectedSelfie.mood}\n\n### 🔄 Google Photos Memories Time-Lapse Comparison:\nComparing today's selfie against **${comparisonTarget.title} (${comparisonTarget.date})**:\n- *Then (${comparisonTarget.date})*: ${comparisonTarget.vibe} (${comparisonTarget.mood})\n- *Now*: ${selectedSelfie.vibe} (${selectedSelfie.mood})\n\n**Notes**: ${customCaption.trim() || 'Selfie memory comparison recorded.'}${isBioEventChecked ? '\n\n*Bio Tie-in*: Linked to recent excretion/bio health event for gut correlation.' : ''}`,
        tags
      });

      setIsProcessing(false);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });
      onClose();
    }, 500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={22} color="#ec4899" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                Photo Scene & Selfie Memories Engine
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Quantify scene atmosphere or perform Google Photos style time-lapse selfie comparisons
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.04)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('upload_image')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: activeTab === 'upload_image' ? '1px solid #10b981' : '1px solid transparent',
              background: activeTab === 'upload_image' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'upload_image' ? '#34d399' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            🖼️ Upload Local Image
          </button>
          <button
            onClick={() => setActiveTab('photo_scene')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: activeTab === 'photo_scene' ? '1px solid #ec4899' : '1px solid transparent',
              background: activeTab === 'photo_scene' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
              color: activeTab === 'photo_scene' ? '#f472b6' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            📷 Photo Scene
          </button>
          <button
            onClick={() => setActiveTab('selfie_memories')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: activeTab === 'selfie_memories' ? '1px solid #ec4899' : '1px solid transparent',
              background: activeTab === 'selfie_memories' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
              color: activeTab === 'selfie_memories' ? '#f472b6' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            🤳 Selfie Memories
          </button>
        </div>

        {activeTab === 'upload_image' ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Upload size={16} color="#34d399" /> Import Photo & Extract Scene Telemetry:
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              style={{ display: 'block', width: '100%', padding: '0.5rem', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', marginBottom: '0.8rem', cursor: 'pointer' }}
            />

            {uploadedImagePreview && (
              <div style={{ textAlign: 'center', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '8px' }}>
                <img
                  src={uploadedImagePreview}
                  alt="Uploaded Preview"
                  style={{ maxHeight: '200px', borderRadius: '8px', border: '2px solid #34d399', objectFit: 'contain' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  <span>{uploadedFileName} • {uploadedFileSize}</span>
                  <button
                    type="button"
                    onClick={handleRotateImage}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#34d399', borderColor: '#34d399' }}
                  >
                    🔄 Rotate 90°
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Scene Notes & Atmosphere Caption:
              </label>
              <input
                type="text"
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder="Describe scene, location, mood, or context..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem' }}
              />
            </div>

            <button
              onClick={handleSaveUploadedImageZettel}
              className="btn-primary"
              style={{ width: '100%', padding: '0.55rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={15} /> Convert Uploaded Image to Zettel Timeline Note
            </button>
          </div>
        ) : activeTab === 'selfie_memories' ? (
          <div>
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <History size={15} /> 🔄 Google Photos Memories Time-Lapse Comparison:
              </div>

              {/* Side-by-side comparison cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                
                {/* Past Memory Card */}
                <div style={{ background: comparisonTarget.avatarBg, padding: '0.75rem', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem' }}>{comparisonTarget.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800' }}>Then: {comparisonTarget.date}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{comparisonTarget.vibe}</div>
                  <div style={{ fontSize: '0.68rem', marginTop: '0.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '2px 4px' }}>
                    {comparisonTarget.mood}
                  </div>
                </div>

                {/* Today Selfie Card */}
                <div style={{ background: selectedSelfie.avatarBg, padding: '0.75rem', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem' }}>{selectedSelfie.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800' }}>Now: Today ({selectedSelfie.date})</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{selectedSelfie.vibe}</div>
                  <div style={{ fontSize: '0.68rem', marginTop: '0.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '2px 4px' }}>
                    {selectedSelfie.mood}
                  </div>
                </div>

              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Select Time-Lapse Comparison Baseline:
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setComparisonTarget(SAMPLE_SELFIE_MEMORIES[0])}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', borderColor: comparisonTarget.id === 's_1' ? '#ec4899' : 'var(--border-color)' }}
                  >
                    1 Year Ago
                  </button>
                  <button
                    onClick={() => setComparisonTarget(SAMPLE_SELFIE_MEMORIES[1])}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', borderColor: comparisonTarget.id === 's_2' ? '#ec4899' : 'var(--border-color)' }}
                  >
                    6 Months Ago
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Selfie Notes & Well-being Observations:
                </label>
                <input
                  type="text"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="e.g. Energy levels much higher compared to 6 months ago..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem', marginBottom: '0.6rem' }}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#a78bfa', cursor: 'pointer', background: 'rgba(167, 139, 250, 0.1)', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                  <input
                    type="checkbox"
                    checked={isBioEventChecked}
                    onChange={(e) => setIsBioEventChecked(e.target.checked)}
                    style={{ accentColor: '#a78bfa' }}
                  />
                  <span>💩 Tie to Logged Bio / Excretion Event (Gut & Health Telemetry)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveSelfieZettel}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '0.55rem', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <UserCheck size={15} /> {isProcessing ? 'Processing Selfie Memory...' : 'Save Selfie Time-Lapse Comparison Zettel'}
            </button>
          </div>
        ) : (
          <div>
            <div className="glass-card" style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', marginBottom: '1rem', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> Quantified Scene Telemetry:
              </div>

              <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '0.4rem' }}>
                Atmosphere Vibe: <strong>Cozy Focused Workspace</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Add Scene Commentary:
                </label>
                <input
                  type="text"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="e.g. Clean workspace setup before starting afternoon coding session..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveSelfieZettel}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '0.55rem', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Camera size={15} /> Append Photo Scene to Zettel Journal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
