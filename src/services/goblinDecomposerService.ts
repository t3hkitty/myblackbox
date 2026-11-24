/**
 * 🧘 Goblin Task Decomposition & Anti-Paralysis Engine
 * Helps AuDHD minds decompose overwhelming monolithic tasks into
 * micro-steps (< 5 minutes each) with friction reduction heuristics.
 */

export interface MicroStep {
  id: string;
  title: string;
  emoji: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface DecompositionResult {
  category: 'routine' | 'study' | 'declutter' | 'writing' | 'admin' | 'creative';
  firstTinyStep: string;
  microSteps: MicroStep[];
  antiParalysisTip: string;
}

export class GoblinDecomposerService {
  /**
   * Heuristic rule-based decomposition templates for classic AuDHD friction tasks
   */
  public static decomposeTask(taskTitle: string): DecompositionResult {
    const lower = taskTitle.toLowerCase();

    // 1. Chores / Laundry / Cleaning / Decluttering
    if (lower.includes('laundry') || lower.includes('clean') || lower.includes('wash') || lower.includes('dishes') || lower.includes('tidy') || lower.includes('room')) {
      return {
        category: 'declutter',
        firstTinyStep: 'Put on headphones with your favorite song & touch just ONE item.',
        microSteps: [
          { id: '1', title: 'Equip headphones & blast a high-energy anthem', emoji: '🎧', estimatedMinutes: 1, completed: false },
          { id: '2', title: 'Pick up just 3 pieces of trash / loose cups', emoji: '🗑️', estimatedMinutes: 2, completed: false },
          { id: '3', title: 'Gather items into one single loose pile (no sorting yet)', emoji: '📦', estimatedMinutes: 3, completed: false },
          { id: '4', title: 'Sort or fold just 5 easiest items', emoji: '👕', estimatedMinutes: 4, completed: false },
          { id: '5', title: 'Take a celebratory victory sip of water', emoji: '🥤', estimatedMinutes: 1, completed: false }
        ],
        antiParalysisTip: 'You do NOT have to finish everything. Sorting just 5 items breaks inertia and counts as 100% Non-Zero!'
      };
    }

    // 2. Paperwork / Admin / Emails / Calls
    if (lower.includes('email') || lower.includes('call') || lower.includes('form') || lower.includes('pay') || lower.includes('doctor') || lower.includes('bill') || lower.includes('appointment')) {
      return {
        category: 'admin',
        firstTinyStep: 'Open the tab or app and just look at the screen—no typing required.',
        microSteps: [
          { id: '1', title: 'Open the website / app / document in a fresh tab', emoji: '🌐', estimatedMinutes: 1, completed: false },
          { id: '2', title: 'Locate account number, reference, or recipient email', emoji: '🔍', estimatedMinutes: 2, completed: false },
          { id: '3', title: 'Write just the greeting and subject line (or dial the digits)', emoji: '✍️', estimatedMinutes: 2, completed: false },
          { id: '4', title: 'Draft the 1 core question or fill 2 mandatory boxes', emoji: '📋', estimatedMinutes: 4, completed: false },
          { id: '5', title: 'Hit send/submit, then immediately close the tab', emoji: '🚀', estimatedMinutes: 1, completed: false }
        ],
        antiParalysisTip: 'Rejection Sensitive Dysphoria (RSD) makes admin feel scary. Remember: a messy reply sent is 100x better than a perfect reply delayed.'
      };
    }

    // 3. Coding / Tech / Build
    if (lower.includes('code') || lower.includes('bug') || lower.includes('refactor') || lower.includes('feature') || lower.includes('test') || lower.includes('deploy') || lower.includes('git')) {
      return {
        category: 'creative',
        firstTinyStep: 'Open the file where the code lives. Do not touch the keyboard yet.',
        microSteps: [
          { id: '1', title: 'Open the exact target file & read the first 10 lines', emoji: '📂', estimatedMinutes: 2, completed: false },
          { id: '2', title: 'Write a 1-line comment explaining what you want to happen', emoji: '💬', estimatedMinutes: 2, completed: false },
          { id: '3', title: 'Create the empty function signature or stub', emoji: '🧩', estimatedMinutes: 3, completed: false },
          { id: '4', title: 'Run test / check if terminal compiles without crashing', emoji: '🧪', estimatedMinutes: 4, completed: false },
          { id: '5', title: 'Commit milestone with a clean message', emoji: '💾', estimatedMinutes: 1, completed: false }
        ],
        antiParalysisTip: 'Break the problem down until the next step feels insultingly easy.'
      };
    }

    // 4. Study / Reading / Syllabus
    if (lower.includes('read') || lower.includes('study') || lower.includes('chapter') || lower.includes('essay') || lower.includes('homework') || lower.includes('syllabus')) {
      return {
        category: 'study',
        firstTinyStep: 'Open the book or PDF to the page and read just the section headers.',
        microSteps: [
          { id: '1', title: 'Open the PDF or chapter page & locate header', emoji: '📖', estimatedMinutes: 1, completed: false },
          { id: '2', title: 'Read only the bold headings & glance at diagrams', emoji: '👀', estimatedMinutes: 3, completed: false },
          { id: '3', title: 'Read the first 2 paragraphs with a cup of tea/water', emoji: '☕', estimatedMinutes: 4, completed: false },
          { id: '4', title: 'Jot down 1 bullet-point question or takeaway', emoji: '📝', estimatedMinutes: 2, completed: false }
        ],
        antiParalysisTip: 'Skimming is valid learning! Getting the general contour primes your brain for effortless deep reading.'
      };
    }

    // 5. Generic Default Fallback
    return {
      category: 'routine',
      firstTinyStep: `Set a 5-minute timer. All you need to do is start the very first micro-action.`,
      microSteps: [
        { id: '1', title: `Prep workspace & clear physical surface`, emoji: '✨', estimatedMinutes: 1, completed: false },
        { id: '2', title: `Write down the very first physical action needed`, emoji: '📝', estimatedMinutes: 2, completed: false },
        { id: '3', title: `Execute just the first 3 minutes of "${taskTitle}"`, emoji: '⚡', estimatedMinutes: 3, completed: false },
        { id: '4', title: `Pause: decide guilt-free if you want to keep going or stop`, emoji: '⏸️', estimatedMinutes: 1, completed: false }
      ],
      antiParalysisTip: 'Starting is 80% of the friction. Once the initial inertia breaks, momentum takes over!'
    };
  }
}
