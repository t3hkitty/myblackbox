import React, { useState } from 'react';
import { Calendar, Cake, Heart, Globe, Clock, Sparkles, Filter, Pin, ShieldOff, CheckCircle2, ChevronRight, PlusCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getContacts } from '../services/contactEngine';
import {
  getWorldEventsForDate,
  getPersonalOnThisDayZettels,
  getContactSpecialEvents,
  isZettelExcludedFromOnThisDay
} from '../services/onThisDayEngine';

export default function OnThisDayPanelWidget({
  allLogs = [],
  onSaveZettel = null,
  onToggleZettelExclusion = null,
  isPinned = false,
  onTogglePin = null
}) {
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'CONTACTS' | 'PERSONAL' | 'WORLD'

  const selectedDate = new Date(`${selectedDateStr}T12:00:00`);
  const contacts = getContacts();

  // Telemetry extracts
  const personalMemories = getPersonalOnThisDayZettels(allLogs, selectedDate);
  const { todayEvents, upcomingEvents } = getContactSpecialEvents(contacts, selectedDate, 30);
  const worldEvents = getWorldEventsForDate(selectedDate);

  const isTodaySelected = selectedDateStr === new Date().toISOString().split('T')[0];

  const handlePostBirthdayNote = (contact, type) => {
    if (onSaveZettel) {
      const emoji = type === 'birthday' ? '🎂' : '💍';
      const label = type === 'birthday' ? 'Birthday' : 'Anniversary';
      onSaveZettel({
        title: `${emoji} ${label} Celebration: ${contact.name}`,
        type: 'contact_event',
        content: `Celebrated ${contact.name}'s ${label.toLowerCase()}! Recorded special event note in myBlackbox Zettelkasten timeline.`,
        tags: ['#celebration', `#${type}`, `#person_${contact.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, '#contact'],
        metadata: { contactId: contact.id, contactName: contact.name, eventType: type }
      });
      alert(`🎉 Congratulatory ${label} Zettel note saved for ${contact.name}!`);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(15, 23, 42, 0.8)' }}>
      
      {/* Widget Header & Date Picker Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="#f59e0b" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📅 On This Day (Birthdays, Anniversaries & History Telemetry)
            </h3>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              Explore personal memories, contact birthdays/anniversaries, and world history!
            </p>
          </div>
        </div>

        {/* Action Controls & Date Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => e.target.value && setSelectedDateStr(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#fcd34d', fontSize: '0.78rem', fontWeight: '700' }}
          />

          {!isTodaySelected && (
            <button
              onClick={() => setSelectedDateStr(new Date().toISOString().split('T')[0])}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.73rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
            >
              Today
            </button>
          )}

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

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('ALL')}
          style={{
            background: activeTab === 'ALL' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: activeTab === 'ALL' ? '#fcd34d' : 'var(--text-muted)',
            border: activeTab === 'ALL' ? '1px solid #f59e0b' : '1px solid transparent',
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🌟 All Events ({todayEvents.length + personalMemories.length + worldEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('CONTACTS')}
          style={{
            background: activeTab === 'CONTACTS' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
            color: activeTab === 'CONTACTS' ? '#f472b6' : 'var(--text-muted)',
            border: activeTab === 'CONTACTS' ? '1px solid #ec4899' : '1px solid transparent',
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🎂 Birthdays & Anniversaries ({todayEvents.length + upcomingEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('PERSONAL')}
          style={{
            background: activeTab === 'PERSONAL' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'PERSONAL' ? '#60a5fa' : 'var(--text-muted)',
            border: activeTab === 'PERSONAL' ? '1px solid #3b82f6' : '1px solid transparent',
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🕰️ Personal Memories ({personalMemories.length})
        </button>

        <button
          onClick={() => setActiveTab('WORLD')}
          style={{
            background: activeTab === 'WORLD' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'WORLD' ? '#34d399' : 'var(--text-muted)',
            border: activeTab === 'WORLD' ? '1px solid #10b981' : '1px solid transparent',
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🌍 World History ({worldEvents.length})
        </button>
      </div>

      {/* SECTION 1: TODAY'S CONTACT BIRTHDAYS & ANNIVERSARIES */}
      {(activeTab === 'ALL' || activeTab === 'CONTACTS') && (
        <div style={{ marginBottom: '1.1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f472b6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cake size={16} color="#f472b6" /> Today's Contact Special Events ({todayEvents.length})
          </h4>

          {todayEvents.length === 0 ? (
            <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No contact birthdays or anniversaries on {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
              {todayEvents.map((evt, idx) => (
                <div
                  key={`today_evt_${idx}`}
                  className="glass-card"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: evt.type === 'birthday' ? '1px solid #ec4899' : '1px solid #f59e0b',
                    background: evt.type === 'birthday' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>
                      {evt.type === 'birthday' ? '🎂 Birthday' : '💍 Anniversary'}: <strong>{evt.contact.name}</strong>
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', background: evt.type === 'birthday' ? '#ec4899' : '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '4px' }}>
                      TODAY! 🎉
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {evt.type === 'birthday' ? (
                      evt.turningAge ? `Turning ${evt.turningAge} years old today!` : `Celebrating birthday today!`
                    ) : (
                      evt.yearsCount ? `Celebrating ${evt.yearsCount} year anniversary!` : `Celebrating anniversary today!`
                    )}
                  </div>

                  <button
                    onClick={() => handlePostBirthdayNote(evt.contact, evt.type)}
                    className="btn-primary"
                    style={{
                      marginTop: '0.2rem',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.72rem',
                      background: evt.type === 'birthday' ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Sparkles size={12} /> Post Congratulatory Zettel Note
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: UPCOMING BIRTHDAYS & ANNIVERSARIES (NEXT 30 DAYS) */}
      {(activeTab === 'CONTACTS') && (
        <div style={{ marginBottom: '1.1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fcd34d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Heart size={16} color="#fcd34d" /> Upcoming Contact Birthdays & Anniversaries (Next 30 Days)
          </h4>

          {upcomingEvents.length === 0 ? (
            <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No contact birthdays or anniversaries registered in the next 30 days. Add birthdays in Contacts Hub!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {upcomingEvents.map((evt, idx) => (
                <div
                  key={`up_evt_${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>{evt.type === 'birthday' ? '🎂' : '💍'}</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                        {evt.contact.name} ({evt.type === 'birthday' ? 'Birthday' : 'Anniversary'})
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Date: {evt.formattedDate} {evt.turningAge ? `(Turning ${evt.turningAge})` : ''}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    In {evt.daysUntil} day{evt.daysUntil === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PERSONAL ZETTEL MEMORIES ("ON THIS DAY IN YOUR HISTORY") */}
      {(activeTab === 'ALL' || activeTab === 'PERSONAL') && (
        <div style={{ marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={16} color="#60a5fa" /> Personal Zettel Memories ({personalMemories.length})
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              (Zettels with <code>#no_on_this_day</code> tag excluded)
            </span>
          </div>

          {personalMemories.length === 0 ? (
            <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No past Zettel logs found on {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} from previous years.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {personalMemories.map(({ log, logYear, yearsAgo, formattedDate }) => (
                <div
                  key={`otd_log_${log.id}`}
                  className="glass-card"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(59, 130, 246, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                      🕰️ {yearsAgo === 0 ? 'Earlier Today' : `${yearsAgo} Year${yearsAgo === 1 ? '' : 's'} Ago Today (${logYear})`}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {formattedDate}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                    {log.title}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {log.content ? (log.content.length > 150 ? `${log.content.substring(0, 150)}...` : log.content) : 'No content'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                      {(log.tags || []).map((t, tidx) => (
                        <span key={tidx} style={{ fontSize: '0.65rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Instant Exclusion Toggle */}
                    {onToggleZettelExclusion && (
                      <button
                        onClick={() => onToggleZettelExclusion(log)}
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="Add #no_on_this_day tag to exclude this log from On This Day panel"
                      >
                        <ShieldOff size={11} /> Exclude (#no_on_this_day)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: MAJOR WORLD HISTORICAL EVENTS */}
      {(activeTab === 'ALL' || activeTab === 'WORLD') && (
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={16} color="#34d399" /> Major World History Milestones on {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} ({worldEvents.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {worldEvents.map((wevt, idx) => (
              <div
                key={`wevt_${idx}`}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                    {wevt.title}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                    Year {wevt.year} ({wevt.category || 'History'})
                  </span>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {wevt.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
