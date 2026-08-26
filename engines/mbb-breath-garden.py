import os
import sys
import time
from datetime import datetime, timedelta

# Default flat-file database path for the Breath Garden
DEFAULT_DB_PATH = os.path.expanduser("~/.mbb_breath_garden.md")
DB_PATH = os.environ.get("MBB_GARDEN_PATH", DEFAULT_DB_PATH)

# ANSI terminal colors for beautiful, low-power visual rendering
GREEN = "\033[38;5;34m"
LIGHT_GREEN = "\033[38;5;71m"
DARK_GREEN = "\033[38;5;22m"
PURPLE = "\033[38;5;129m"
ORANGE = "\033[38;5;214m"
BLUE = "\033[38;5;39m"
GRAY = "\033[38;5;244m"
RESET = "\033[0m"

# Default state content for flat-file database representation
DEFAULT_FRONTMATTER = """---
id: "breath_garden"
type: "somatic_garden"
steps_today: 0
breaths_counted: 0
last_step_timestamp: "{now}"
last_breath_timestamp: "{now}"
moss_density: 0.2
fern_growth_level: 0
flower_bloomed_count: 0
consistency_streak_days: 0
---
# Somatic Breath & Moss Garden Log
Simply by existing, you are nourishing this environment.
"""

def load_or_create_db():
    if not os.path.exists(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        now_str = datetime.now().isoformat()
        with open(DB_PATH, "w") as f:
            f.write(DEFAULT_FRONTMATTER.format(now=now_str))
    
    metadata = {}
    with open(DB_PATH, "r") as f:
        lines = f.readlines()
        
    in_frontmatter = False
    for line in lines:
        if line.strip() == "---":
            in_frontmatter = not in_frontmatter
            continue
        if in_frontmatter:
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"')
                # Parse numeric values
                if val.isdigit():
                    metadata[key] = int(val)
                elif val.replace('.', '', 1).isdigit():
                    metadata[key] = float(val)
                else:
                    metadata[key] = val
    return metadata

def save_db(metadata):
    now_str = datetime.now().isoformat()
    lines = [
        "---",
        f'id: "{metadata.get("id", "breath_garden")}"',
        f'type: "{metadata.get("type", "somatic_garden")}"',
        f'steps_today: {metadata.get("steps_today", 0)}',
        f'breaths_counted: {metadata.get("breaths_counted", 0)}',
        f'last_step_timestamp: "{metadata.get("last_step_timestamp", now_str)}"',
        f'last_breath_timestamp: "{metadata.get("last_breath_timestamp", now_str)}"',
        f'moss_density: {round(metadata.get("moss_density", 0.2), 2)}',
        f'fern_growth_level: {metadata.get("fern_growth_level", 0)}',
        f'flower_bloomed_count: {metadata.get("flower_bloomed_count", 0)}',
        f'consistency_streak_days: {metadata.get("consistency_streak_days", 0)}',
        "---",
        "# Somatic Breath & Moss Garden Log",
        "Simply by existing, you are nourishing this environment."
    ]
    with open(DB_PATH, "w") as f:
        f.write("\n".join(lines) + "\n")

def tick_engine(metadata):
    """
    Recalculates active plant growth dynamics based on time elapsed and log activity.
    """
    now = datetime.now()
    
    # Estimate passive breathing over time if no active logs
    last_breath_str = metadata.get("last_breath_timestamp")
    try:
        last_breath = datetime.fromisoformat(last_breath_str)
    except:
        last_breath = now
        metadata["last_breath_timestamp"] = now.isoformat()
        
    seconds_since_last_breath = (now - last_breath).total_seconds()
    
    # Human respiratory rate at rest is ~12-16 breaths per minute (0.2 to 0.26 breaths per second)
    # We passively generate breaths simply by staying alive!
    if seconds_since_last_breath > 60:
        passive_breaths = int(seconds_since_last_breath * 0.22)
        metadata["breaths_counted"] = metadata.get("breaths_counted", 0) + passive_breaths
        metadata["last_breath_timestamp"] = now.isoformat()
    
    # Moss density increases with breaths (passive existence)
    # Ferns grow with daily step thresholds
    # Flowers bloom when both steps and breaths are highly active (synergy)
    breaths = metadata.get("breaths_counted", 0)
    steps = metadata.get("steps_today", 0)
    
    # Calculate Growth Stages
    metadata["moss_density"] = min(1.0, 0.2 + (breaths / 5000.0) + (steps / 10000.0))
    
    # Fern growth level (0 to 3) based on active steps
    if steps >= 10000:
        metadata["fern_growth_level"] = 3
    elif steps >= 6000:
        metadata["fern_growth_level"] = 2
    elif steps >= 2000:
        metadata["fern_growth_level"] = 1
    else:
        metadata["fern_growth_level"] = 0
        
    # Flower bloom count (0 to 2) based on combining breath + step milestones
    if steps >= 8000 and breaths >= 1500:
        metadata["flower_bloomed_count"] = 2
    elif steps >= 3000 and breaths >= 500:
        metadata["flower_bloomed_count"] = 1
    else:
        metadata["flower_bloomed_count"] = 0
        
    return metadata

def render_garden(metadata):
    """
    Renders a stunning 4-line space-padded ASCII TUI of the active somatic garden,
    featuring dynamic representations of moss, ferns, and blooming velvet flowers.
    """
    steps = metadata.get("steps_today", 0)
    breaths = metadata.get("breaths_counted", 0)
    fern_lv = metadata.get("fern_growth_level", 0)
    flower_count = metadata.get("flower_bloomed_count", 0)
    moss_d = metadata.get("moss_density", 0.2)
    
    # Line 1: Upper layer of foliage (Flowers & Fern Tips)
    # Depending on growth, flowers open and ferns spread
    l1_flower_left = f"{PURPLE}_/*\\_{RESET}" if flower_count >= 1 else "     "
    l1_flower_right = f"{PURPLE}_/*\\_{RESET}" if flower_count >= 2 else "     "
    
    if fern_lv == 3:
        l1_fern = f"{GREEN}*|* *|*{RESET}"
    elif fern_lv == 2:
        l1_fern = f" {GREEN}*|*{RESET}  "
    elif fern_lv == 1:
        l1_fern = f"  {GREEN}|{RESET}   "
    else:
        l1_fern = "     "
        
    line1 = f"    {l1_flower_left}     {l1_fern}     {l1_flower_right}   {GRAY}<- [ PASSIVE BREATHS: {breaths:,} ]{RESET}"
    
    # Line 2: Mid layer of foliage (Blooms and Fern stems)
    l2_bloom_left = f"({PURPLE}@{RESET}_{PURPLE}@{RESET}_{PURPLE}@{RESET})" if flower_count >= 1 else f"({GRAY}.{RESET}_{GRAY}.{RESET}_{GRAY}.{RESET})" if steps > 0 else "     "
    l2_bloom_right = f"({PURPLE}@{RESET}_{PURPLE}@{RESET}_{PURPLE}@{RESET})" if flower_count >= 2 else f"({GRAY}.{RESET}_{GRAY}.{RESET}_{GRAY}.{RESET})" if steps > 500 else "     "
    
    if fern_lv == 3:
        l2_fern = f"{LIGHT_GREEN}\\|/ \\|/{RESET}"
    elif fern_lv == 2:
        l2_fern = f" {LIGHT_GREEN}\\|/{RESET}  "
    elif fern_lv == 1:
        l2_fern = f"  {LIGHT_GREEN}|{RESET}   "
    else:
        l2_fern = "     "
        
    line2 = f"   {l2_bloom_left}    {l2_fern}    {l2_bloom_right}   {GRAY}(Existing is doing meaningful work){RESET}"
    
    # Line 3: Stem and root connections to ground
    l3_stem_left = f"{DARK_GREEN}Y{RESET}" if flower_count >= 1 or steps > 0 else " "
    l3_stem_right = f"{DARK_GREEN}Y{RESET}" if flower_count >= 2 or steps > 500 else " "
    l3_fern_stem = f"{DARK_GREEN}Y   Y{RESET}" if fern_lv >= 2 else f"  {DARK_GREEN}Y{RESET}  " if fern_lv == 1 else "     "
    
    line3 = f"   ====={l3_stem_left}====={l3_fern_stem}====={l3_stem_right}=====  {GRAY}<- [ PHYSICAL STEPS: {steps:,} ]{RESET}"
    
    # Line 4: Table and moss-covered ground layer
    # Moss density determines the pattern of ground vegetation (.,,,._)
    if moss_d >= 0.8:
        ground_pattern = f"{GREEN}_/\\_..__U_,,_.._.._,,_U__.._\\/_{RESET}"
    elif moss_d >= 0.5:
        ground_pattern = f"{LIGHT_GREEN}_/\\_..____,,_..____,,____.._\\/_{RESET}"
    else:
        ground_pattern = f"{GRAY}_/\\________________________/\\_{RESET}"
        
    line4 = f"  {ground_pattern}"
    
    # Print formatted TUI layout
    print()
    print(line1)
    print(line2)
    print(line3)
    print(line4)
    print()

def main():
    metadata = load_or_create_db()
    metadata = tick_engine(metadata)
    
    if len(sys.argv) > 1:
        action = sys.argv[1].lower()
        if action == "step":
            increment = int(sys.argv[2]) if len(sys.argv) > 2 else 500
            metadata["steps_today"] = metadata.get("steps_today", 0) + increment
            metadata["last_step_timestamp"] = datetime.now().isoformat()
            print(f"{BLUE}[mbb:garden]{RESET} Steps logged. Kinetic fuel registered: +{increment} steps.")
        elif action == "breath":
            increment = int(sys.argv[2]) if len(sys.argv) > 2 else 50
            metadata["breaths_counted"] = metadata.get("breaths_counted", 0) + increment
            metadata["last_breath_timestamp"] = datetime.now().isoformat()
            print(f"{BLUE}[mbb:garden]{RESET} Breath cycle logged. Respiration calibration: +{increment} breaths.")
        elif action == "update":
            # Just runs background calculations (useful for cron triggers)
            pass
        elif action == "status":
            # Just displays the TUI (default behavior)
            pass
        else:
            print(f"Unknown action. Supported: step [amount], breath [amount], update, status")
            sys.exit(1)
            
    # Always tick and save state changes
    metadata = tick_engine(metadata)
    save_db(metadata)
    render_garden(metadata)

if __name__ == "__main__":
    main()
