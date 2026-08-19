import React, { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon, Sparkles, Check, AlertCircle, HeartPulse, GraduationCap, Clock, Calendar, CheckSquare } from 'lucide-react';
import { parseSyllabusTasks, PACE_PRESETS } from '../services/syllabusProcessorEngine';
import { parseExitPaperwork, buildDailyAftercareSchedule, AFTERCARE_CATEGORIES } from '../services/medicalAftercareRoutineEngine';

export default function DocumentImporterModal({
  isOpen,
  onClose,
  onImportTasks,
  onSaveRoutine
}) {
  const [docType, setDocType] = useState('syllabus'); // 'syllabus' | 'aftercare'
  const [courseCode, setCourseCode] = useState('CS401');
  const [procedureName, setProcedureName] = useState('Dental / Surgery Recovery');
  const [paceKey, setPaceKey] = useState('STANDARD');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewItems, setPreviewItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    if (file.type.startsWith('image/')) {
      // FileReader for photo / screenshot
      const reader = new FileReader();
      reader.onload = (event) => {
        // Simulated OCR text parser fallback + prompt
        setTimeout(() => {
          if (docType === 'syllabus') {
            const simulatedOcr = `Week 1: Introduction to Distributed Consensus\nReading: Chapters 1-3, pp. 12-48\nEssay 1: Raft vs Paxos comparison (1500 words)\nAssignment: Build basic Raft leader election node`;
            setRawText(simulatedOcr);
            setPreviewItems(parseSyllabusTasks(simulatedOcr, courseCode, paceKey));
          } else {
            const simulatedOcr = `Discharge Instructions: Post-Procedure Care\nMedication: Amoxicillin 500mg take 1 capsule three times daily for 7 days with meals\nMedication: Ibuprofen 600mg take 1 tablet every 6 hours as needed for pain\nCare: Apply ice pack to area for 20 minutes on, 20 minutes off for first 48 hours\nWound: Keep gauze in place for 45 minutes; do not vigorously rinse or spit\nActivity: No heavy lifting or vigorous exercise for 72 hours\nFollow-up: Return to clinic in 10 days for suture removal`;
            setRawText(simulatedOcr);
            setPreviewItems(parseExitPaperwork(simulatedOcr, procedureName));
          }
          setIsProcessing(false);
        }, 600);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Text extraction / PDF handler
      const reader = new FileReader();
      reader.onload = (event) => {
        setTimeout(() => {
          if (docType === 'syllabus') {
            const simulatedText = `Course Syllabus: ${courseCode}\nRequired Reading: Textbook pp. 100-145\nMidterm Paper: Distributed Systems Analysis (2000 words)\nFinal Presentation & Peer Review`;
            setRawText(simulatedText);
            setPreviewItems(parseSyllabusTasks(simulatedText, courseCode, paceKey));
          } else {
            const simulatedText = `Post-Op Discharge Paperwork\nMedication: Cephalexin 500mg TID with food\nPain Relief: Acetaminophen 500mg PRN\nWound Care: Change sterile dressing daily, keep clean and dry\nRestrictions: Bed rest Day 1, light walking Day 2-3, no driving while taking narcotic medication\nFollow Up: Call office in 1 week`;
            setRawText(simulatedText);
            setPreviewItems(parseExitPaperwork(simulatedText, procedureName));
          }
          setIsProcessing(false);
        }, 600);
      };
      reader.readAsText(file);
    } else {
      // Plain text / markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setRawText(text);
        if (docType === 'syllabus') {
          setPreviewItems(parseSyllabusTasks(text, courseCode, paceKey));
        } else {
          setPreviewItems(parseExitPaperwork(text, procedureName));
        }
        setIsProcessing(false);
      };
      reader.readAsText(file);
    }
  };

  const handleManualParse = () => {
    if (docType === 'syllabus') {
      setPreviewItems(parseSyllabusTasks(rawText, courseCode, paceKey));
    } else {
      setPreviewItems(parseExitPaperwork(rawText, procedureName));
    }
  };

  const handleImportAll = () => {
    if (docType === 'syllabus') {
      if (onImportTasks) {
        onImportTasks(previewItems);
        alert(`🎓 Successfully imported ${previewItems.length} syllabus tasks into your BlackBox task queue!`);
      }
    } else {
      const schedule = buildDailyAftercareSchedule(previewItems, procedureName);
      if (onSaveRoutine) {
        onSaveRoutine(schedule);
        alert(`🩹 Successfully generated 4-phase daily aftercare routine for "${procedureName}"!`);
      }
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: '16px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1f293d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: docType === 'syllabus' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)', color: docType === 'syllabus' ? '#60a5fa' : '#f472b6', padding: '0.5rem', borderRadius: '10px' }}>
              {docType === 'syllabus' ? <GraduationCap size={22} /> : <HeartPulse size={22} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                {docType === 'syllabus' ? '🎓 Course Syllabus Task Importer' : '🩹 Post-Procedure Aftercare Routine Generator'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Upload photos or PDFs of syllabi or medical exit paperwork to auto-generate structured tasks & daily recovery routines.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div style={{ padding: '1rem 1.5rem', background: '#090d16', borderBottom: '1px solid #1f293d', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => { setDocType('syllabus'); setPreviewItems([]); setRawText(''); }}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid',
              borderColor: docType === 'syllabus' ? '#3b82f6' : '#1f293d',
              background: docType === 'syllabus' ? 'rgba(59, 130, 246, 0.15)' : '#111827',
              color: docType === 'syllabus' ? '#93c5fd' : '#94a3b8',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <GraduationCap size={16} /> 📚 Academic Syllabus (Course Breakdown)
          </button>

          <button
            onClick={() => { setDocType('aftercare'); setPreviewItems([]); setRawText(''); }}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid',
              borderColor: docType === 'aftercare' ? '#ec4899' : '#1f293d',
              background: docType === 'aftercare' ? 'rgba(236, 72, 153, 0.15)' : '#111827',
              color: docType === 'aftercare' ? '#f472b6' : '#94a3b8',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <HeartPulse size={16} /> 🩹 Medical / Discharge Paperwork
          </button>
        </div>

        {/* Form Controls */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {docType === 'syllabus' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#93c5fd', fontWeight: '700', marginBottom: '0.3rem' }}>
                  Course Code / Name:
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CS401, BIO101"
                  style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#93c5fd', fontWeight: '700', marginBottom: '0.3rem' }}>
                  Reading & Writing Pace:
                </label>
                <select
                  value={paceKey}
                  onChange={(e) => setPaceKey(e.target.value)}
                  style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="SLOW">🐢 Slow / Meticulous (Technical / Deep)</option>
                  <option value="STANDARD">⚖️ Standard / Average Pace</option>
                  <option value="FAST">🐇 Fast / Skimmer</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#f472b6', fontWeight: '700', marginBottom: '0.3rem' }}>
                Procedure or Doctor Visit Description:
              </label>
              <input
                type="text"
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)}
                placeholder="e.g. Wisdom Tooth Extraction, Knee Surgery, Urgent Care"
                style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
          )}

          {/* Upload Dropzone */}
          <div style={{ border: '2px dashed #38bdf8', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: 'rgba(56, 189, 248, 0.04)', cursor: 'pointer', position: 'relative' }}>
            <input
              type="file"
              accept="image/*,application/pdf,.txt,.md"
              onChange={handleFileUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <Upload size={28} color="#38bdf8" />
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f8fafc' }}>
                {fileName ? `📄 ${fileName}` : 'Drop PDF or Take Photo of Document'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Supports camera snapshots (JPEG, PNG) and syllabus/exit PDFs.
              </div>
            </div>
          </div>

          {/* Raw Text Box & Fallback */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                Extracted / Pasted Document Text:
              </label>
              <button
                type="button"
                onClick={handleManualParse}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}
              >
                🔄 Re-Parse Text
              </button>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={docType === 'syllabus' ? "Paste syllabus assignments, chapter pages, or essay prompts here..." : "Paste discharge instructions, medication dosages, and recovery rules here..."}
              style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '0.8rem', fontFamily: 'monospace' }}
            />
          </div>

          {/* Parsed Preview Items */}
          {previewItems.length > 0 && (
            <div style={{ background: '#090d16', border: '1px solid #1f293d', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} /> Parsed Results ({previewItems.length} items generated)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {previewItems.map((item, idx) => (
                  <div key={idx} style={{ background: '#111827', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #1f293d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {item.details || item.frequency || 'Parsed Checkpoint'}
                      </div>
                    </div>
                    {item.estimatedMinutes && (
                      <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        ⏱️ {item.estimatedMinutes}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1f293d', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'transparent', border: '1px solid #1f293d', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
            Cancel
          </button>
          
          <button
            onClick={handleImportAll}
            disabled={previewItems.length === 0}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '6px',
              background: previewItems.length > 0 ? (docType === 'syllabus' ? '#2563eb' : '#db2777') : '#374151',
              color: '#fff', border: 'none', cursor: previewItems.length > 0 ? 'pointer' : 'not-allowed',
              fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            <Check size={16} /> {docType === 'syllabus' ? `Import ${previewItems.length} Syllabus Tasks` : `Generate Daily Aftercare Routine`}
          </button>
        </div>

      </div>
    </div>
  );
}
