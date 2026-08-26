#!/usr/bin/env python3
"""
mbb_violet_engine.py - The Pluggable African Violet & Water Globe TUI Engine
Brought to you by Gemini Notebook & Antigravity. Zero-dependency somatic terminal tracking.
"""

import sys
import os
import time
import re
from datetime import datetime, timedelta

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================
MDDB_PATH = os.environ.get("MBB_VIOLET_PATH", "/workspace/scratch/african_violet.md")
CAPILLARY_RECOVERY_TIME = 300  # 5 minutes in seconds
WILT_THRESHOLD_SECONDS = 7200   # 2 hours of dry globe before wilting begins
LEAF_DROP_RATE_SECONDS = 7200   # 1 leaf drops every 2 hours of active wilting

# ANSI Color Escape Codes
RESET = "\033[0m"
BOLD = "\033[1m"
PURPLE = "\033[38;5;129m"
BROWN = "\033[38;5;94m"
GREEN = "\033[38;5;34m"
BLUE = "\033[38;5;39m"
GRAY = "\033[38;5;244m"
YELLOW = "\033[38;5;214m"
RED = "\033[38;5;196m"

# ==============================================================================
# DEFAULT MDDB STATE TEMPLATE
# ==============================================================================
DEFAULT_MDDB_CONTENT = """---
id: "african_violet"
type: "hydration_widget"
companion: "trash_bandit"
max_capacity_sips: 4
current_level: 4
state: "healthy"
last_pee_timestamp: "{now}"
last_sip_timestamp: "{now}"
last_dry_timestamp: ""
last_update_timestamp: "{now}"
recovering_timer_seconds: 0
leaves_on_table: 0
consistency_streak_days: 3
---

# African Violet & Water Globe Widget

This file acts as a flat-file database (mddb) parsed by the Antigravity system.
Modifying the YAML front-matter will change the real-time TUI display.
"""

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
def parse_mddb(path):
    """Parses the YAML front-matter of the mddb file."""
    if not os.path.exists(path):
        # Create default file
        now_str = datetime.now().isoformat()
        content = DEFAULT_MDDB_CONTENT.format(now=now_str)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(content)
    
    with open(path, "r") as f:
        content = f.read()
    
    # Extract front-matter
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        raise ValueError("Malformed mddb file: No YAML front-matter found.")
    
    front_matter_raw = match.group(1)
    data = {}
    for line in front_matter_raw.splitlines():
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            # Parse simple types
            if val.isdigit():
                val = int(val)
            elif val.lower() == "true":
                val = True
            elif val.lower() == "false":
                val = False
            data[key] = val
    return data, content

def save_mddb(path, data, original_content):
    """Saves updated front-matter variables back to the flat mddb file."""
    new_yaml_lines = ["---"]
    for k, v in data.items():
        if isinstance(v, str) and v != "":
            new_yaml_lines.append(f'{k}: "{v}"')
        else:
            new_yaml_lines.append(f'{k}: {v if v is not None else ""}')
    new_yaml_lines.append("---")
    new_yaml = "\n".join(new_yaml_lines)
    
    # Replace old front-matter
    updated_content = re.sub(
        r"^---\s*\n.*?\n---\s*\n", 
        new_yaml + "\n", 
        original_content, 
        flags=re.DOTALL
    )
    with open(path, "w") as f:
        f.write(updated_content)

def parse_iso(dt_str):
    """Safely parse ISO datetime string."""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except ValueError:
        return None

# ==============================================================================
# STATE RECALCULATION ENGINE
# ==============================================================================
def tick_engine(data):
    """Calculates state transitions based on elapsed clock time."""
    now = datetime.now()
    last_update = parse_iso(data.get("last_update_timestamp")) or now
    data["last_update_timestamp"] = now.isoformat()
    
    elapsed_seconds = (now - last_update).total_seconds()
    if elapsed_seconds <= 0:
        return data

    state = data.get("state", "healthy")

    # 1. Handle Active Capillary Recovery Timer
    if state == "recovering":
        timer = data.get("recovering_timer_seconds", 0)
        timer -= elapsed_seconds
        if timer <= 0:
            data["state"] = "healthy"
            data["recovering_timer_seconds"] = 0
            data["leaves_on_table"] = 0  # Clean table compost complete!
            data["current_level"] = 4    # Boost to full health
        else:
            data["recovering_timer_seconds"] = int(timer)

    # 2. Handle Dehydration Progression (Dry -> Wilting -> Leaf Drop)
    elif data.get("current_level", 0) == 0:
        last_dry_str = data.get("last_dry_timestamp")
        if not last_dry_str:
            data["last_dry_timestamp"] = now.isoformat()
            last_dry = now
        else:
            last_dry = parse_iso(last_dry_str) or now
        
        dry_duration = (now - last_dry).total_seconds()
        
        if dry_duration >= WILT_THRESHOLD_SECONDS:
            if state != "wilting":
                data["state"] = "wilting"
                data["leaves_on_table"] = 1
            else:
                # Progressively drop more leaves
                active_wilt_duration = dry_duration - WILT_THRESHOLD_SECONDS
                additional_leaves = int(active_wilt_duration // LEAF_DROP_RATE_SECONDS)
                data["leaves_on_table"] = min(1 + additional_leaves, 4)
                
    return data

# ==============================================================================
# ART RENDERING ENGINE
# ==============================================================================
def render_frame(data):
    """Selects and colorizes the correct 4-line terminal output frame."""
    state = data.get("state", "healthy")
    level = data.get("current_level", 0)
    timer = data.get("recovering_timer_seconds", 0)
    leaves = data.get("leaves_on_table", 0)
    streak = data.get("consistency_streak_days", 0)
    
    # Colored components
    p_bloom = f"{PURPLE}@{RESET}"
    b_bloom = f"{BROWN}x{RESET}"
    r_bloom = f"{GRAY}-{RESET}"
    p_pot = f"{YELLOW}U{RESET}"
    table_edge = f"{GRAY}_/\\_..__U_,,_.._/\\_{RESET}"
    
    # 1. Determine Water Globe Bubble Content
    if level == 4:
        globe_bubble = f"{BLUE}~~~{RESET}"
        globe_neck = f"{BLUE}\\~/{RESET}"
    elif level == 3:
        globe_bubble = f"{BLUE}~~ {RESET}"
        globe_neck = f"{BLUE}\\~/{RESET}"
    elif level == 2:
        globe_bubble = f"{BLUE}~  {RESET}"
        globe_neck = f"{BLUE}\\~/{RESET}"
    elif level == 1:
        globe_bubble = f"   "
        globe_neck = f"{BLUE}\\_/{RESET}"
    else:
        globe_bubble = "   "
        globe_neck = "\\_/"

    # 2. Render State Matrix
    
    # STATE: RECOVERING (Capillary Slow-Sip Buffer Active)
    if state == "recovering":
        mins, secs = divmod(timer, 60)
        timer_str = f"{mins:02d}:{secs:02d}"
        l1 = f"    _/*\\_   ({globe_bubble})  <- [ {BLUE}CAPILLARY RESTORE: {timer_str}{RESET} ]"
        l2 = f"   (_{r_bloom}_{r_bloom}_{r_bloom}_)   {globe_neck}   ~ Good job pacing yourself... ~"
        l3 = f"   =====\\_ _/ Y =====  ({GRAY}-.-{RESET})   * gentle pat *"
        l4 = f"  _\\/_..__U_,,_.._\\/_ o({GRAY}  \"  {RESET})_ "
        return [l1, l2, l3, l4]

    # STATE: WILTING (Chronically Dehydrated)
    if state == "wilting" or level == 0:
        # Raccoon munching leaves on table
        dialogue = "~ Nom nom... no wasted spoons! ~" if leaves > 1 else "~ Dryer than a sandbox in July! ~"
        leaf_decoration = f"{BROWN}..{RESET}" if leaves > 2 else "  "
        l1 = f"    _/*\\_   (   )  <- [ {RED}DEHYDRATION ALERT!{RESET} ]"
        l2 = f"   (_{b_bloom}_{b_bloom}_{b_bloom}_)   \\_/   {dialogue}"
        l3 = f"   =====\\_ _/ Y =====  ({GRAY} ^_^ {RESET})   ~ crunch crunch ~"
        l4 = f"  _\\/_..__{p_pot}_{leaf_decoration}_.._\\/_ o({GRAY}  \"  {RESET})_ * wiggle tail *"
        return [l1, l2, l3, l4]

    # STATE: STRAW POKE (Hydration consistency high-streak bonus!)
    if streak >= 3 and level >= 3:
        l1 = f"    _/*\\_   ({globe_bubble})  <- [ {GREEN}CLONE STREAK: {streak} DAYS{RESET} ]"
        l2 = f"   (_{p_bloom}_{p_bloom}_{p_bloom}_)   {globe_neck}   ~ let me get a sip... ~"
        l3 = f"   =====\\_ _/ Y =====  ({GRAY} o.o {RESET})   / * clink straw *"
        l4 = f"  {table_edge} o({GRAY}  \"  {RESET})_="
        return [l1, l2, l3, l4]

    # STATE: DRY GLOBE (Fresh warning phase)
    if level == 1:
        l1 = f"    _/*\\_   ({globe_bubble})  <- [ {YELLOW}VIOLET GLOBE: DRY{RESET} ]"
        l2 = f"   (_{p_bloom}_{p_bloom}_{p_bloom}_)   {globe_neck}   ~ why glass so thick?! ~"
        l3 = f"   =====\\_ _/ Y =====  ({GRAY} o.o {RESET})   * shake head *"
        l4 = f"  {table_edge} o({GRAY}  \"  {RESET})_ (U) * pour outside *"
        return [l1, l2, l3, l4]

    # STATE: STANDARD HEALTHY / FULL
    l1 = f"    _/*\\_   ({globe_bubble})  <- [ {GREEN}FLUID LEVELS: {level*25}%{RESET} ]"
    l2 = f"   (_{p_bloom}_{p_bloom}_{p_bloom}_)   {globe_neck}   (Velvet violet rosette & glass globe)"
    l3 = f"   =====\\_ _/ Y =====  ({GRAY}-.-{RESET}) * sleeping beside pot *"
    l4 = f"  {table_edge} o({GRAY}  \"  {RESET})_"
    return [l1, l2, l3, l4]

# ==============================================================================
# MAIN EVENT ROUTER
# ==============================================================================
def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} [sip|pee|update|status]")
        sys.exit(1)

    action = sys.argv[1].lower()
    
    # Load state
    data, raw_content = parse_mddb(MDDB_PATH)
    
    # Tick state forward first
    data = tick_engine(data)
    
    now = datetime.now()

    if action == "sip":
        # Log Hydration Event
        data["last_sip_timestamp"] = now.isoformat()
        
        # Check if dry/wilting to trigger the hydrophobic buffer
        if data.get("state") in ["wilting", "dry"] or data.get("current_level", 0) == 0:
            data["state"] = "recovering"
            data["recovering_timer_seconds"] = CAPILLARY_RECOVERY_TIME
            data["current_level"] = 1  # Waking up the root capillary
        else:
            # Standard increase
            data["current_level"] = min(data.get("current_level", 0) + 1, 4)
            data["state"] = "healthy"
        
        # Increase consistency metric slightly
        data["consistency_streak_days"] = min(data.get("consistency_streak_days", 0) + 1, 7)
        print(f"[{BLUE}mbb{RESET}] Sip logged. Telemetry hydration level increased.")

    elif action == "pee":
        # Log Bio Break Event
        data["last_pee_timestamp"] = now.isoformat()
        curr = data.get("current_level", 4)
        
        if curr > 0:
            data["current_level"] = curr - 1
            if data["current_level"] == 0:
                data["state"] = "dry"
                data["last_dry_timestamp"] = now.isoformat()
                # Break streak!
                data["consistency_streak_days"] = 0
            print(f"[{BLUE}mbb{RESET}] Bio break logged. System fluids discharged.")
        else:
            print(f"[{RED}mbb{RESET}] System is already completely empty! Take a slow sip.")

    elif action == "update":
        # Just tick engine and save (run passively by cron/file-watcher)
        print(f"[{BLUE}mbb{RESET}] Background clock ticked.")

    elif action == "status":
        # Silent pass, used for TUI display
        pass

    else:
        print(f"Unknown action: {action}")
        sys.exit(1)

    # Save state back to mddb
    save_mddb(MDDB_PATH, data, raw_content)

    # Output the ANSI color frames
    frame_lines = render_frame(data)
    print("\n" + "\n".join(frame_lines) + "\n")

if __name__ == "__main__":
    main()
