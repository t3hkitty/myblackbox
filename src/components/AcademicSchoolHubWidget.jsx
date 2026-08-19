import React, { useState } from 'react';
import { GraduationCap, BookOpen, Users, Clock, Plus, Trash2, Sparkles, CheckCircle2, ChevronRight, FileText, Pin, User, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getContacts } from '../services/contactEngine';
import {
  PACE_PRESETS,
  parseSyllabusTasks,
  calculateReadingTime,
  calculateWritingTime
} from '../services/syllabusProcessorEngine';

const DEFAULT_COURSES = [
  {
    id: 'course_1',
    code: 'CS 101',
    subject: 'Computer Science',
    title: 'Data Structures & Algorithms',
    room: 'Turing Hall 302',
    instructor: { name: 'Dr. Alan Turing', email: 'turing@university.edu', officeHours: 'Tue/Thu 2-4 PM' },
    classmates: ['Sarah Connor', 'Miles Dyson'],
    syllabus: 'Read Chapter 4 pp. 120-165\nWrite 1500 words research paper on Binary Search Trees\nGroup Assignment 1: Graph Traversal Lab'
  },
  {
    id: 'course_2',
    code: 'HIST 202',
    subject: 'History',
    title: 'Modern World History & Technology',
    room: 'Lincoln Hall 105',
    instructor: { name: 'Prof. Howard Zinn', email: 'zinn@university.edu', officeHours: 'Mon/Wed 1-3 PM' },
    classmates: ['Miles Dyson'],
    syllabus: 'Read Chapter 8 pp. 200-245\nEssay 2500 words on the Industrial Revolution'
  }
];

export default function AcademicSchoolHubWidget({
  allLogs = [],
  onSaveZettel = null,
  isPinned = false,
  onTogglePin = null
}) {
  const [courses, setCourses] = useState(() => {
    const stored = localStorage.getItem('blackbox_academic_courses_v1');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return DEFAULT_COURSES;
  });

  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);
  const [paceKey, setPaceKey] = useState('STANDARD');
  const [showAddCourse, setShowAddCourse] = useState(false);

  // New Course Form State
  const [newCode, setNewCode] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newInstructorEmail, setNewInstructorEmail] = useState('');
  const [newSyllabusText, setNewSyllabusText] = useState('');

  const [rawSyllabusInput, setRawSyllabusInput] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);

  const allContacts = getContacts();

  const saveCoursesToStorage = (updated) => {
    setCourses(updated);
    localStorage.setItem('blackbox_academic_courses_v1', JSON.stringify(updated));
  };

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    const newCourseObj = {
      id: `course_${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      subject: newSubject.trim() || 'General',
      title: newTitle.trim(),
      room: 'Online / TBD',
      instructor: { name: newInstructorName.trim() || 'Instructor', email: newInstructorEmail.trim() || '', officeHours: 'TBD' },
      classmates: [],
      syllabus: newSyllabusText.trim()
    };

    const updated = [newCourseObj, ...courses];
    saveCoursesToStorage(updated);
    setSelectedCourseId(newCourseObj.id);
    setNewCode('');
    setNewSubject('');
    setNewTitle('');
    setNewInstructorName('');
    setNewInstructorEmail('');
    setNewSyllabusText('');
    setShowAddCourse(false);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleDeleteCourse = (courseId, code) => {
    if (window.confirm(`Delete course "${code}"?`)) {
      const updated = courses.filter(c => c.id !== courseId);
      saveCoursesToStorage(updated);
      if (updated.length > 0) setSelectedCourseId(updated[0].id);
    }
  };

  const handleParseSyllabus = (textToParse = null) => {
    const text = textToParse || rawSyllabusInput || (activeCourse ? activeCourse.syllabus : '');
    if (!text || !text.trim()) {
      alert('Please enter or select a syllabus text to process.');
      return;
    }

    const tasks = parseSyllabusTasks(text, activeCourse ? activeCourse.code : 'SCHOOL', paceKey);
    setGeneratedTasks(tasks);
  };

  const handleInjectTasksToBlackbox = () => {
    if (!generatedTasks || generatedTasks.length === 0) {
      alert('No parsed tasks to inject.');
      return;
    }

    if (!onSaveZettel) {
      alert('Zettel save handler unlinked.');
      return;
    }

    let count = 0;
    generatedTasks.forEach(task => {
      onSaveZettel({
        title: task.title,
        type: 'task',
        content: `**Course Task (${activeCourse ? activeCourse.code : 'School'})**\n${task.details}\n\n⏱️ **Estimated Duration**: ${task.estimatedMinutes} mins (Pace: ${PACE_PRESETS[paceKey].label})`,
        tags: [...task.tags, '#blackbox_task', '#academic_hub'],
        metadata: { courseCode: activeCourse ? activeCourse.code : 'School', estimatedMinutes: task.estimatedMinutes, pace: paceKey }
      });
      count++;
    });

    alert(`⚡ Created ${count} granular Academic Zettel tasks in your Blackbox timeline feed!`);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
    setGeneratedTasks([]);
  };

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={22} color="#c084fc" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>
              🎓 Academic School Hub & Syllabus Processor
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Track subjects, teachers, classmates, and divide syllabi into granular reading/writing tasks!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setShowAddCourse(!showAddCourse)}
            className="btn-primary"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
          >
            <Plus size={13} /> Add Class / Course
          </button>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
              title={isPinned ? 'Unpin from Corkboard' : 'Pin to Corkboard'}
            >
              <Pin size={13} fill={isPinned ? '#fcd34d' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Add Course Form Modal/Card */}
      {showAddCourse && (
        <form onSubmit={handleAddCourse} className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #a855f7', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#c084fc' }}>➕ Register New Academic Course</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem' }}>
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Course Code (e.g. CS 101)..." required style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject Area (e.g. Computer Science)..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Course Title..." required style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <input type="text" value={newInstructorName} onChange={(e) => setNewInstructorName(e.target.value)} placeholder="Instructor Name (e.g. Dr. Turing)..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
          </div>
          <textarea rows="3" value={newSyllabusText} onChange={(e) => setNewSyllabusText(e.target.value)} placeholder="Paste raw syllabus / reading & assignment list..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
            <button type="button" onClick={() => setShowAddCourse(false)} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', background: '#a855f7' }}>Save Course</button>
          </div>
        </form>
      )}

      {/* Course Selection Pills Bar */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: selectedCourseId === course.id ? '1px solid #c084fc' : '1px solid var(--border-color)',
              background: selectedCourseId === course.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
              color: selectedCourseId === course.id ? '#fff' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <BookOpen size={14} color={selectedCourseId === course.id ? '#c084fc' : 'var(--text-muted)'} />
            <span>{course.code}: {course.title}</span>
          </button>
        ))}
      </div>

      {/* Active Course Details & Teacher/Classmates Cards */}
      {activeCourse && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem', marginBottom: '1.25rem' }}>
          
          {/* Class Overview Card */}
          <div className="glass-card" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                  {activeCourse.subject}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', marginTop: '0.2rem' }}>
                  {activeCourse.code}: {activeCourse.title}
                </h4>
              </div>
              <button onClick={() => handleDeleteCourse(activeCourse.id, activeCourse.code)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }} title="Delete Course">
                <Trash2 size={13} />
              </button>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>📍 Location: {activeCourse.room}</div>
          </div>

          {/* Instructor & Classmates Card */}
          <div className="glass-card" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={14} color="#60a5fa" /> Teacher / Instructor: <strong>{activeCourse.instructor.name}</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ✉️ {activeCourse.instructor.email || 'No email specified'} • 🕒 Office Hours: {activeCourse.instructor.officeHours}
            </div>

            <div style={{ marginTop: '0.3rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.3rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={13} color="#fcd34d" /> Classmates & Group Partners:
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                {activeCourse.classmates && activeCourse.classmates.length > 0 ? (
                  activeCourse.classmates.map((name, idx) => (
                    <span key={idx} style={{ fontSize: '0.68rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      👤 {name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>No partners assigned yet. Add partners in Contacts Hub!</span>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SYLLABUS GRANULAR TASK PROCESSOR PANEL */}
      <div className="glass-card" style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
        
        {/* Pace Speed Allocation Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} color="#c084fc" /> Syllabus Processor & Reading/Writing Pace Adjuster
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Automatically divide reading & writing assignments into granular time-allocated tasks.
            </p>
          </div>

          {/* Pace Toggle Buttons */}
          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {Object.values(PACE_PRESETS).map(spec => (
              <button
                key={spec.id}
                onClick={() => setPaceKey(spec.id)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  borderRadius: '4px',
                  border: 'none',
                  background: paceKey === spec.id ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  color: paceKey === spec.id ? '#c084fc' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title={spec.description}
              >
                {spec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Syllabus Input Textarea & Parse Trigger */}
        <textarea
          rows="3"
          value={rawSyllabusInput}
          onChange={(e) => setRawSyllabusInput(e.target.value)}
          placeholder={`Paste syllabus readings, essays, or lab assignments for ${activeCourse ? activeCourse.code : 'this class'}...\nExample: Read Chapter 4 pp. 120-165\nWrite 1500 words research paper on Algorithms`}
          style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.78rem', outline: 'none', marginBottom: '0.5rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#c084fc' }}>
            Current Pace: <strong>{PACE_PRESETS[paceKey].label}</strong> ({PACE_PRESETS[paceKey].readingWpm} wpm reading / {PACE_PRESETS[paceKey].writingWpm} wpm writing)
          </span>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => handleParseSyllabus()}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.5)' }}
            >
              ⚡ Process Syllabus Tasks
            </button>

            {generatedTasks.length > 0 && (
              <button
                onClick={handleInjectTasksToBlackbox}
                className="btn-primary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                Inject {generatedTasks.length} Tasks to Blackbox Feed
              </button>
            )}
          </div>
        </div>

        {/* Parsed Granular Tasks Preview */}
        {generatedTasks.length > 0 && (
          <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
            <h5 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem' }}>
              📋 Granular Task Breakdown ({generatedTasks.length} Sub-tasks Generated):
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {generatedTasks.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>{t.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.details}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    ⏱️ {t.estimatedMinutes} mins
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
