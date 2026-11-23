# 🐾 MBB AnyMD Extension Bundle (`extensions/mbb/`)

```text
  /\_/\  
 ( o.o )  MBB EXTENSION BUNDLE SPECIFICATION
  > ^ <   Pluggable AnyMD Task Telemetry & Milestone Engine
```

This directory houses the formal, modular **My Black Box (MBB)** extension bundle for **AnyMD** (`t3hkitty/anymd`). It integrates directly into AnyMD via `AnyMDExtensionHost` rather than modifying core Markdown parsing or editor logic.

---

## 1. Extension Manifest (`extensionManifest.json`)

The extension manifest declares bundle metadata, permission scopes, supported URI schemes, and storage conventions:

```json
{
  "id": "org.anymd.extension.mbb",
  "name": "My Black Box (MBB) Bundle",
  "version": "1.0.0",
  "description": "Tasks.org-parity task engine, Roman numeral completion tickers, Stage Director milestones, emoji folder trees, Telemeowtrics capture, and Google Tasks two-way sync for AnyMD.",
  "author": "t3hkitty & Kawaiian AI",
  "enabledByDefault": true,
  "category": "task-telemetry",
  "entry": "./index.ts",
  "permissions": [
    "vault:read",
    "vault:write",
    "vault:watch",
    "router:protocols",
    "ui:mount:quickbar",
    "ui:mount:modals",
    "ui:mount:settings"
  ],
  "supportedProtocols": [
    "mbb://ticker/*",
    "mbb://state/*",
    "mbb://vault/*",
    "kittlibr://capture"
  ],
  "supportedBroadcasts": [
    "org.anymd.broadcast.UNIFIED_FIREHOSE",
    "org.anymd.broadcast.TASKER_WEBHOOK"
  ],
  "storage": {
    "defaultVault": "meow-vault",
    "sidecarDir": ".anymd",
    "inboxDir": "inbox",
    "tasksDir": "tasks",
    "tickersDir": "tickers"
  }
}
```

---

## 2. Host Interface Contracts (`host/AnyMDExtensionHostTypes.ts`)

AnyMD provides the following clean contracts to the MBB bundle via `AnyMDExtensionContext`:

### A. Vault Storage API (`AnyMDVaultStorageAPI`)
- Flat-file local-first abstraction operating over `meow-vault/`.
- Zero database lock-in: reads and writes `.md` files with YAML frontmatter headers.
- Stores custom sidecars in `.anymd/<path>.json`.
- Implements file watchers (`watch(folder, callback)`) to trigger reactive UI updates when external CLI tools (e.g. Python scripts in Termux) modify vault files.
- Generates Pacific Time Zettelkasten timestamps: `YYYYMMDD-HHMM` (America/Los_Angeles).

### B. UI Mount Slots (`registerUIMount`)
MBB registers three primary UI mount points:
1. `quickbar`: 1-click floating right-side bar (`MBBQuickBarWidget`) displaying active Roman numeral tickers, quick `+1` / `✓ Done` buttons, and a 7-day mini milestone rollup.
2. `taskboard-modal`: Full AuDHD task board (`MBBTaskBoardModal`) with collapsible emoji folder trees (`🤣//jokes/true`), tag filtering, search, and anti-overwhelm tabs.
3. `settings-panel`: Stage Director configuration panel (`StageDirectorSettingsPanel`) mounted seamlessly inside AnyMD's main Settings modal.

### C. Intent & Event Router (`AnyMDEventRouterAPI`)
- Directs deep links and system broadcasts without reloading the webview:
  - `mbb://ticker/<slug>`: Increments or creates the micro-ticker matching `<slug>`.
  - `mbb://state/<state_name>`: Emits superseding state (e.g., `sleep`, `meal`) and triggers cascade auto-stop on dependent active tickers.
  - `kittlibr://capture`: Captures reading highlights and quotes into Zettelkasten-ID notes.
  - `org.anymd.broadcast.UNIFIED_FIREHOSE`: Ingests raw Android notification/clipboard captures.

### D. Toggleable Lifecycle
- The bundle provides `activate(context)` and `deactivate()`.
- Toggling MBB off in AnyMD Settings cleanly removes all UI slots and event listeners, leaving AnyMD as an unencumbered plain-text Markdown reader/editor.

---

## 3. Data Schemas & YAML Frontmatter

### Task Note YAML Frontmatter
```yaml
---
priority: 2
tags: ["somatic", "focus"]
recurrence: "FREQ=DAILY;INTERVAL=1"
recurrenceBase: "due_date"
defer_until: "2026-11-23"
status: "needsAction"
type: "task"
emoji: "🤣"
folderPath: ["jokes"]
cleanTitle: "true"
---
Markdown body content...
```

### Micro-Ticker Note YAML Frontmatter (`type: ticker`)
```yaml
---
title: "💊//health/Took a sip"
type: "ticker"
count: 4
roman: "IV"
started_at: "2026-11-22T16:00:00-08:00"
stage_profile_id: "hydration_ticker"
auto_stop_on: ["sleep"]
status: "needsAction"
---
- Tick I (#1) at 20261122-1600
- Tick II (#2) at 20261122-1605
- Tick III (#3) at 20261122-1615
- Tick IV (#4) at 20261122-1620
```

### Reprocessed Done Note (After Completion or Auto-Stop)
```yaml
---
title: "💊//health/Took a sip"
type: "ticker"
count: 4
roman: "IV"
started_at: "2026-11-22T16:00:00-08:00"
completed_at: "2026-11-22T16:25:00-08:00"
duration_minutes: 25
status: "completed"
stopped_by: "state:sleep"
max_stage: "III Sips - Awakened"
stages_reached: ["sip_starter"]
---
- Tick I (#1) at 20261122-1600
- Tick II (#2) at 20261122-1605
- Tick III (#3) at 20261122-1615
- Tick IV (#4) at 20261122-1620

### 🏁 MBB Completion Reprocessor Log
- **Completed**: 2026-11-22T16:25:00-08:00
- **Total Ticks**: 4 (IV)
- **Duration**: 25m
- **Stopped By**: `state:sleep`

#### 🎯 Milestone Messages
- III ticks reached for 💊//health/Took a sip: Habit loop active!
```

---

## 4. Module Map

- `extensionManifest.json`: Formal AnyMD extension metadata.
- `index.ts`: Bundle root activating slots, storage, and routers.
- `types.ts`: TypeScript domain definitions for tasks, tickers, and Stage Director profiles.
- `roman.ts`: Roman numeral algorithms (`I`, `II`, `III`, `IV`...) and duration formatting.
- `emojiFolders.ts`: Path parser for `<emoji>//<folder>/<subfolders>/<title>` and tree builder.
- `stageDirector.ts`: Stage Director milestone calculation, token substitution, and preset templates (Fasting, Workout, Hydration, Blank).
- `mbbFrontmatter.ts`: Zero-dependency YAML serialization & recovery engine.
- `mbbEngine.ts`: Reactive store implementing Tasks.org logic, Skip/Half states, auto-stop cascades, and 7-day Weekly Stage Rollup.
- `mbbSyncAdapter.ts`: Two-way transformer for Google Tasks REST API.
- `telemeowtrics.ts`: Intent ingestion router and offline-first Zettelkasten-ID note logger.
- `host/AnyMDExtensionHost.ts`: Concrete host implementation with localStorage/SAF abstraction.
- `host/AnyMDExtensionHostTypes.ts`: Strict TypeScript contracts for extension hosts.
- `ui/MBBQuickBarWidget.tsx`: 1-click floating quickbar widget.
- `ui/MBBTaskBoardModal.tsx`: Complete task board modal with folder hierarchy and anti-overwhelm states.
- `ui/StageDirectorSettingsPanel.tsx`: Interactive Stage Director profile editor.
