import sys
import os
import json
import math
from datetime import datetime, timedelta

# ==============================================================================
# mbb_moisture_anticipator.py - The Circadian Calibration & Predictive Wake System
# ==============================================================================
#
#   "No Shame, No Fear. Only Unconditional Safety & Biological Alignment."
#
# DESCRIPTION:
#   This is a standalone, offline, zero-dependency TUI state engine designed
#   to replace the hostile, reactive "punishment" models of traditional 
#   nocturnal alarms with a proactive, phase-locked anticipatory wake cycle.
#
#   By gathering a silent, non-intrusive 7-day baseline of nocturnal telemetry,
#   the engine identifies the precise recurring temporal footprint of your 
#   bladder's circadian pressure limits. It then initiates a gentle, 15-minute 
#   sub-sensory haptic and acoustic ramp BEFORE the predicted event, allowing 
#   the subcortical brain to float smoothly from deep Delta sleep to light Alpha 
#   waves, triggering natural sphincter reflexes without cortisol spikes.
#
#   This tool is dedicated to peace, healing, and somatic sovereignty.
# ==============================================================================

# Custom 4-line space-padded ASCII Frames for the Somatic TUI Dashboard
FRAMES = {
    "diagnostic": """
    _---_      [ooo]  <- [ BASELINE PHASE: DAY {day}/7 ]
   ( O.O )     |   |   (Silent, non-intrusive tracking...)
   ==u=u=======|___|== (Moisture sensors active, alarms off)
  _\\/_..__U_,,_.._\\/________________________________________
""",
    "anticipatory_haptic": """
    _---_      [~~~]  <- [ PROACTIVE WAKE: T-MINUS 15M ]
   ( -.- )     | ~ |   * gentle wristband vibration pulse *
   ==u=u=======|~~~|== (Sub-sensory Alpha transition active)
  _\\/_..__U_,,_.._\\/________________________________________
""",
    "anticipatory_light": """
    _---_      [~~~]  <- [ PROACTIVE WAKE: T-MINUS 5M ]
   ( u_u )     |~~~|   * baseboard amber lights fade on *
   ==u=u=======|~~~|== (Visual pathway calibrated: 0.5% intensity)
  _\\/_..__U_,,_.._\\/________________________________________
""",
    "conscious_wake": """
    _---_      [   ]  <- [ CONSCIOUS WAKE: MIDNIGHT SLIP ]
   ( ^_^ )     |   |   ~ Stand up slowly. Path is clear. ~\n   ==u=u=======|___|== (Zero rush. No shame. No failure.)
  _\\/_..__U_,,_.._\\/________________________________________
""",
    "recovering": """
    _---_      [~~~]  <- [ RECOVERY SEQUENCE LOCKED ]
   ( -.- )     |~~~|   ~ resetting smart grid to night mode ~
   ==u=u=======|~~~|== (Safe-state confirmed. Sleep well.)
  _\\/_..__U_,,_.._\\/________________________________________
"""
}

DEFAULT_DB_PATH = "/tmp/mbb_moisture_db.json"

def load_database():
    if os.path.exists(DEFAULT_DB_PATH):
        try:
            with open(DEFAULT_DB_PATH, "r") as f:
                return json.load(f)
        except:
            pass
    
    # Initialize default 7-day baseline data (simulating standard sleep patterns)
    return {
        "phase": "diagnostic",  # diagnostic, predictive, recovery
        "current_day": 5,
        "logs": [
            {"day": 1, "timestamp": "03:40", "sleep_onset": "23:15", "delta_minutes": 265},
            {"day": 2, "timestamp": "03:45", "sleep_onset": "23:30", "delta_minutes": 255},
            {"day": 3, "timestamp": "03:42", "sleep_onset": "23:00", "delta_minutes": 282},
            {"day": 4, "timestamp": "03:38", "sleep_onset": "23:10", "delta_minutes": 268},
            {"day": 5, "timestamp": "03:41", "sleep_onset": "23:20", "delta_minutes": 261}
        ],
        "target_hour": 3,
        "target_minute": 41,
        "pre_wake_minutes_offset": 15
    }

def save_database(data):
    with open(DEFAULT_DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

def calculate_circadian_anchor(logs):
    if not logs:
        return 3, 45 # Default fallback (3:45 AM)
    
    total_minutes = 0
    for log in logs:
        time_parts = log["timestamp"].split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1])
        total_minutes += (hour * 60 + minute)
    
    avg_minutes = total_minutes // len(logs)
    avg_hour = avg_minutes // 60
    avg_minute = avg_minutes % 60
    return avg_hour, avg_minute

def print_tui(frame_type, format_dict=None):
    if format_dict is None:
        format_dict = {}
    
    # Add ANSI Color Codes for terminal beauty (cozy blues and amber yellows)
    blue = "\033[38;5;39m"
    amber = "\033[38;5;214m"
    green = "\033[38;5;34m"
    magenta = "\033[38;5;129m"
    reset = "\033[0m"
    
    frame_text = FRAMES.get(frame_type, "").format(**format_dict)
    
    # Beautify strings with color mappings
    frame_text = frame_text.replace("[ooo]", f"[{blue}ooo{reset}]")
    frame_text = frame_text.replace("[~~~]", f"[{amber}~~~{reset}]")
    frame_text = frame_text.replace("[   ]", f"[{green}   {reset}]")
    frame_text = frame_text.replace("~~~\033[0m)", f"~~~\033[0m)")
    frame_text = frame_text.replace("ACTIVE", f"{green}ACTIVE{reset}")
    frame_text = frame_text.replace("LOCKED", f"{magenta}LOCKED{reset}")
    
    print(frame_text)

def main():
    db = load_database()
    
    if len(sys.argv) < 2:
        print("\n\033[38;5;214m[mbb:moisture-anticipator]\033[0m Run with arguments:")
        print("  simulate-log <HH:MM>  - Log a silent baseline moisture check (e.g., 03:41)")
        print("  analyze               - Run circadian pattern calculation on the last 7 days")
        print("  status                - Display the current active TUI dashboard frame")
        print("  predictive-start      - Trigger the 15-minute sub-sensory haptic cycle")
        print("  predictive-light      - Trigger the 5-minute warm amber lighting route")
        print("  midnight-slip         - Enter conscious, zero-friction awake/washroom mode")
        print("  reset-night           - Clear alerts and restore ambient dark state\n")
        return

    command = sys.argv[1].lower()

    if command == "simulate-log":
        if len(sys.argv) < 3:
            print("Please specify a time stamp (e.g. 03:41)")
            return
        time_str = sys.argv[2]
        db["logs"].append({
            "day": len(db["logs"]) + 1,
            "timestamp": time_str,
            "sleep_onset": "23:00",
            "delta_minutes": 270
        })
        db["current_day"] = min(7, len(db["logs"]) + 1)
        if len(db["logs"]) >= 7:
            db["phase"] = "predictive"
            avg_h, avg_m = calculate_circadian_anchor(db["logs"])
            db["target_hour"] = avg_h
            db["target_minute"] = avg_m
        save_database(db)
        print(f"\033[38;5;34m[mbb:moisture-anticipator]\033[0m Passive baseline data logged silently. Day {db['current_day']-1}/7 compiled.")
        
    elif command == "analyze":
        avg_h, avg_m = calculate_circadian_anchor(db["logs"])
        db["target_hour"] = avg_h
        db["target_minute"] = avg_m
        save_database(db)
        
        target_time = f"{avg_h:02d}:{avg_m:02d}"
        wake_dt = datetime.strptime(target_time, "%H:%M")
        pref_dt = wake_dt - timedelta(minutes=db["pre_wake_minutes_offset"])
        pref_time = pref_dt.strftime("%H:%M")
        
        print(f"\n\033[38;5;129m=== CIRCADIAN TEMPORAL DEEP ANALYSIS ===\033[0m")
        print(f"  • Raw Baseline Samples: {len(db['logs'])} recorded events")
        print(f"  • Calculated Bladder Pressure Window: \033[38;5;214m{target_time} AM\033[0m")
        print(f"  • Phase-Locked Preventive Intervention: \033[38;5;34m{pref_time} AM\033[0m (15-Minute Offset)")
        print(f"  • Somatic Tuning Status: Ready for peaceful, no-alarm sleep cycle.\n")

    elif command == "status":
        if db["phase"] == "diagnostic":
            print_tui("diagnostic", {"day": db["current_day"]})
        else:
            avg_h, avg_m = calculate_circadian_anchor(db["logs"])
            target_time = f"{avg_h:02d}:{avg_m:02d}"
            print_tui("diagnostic", {"day": len(db["logs"])})
            print(f"  • \033[38;5;39m[CALIBRATION COMPCOMPLETE]\033[0m Circadian Peak Target Locked: {target_time} AM")

    elif command == "predictive-start":
        print_tui("anticipatory_haptic")
        print("\033[38;5;214m[mbb:haptic]\033[0m Haptic bracelet pulsing slowly in a calming, asymmetric rhythm.")
        print("\033[38;5;214m[mbb:acoustic]\033[0m Bedside speaker fading in acoustic sounds of a gentle creek (0% -> 15% volume).")

    elif command == "predictive-light":
        print_tui("anticipatory_light")
        print("\033[38;5;214m[mbb:lighting]\033[0m Smart baseboard lights initialized at 0.5% amber intensity. Visual path ready.")

    elif command == "midnight-slip":
        print_tui("conscious_wake")
        print("\033[38;5;34m[mbb:tts]\033[0m Director whispers softly over pillow: 'It is okay. Stand up slowly. Path is clear.'")
        print("\033[38;5;34m[mbb:caretaker]\033[0m Dispatching silent alert to earbud whitelist: 'Safe-state washroom check initiated.'")

    elif command == "reset-night":
        print_tui("recovering")
        print("\033[38;5;39m[mbb:environment]\033[0m Smart lights dimming back to zero. Restoring deep, dark safety.")

if __name__ == "__main__":
    main()
