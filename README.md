# ✈️ myBlackbox Microlog Protocol 

✨ *kawaii aesthetic edition!* ✨

   /\_/\
  ( o.o )
   > ^ <
    meow!

A lightweight, zero-friction telemetry logging protocol, mood pattern corollary engine, and Zettelkasten daily driver dashboard. 

Inspired by the flight data recorder (blackbox) in aviation, **myBlackbox** continuously logs operational micro-events without breaking cognitive flow — providing instant troubleshooting and correlation analysis whenever unexpected slumps, headaches, or energy crashes occur.

---

## 🤖 Built with Google Antigravity & Google Gemini

> **Transparency Notice**: This entire codebase was designed, architected, and synthesized using **Google Antigravity (AGY)** and **Google Gemini** agentic AI pair programming tools.

### Active Antigravity Skills & Plugins Used
- 🛠️ `modern-web-guidance`: Glassmorphism design systems, micro-animations, and modern HTML5/CSS standards.
- 🔌 `google-antigravity-sdk`: Autonomous multi-agent coordination & tool execution.
- 📊 `data-agent-kit`: Flat-file Zettelkasten serialization, telemetry schema validation, and pattern analysis.
- 📖 `antigravity-guide`: Antigravity CLI and workflow orchestration standards.

---

## ✨ Key Features

- ⏱️ **Zettelkasten Pacific Time Serialization**: Every log automatically generates a Notion-compatible `YYYYMMDD-HHMM` Pacific Time serialization tag (e.g., `20260803-1935`).
- 🔮 **Airplane Blackbox Corollary Engine**: Filter telemetry by mood level (`ALL`, `😍 Super Happy`, `😊 Good`, `😐 Meh`, `😔 Low`, `😭 Distress`, `😡 Frustrated`) to discover statistical factor correlations.
- 💧 **Hydration Telemetry & Real-World Descriptors**: Maps sips to relatable real-world comparison objects (*Toddler Sippy Cup*, *Soda Can*, *Gym Shaker*, *Stanley Tumbler*, *2-Liter Jug*, *Gallon Milk Jug*, *Pallet of Water Bottles*).
- 📚 **Ebook Sessions, Private Micro-Tweets & AI Rating**: Capture book quotes in a private Twitter/X-style feed, track reading session timers, and receive AI reader rating predictions (1.0 - 5.0 stars).
- 📷 **Photo Scene Quantifier & Recent Google Photos Intake**: Quantifies atmosphere vibe, extracts OCR text snippets, and attaches scene cards (`#photo_scene`) to Zettel journals.
- 📋 **Google Tasks Integration & Configurable Lists**:
  - **Live Duration List**: Log start/complete duration pairs (default: `"blackbox"`).
  - **Idea Storage Vault**: Timeless idea backlog & curiosity storage without strict due dates (default: `"roundtoit"`).
  - 🎲 **Boredom Suggestion Generator**: 1-tap random idea picker when looking for creative inspiration.
- ⚡ **Real-Time IFTTT Maker Webhooks**: Dispatches HTTP payloads to IFTTT to flash smart lights, send iOS push notifications, or append to Google Sheets.
- 🔐 **Google Drive `/Drive/Apps/myBlackbox/` Backup**: OAuth 2.0 sync backs up all Zettel entries as flat-file `.md` Markdown documents directly into your Google Drive AppData directory.
- 🔥 **"No Zero Days" Philosophy & Self-Care**: Built-in FAQ guide based on the classic Reddit `r/getdisciplined` manifesto by `/u/ryans01` (Rule 1: No Zero Days, Rule 2: Gratitude to Past/Future Self, Rule 3: Instant Self-Forgiveness, Rule 4: Fuel Body & Mind).
- 🌐 **Tool Interoperability Matrix**: Export to Obsidian, Joplin, Notion, Logseq, Roam Research, Daylio, Google Keep, and Readwise.

---

## 🚀 Quick Start — Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- `npm` (included with Node.js)

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/myblackbox-microlog.git
   cd myblackbox-microlog
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173/` in Google Chrome or any modern web browser.

---

## 🛠️ DIY Google Cloud & OAuth Setup (Optional)

You can run **myBlackbox** 100% locally out of the box using persistent browser storage (`localStorage`) and local `.md` / `.zip` file downloads. 

To link your personal Google Account for direct `/Drive/Apps/myBlackbox/` sync and Google Tasks integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a free project.
2. In **API & Services ➔ Library**, enable:
   - [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
   - [Google Tasks API](https://console.cloud.google.com/apis/library/tasks.googleapis.com)
3. In **Credentials ➔ Create Credentials ➔ OAuth Client ID**:
   - Application Type: *Web Application*
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
4. Copy your generated Client ID (`123456-abc.apps.googleusercontent.com`).
5. Open **Settings (⚙️) ➔ 🔐 Google OAuth Keys** in the app UI and paste your Client ID!

---

## 📄 License & Terms of Service Compliance

This project is released under **The Unlicense** (Public Domain Dedication). You are 100% free to modify, reuse, fork, sell, and distribute this codebase for any commercial or non-commercial purpose.

### Google Terms of Service & Attribution
All AI generation and code synthesis adhere to the [Google Terms of Service](https://policies.google.com/terms) and [Google Generative AI Additional Terms of Service](https://policies.google.com/terms/generative-ai).
