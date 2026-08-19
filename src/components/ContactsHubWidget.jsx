import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Upload, Download, Search, Filter, Trash2, Mail, Briefcase, FileText, CheckCircle, RefreshCw, Sparkles, ExternalLink, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getContacts,
  saveContacts,
  saveSingleContact,
  deleteContact,
  countLogsForContact,
  exportContactToMarkdown,
  downloadAllContactsZIP,
  parseLinkedInCsv,
  parseVCardText,
  fetchGooglePeopleContacts,
  convertContactToZettelData
} from '../services/contactEngine';

import { triggerGoogleAuthPopup, getStoredAccessToken } from '../services/googleDriveAuthEngine';

export default function ContactsHubWidget({
  allLogs = [],
  onFilterByContact = null,
  onSaveContactZettel = null
}) {
  const [contacts, setContactsState] = useState(() => getContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newAnniversary, setNewAnniversary] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const refreshContacts = () => {
    setContactsState(getContacts());
  };

  const handleCreateWebpageZettel = (contact) => {
    if (onSaveContactZettel) {
      const zettelData = convertContactToZettelData(contact);
      onSaveContactZettel(zettelData);
      alert(`⚡ Created Zettel .md log directly on webpage feed for "${contact.name}"!`);
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleConvertAllToWebpageZettels = () => {
    if (!onSaveContactZettel) {
      alert('Zettel save handler unlinked.');
      return;
    }
    if (contacts.length === 0) {
      alert('No contacts available to convert.');
      return;
    }
    let count = 0;
    contacts.forEach(c => {
      const zettelData = convertContactToZettelData(c);
      onSaveContactZettel(zettelData);
      count++;
    });
    alert(`⚡ Successfully created ${count} Contact Zettel .md logs directly in webpage timeline feed!`);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
  };

  const handleAddManualContact = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const contactPayload = {
      name: newName.trim(),
      email: newEmail.trim(),
      company: newCompany.trim(),
      role: newRole.trim(),
      birthday: newBirthday.trim(),
      anniversary: newAnniversary.trim(),
      notes: newNotes.trim(),
      source: 'manual'
    };

    const updated = saveSingleContact(contactPayload);
    setContactsState(updated);

    if (onSaveContactZettel) {
      onSaveContactZettel(convertContactToZettelData(contactPayload));
    }

    setNewName('');
    setNewEmail('');
    setNewCompany('');
    setNewRole('');
    setNewBirthday('');
    setNewAnniversary('');
    setNewNotes('');
    setShowAddForm(false);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleDeleteContact = (id, name) => {
    if (window.confirm(`Delete contact "${name}"?`)) {
      const updated = deleteContact(id);
      setContactsState(updated);
    }
  };

  const handleSyncGoogleContacts = async () => {
    setIsSyncingGoogle(true);

    if (!getStoredAccessToken()) {
      const shouldAuth = window.confirm(
        '🔑 Google OAuth Token Missing / Unauthenticated.\n\nClick OK to trigger Google OAuth Sign-In (with Contacts Read-Only scope), or CANCEL to enter token manually.'
      );
      if (shouldAuth) {
        triggerGoogleAuthPopup(true);
      }
    }

    let res = await fetchGooglePeopleContacts();
    setIsSyncingGoogle(false);

    if (res.success && res.contacts) {
      let addedCount = 0;
      let current = getContacts();

      res.contacts.forEach(gc => {
        if (!current.some(c => c.name.toLowerCase() === gc.name.toLowerCase())) {
          current = [gc, ...current];
          addedCount++;

          if (onSaveContactZettel) {
            onSaveContactZettel(convertContactToZettelData(gc));
          }
        }
      });

      saveContacts(current);
      setContactsState(current);
      alert(`👥 Synced ${res.contacts.length} contacts from Google People API! (${addedCount} new .md Zettels added directly to webpage timeline)`);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    } else {
      alert(`⚠️ Could not fetch Google Contacts: ${res.message || 'Check OAuth connection'}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      let imported = [];

      if (file.name.endsWith('.csv')) {
        imported = parseLinkedInCsv(text);
      } else if (file.name.endsWith('.vcf') || file.name.endsWith('.vcard')) {
        imported = parseVCardText(text);
      } else if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          imported = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {}
      }

      if (imported.length > 0) {
        let current = getContacts();
        let addedCount = 0;

        imported.forEach(ic => {
          if (!current.some(c => c.name.toLowerCase() === ic.name.toLowerCase())) {
            current = [ic, ...current];
            addedCount++;

            if (onSaveContactZettel) {
              onSaveContactZettel(convertContactToZettelData(ic));
            }
          }
        });

        saveContacts(current);
        setContactsState(current);
        alert(`📥 Successfully converted & imported ${imported.length} contacts from "${file.name}"! (${addedCount} new .md Zettels added directly to webpage feed)`);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      } else {
        alert('⚠️ Could not parse contact file. Please upload a LinkedIn Connections.csv or VCF vCard file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSingleMd = (contact) => {
    const mdText = exportContactToMarkdown(contact);
    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contact.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contact.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === 'ALL' || (c.source || 'manual').toLowerCase() === sourceFilter.toLowerCase();
    return matchesSearch && matchesSource;
  });

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem' }}>
      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#60a5fa" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
              👥 Contacts Hub & Contact-to-Markdown Converter ({contacts.length} Contacts)
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Tag people in meeting logs, count mentions, and convert Google/LinkedIn exports to Zettel <code>.md</code> files!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSyncGoogleContacts}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
            title="Sync live Google Contacts via Google People REST API"
          >
            <RefreshCw size={13} className={isSyncingGoogle ? 'animate-spin' : ''} />
            <span>Sync Google Contacts</span>
          </button>

          <label className="btn-secondary" style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', cursor: 'pointer' }} title="Import LinkedIn CSV or VCF contact export files">
            <Upload size={13} /> Import Contact File (CSV/VCF)
            <input type="file" accept=".csv,.vcf,.vcard,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={() => downloadAllContactsZIP(contacts)}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#c4b5fd', borderColor: 'rgba(167, 139, 250, 0.4)' }}
            title="Package all contacts into individual Zettel .md files and download ZIP"
          >
            <Download size={13} /> Export All .md ZIP
          </button>

          <button
            onClick={handleConvertAllToWebpageZettels}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            title="Convert all contacts into Zettel .md logs directly in webpage timeline feed"
          >
            <Sparkles size={13} color="#fcd34d" /> Convert All to Webpage .md
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
          >
            <UserPlus size={13} /> Add Contact
          </button>
        </div>
      </div>

      {/* Manual Add Contact Form */}
      {showAddForm && (
        <form onSubmit={handleAddManualContact} className="glass-card" style={{ padding: '0.8rem', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #3b82f6', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa' }}>➕ Create / Convert New Contact Zettel</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem' }}>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name (e.g. John Doe)..." required style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email address..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <input type="text" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Company / Org..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Role / Title..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: '#ec4899', marginBottom: '0.1rem' }}>🎂 Birthday (YYYY-MM-DD or MM-DD):</label>
              <input type="text" value={newBirthday} onChange={(e) => setNewBirthday(e.target.value)} placeholder="e.g. 1995-08-06" style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: '#f59e0b', marginBottom: '0.1rem' }}>💍 Anniversary (YYYY-MM-DD or MM-DD):</label>
              <input type="text" value={newAnniversary} onChange={(e) => setNewAnniversary(e.target.value)} placeholder="e.g. 2020-08-06" style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
            </div>
          </div>
          <textarea rows="2" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Notes & collaboration history..." style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.35rem', color: '#fff', fontSize: '0.78rem' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', background: '#3b82f6' }}>Save Contact</button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, email, company..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.5rem 0.35rem 2rem', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.5rem', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
        >
          <option value="ALL" style={{ background: '#111827' }}>All Sources</option>
          <option value="google_contacts" style={{ background: '#111827' }}>Google Contacts</option>
          <option value="google_people_api" style={{ background: '#111827' }}>Google People API</option>
          <option value="linkedin_csv" style={{ background: '#111827' }}>LinkedIn CSV</option>
          <option value="vcard_vcf" style={{ background: '#111827' }}>VCF vCard</option>
          <option value="manual" style={{ background: '#111827' }}>Manual</option>
        </select>
      </div>

      {/* Contacts Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {filteredContacts.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
            No contacts found matching search filter.
          </div>
        ) : (
          filteredContacts.map(contact => {
            const mentionCount = countLogsForContact(contact, allLogs);
            const personTag = `#person_${contact.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

            return (
              <div key={contact.id} className="glass-card" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff' }}>
                      👤 {contact.name}
                    </div>
                    {contact.email && (
                      <div style={{ fontSize: '0.74rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {contact.email}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: '700' }}>
                    {contact.source || 'manual'}
                  </span>
                </div>

                {(contact.company || contact.role) && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Briefcase size={12} /> {contact.role ? `${contact.role} ` : ''}{contact.company ? `@ ${contact.company}` : ''}
                  </div>
                )}

                {(contact.birthday || contact.anniversary) && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                    {contact.birthday && (
                      <span style={{ fontSize: '0.68rem', color: '#f472b6', background: 'rgba(236, 72, 153, 0.15)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                        🎂 Birthday: {contact.birthday}
                      </span>
                    )}
                    {contact.anniversary && (
                      <span style={{ fontSize: '0.68rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        💍 Anniv: {contact.anniversary}
                      </span>
                    )}
                  </div>
                )}

                {/* Mention Counter Badge & YAML Frontmatter Link Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.5rem', borderRadius: '4px', margin: '0.2rem 0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#fcd34d', fontWeight: '700' }}>
                    📊 Mentioned in <strong>{mentionCount}</strong> Zettel log(s)
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#a78bfa', fontFamily: 'monospace' }}>
                    {personTag}
                  </span>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  {onFilterByContact && (
                    <button
                      onClick={() => onFilterByContact(personTag)}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                      title="Filter Zettel timeline for logs mentioning this contact"
                    >
                      🔍 Filter Logs ({mentionCount})
                    </button>
                  )}

                  <button
                    onClick={() => handleCreateWebpageZettel(contact)}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    title="Create Zettel .md log directly in webpage timeline"
                  >
                    <Sparkles size={12} color="#f59e0b" /> Webpage .md Zettel
                  </button>

                  <button
                    onClick={() => handleDownloadSingleMd(contact)}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                    title="Download Contact as Zettel .md file with YAML frontmatter"
                  >
                    📄 Export .md
                  </button>

                  <button
                    onClick={() => handleDeleteContact(contact.id, contact.name)}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    title="Delete contact"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
