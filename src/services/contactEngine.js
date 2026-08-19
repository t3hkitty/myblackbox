/**
 * Contact Management, Google Contacts Sync & Social Media Export Converter Engine
 * Converts Google Contacts, LinkedIn CSVs, and vCards into Zettelkasten Markdown files (.md)
 * with standardized YAML Frontmatter schemas for external app linkage (Obsidian, Notion, Logseq).
 */

import JSZip from 'jszip';
import { getZettelTimestamp } from '../utils/timeUtils';
import { getStoredAccessToken, logSyncDiagnostic } from './googleDriveAuthEngine';

const CONTACTS_STORAGE_KEY = 'blackbox_contacts_v1';

const DEFAULT_CONTACTS = [
  {
    id: 'c_1',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    company: 'Skynet Research',
    role: 'Lead Architect',
    source: 'google_contacts',
    birthday: '1995-08-06',
    anniversary: '2020-08-06',
    tags: ['#contact', '#person', '#work'],
    notes: 'Primary collaborator on autonomous AI agent architecture.'
  },
  {
    id: 'c_2',
    name: 'Miles Dyson',
    email: 'miles.dyson@cyberdyne.io',
    company: 'Cyberdyne Systems',
    role: 'VP of Engineering',
    source: 'linkedin',
    birthday: '1988-08-15',
    anniversary: '2015-09-10',
    tags: ['#contact', '#person', '#linkedin'],
    notes: 'Met at AI Systems summit.'
  }
];

export function getContacts() {
  const data = localStorage.getItem(CONTACTS_STORAGE_KEY);
  if (!data) return DEFAULT_CONTACTS;
  try {
    const parsed = JSON.parse(data);
    return parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
  } catch (e) {
    return DEFAULT_CONTACTS;
  }
}

export function saveContacts(contacts) {
  localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
}

export function saveSingleContact(contact) {
  const contacts = getContacts();
  const existingIndex = contacts.findIndex(c => c.id === contact.id || c.name.toLowerCase() === contact.name.toLowerCase());
  
  let updated;
  if (existingIndex >= 0) {
    contacts[existingIndex] = { ...contacts[existingIndex], ...contact };
    updated = [...contacts];
  } else {
    const newEntry = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: 'manual',
      tags: ['#contact', '#person'],
      ...contact
    };
    updated = [newEntry, ...contacts];
  }
  saveContacts(updated);
  return updated;
}

export function deleteContact(id) {
  const contacts = getContacts();
  const updated = contacts.filter(c => c.id !== id);
  saveContacts(updated);
  return updated;
}

/**
 * Counts how many Zettel logs mention a given contact by name or email
 */
export function countLogsForContact(contact, allLogs = []) {
  if (!contact || !allLogs) return 0;
  const nameClean = contact.name ? contact.name.toLowerCase() : '';
  const emailClean = contact.email ? contact.email.toLowerCase() : '';
  const tagClean = `#person_${contact.name ? contact.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : ''}`;

  return allLogs.filter(l => {
    const text = `${l.title || ''} ${l.content || ''}`.toLowerCase();
    const matchesName = nameClean && text.includes(nameClean);
    const matchesEmail = emailClean && text.includes(emailClean);
    const matchesTag = l.tags && (l.tags.includes(tagClean) || l.tags.some(t => t.toLowerCase() === `@${nameClean}`));
    const matchesMeta = l.metadata?.contacts && l.metadata.contacts.some(c => c.toLowerCase().includes(nameClean));
    return matchesName || matchesEmail || matchesTag || matchesMeta;
  }).length;
}

/**
 * Converts a contact into standard Zettelkasten Markdown format (.md) with YAML frontmatter
 */
export function exportContactToMarkdown(contact) {
  const frontmatterTag = contact.name ? `#person_${contact.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : '#person';
  const allTags = Array.from(new Set(['#contact', '#person', frontmatterTag, `source_${contact.source || 'imported'}`, ...(contact.tags || [])]));

  const mdText = `---
type: "contact"
contact_id: "${contact.id}"
name: "${contact.name}"
email: "${contact.email || ''}"
company: "${contact.company || ''}"
role: "${contact.role || ''}"
birthday: "${contact.birthday || ''}"
anniversary: "${contact.anniversary || ''}"
source: "${contact.source || 'manual'}"
tags: [${allTags.map(t => `"${t}"`).join(', ')}]
imported_at_pt: "${getZettelTimestamp()}"
---

# 👤 ${contact.name}
**Email**: ${contact.email || 'N/A'}  
**Company / Org**: ${contact.company || 'N/A'}  
**Role**: ${contact.role || 'N/A'}  
**Birthday**: ${contact.birthday || 'N/A'}  
**Anniversary**: ${contact.anniversary || 'N/A'}  
**Source Channel**: \`${contact.source || 'manual'}\`  

## Notes & Collaboration Telemetry
${contact.notes || 'No detailed notes recorded yet.'}

## Linkage & Frontmatter Tags
Primary Tag: \`${frontmatterTag}\`  
All Tags: ${allTags.join(' ')}

*Converted by myBlackbox Microlog Contact Converter Engine at ${getZettelTimestamp()} PT*
`;
  return mdText;
}

/**
 * Converts a contact into a Zettel object payload ready for instant saving to the webpage Zettelkasten timeline
 */
export function convertContactToZettelData(contact) {
  const personTag = `#person_${contact.name ? contact.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'unknown'}`;
  const allTags = Array.from(new Set(['#contact', '#person', personTag, `source_${contact.source || 'imported'}`, ...(contact.tags || [])]));

  return {
    title: `👤 Contact Zettel: ${contact.name}`,
    type: 'contact',
    content: `**Name**: ${contact.name}\n**Email**: ${contact.email || 'N/A'}\n**Company / Org**: ${contact.company || 'N/A'}\n**Role**: ${contact.role || 'N/A'}\n**Birthday**: ${contact.birthday || 'N/A'}\n**Anniversary**: ${contact.anniversary || 'N/A'}\n**Source**: \`${contact.source || 'manual'}\` \n\n### Notes & Collaboration History\n${contact.notes || 'No detailed notes recorded yet.'}`,
    tags: allTags,
    metadata: {
      contactId: contact.id,
      name: contact.name,
      email: contact.email,
      company: contact.company,
      role: contact.role,
      birthday: contact.birthday,
      anniversary: contact.anniversary,
      source: contact.source
    }
  };
}

/**
 * Packages all contacts into individual .md files and downloads a ZIP archive
 */
export async function downloadAllContactsZIP(contacts) {
  if (!contacts || contacts.length === 0) {
    alert('No contacts available to export.');
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder(`blackbox_contacts_md_${getZettelTimestamp()}`);

  contacts.forEach(c => {
    const mdContent = exportContactToMarkdown(c);
    const fileName = `${c.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contact.md`;
    folder.file(fileName, mdContent);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `blackbox_contacts_all_md_${getZettelTimestamp()}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * LinkedIn Connections CSV Parser (Exports: First Name, Last Name, Email Address, Company, Position)
 */
export function parseLinkedInCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Find header line
  let headerIndex = lines.findIndex(l => l.toLowerCase().includes('first name') && l.toLowerCase().includes('last name'));
  if (headerIndex < 0) headerIndex = 0;

  const headers = lines[headerIndex].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  
  const firstNameIdx = headers.findIndex(h => h.includes('first name'));
  const lastNameIdx = headers.findIndex(h => h.includes('last name'));
  const emailIdx = headers.findIndex(h => h.includes('email'));
  const companyIdx = headers.findIndex(h => h.includes('company'));
  const positionIdx = headers.findIndex(h => h.includes('position') || h.includes('role') || h.includes('title'));

  const importedContacts = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const row = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(cell => cell.replace(/^["']|["']$/g, '').trim());
    if (row.length < 2) continue;

    const firstName = firstNameIdx >= 0 ? row[firstNameIdx] : row[0];
    const lastName = lastNameIdx >= 0 ? row[lastNameIdx] : row[1];
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    if (!fullName) continue;

    const contact = {
      id: `c_linkedin_${Date.now()}_${i}`,
      name: fullName,
      email: emailIdx >= 0 ? row[emailIdx] : '',
      company: companyIdx >= 0 ? row[companyIdx] : '',
      role: positionIdx >= 0 ? row[positionIdx] : '',
      source: 'linkedin_csv',
      tags: ['#contact', '#person', '#linkedin', `#person_${fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`],
      notes: 'Imported from LinkedIn Connections export CSV.'
    };
    importedContacts.push(contact);
  }

  return importedContacts;
}

/**
 * Google Contacts VCF / VCard Parser
 */
export function parseVCardText(vcfText) {
  const cards = vcfText.split(/END:VCARD/i);
  const importedContacts = [];

  cards.forEach((card, idx) => {
    if (!card.includes('BEGIN:VCARD')) return;
    
    let name = '';
    let email = '';
    let company = '';

    const lines = card.split(/\r?\n/);
    lines.forEach(l => {
      if (l.toUpperCase().startsWith('FN:')) name = l.substring(3).trim();
      else if (l.toUpperCase().startsWith('EMAIL')) {
        const parts = l.split(':');
        if (parts.length > 1) email = parts[1].trim();
      } else if (l.toUpperCase().startsWith('ORG:')) {
        company = l.substring(4).replace(/;/g, ' ').trim();
      }
    });

    if (name) {
      importedContacts.push({
        id: `c_vcard_${Date.now()}_${idx}`,
        name,
        email,
        company,
        role: 'Contact',
        source: 'vcard_vcf',
        tags: ['#contact', '#person', '#google_contacts', `#person_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`],
        notes: 'Imported from VCF vCard contact file.'
      });
    }
  });

  return importedContacts;
}

/**
 * Google Contacts REST API Integration (using OAuth Access Token)
 */
export async function fetchGooglePeopleContacts() {
  const token = getStoredAccessToken();
  if (!token) {
    logSyncDiagnostic('FETCH_GOOGLE_CONTACTS_FAIL', 'OAuth Access Token not available to query Google People API.', 'WARNING');
    return { success: false, message: 'Google OAuth token missing.' };
  }

  try {
    logSyncDiagnostic('FETCH_GOOGLE_CONTACTS_START', 'Querying GET https://people.googleapis.com/v1/people/me/connections', 'INFO');
    const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      const connections = data.connections || [];
      const fetched = connections.map((p, idx) => {
        const name = (p.names && p.names[0]) ? p.names[0].displayName : 'Google Contact';
        const email = (p.emailAddresses && p.emailAddresses[0]) ? p.emailAddresses[0].value : '';
        const company = (p.organizations && p.organizations[0]) ? p.organizations[0].name : '';
        const role = (p.organizations && p.organizations[0]) ? p.organizations[0].title : 'Google Contact';

        return {
          id: `c_gpeople_${p.resourceName ? p.resourceName.replace(/\//g, '_') : idx}_${Date.now()}`,
          name,
          email,
          company,
          role,
          source: 'google_people_api',
          tags: ['#contact', '#person', '#google_contacts', `#person_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`],
          notes: 'Synced live from Google Contacts API.'
        };
      });

      logSyncDiagnostic('FETCH_GOOGLE_CONTACTS_SUCCESS', `Fetched ${fetched.length} contacts from Google People API!`, 'SUCCESS');
      return { success: true, contacts: fetched };
    } else {
      const errText = await res.text();
      logSyncDiagnostic('FETCH_GOOGLE_CONTACTS_ERROR', `HTTP ${res.status}: ${errText}`, 'ERROR');
      return { success: false, message: `HTTP ${res.status}: ${errText}` };
    }
  } catch (e) {
    logSyncDiagnostic('FETCH_GOOGLE_CONTACTS_EXCEPTION', `Exception: ${e.message}`, 'ERROR');
    return { success: false, message: e.message };
  }
}
