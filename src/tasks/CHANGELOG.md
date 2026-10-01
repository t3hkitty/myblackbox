# Changelog

## [1.0.0] - 2026-10-01

### 🐾 Added
- Core Domain Types (`GoogleTasksV1Item`, `MBBTask`, `MBBTaskMetadata`, `TaskFilterOptions`).
- High-Density Priority & Theme mapping helper.
- Zero-dependency regex YAML frontmatter parser/serializer (`parseNotesField`, `serializeNotesField`).
- Temporal datetime merger (`getCombinedDueDateTime`) & RFC 5545 recurrence engine (`calculateNextRecurrence`).
- Cross-window reactive LocalStorage task store (`MBBTaskStore`).
- Bidirectional Google Tasks API adapter (`TaskSyncEngine`).
- React Task Board Modal (`MBBTaskBoardModal`) with inline `#tag` parser, priority select, and filters.
- Public module barrel (`index.ts`).
