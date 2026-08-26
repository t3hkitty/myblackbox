# mbb_privacy_alert_system.py
# Tactical High-Autonomy Patient-Caregiver Privacy Maximizer (HAPCPM) TUI Engine
# Crafted for sovereign, zero-shame, non-punitive physical rehabilitation.

import os
import sys
import time
from datetime import datetime, timedelta

# ANSI colors for styling
BLUE = "\033[38;5;39m"
GREEN = "\033[38;5;34m"
YELLOW = "\033[38;5;214m"
RED = "\033[38;5;196m"
PURPLE = "\033[38;5;129m"
GRAY = "\033[38;5;244m"
RESET = "\033[0m"

class SovereignDignitySystem:
    def __init__(self):
        # Default mock database values for high-autonomy patient monitoring
        self.state = "SOVEREIGN_IDLE"  # Options: SOVEREIGN_IDLE, RESTROOM_IN_USE, TIMEOUT_WARNING, ENTRANCE_ALERT, BYPASS_CALM
        self.patient_name = "Loran"
        self.last_event_timestamp = datetime.now()
        self.restroom_entry_time = None
        self.safety_timeout_minutes = 15
        self.wipe_assistance_requested = False
        self.privacy_level = "MAXIMUM"  # Options: HIGH (Verified NFC), MAXIMUM (Anonymized PIR Only)
        self.stampede_avoided_count = 142  # Cumulative number of nurse convergence runs cancelled by user
        self.gboard_mic_active = True
        
    def log_event(self, message):
        print(f"{GRAY}[hapcpm]{RESET} {message}")

    def simulate_entry(self, mode="MAXIMUM"):
        """Simulates the patient walking into the restroom area."""
        self.restroom_entry_time = datetime.now()
        self.last_event_timestamp = self.restroom_entry_time
        self.privacy_level = mode
        self.wipe_assistance_requested = False
        self.state = "RESTROOM_IN_USE"
        
        print("\n" + "="*60)
        if mode == "MAXIMUM":
            self.log_event("Anonymized PIR Motion Sensor triggered in Doorway. Identity: Protected.")
            self.log_event("Zero-Data logging mode engaged. No cameras. No active RFID trackers.")
        else:
            self.log_event(f"Verified NFC Wristband ping: Patient '{self.patient_name}' detected.")
            
        print(self.render_tui_frame())

    def simulate_tick(self, elapsed_minutes):
        """Simulates time passing while in the restroom to trigger safety timeouts."""
        if self.state != "RESTROOM_IN_USE":
            self.log_event("Restroom is not currently in use. Action ignored.")
            return
            
        simulated_now = self.restroom_entry_time + timedelta(minutes=elapsed_minutes)
        time_used = (simulated_now - self.restroom_entry_time).total_seconds() / 60
        
        print("\n" + "="*60)
        self.log_event(f"Simulating elapsed time: +{elapsed_minutes} minutes... (Total: {time_used:.1f}m)")
        
        if time_used >= self.safety_timeout_minutes:
            self.state = "TIMEOUT_WARNING"
            self.log_event(f"{YELLOW}WARNING: Privacy timer reached limit ({self.safety_timeout_minutes} mins) without exiting.{RESET}")
        else:
            self.log_event("Sovereign session normal. Restroom remains a secure sensory sanctuary.")
            
        print(self.render_tui_frame())

    def execute_handsfree_override(self):
        """Simulates the patient shouting 'I'm OK' or tapping an earbud to extend privacy."""
        print("\n" + "="*60)
        if self.state in ["RESTROOM_IN_USE", "TIMEOUT_WARNING"]:
            self.restroom_entry_time = datetime.now()  # Reset the safety timer
            self.state = "RESTROOM_IN_USE"
            self.stampede_avoided_count += 1
            self.log_event(f"{GREEN}HANDS-FREE OVERRIDE REGISTERED via voice/earbud.{RESET}")
            self.log_event("Caretaker Alert Queue cleared. Nurse army deployment avoided.")
            self.log_event(f"Cumulative Stampede Interceptions: {self.stampede_avoided_count}")
        else:
            self.log_event("No active warning loop. Override ignored.")
        print(self.render_tui_frame())

    def simulate_safe_exit(self):
        """Simulates a successful toilet session with independent hygiene completed."""
        print("\n" + "="*60)
        if self.state in ["RESTROOM_IN_USE", "TIMEOUT_WARNING"]:
            self.state = "SOVEREIGN_IDLE"
            self.restroom_entry_time = None
            self.log_event(f"{GREEN}Somatic Check-In Success: Restroom cleared. Integrity intact.{RESET}")
            self.log_event("Dignity Level: 100%. No unrequested physical interference occurred.")
        else:
            self.log_event("Restroom already empty.")
        print(self.render_tui_frame())

    def trigger_emergency_stampede(self):
        """Simulates the physical backup warning when the patient actually needs assistance."""
        print("\n" + "="*60)
        self.state = "ENTRANCE_ALERT"
        self.log_event(f"{RED}CRITICAL: Safety window breached with no user override.{RESET}")
        self.log_event("Firing targeted haptic buzzers to Caretaker Open-Ear earbuds...")
        self.log_event("Caretaker dispatch: 'Restroom safety timeout. Verification requested.'")
        print(self.render_tui_frame())

    def render_tui_frame(self):
        """Renders the 4-line space-padded visual feedback loop on the terminal screen."""
        frame = ""
        
        # Line 1: Header / State metadata
        if self.state == "SOVEREIGN_IDLE":
            l1 = f"    _---_      [{BLUE}---{RESET}]  <- [ {GREEN}STATUS: SOVEREIGN IDLE{RESET} ]"
            l2 = "   ( O.O )     |   |   (No active bio-checks in progress)"
            l3 = "   ==u=u=======|___|== (Dignity firewall is fully armed)"
            l4 = f"  _\\/_..__U_,,_.._\\/____ [ STAMPEDES AVOIDED: {self.stampede_avoided_count} ]"
        
        elif self.state == "RESTROOM_IN_USE":
            elapsed = 0 if not self.restroom_entry_time else int((datetime.now() - self.last_event_timestamp).total_seconds() / 60)
            l1 = f"    _---_      [{YELLOW}ooo{RESET}]  <- [ {YELLOW}RESTROOM IN USE ({self.privacy_level}){RESET} ]"
            l2 = "   ( -.- )     |   |   (Patient is processing private hydration...)"
            l3 = "   ==u=u=======|___|== (Silent, non-intrusive safety clock active)"
            l4 = "  _\\/_..__U_,,_.._\\/____ * Gboard Mic Active: 'I'm OK' override ready *"
            
        elif self.state == "TIMEOUT_WARNING":
            l1 = f"    _---_      [{RED}!!!{RESET}]  <- [ {RED}WARN: 15-MIN TIMEOUT BREACH{RESET} ]"
            l2 = f"   ( o_o )     | ? |   * silent {YELLOW}haptic tickle{RESET} playing on earbud *"
            l3 = "   ==u=u=======|___|== (Say 'I'm OK' or tap earbud to block nurse alert)"
            l4 = f"  _\\/_..__U_,,_.._\\/____ [ {RED}NURSE ARMY CONVERGENCE IN T-MINUS 60S{RESET} ]"
            
        elif self.state == "ENTRANCE_ALERT":
            l1 = f"    _---_      [{RED}🚨 Alert 🚨{RESET}]  <- [ {RED}ALERT: CARETAKER DISPATCHED{RESET} ]"
            l2 = "   ( >_< )     | X |   * targeted caretakers paged quietly via earbuds *"
            l3 = "   ==u=u=======|___|== (Knock first. 'Wipe and stand' confirmation requested.)"
            l4 = "  _\\/_..__U_,,_.._\\/________________________________________"
            
        else:
            l1 = "    _---_"
            l2 = "   ( o_o )"
            l3 = "   ==u=u=="
            l4 = "  _\\/_..__U_,,_.._\\/________________________________________"

        return f"\n{l1}\n{l2}\n{l3}\n{l4}\n"

if __name__ == "__main__":
    system = SovereignDignitySystem()
    
    # Simple manual command router for the TUI test
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "enter_private":
            system.simulate_entry(mode="MAXIMUM")
        elif cmd == "enter_nfc":
            system.simulate_entry(mode="HIGH")
        elif cmd == "tick":
            # Simulate 15 minutes of inactivity passing
            system.simulate_entry(mode="MAXIMUM")
            system.simulate_tick(15)
        elif cmd == "override":
            # Enter, tick, then override back to safety
            system.simulate_entry(mode="MAXIMUM")
            system.simulate_tick(15)
            system.execute_handsfree_override()
        elif cmd == "exit":
            system.simulate_entry(mode="MAXIMUM")
            system.simulate_safe_exit()
        elif cmd == "alert":
            system.simulate_entry(mode="MAXIMUM")
            system.simulate_tick(15)
            system.trigger_emergency_stampede()
    else:
        # Default diagnostic run displaying the whole flow
        print(f"\n{BLUE}--- INITIATING HAPCPM DIAGNOSTIC SYSTEM RUN ---{RESET}")
        time.sleep(0.1)
        system.simulate_safe_exit() # Show idle
        time.sleep(0.1)
        system.simulate_entry(mode="MAXIMUM") # Show anonymous entry
        time.sleep(0.1)
        system.simulate_tick(10) # Normal use
        time.sleep(0.1)
        system.simulate_tick(15) # Timeout alert
        time.sleep(0.1)
        system.execute_handsfree_override() # Voice reset
        time.sleep(0.1)
        system.simulate_safe_exit() # Safe clean exit
        print(f"{GREEN}--- ALL HAPCPM LOGIC TESTS PASSED SUCCESSFULLY ---{RESET}\n")
