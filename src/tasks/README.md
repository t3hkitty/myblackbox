# 🐾 MBB Task Board Module (Kawaiian Architecture) 🌸

```
  /\_/\  
 ( o.o ) 
  > ^ <  
```

High-Density Kawaii Brutalist Task Board module for `mbb_suite`. Designed with zero third-party UI dependencies, immutable local reactive storage, and clean Google Tasks REST API serialization.

## 📖 Module Specification

### 1. Frontmatter Engine
The module extracts and serializes custom task metadata (priority, tags, recurrence, estimated duration) to/from Google Tasks `notes` field using a zero-dependency YAML frontmatter block format:

```yaml
---
priority: 3
tags: ["kawaii", "dev"]
recurrence: "FREQ=DAILY;INTERVAL=1"
recurrenceBase: "due_date"
---
Task description body text goes here...
```

### 2. Recurrence & Temporal Logic
- Supports RFC 5545 RRULE patterns (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`).
- Handles `recurrenceBase` calculation (`due_date` vs `completion_date`).
- Merges date-only ISO strings (`YYYY-MM-DD`) with optional `dueTime` (`HH:mm`).

### 3. Keyboard Shortcuts & Modals
- `Esc`: Dismiss modal.
- Click-outside backdrop dismissal.
- Inline `#tag` parsing during quick task entry.

## ⚖️ FOSS Attribution
- **Tasks.org** (GPLv3) — Conceptual structure for Google Tasks metadata augmentation.
- **RFC 5545** — Recurrence rule specification guidelines.
