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

## 🔗 Deep Link Routing & Action Interceptor

     /\_/\   --- "Let's click without reload, purr!"
    ( o.o )
    >  ^  <

**myBlackbox** includes the custom **Anymd Plugin Core** link interceptor to route `mbb://` and `web+mbb://` URI protocols internally without page reloads.

- 🗃️ **Vault Switches**: Intercepts `mbb://vault/<vaultName>` to switch active workspace modes seamlessly (`all`, `school`, `work`, `accounts`, `personal`).
- ⚡ **1-Click Telemetry Actions**:
  - `mbb://sip?amount=2&level=water` - Quick log hydration sips.
  - `mbb://pee` - Quick log urination events.
  - `mbb://poo` - Quick log bowel movement events.

## 🎮 Terminal Cozy Engines (State-Machines) 🐱

   /\_/\  
  ( >.< ) ~ "We have backend state-machines too! Rawr!"
   >   < 

Located in the [engines/](file:///C:/Users/lorik/.gemini/antigravity/scratch/mbb/engines) folder, these terminal tools maintain decoupled state tracking:

- 🐻 **Hungry Bear & Honey Jar Engine (`mbb-bear-engine.py`)**: A cozy terminal-based state machine for metabolic tracking and logging. It ticks down honey jar level over time, requiring you to `feed` the bear to build daily streaks.
  - View status: `python engines/mbb-bear-engine.py status`
  - Replenish jar: `python engines/mbb-bear-engine.py feed`
  - Log burn: `python engines/mbb-bear-engine.py burn`
- 💨 **Breath Garden (`mbb-breath-garden.py`)**: Log breathing breaks and watch your virtual garden grow with ASCII flowers.
- 💧 **Moisture Anticipator (`mbb-moisture-anticipator.py`)**: Predicts next hydration requirements using historical logging trends.
- 🔒 **Privacy Alert System (`mbb-privacy-alert-system.py`)**: Scans logs to prevent PII exposure.

---

## 🌐 Deployment Guide 🐾

      /\_/\
    =( °.°) = ~ "Let's put this online, meow!"
    __(")_(")_______________________________

### 1. 🐙 Deploying to GitHub Pages (Recommended)

Since **myBlackbox** is a purely static frontend React/Vite app, it is perfect for GitHub Pages.

#### Option A: Automatic via GitHub Actions
Create a file at `.github/workflows/deploy.yml` with:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: 'pages'
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
Ensure GitHub Pages source is set to **GitHub Actions** in your Repository Settings ➔ Pages.

#### Option B: Manual build and push
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` directory to your hosting provider or publish the `dist` folder directly onto a `gh-pages` branch.

### 2. 🚀 Deploying to FTP (e.g., `meow.artkitty.net/lcmd`)

The included `deploy_meow.py` script uploads the built workspace via FTP. To keep credentials safe and prevent PII leaks:

1. Build the project: `npm run build`
2. Run the deployment script with credentials passed as environment variables:
   ```bash
   $env:FTP_USER="kitty@artkitty.net"; $env:FTP_PASS="your_password"; python deploy_meow.py
   ```
   *(Or on Linux/macOS: `FTP_USER="kitty@artkitty.net" FTP_PASS="your_password" python deploy_meow.py`)*

---

## 📄 License & Terms of Service Compliance

This project is released under **The Unlicense** (Public Domain Dedication). You are 100% free to modify, reuse, fork, sell, and distribute this codebase for any commercial or non-commercial purpose.

### Google Terms of Service & Attribution
All AI generation and code synthesis adhere to the [Google Terms of Service](https://policies.google.com/terms) and [Google Generative AI Additional Terms of Service](https://policies.google.com/terms/generative-ai).
