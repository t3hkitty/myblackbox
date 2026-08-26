#!/usr/bin/env python3
import os
import sys
import time
import re

# ==========================================
# MBB Hungry Bear & Honey Jar Engine (v2.0)
# Decoupled state-machine for cozy terminal UIs
# ==========================================

# ANSI Terminal Escape Codes for Cozy styling
GOLD = "\033[38;5;214m"       # Honey
BROWN = "\033[38;5;137m"      # Bear
RED = "\033[38;5;196m"        # Alerts/Lid
GREEN = "\033[38;5;34m"       # Streak Indicators
RESET = "\033[0m"
MUTED = "\033[38;5;244m"

DEFAULT_FILE_PATH = "/tmp/hungry_bear.md"
MD_PATH = os.getenv("MBB_BEAR_PATH", DEFAULT_FILE_PATH)

DEFAULT_MD_CONTENT = """---
id: "hungry_bear"
type: "nutrition_widget"
companion: "honey_bear"
max_capacity_servings: 4
current_level: 4
state: "healthy"              # options: healthy, hungry, hangry, digesting
last_feed_timestamp: "{now}"
last_burn_timestamp: "{now}"
digesting_timer_seconds: 300
streak_days: 3
---

# Hungry Bear & Honey Jar Configuration
"""

def get_now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%S")

def parse_iso(iso_str):
    try:
        return time.strptime(iso_str.split(".")[0], "%Y-%m-%dT%H:%M:%S")
    except Exception:
        return time.localtime()

def read_db():
    if not os.path.exists(MD_PATH):
        # Initialize default mddb file
        now = get_now_iso()
        os.makedirs(os.path.dirname(MD_PATH) or '.', exist_ok=True)
        with open(MD_PATH, "w") as f:
            f.write(DEFAULT_MD_CONTENT.format(now=now))
    
    with open(MD_PATH, "r") as f:
        content = f.read()
    
    # Parse flat YAML frontmatter
    metadata = {}
    fm_match = re.search(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if fm_match:
        fm_text = fm_match.group(1)
        for line in fm_text.split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if val.isdigit():
                    val = int(val)
                metadata[key] = val
    return metadata

def write_db(metadata):
    fm_lines = ["---"]
    for k, v in metadata.items():
        if isinstance(v, str):
            fm_lines.append(f'{k}: "{v}"')
        else:
            fm_lines.append(f'{k}: {v}')
    fm_lines.append("---")
    
    with open(MD_PATH, "w") as f:
        f.write("\n".join(fm_lines) + "\n\n# Hungry Bear & Honey Jar Configuration\n")

def tick_engine():
    """Recalculates times and decays honey levels based on real-time passage."""
    meta = read_db()
    now_epoch = time.time()
    
    last_burn = time.mktime(parse_iso(meta.get("last_burn_timestamp", get_now_iso())))
    last_feed = time.mktime(parse_iso(meta.get("last_feed_timestamp", get_now_iso())))
    
    # Digesting Countdown calculation
    if meta.get("state") == "digesting":
        elapsed_since_feed = now_epoch - last_feed
        timer_remaining = max(0, 300 - int(elapsed_since_feed))
        meta["digesting_timer_seconds"] = timer_remaining
        if timer_remaining <= 0:
            meta["state"] = "healthy"
            meta["current_level"] = meta.get("max_capacity_servings", 4)
    
    # Natural Honey decay (1 level burned every 4 hours of inactivity)
    elapsed_since_burn = now_epoch - last_burn
    hours_elapsed = elapsed_since_burn / 3600.0
    
    if hours_elapsed >= 4.0 and meta.get("state") != "digesting":
        decay_amount = int(hours_elapsed // 4)
        if decay_amount > 0:
            meta["current_level"] = max(0, meta.get("current_level", 4) - decay_amount)
            meta["last_burn_timestamp"] = get_now_iso()
            
            # Reset streak if the bear goes hungry/hangry
            if meta["current_level"] <= 1:
                meta["streak_days"] = 0
    
    # State evaluation based on level
    if meta.get("state") != "digesting":
        current_level = meta.get("current_level", 4)
        if current_level == 0:
            meta["state"] = "hangry"
        elif current_level == 1:
            meta["state"] = "hungry"
        else:
            meta["state"] = "healthy"
            
    write_db(meta)
    return meta

def feed_bear():
    meta = read_db()
    # Trigger active digesting buffer (cooldown)
    meta["state"] = "digesting"
    meta["last_feed_timestamp"] = get_now_iso()
    meta["last_burn_timestamp"] = get_now_iso() # reset burn decay clock
    meta["digesting_timer_seconds"] = 300
    
    # Increment streak if fed consistently from non-starving states
    if meta.get("current_level", 0) > 0:
        meta["streak_days"] = min(7, meta.get("streak_days", 0) + 1)
    else:
        meta["streak_days"] = 1 # reset to baseline
        
    write_db(meta)
    print(f"{GREEN}[mbb]{RESET} Fuel logged. Honey jar replenished. Digestion cycle locked (5m buffer).")

def burn_fuel():
    meta = read_db()
    meta["current_level"] = max(0, meta.get("current_level", 4) - 1)
    meta["last_burn_timestamp"] = get_now_iso()
    if meta["current_level"] <= 1:
        meta["streak_days"] = 0
    write_db(meta)
    print(f"{MUTED}[mbb]{RESET} Metabolic burn logged. Honey level decreased.")

def render_frame():
    meta = tick_engine()
    state = meta.get("state", "healthy")
    level = meta.get("current_level", 4)
    streak = meta.get("streak_days", 0)
    timer = meta.get("digesting_timer_seconds", 300)
    
    # Formulate specific strings with colored telemetry
    if state == "digesting":
        status_label = f"{GOLD}DIGESTING BUFFER: {timer//60:02d}:{timer%60:02d}{RESET}"
    elif state == "hangry":
        status_label = f"{RED}STOMACH EMPTY! DEFEATED{RESET}"
    elif state == "hungry":
        status_label = f"{RED}HONEY JAR: EMPTY{RESET}"
    else:
        if streak >= 3:
            status_label = f"{GREEN}STREAK: {streak} DAYS FULL!{RESET}"
        else:
            status_label = f"{GOLD}HONEY JAR: {level * 25}%{RESET}"

    # Build ASCII strings
    # Honey Jar: Lid (_(\/)_), Glass body |~~~~~|, baseline \______/
    # Bear: Head (o.o), Body ( " ), Paws o( )_
    
    frame = []
    
    if state == "digesting":
        # State: Digesting (The 5-Minute Cooldown, Bear resting, satisfied)
        frame.append(f"    _({RED}\\/ {RESET})_   {GOLD}(~~~){RESET}  <- [ {status_label} ]")
        frame.append(f"   | {GOLD}~~~~{RESET} |  {MUTED}( -.- ){RESET}  ~ blood sugar rising... ~")
        frame.append(f"   |{GOLD}~~H~~~{RESET}| o{BROWN}(  \"  ){RESET}_ * gentle tummy pat *")
        frame.append(f" _/\\{MUTED}______{RESET}/\\_ {MUTED}\"\"   \"\"{RESET} __________________________")
        
    elif state == "hangry":
        # State: Hangry (Jar sat empty too long. Bear face-plants or wiggles tail in a pile of leaves/spilled honey)
        frame.append(f"    _({RED}\\/ {RESET})_   (   )  <- [ {status_label} ]")
        frame.append(f"   |      |  {BROWN}( >_< ){RESET}  ~ Nom nom... no wasted spoons! ~")
        frame.append(f"   |______| o{BROWN}(  \"  ){RESET}_  ~ crunching fallen leaves ~")
        frame.append(f" _/\\{MUTED}______{RESET}/\\_ {MUTED}\"\"   \"\"{RESET} * wiggle tail *")
        
    elif state == "hungry":
        # State: Hungry (Just emptied, Bear shakes the jar upside down looking for drops)
        frame.append(f"    _({RED}\\/ {RESET})_   (   )  <- [ {status_label} ]")
        frame.append(f"   |      |  {BROWN}( o.o ){RESET}  ~ why glass so thick?! ~")
        frame.append(f"   |______| o{BROWN}(  \"  ){RESET}_ {RED}(U){RESET} * shake jar upside down *")
        frame.append(f" _/\\{MUTED}______{RESET}/\\_ {MUTED}\"\"   \"\"{RESET} * shake head *")
        
    else: # Healthy/Full State
        if streak >= 3:
            # State: Honey Thief Straw State (Consistently Full Streak Reward!)
            # Bear is waddling over trying to sneak a straw into your bulletproof locked honey jar
            frame.append(f"    _({RED}\\/ {RESET})_   {GOLD}(~~~){RESET}  <- [ {status_label} ]")
            frame.append(f"   | {GOLD}~~~~{RESET} |  {BROWN}( o.o ){RESET}  / * clink straw on lid *")
            frame.append(f"   |{GOLD}~~H~~~{RESET}| o{BROWN}(  \"  ){RESET}_= ~ let me get a sip... ~")
            frame.append(f" _/\\{MUTED}______{RESET}/\\_ {MUTED}\"\"   \"\"{RESET} __________________________")
        else:
            # State: Healthy Idle (Bear sleeping next to the pot)
            jar_waves = "~   " if level == 1 else "~~  " if level == 2 else "~~~ " if level == 3 else "~~~~"
            frame.append(f"    _({RED}\\/ {RESET})_   {GOLD}({jar_waves[0:3]}){RESET}  <- [ {status_label} ]")
            frame.append(f"   | {GOLD}{jar_waves}{RESET} |  {MUTED}(-. -){RESET}  * sleeping beside jar *")
            frame.append(f"   |{GOLD}~~H~~~{RESET}| o{BROWN}(  \"  ){RESET}_")
            frame.append(f" _/\\{MUTED}______{RESET}/\\_ {MUTED}\"\"   \"\"{RESET} __________________________")

    print("\n" + "\n".join(frame) + "\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "feed" or cmd == "sip" or cmd == "eat":
            feed_bear()
        elif cmd == "burn" or cmd == "pee":
            burn_fuel()
        elif cmd == "update":
            tick_engine()
            print("[mbb] Engine ticked. Decayed levels updated.")
        elif cmd == "status":
            render_frame()
        else:
            print("Unknown command. Use: feed, burn, update, status")
    else:
        render_frame()
