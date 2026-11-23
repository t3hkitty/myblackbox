#!/usr/bin/env python3
"""
🐾 AnyMD Local Daemon (:3050) & Kittlibr Bridge
Central token reader and local REST/intent bridge between AnyMD, MBB, Kittlibr,
and headless rclone (rcd / webdav / Z: / K: / G: / meow-vault).

Provides:
- GET /oauth/status : Reports Google OAuth token bundle status and scope presets.
- POST /oauth/refresh : Forces token refresh via grant_type=refresh_token.
- POST /kittlibr/capture : Captures note directly into meow-vault/inbox.
- POST /telemetry/somatic : Ingests fitness, timeline, and contacts telemetry directly.
- Windows safe: UTF-8 encoding reconfigured to avoid cp1252 console crashes.
"""

import os
import sys
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from zoneinfo import ZoneInfo
from datetime import datetime

# Prevent cp1252 crashes on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PACIFIC_TZ = ZoneInfo("America/Los_Angeles")
TOKEN_DIR = Path(os.environ.get("ANYMD_CONFIG_DIR", Path.home() / ".config" / "anymd"))
TOKEN_BUNDLE_PATH = TOKEN_DIR / "google_oauth_token.json"


def get_pacific_zettel_id():
    return datetime.now(PACIFIC_TZ).strftime("%Y%m%d-%H%M")


def get_vault_path():
    if "MEOW_VAULT" in os.environ:
        p = Path(os.environ["MEOW_VAULT"])
    elif sys.platform == "win32":
        s_inbox = Path(r"S:\inbox")
        if s_inbox.parent.exists():
            p = s_inbox.parent
        else:
            p = Path(r"C:\meow-vault")
    else:
        p = Path.home() / "meow-vault"
    p.mkdir(parents=True, exist_ok=True)
    return p


class AnyMDDaemonHandler(BaseHTTPRequestHandler):
    def send_json(self, status_code: int, data: dict):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        if self.path == "/oauth/status" or self.path == "/":
            if not TOKEN_BUNDLE_PATH.exists():
                self.send_json(200, {
                    "daemon": "anymd_daemon",
                    "port": 3050,
                    "oauth_status": "DISCONNECTED",
                    "token_bundle_path": str(TOKEN_BUNDLE_PATH),
                    "active_presets": []
                })
                return

            try:
                with open(TOKEN_BUNDLE_PATH, "r", encoding="utf-8") as f:
                    bundle = json.load(f)
                
                now = int(time.time())
                expires_at = bundle.get("expires_at", 0)
                is_expired = now >= expires_at

                self.send_json(200, {
                    "daemon": "anymd_daemon",
                    "port": 3050,
                    "oauth_status": "EXPIRED" if is_expired else "CONNECTED",
                    "project_id": bundle.get("project_id", "anymd-515619"),
                    "active_presets": bundle.get("active_presets", []),
                    "expires_in": max(0, expires_at - now),
                    "expiry": bundle.get("expiry"),
                    "token_bundle_path": str(TOKEN_BUNDLE_PATH)
                })
            except Exception as e:
                self.send_json(500, {"error": str(e)})
        else:
            self.send_json(404, {"error": "Not Found"})

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if self.path == "/kittlibr/capture":
            zettel_id = get_pacific_zettel_id()
            vault = get_vault_path()
            inbox = vault / "inbox"
            inbox.mkdir(parents=True, exist_ok=True)
            note_file = inbox / f"{zettel_id}-kittlibr-capture.md"

            title = payload.get("title", f"Kittlibr Capture {zettel_id}")
            content = payload.get("body") or payload.get("text") or payload.get("quote", "")

            fm_lines = [
                "---",
                f'title: "{title}"',
                f'created_pt: "{zettel_id}"',
                'type: "kittlibr-capture"',
                'tags: ["kittlibr", "reading", "inbox"]',
                f'source: "{payload.get("source", "kittlibr-client")}"',
                "---",
                "",
                f"# 📚 {title}",
                "",
                content
            ]
            with open(note_file, "w", encoding="utf-8") as f:
                f.write("\n".join(fm_lines) + "\n")

            self.send_json(200, {
                "success": True,
                "file": str(note_file),
                "zettel_id": zettel_id
            })

        elif self.path == "/telemetry/somatic":
            zettel_id = get_pacific_zettel_id()
            vault = get_vault_path()
            telemetry_dir = vault / "telemetry"
            telemetry_dir.mkdir(parents=True, exist_ok=True)
            category = payload.get("category", "fitness").lower()
            note_file = telemetry_dir / f"{zettel_id}-somatic-{category}.md"

            fm_lines = [
                "---",
                f'title: "Somatic Telemetry: {category.capitalize()} ({zettel_id})"',
                f'created_pt: "{zettel_id}"',
                f'type: "telemeowtrics-{category}"',
                f'category: "{category}"',
                'tags: ["somatic", "telemeowtrics", "' + category + '"]',
                f'source: "{payload.get("source", "anymd-daemon")}"',
                "---",
                "",
                f"# 🐾 Somatic Telemetry: {category.capitalize()}",
                "",
                f"- **Timestamp (PT)**: `{zettel_id}`",
                f"- **Category**: `{category}`",
                "",
                "```json",
                json.dumps(payload, indent=2),
                "```"
            ]
            with open(note_file, "w", encoding="utf-8") as f:
                f.write("\n".join(fm_lines) + "\n")

            self.send_json(200, {
                "success": True,
                "file": str(note_file),
                "zettel_id": zettel_id
            })
        else:
            self.send_json(404, {"error": "Unknown POST route"})


def start_daemon(port: int = 3050):
    server = HTTPServer(("127.0.0.1", port), AnyMDDaemonHandler)
    print(f"🐾 [AnyMD Daemon] Listening on http://127.0.0.1:{port} (meow-vault: {get_vault_path()})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🐾 [AnyMD Daemon] Stopped.")


if __name__ == "__main__":
    p = 3050
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        p = int(sys.argv[1])
    start_daemon(p)
