#!/usr/bin/env python3
"""
🐾 Google OAuth 2.0 Loopback & Token Manager (Desktop App Client: anymd-515619)
- Listens strictly on plain HTTP loopback: http://127.0.0.1:<port> (never https://localhost)
- Captures offline refresh_token and access_token bundle
- Writes to:
    1. ~/.config/anymd/google_oauth_token.json (AnyMD, Kittlibr, MBB shared bundle)
    2. rclone.conf compatible snippet: token = {"access_token":...,"refresh_token":...}
- Supports modular opt-in scope presets (Drive/Vault, Fitness, Timeline/Location, Contacts)
- Centralizes grant_type=refresh_token rotation for headless rclone (rcd / webdav / Z: / K: / G: / meow-vault)
  and anymd_daemon.py (:3050).
- Windows safe: utf-8 console reconfigured to avoid cp1252 crashes.
"""

import os
import sys
import json
import time
import socket
import urllib.parse
import urllib.request
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

# Ensure Windows cp1252 console encoding does not crash UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Default Google Cloud Desktop App Client (Project: anymd-515619)
DEFAULT_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "94205059236b41a092da67ff079c54a1")
DEFAULT_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
PROJECT_ID = "anymd-515619"

# Scope Presets
SCOPE_PRESETS: Dict[str, Dict[str, Any]] = {
    "vault": {
        "id": "vault",
        "name": "Google Drive Vault & AppData",
        "description": "Read/write access to app-created files and AppData folder for meow-vault sync",
        "tier": "base",
        "scopes": [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.appdata",
            "https://www.googleapis.com/auth/tasks"
        ]
    },
    "fitness": {
        "id": "fitness",
        "name": "Fitness & Activity Telemetry",
        "description": "Google Fit & Health activity, steps, sleep, and heart rate telemetry",
        "tier": "sensitive",
        "scopes": [
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.body.read",
            "https://www.googleapis.com/auth/fitness.location.read"
        ]
    },
    "timeline": {
        "id": "timeline",
        "name": "Location & Timeline / Geofence",
        "description": "Location telemetry feeding Telemeowtrics / MacroDroid / Tasker logs",
        "tier": "sensitive",
        "scopes": [
            "https://www.googleapis.com/auth/fitness.location.read",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    },
    "contacts": {
        "id": "contacts",
        "name": "Google Contacts / CardDAV Context",
        "description": "Read-only contacts lookup for relationship context and CRM widgets",
        "tier": "sensitive",
        "scopes": [
            "https://www.googleapis.com/auth/contacts.readonly"
        ]
    }
}

TOKEN_DIR = Path(os.environ.get("ANYMD_CONFIG_DIR", Path.home() / ".config" / "anymd"))
TOKEN_BUNDLE_PATH = TOKEN_DIR / "google_oauth_token.json"
RCLONE_SNIPPET_PATH = TOKEN_DIR / "rclone_token_snippet.conf"

TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"


def find_free_port() -> int:
    """Finds an open loopback port on 127.0.0.1"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class OAuthLoopbackHandler(BaseHTTPRequestHandler):
    auth_code: Optional[str] = None
    auth_error: Optional[str] = None

    def log_message(self, format, *args):
        # Suppress noisy default HTTP server console noise
        pass

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            OAuthLoopbackHandler.auth_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>AnyMD / MBB OAuth Authorized</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 40px; }
.card { background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 30px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
h1 { color: #38bdf8; margin-bottom: 10px; font-size: 1.5rem; }
p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
.badge { display: inline-block; padding: 6px 14px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 9999px; font-weight: bold; margin-top: 15px; font-size: 0.85rem; }
</style>
</head>
<body>
<div class="card">
  <h1>🐾 Authorization Successful</h1>
  <p>Tokens captured and stored for <strong>AnyMD</strong>, <strong>MBB</strong>, <strong>Kittlibr</strong>, and <strong>meow-vault</strong>.</p>
  <div class="badge">You may close this tab now.</div>
</div>
</body>
</html>"""
            self.wfile.write(html.encode("utf-8"))
        else:
            error = params.get("error", ["unknown_error"])[0]
            OAuthLoopbackHandler.auth_error = error
            self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = f"""<!DOCTYPE html><html><body style='background:#0f172a;color:#f87171;font-family:sans-serif;padding:40px;text-align:center;'>
<h2>Authorization Failed or Cancelled</h2><p>Error: {error}</p></body></html>"""
            self.wfile.write(html.encode("utf-8"))


def build_scope_list(presets: Optional[List[str]] = None, extra_scopes: Optional[List[str]] = None) -> List[str]:
    """Builds a deduped scope list based on requested presets."""
    if presets is None:
        # Default to vault and tasks
        presets = ["vault"]
    
    scopes = set()
    for p in presets:
        preset_info = SCOPE_PRESETS.get(p.lower())
        if preset_info:
            for s in preset_info["scopes"]:
                scopes.add(s)

    if extra_scopes:
        for s in extra_scopes:
            scopes.add(s)

    # Standard offline baseline
    scopes.add("openid")
    scopes.add("https://www.googleapis.com/auth/userinfo.email")
    return sorted(list(scopes))


def generate_auth_url(client_id: str, redirect_uri: str, scopes: List[str], force_consent: bool = True) -> str:
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(scopes),
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "consent select_account" if force_consent else "select_account"
    }
    return f"{AUTH_ENDPOINT}?{urllib.parse.urlencode(params)}"


def exchange_code_for_tokens(
    client_id: str,
    client_secret: str,
    code: str,
    redirect_uri: str
) -> Dict[str, Any]:
    """Exchanges authorization code for access_token, refresh_token, and expiry."""
    data = {
        "code": code,
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    if client_secret:
        data["client_secret"] = client_secret

    encoded_data = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(
        TOKEN_ENDPOINT,
        data=encoded_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def refresh_access_token(
    client_id: str,
    client_secret: str,
    refresh_token: str
) -> Dict[str, Any]:
    """Refreshes access_token using refresh_token rotation."""
    data = {
        "client_id": client_id,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    if client_secret:
        data["client_secret"] = client_secret

    encoded_data = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(
        TOKEN_ENDPOINT,
        data=encoded_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def save_token_bundle(token_data: Dict[str, Any], presets: List[str], client_id: str, client_secret: str = "") -> Path:
    """Saves centralized token bundle & rclone snippet."""
    TOKEN_DIR.mkdir(parents=True, exist_ok=True)
    
    # Calculate expiry
    expires_in = token_data.get("expires_in", 3600)
    expiry_timestamp = int(time.time()) + expires_in
    expiry_rfc3339 = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expiry_timestamp))

    bundle = {
        "project_id": PROJECT_ID,
        "client_id": client_id,
        "client_secret": client_secret,
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token") or token_data.get("existing_refresh_token"),
        "token_type": token_data.get("token_type", "Bearer"),
        "scope": token_data.get("scope", ""),
        "active_presets": presets,
        "expires_in": expires_in,
        "expires_at": expiry_timestamp,
        "expiry": expiry_rfc3339,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    with open(TOKEN_BUNDLE_PATH, "w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2)

    # Write rclone-compatible token snippet
    # rclone expects: token = {"access_token":"...","token_type":"Bearer","refresh_token":"...","expiry":"..."}
    rclone_token_dict = {
        "access_token": bundle["access_token"],
        "token_type": bundle["token_type"],
        "refresh_token": bundle["refresh_token"],
        "expiry": bundle["expiry"]
    }
    rclone_conf_str = f'token = {json.dumps(rclone_token_dict)}\n'
    with open(RCLONE_SNIPPET_PATH, "w", encoding="utf-8") as f:
        f.write(rclone_conf_str)

    return TOKEN_BUNDLE_PATH


def load_token_bundle() -> Optional[Dict[str, Any]]:
    """Loads token bundle if present."""
    if not TOKEN_BUNDLE_PATH.exists():
        return None
    try:
        with open(TOKEN_BUNDLE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ [OAuth] Could not parse existing token bundle: {e}")
        return None


def get_valid_access_token(auto_refresh: bool = True) -> Optional[str]:
    """
    Returns a valid access token.
    Automatically refreshes if expired and refresh_token is present.
    """
    bundle = load_token_bundle()
    if not bundle:
        return None

    now = int(time.time())
    expires_at = bundle.get("expires_at", 0)

    # 60s safety buffer
    if now < (expires_at - 60):
        return bundle.get("access_token")

    # Expired or close to expiry: refresh
    if auto_refresh and bundle.get("refresh_token"):
        print(f"🔄 [OAuth] Access token expired or nearing expiry. Refreshing via {PROJECT_ID}...")
        try:
            res = refresh_access_token(
                bundle.get("client_id", DEFAULT_CLIENT_ID),
                bundle.get("client_secret", DEFAULT_CLIENT_SECRET),
                bundle["refresh_token"]
            )
            bundle["access_token"] = res.get("access_token", bundle.get("access_token"))
            if "refresh_token" in res:
                bundle["refresh_token"] = res["refresh_token"]
            bundle["expires_in"] = res.get("expires_in", 3600)
            bundle["expires_at"] = now + bundle["expires_in"]
            bundle["expiry"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(bundle["expires_at"]))
            bundle["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

            save_token_bundle(
                bundle,
                bundle.get("active_presets", ["vault"]),
                bundle.get("client_id", DEFAULT_CLIENT_ID),
                bundle.get("client_secret", "")
            )
            print("✓ [OAuth] Token refreshed successfully.")
            return bundle["access_token"]
        except Exception as e:
            print(f"🔴 [OAuth] Failed to refresh token: {e}")
            return None

    return bundle.get("access_token")


def run_loopback_flow(
    client_id: str = DEFAULT_CLIENT_ID,
    client_secret: str = DEFAULT_CLIENT_SECRET,
    presets: Optional[List[str]] = None,
    open_browser: bool = True,
    force_consent: bool = True
) -> Dict[str, Any]:
    """
    Spins up plain HTTP loopback http://127.0.0.1:<port>, opens browser,
    captures offline refresh token, and saves bundle.
    """
    port = find_free_port()
    redirect_uri = f"http://127.0.0.1:{port}"
    if presets is None:
        presets = ["vault", "fitness", "timeline", "contacts"]

    scopes = build_scope_list(presets)
    auth_url = generate_auth_url(client_id, redirect_uri, scopes, force_consent=force_consent)

    server = HTTPServer(("127.0.0.1", port), OAuthLoopbackHandler)
    server.timeout = 180  # 3 minutes

    print("==================================================================")
    print("🐾 AnyMD / MBB / Kittlibr / Vault Google Cloud Desktop App OAuth")
    print(f"Project: {PROJECT_ID} | Client: Desktop App")
    print(f"Loopback URI: {redirect_uri}")
    print(f"Selected Presets: {', '.join(presets)}")
    print(f"Scopes: {len(scopes)} requested")
    print("==================================================================")
    print("\nIf browser does not open automatically, visit:")
    print(f"\n{auth_url}\n")

    if open_browser:
        try:
            webbrowser.open(auth_url)
        except Exception:
            pass

    print(f"Waiting for authorization callback on {redirect_uri}...")
    while OAuthLoopbackHandler.auth_code is None and OAuthLoopbackHandler.auth_error is None:
        server.handle_request()

    if OAuthLoopbackHandler.auth_error:
        raise RuntimeError(f"OAuth failed with error: {OAuthLoopbackHandler.auth_error}")

    auth_code = OAuthLoopbackHandler.auth_code
    print("✓ Authorization code received. Exchanging for tokens...")

    token_res = exchange_code_for_tokens(client_id, client_secret, auth_code, redirect_uri)
    saved_path = save_token_bundle(token_res, presets, client_id, client_secret)

    print(f"✓ Token bundle saved to: {saved_path}")
    print(f"✓ Rclone snippet written to: {RCLONE_SNIPPET_PATH}")
    return token_res


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Google OAuth Loopback Token Manager for AnyMD / MBB / Kittlibr / Vault Sync")
    parser.add_argument("--client-id", default=DEFAULT_CLIENT_ID, help="Google Cloud Desktop App Client ID")
    parser.add_argument("--client-secret", default=DEFAULT_CLIENT_SECRET, help="Client Secret if configured")
    parser.add_argument("--presets", default="vault,fitness,timeline,contacts", help="Comma-separated scope presets (vault, fitness, timeline, contacts)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    parser.add_argument("--refresh", action="store_true", help="Test token refresh using existing refresh_token")
    parser.add_argument("--status", action="store_true", help="Print current token and scope status")

    args = parser.parse_args()

    if args.status:
        b = load_token_bundle()
        if not b:
            print("🔴 No Google OAuth token bundle found. Run flow to authorize.")
            sys.exit(1)
        print(f"🟢 Google OAuth Bundle Status ({PROJECT_ID}):")
        print(f"  - Active Presets: {b.get('active_presets')}")
        print(f"  - Expiry: {b.get('expiry')}")
        print(f"  - Has Refresh Token: {bool(b.get('refresh_token'))}")
        valid_token = get_valid_access_token(auto_refresh=False)
        print(f"  - Currently Valid Access Token: {bool(valid_token)}")
        sys.exit(0)

    if args.refresh:
        t = get_valid_access_token(auto_refresh=True)
        if t:
            print(f"✓ Current valid access token: {t[:12]}...")
        else:
            print("🔴 Refresh failed.")
            sys.exit(1)
        sys.exit(0)

    selected_presets = [p.strip() for p in args.presets.split(",") if p.strip()]
    run_loopback_flow(
        client_id=args.client_id,
        client_secret=args.client_secret,
        presets=selected_presets,
        open_browser=not args.no_browser
    )
