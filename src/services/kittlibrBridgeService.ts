/**
 * 🐾 MBB & Kittlibr Sidecar / Recent Opens Integration Service
 * 
 * Pairs MBB Currently Reading with Kittlibr's sidecar metadata (.anymd/sidecars)
 * for active book opens, reading progress, and bidirectional Litany Capture:
 * - Emits Litany Pulses into Kittlibr as margin annotations & reading thoughts
 * - Ingests Kittlibr recent book opens into MBB Currently Reading Shelf
 * - Synchronizes reading quotes and highlight captures into Zettelkasten-ID notes
 */

export interface KittlibrBookSidecar {
  bookId: string;
  title: string;
  author?: string;
  format?: 'EPUB' | 'PDF' | 'MOBI' | 'MD' | string;
  progressPercent?: number;
  currentChapter?: string;
  currentPage?: number;
  totalPages?: number;
  lastOpenedPT?: string;
  highlightsCount?: number;
  litanyAnnotationsCount?: number;
  coverUrl?: string;
  tags?: string[];
}

export interface LitanyCapturePayload {
  bookTitle?: string;
  bookId?: string;
  chapter?: string;
  page?: number | string;
  quote?: string;
  litanyText: string;
  intensity?: number;
  tags?: string[];
  source?: string;
}

const KITTLIBR_RECENT_OPENS_KEY = 'kittlibr_recent_opens_sidecars_v1';
const KITTLIBR_LITANY_STREAM_KEY = 'kittlibr_litany_capture_stream_v1';

export class KittlibrBridgeService {
  /**
   * Retrieves recent book opens from Kittlibr sidecar storage
   */
  public static getRecentBookOpens(): KittlibrBookSidecar[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(KITTLIBR_RECENT_OPENS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse Kittlibr recent opens:', e);
    }

    // Default seeded Kittlibr sidecars for seamless first-load pairing
    return [
      {
        bookId: 'kittlibr_crafting_chess',
        title: 'The Crafting of Chess',
        author: 'Mark Sehestedt',
        format: 'EPUB',
        progressPercent: 68,
        currentChapter: 'Chapter 14 (p. 210)',
        currentPage: 210,
        totalPages: 310,
        lastOpenedPT: '20261123-1045',
        highlightsCount: 12,
        litanyAnnotationsCount: 4,
        tags: ['litrpg', 'fantasy', 'focus']
      },
      {
        bookId: 'kittlibr_fuck_it_diet',
        title: 'The F*ck It Diet',
        author: 'Caroline Dooner',
        format: 'EPUB',
        progressPercent: 42,
        currentChapter: 'Chapter 5: Body Respect',
        currentPage: 142,
        totalPages: 338,
        lastOpenedPT: '20261123-0915',
        highlightsCount: 7,
        litanyAnnotationsCount: 2,
        tags: ['somatic', 'wellness', 'intuitive_eating']
      },
      {
        bookId: 'kittlibr_design_things',
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        format: 'EPUB',
        progressPercent: 28,
        currentChapter: 'The Psychopathology of Everyday Things',
        currentPage: 88,
        totalPages: 312,
        lastOpenedPT: '20261122-1630',
        highlightsCount: 15,
        litanyAnnotationsCount: 6,
        tags: ['design', 'ux', 'affordances']
      }
    ];
  }

  /**
   * Saves or updates a Kittlibr book sidecar (e.g. when opened or progress updated)
   */
  public static recordBookOpen(sidecar: KittlibrBookSidecar): void {
    if (typeof localStorage === 'undefined') return;
    const existing = this.getRecentBookOpens();
    const filtered = existing.filter((b) => b.bookId !== sidecar.bookId && b.title.toLowerCase() !== sidecar.title.toLowerCase());
    const updated = [sidecar, ...filtered].slice(0, 20); // Keep top 20 recent opens
    try {
      localStorage.setItem(KITTLIBR_RECENT_OPENS_KEY, JSON.stringify(updated));
      // Notify listeners
      window.dispatchEvent(new CustomEvent('kittlibr-recent-opens-updated', { detail: updated }));
    } catch (e) {
      console.warn('Failed to save Kittlibr sidecar:', e);
    }
  }

  /**
   * Dispatches an MBB Litany Pulse to Kittlibr as an in-book margin thought / quote capture
   */
  public static sendLitanyToKittlibr(payload: LitanyCapturePayload): { success: boolean; zettelId: string } {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const zettelId = `${dateStr}-${timeStr}`;

    const litanyEntry = {
      id: `kittlibr_litany_${Date.now()}`,
      zettelId,
      bookTitle: payload.bookTitle || 'General Litany',
      bookId: payload.bookId || 'active_book',
      chapter: payload.chapter || 'Active Reading Stream',
      page: payload.page || '',
      quote: payload.quote || '',
      litanyText: payload.litanyText,
      intensity: payload.intensity || 3,
      tags: ['#litany', '#kittlibr_capture', '#reading_pulse', ...(payload.tags || [])],
      createdPT: zettelId
    };

    // Store in Kittlibr Litany stream
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(KITTLIBR_LITANY_STREAM_KEY);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(litanyEntry);
        localStorage.setItem(KITTLIBR_LITANY_STREAM_KEY, JSON.stringify(list.slice(0, 50)));
      } catch (e) {
        console.warn('Failed to append to Kittlibr Litany stream:', e);
      }
    }

    // Broadcast protocol event
    window.dispatchEvent(
      new CustomEvent('kittlibr-litany-emitted', {
        detail: litanyEntry
      })
    );

    // Also trigger kittlibr:// protocol capture via CustomEvent for telemeowtrics
    window.dispatchEvent(
      new CustomEvent('kittlibr-capture', {
        detail: {
          protocol: 'kittlibr',
          action: 'capture',
          title: `Kittlibr Litany: ${litanyEntry.bookTitle}`,
          quote: litanyEntry.quote,
          body: `> "${litanyEntry.quote || ''}"\n\n**Litany Pulse Thought**: ${litanyEntry.litanyText}`,
          source: 'mbb-litany-extension',
          category: 'reading',
          meta: litanyEntry
        }
      })
    );

    return { success: true, zettelId };
  }

  /**
   * Retrieves all recent Litany captures sent to Kittlibr
   */
  public static getKittlibrLitanyStream(): any[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KITTLIBR_LITANY_STREAM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
