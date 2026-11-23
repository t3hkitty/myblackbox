#!/usr/bin/env python3
"""
🐾 MBB Telemeowtrics Capture & Ticker Daemon CLI (Termux / C:\\Scripts Compatible)
Captures flat .md notes with YAML frontmatter and Zettelkasten-ID (YYYYMMDD-HHMM Pacific Time).
Handles Roman numeral micro-tickers and superseding auto-stop triggers offline.
Zero third-party dependencies (standard library only).
"""

import os
import sys
import json
import argparse
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path

PACIFIC_TZ = ZoneInfo("America/Los_Angeles")

ROMAN_PAIRS = [
    (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
    (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
    (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")
]

def to_roman(num: int) -> str:
    if num <= 0:
        return ""
    res = []
    rem = num
    for val, roman in ROMAN_PAIRS:
        while rem >= val:
            res.append(roman)
            rem -= val
    return "".join(res)

def get_pacific_zettel_id(dt: datetime = None) -> str:
    if dt is None:
        dt = datetime.now(PACIFIC_TZ)
    elif dt.tzinfo is None:
        dt = dt.astimezone(PACIFIC_TZ)
    return dt.strftime("%Y%m%d-%H%M")

def get_vault_path(custom_vault: str = None) -> Path:
    if custom_vault:
        p = Path(custom_vault)
    elif "MEOW_VAULT" in os.environ:
        p = Path(os.environ["MEOW_VAULT"])
    elif sys.platform == "win32":
        p = Path(r"C:\meow-vault")
    else:
        p = Path.home() / "meow-vault"
    p.mkdir(parents=True, exist_ok=True)
    return p

def write_frontmatter_note(filepath: Path, frontmatter: dict, body: str):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    lines = ["---"]
    for k, v in frontmatter.items():
        if isinstance(v, list):
            items_str = ", ".join(f'"{i}"' if isinstance(i, str) else str(i) for i in v)
            lines.append(f"{k}: [{items_str}]")
        elif isinstance(v, str):
            lines.append(f'{k}: "{v}"')
        elif isinstance(v, bool):
            lines.append(f"{k}: {'true' if v else 'false'}")
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    lines.append("")
    lines.append(body.strip())
    lines.append("")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def parse_frontmatter_note(filepath: Path):
    if not filepath.exists():
        return {}, ""
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    if not text.startswith("---"):
        return {}, text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text

    yaml_block = parts[1]
    body = parts[2].strip()

    fm = {}
    for line in yaml_block.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            k, v = line.split(":", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if v == "true":
                fm[k] = True
            elif v == "false":
                fm[k] = False
            elif v.isdigit():
                fm[k] = int(v)
            elif v.startswith("[") and v.endswith("]"):
                fm[k] = [x.strip().strip('"').strip("'") for x in v[1:-1].split(",") if x.strip()]
            else:
                fm[k] = v
    return fm, body

def capture_command(args):
    vault = get_vault_path(args.vault)
    inbox = vault / "inbox"
    zettel_id = get_pacific_zettel_id()
    slug = (args.source or "capture").lower().replace(" ", "_")
    filename = f"{zettel_id}-{slug}.md"
    note_path = inbox / filename

    fm = {
        "title": args.title or f"Capture {zettel_id}",
        "created_pt": zettel_id,
        "source": args.source or "telemeowtrics-cli",
        "tags": args.tags.split(",") if args.tags else ["inbox", "telemeowtrics"],
        "status": "draft",
        "vault_area": "inbox"
    }

    body = args.text or sys.stdin.read() if not sys.stdin.isatty() else ""
    write_frontmatter_note(note_path, fm, body)
    print(f"🐾 [MBB] Note captured: {note_path}")

def ticker_command(args):
    vault = get_vault_path(args.vault)
    tickers_dir = vault / "tickers"
    tickers_dir.mkdir(parents=True, exist_ok=True)
    slug = args.slug.lower()
    ticker_file = tickers_dir / f"{slug}.md"

    now_pt = get_pacific_zettel_id()
    now_iso = datetime.now(PACIFIC_TZ).isoformat()

    if args.action == "tick":
        fm, body = parse_frontmatter_note(ticker_file)
        count = int(fm.get("count", 0)) + 1
        roman = to_roman(count)
        started_at = fm.get("started_at", now_iso)

        fm.update({
            "title": f"💊//ticker/{slug}",
            "type": "ticker",
            "count": count,
            "roman": roman,
            "started_at": started_at,
            "last_ticked_at": now_iso,
            "status": "needsAction",
            "auto_stop_on": ["sleep"]
        })

        append_body = f"- Tick {roman} (#{count}) at {now_pt}\n"
        new_body = (body + "\n" + append_body).strip()
        write_frontmatter_note(ticker_file, fm, new_body)
        print(f"🐾 [MBB] Ticker '{slug}' updated to {roman} (#{count})")

    elif args.action == "stop" or args.action == "done":
        fm, body = parse_frontmatter_note(ticker_file)
        if not fm:
            print(f"⚠️ [MBB] Ticker '{slug}' not found.")
            return

        count = int(fm.get("count", 0))
        roman = fm.get("roman", to_roman(count))
        fm["status"] = "completed"
        fm["completed_at"] = now_iso
        if args.stopped_by:
            fm["stopped_by"] = args.stopped_by

        completion_log = f"\n\n### 🏁 MBB Completion Reprocessor Log\n- **Completed**: {now_iso}\n- **Total Ticks**: {count} ({roman})\n"
        if args.stopped_by:
            completion_log += f"- **Stopped By**: `{args.stopped_by}`\n"

        write_frontmatter_note(ticker_file, fm, body + completion_log)
        print(f"🐾 [MBB] Ticker '{slug}' marked DONE! Total: {count} ({roman})")

def state_command(args):
    """Cascades auto-stop to active tickers listening to this state"""
    vault = get_vault_path(args.vault)
    tickers_dir = vault / "tickers"
    if not tickers_dir.exists():
        print(f"🐾 [MBB] No active tickers found in {tickers_dir}")
        return

    state_name = args.state_name
    print(f"🐾 [MBB] Emitting state '{state_name}'...")
    stopped_count = 0

    for ticker_file in tickers_dir.glob("*.md"):
        fm, body = parse_frontmatter_note(ticker_file)
        if fm.get("status") == "needsAction":
            auto_stops = fm.get("auto_stop_on", [])
            if isinstance(auto_stops, str):
                auto_stops = [auto_stops]
            if state_name in auto_stops:
                fm["status"] = "completed"
                fm["completed_at"] = datetime.now(PACIFIC_TZ).isoformat()
                fm["stopped_by"] = f"state:{state_name}"
                count = fm.get("count", 0)
                roman = fm.get("roman", to_roman(count))
                completion_log = f"\n\n### 🏁 MBB Superseding Auto-Stop\n- **Triggered By**: `state:{state_name}`\n- **Total Ticks**: {count} ({roman})\n"
                write_frontmatter_note(ticker_file, fm, body + completion_log)
                print(f"  -> Closed ticker {ticker_file.name} (stopped by {state_name})")
                stopped_count += 1

    print(f"🐾 [MBB] Cascaded stop complete. {stopped_count} tickers stopped.")

def main():
    vault_parent = argparse.ArgumentParser(add_help=False)
    vault_parent.add_argument("--vault", help="Path to meow-vault directory")

    parser = argparse.ArgumentParser(description="MBB Telemeowtrics & Ticker CLI", parents=[vault_parent])
    subparsers = parser.add_subparsers(dest="cmd", required=True)

    # capture
    p_cap = subparsers.add_parser("capture", help="Capture note to meow-vault/inbox", parents=[vault_parent])
    p_cap.add_argument("--title", help="Note title")
    p_cap.add_argument("--text", help="Note body text")
    p_cap.add_argument("--tags", help="Comma-separated tags")
    p_cap.add_argument("--source", help="Source adapter (tasker, macrodroid, etc.)")
    p_cap.set_defaults(func=capture_command)

    # ticker
    p_tick = subparsers.add_parser("ticker", help="Increment or complete micro-ticker", parents=[vault_parent])
    p_tick.add_argument("slug", help="Ticker slug e.g. sip, workout, fasting")
    p_tick.add_argument("action", choices=["tick", "stop", "done"], help="Action to execute")
    p_tick.add_argument("--stopped-by", help="Entity or event stopping this ticker")
    p_tick.set_defaults(func=ticker_command)

    # state
    p_state = subparsers.add_parser("state", help="Emit superseding state (e.g. sleep, meal)", parents=[vault_parent])
    p_state.add_argument("state_name", help="Name of state e.g. sleep, broke_fast")
    p_state.set_defaults(func=state_command)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
