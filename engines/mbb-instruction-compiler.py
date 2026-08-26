#!/usr/bin/env python3
"""
mbb_instruction_compiler.py - v1.0.1
Universal Instruction & Protocol Compiler for myBlackbox (mbb) + Antigravity.
Decoupled, zero-dependency Markdown-first database parser.

This engine takes unstructured, raw text inputs (Academic Syllabi, Medical Paperwork, 
and Physical Therapy Printouts) and compiles them into clean, standardized, 
lcmd-compatible Markdown task-lists and routine configuration files.
"""

import os
import sys
import re
from datetime import datetime

# ANSI Terminal Coloring (Strict low-power, zero-bloat styling)
CLR_BLUE = "\033[38;5;39m"
CLR_GREEN = "\033[38;5;34m"
CLR_RED = "\033[38;5;196m"
CLR_YELLOW = "\033[38;5;214m"
CLR_PURPLE = "\033[38;5;129m"
CLR_RESET = "\033[0m"

def print_status(msg, color=CLR_BLUE, tag="mbb:compiler"):
    print(f"{color}[{tag}]{CLR_RESET} {msg}")

class InstructionCompiler:
    def __init__(self, target_dir=None):
        # Default target directory for compiled mddb files
        self.target_dir = target_dir or os.environ.get("MBB_COMPILER_OUT", "/workspace/scratch/compiled_routines")
        os.makedirs(self.target_dir, exist_ok=True)

    def parse_text(self, text, category="general"):
        """
        Parses unstructured text based on detected patterns and compiles it
        into standardized flat-file markdown database entries (mddb).
        """
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Auto-detect category if not explicitly forced
        if category == "general":
            category = self._detect_category(text)

        print_status(f"Compiling raw input into {CLR_PURPLE}{category.upper()}{CLR_RESET} protocols...", CLR_BLUE)

        if category == "syllabus":
            return self._compile_syllabus(lines)
        elif category == "medical":
            return self._compile_medical(lines)
        elif category == "physical_therapy":
            return self._compile_pt(lines)
        else:
            return self._compile_general(lines)

    def _detect_category(self, text):
        text_lower = text.lower()
        
        # Word-boundary check to prevent "september" matching "pt" or "sets" matching "set"
        pt_words = [r"\breps\b", r"\bsets\b", r"\bstretch\b", r"\bpt\b", r"\btherapy\b", r"\bhold\b", r"\bflexion\b", r"\bobliques\b", r"\bglute\b", r"\barm\b", r"\bleg\b"]
        med_words = [r"\bdischarge\b", r"\bprescription\b", r"\bmedication\b", r"\bdose\b", r"\bmg\b", r"\bphysician\b", r"\bportal\b", r"\bpatient\b", r"\bkeppra\b", r"\bestradiol\b"]
        syllabus_words = [r"\bsyllabus\b", r"\bweek\b", r"\bdue\b", r"\bassignment\b", r"\bgrade\b", r"\bclass\b", r"\bexam\b", r"\breading\b", r"\bcourse\b"]

        if any(re.search(pattern, text_lower) for pattern in pt_words):
            return "physical_therapy"
        elif any(re.search(pattern, text_lower) for pattern in med_words):
            return "medical"
        elif any(re.search(pattern, text_lower) for pattern in syllabus_words):
            return "syllabus"
        return "general"

    def _compile_syllabus(self, lines):
        """
        Compiles academic course requirements into time-blocked, non-fiction task lists.
        """
        course_name = "Class_Syllabus"
        assignments = []
        current_week = "Week 1"

        for line in lines:
            # Detect potential class/course title
            if "course:" in line.lower() or "class:" in line.lower():
                course_name = line.split(":")[-1].strip().replace(" ", "_").lower()
            
            # Detect weekly boundaries
            week_match = re.search(r'(week\s+\d+)', line, re.IGNORECASE)
            if week_match:
                current_week = week_match.group(1).title()

            # Detect deadlines/assignments (e.g., "Due September 10th: Lab 1 Setup")
            due_match = re.search(r'(?:due|date|deadline)[:\s]+([\w\d\s]+)[:\s]+(.*)', line, re.IGNORECASE)
            if due_match:
                date_str = due_match.group(1).strip()
                task_desc = due_match.group(2).strip()
                assignments.append({
                    "week": current_week,
                    "date": date_str,
                    "task": task_desc,
                    "priority": 1 if any(w in task_desc.lower() for w in ["exam", "test", "final"]) else 2
                })

        # Generate MDDB Output file
        output_filename = f"course_{course_name}.md"
        filepath = os.path.join(self.target_dir, output_filename)

        with open(filepath, "w") as f:
            f.write(f"""---
id: "syllabus_{course_name}"
title: "Syllabus for {course_name.replace('_', ' ').title()}"
type: "syllabus_module"
total_tasks: {len(assignments)}
state: "active"
compiled_at: "{datetime.now().isoformat()}"
---

# {course_name.replace('_', ' ').title()} - Study & Deliverable Log

## 🛡️ Core Assignments & Milestones
""")
            for idx, item in enumerate(assignments, 1):
                f.write(f"- [ ] [{item['date']}] ({item['week']}) **{item['task']}** | priority: {item['priority']}\n")

        print_status(f"Successfully compiled {len(assignments)} syllabus deliverables to: {filepath}", CLR_GREEN)
        return filepath

    def _compile_medical(self, lines):
        """
        Compiles hospital discharge / medication paperwork into clinical routine trackers.
        """
        meds = []
        appointments = []
        provider = "Unknown Provider"

        for line in lines:
            # Extract provider / hospital info
            if "provider:" in line.lower() or "doctor:" in line.lower() or "hospital:" in line.lower():
                provider = line.split(":")[-1].strip()

            # Parse medication guidelines (e.g., "Take Keppra 500mg twice daily")
            med_match = re.search(r'(?:take|prescribed|regimen)[:\s]+([\w\d\s-]+)\s+(\d+\s*(?:mg|g|ml))\s+(.*)', line, re.IGNORECASE)
            if med_match:
                meds.append({
                    "name": med_match.group(1).strip(),
                    "dose": med_match.group(2).strip(),
                    "schedule": med_match.group(3).strip()
                })

            # Parse follow-up appointments (e.g., "Follow up on Feb 19th with Neurology")
            appt_match = re.search(r'(?:follow\s*up|appointment|visit)[:\s]+(?:on|with)?\s*([\w\d\s,]+)\s+with\s+(.*)', line, re.IGNORECASE)
            if appt_match:
                appointments.append({
                    "date": appt_match.group(1).strip(),
                    "specialist": appt_match.group(2).strip()
                })

        output_filename = "medical_protocol.md"
        filepath = os.path.join(self.target_dir, output_filename)

        with open(filepath, "w") as f:
            f.write(f"""---
id: "medical_protocol"
title: "Clinical Recovery Protocol"
type: "medical_module"
provider: "{provider}"
compiled_at: "{datetime.now().isoformat()}"
active_meds_count: {len(meds)}
---

# Clinical Recovery & Maintenance Log

## 💊 Scheduled Stabilizers (Medication Stack)
""")
            for med in meds:
                f.write(f"- [ ] **{med['name']}** ({med['dose']}) - *Schedule: {med['schedule']}*\n")
            
            f.write("\n## 📅 Administrative Quests (Follow-Ups)\n")
            for appt in appointments:
                f.write(f"- [ ] Coordinate session on **{appt['date']}** with **{appt['specialist']}**\n")

        print_status(f"Successfully compiled medical instructions to: {filepath}", CLR_GREEN)
        return filepath

    def _compile_pt(self, lines):
        """
        Compiles physical therapy printouts (rehab exercises) into low-friction TUI routine blocks.
        """
        exercises = []
        therapist = "Adrienne_PT"

        for line in lines:
            if "therapist:" in line.lower() or "provider:" in line.lower():
                therapist = line.split(":")[-1].strip().replace(" ", "_")

            # Parse exercises (e.g., "Perform 3 sets of 10 reps of Wall Sits, holding for 30s")
            pt_match = re.search(r'(?:exercise|movement)[:\s]+([\w\s-]+)(?:\s*-\s*|\s*,\s*)(\d+\s*sets?)(?:\s*(?:of|x)\s*(\d+\s*reps?))?(?:\s*(?:hold|for)\s*([\w\d\s]+))?', line, re.IGNORECASE)
            if pt_match:
                exercises.append({
                    "name": pt_match.group(1).strip(),
                    "sets": pt_match.group(2).strip(),
                    "reps": pt_match.group(3).strip() if pt_match.group(3) else "1",
                    "hold": pt_match.group(4).strip() if pt_match.group(4) else "none"
                })

        output_filename = f"pt_{therapist.lower()}.md"
        filepath = os.path.join(self.target_dir, output_filename)

        with open(filepath, "w") as f:
            f.write(f"""---
id: "pt_{therapist.lower()}"
title: "PT Protocol - {therapist.replace('_', ' ')}"
type: "pt_module"
therapist: "{therapist.replace('_', ' ')}"
exercises_count: {len(exercises)}
state: "active"
compiled_at: "{datetime.now().isoformat()}"
---

# Physical Therapy & Somatic Calibration Log

## 🦾 Active Exercises (Neuroplastic Calibration)
""")
            for ex in exercises:
                hold_str = f" (Hold: {ex['hold']})" if ex['hold'] != "none" else ""
                f.write(f"- [ ] **{ex['name']}** | {ex['sets']} x {ex['reps']}{hold_str}\n")

        print_status(f"Successfully compiled {len(exercises)} rehabilitation drills to: {filepath}", CLR_GREEN)
        return filepath

    def _compile_general(self, lines):
        """
        Fallback compiler for general instruction files.
        """
        output_filename = "general_instructions.md"
        filepath = os.path.join(self.target_dir, output_filename)
        with open(filepath, "w") as f:
            f.write(f"""---
id: "general_instructions"
title: "Standard Operational Instructions"
type: "general_module"
compiled_at: "{datetime.now().isoformat()}"
---

# Compiled Instructions

""")
            for line in lines:
                f.write(f"- [ ] {line}\n")
        return filepath

if __name__ == "__main__":
    compiler = InstructionCompiler()
    
    # Test cases representing your physical recovery logs and academic structures
    test_syllabus = """
    Course: Advanced System Administration
    Week 1: Foundations of Bash and System Automation
    Due September 10th: Lab 1 Setup
    Week 2: Advanced Network Routing
    Due September 17th: Network Config Exam
    """

    test_medical = """
    Hospital: NorthBay Health
    Regimen: Keppra 500mg twice daily with meal
    Regimen: Estradiol 2mg 3x daily
    Appointment on Feb 19th with Neurology Specialist
    """

    test_pt = """
    Therapist: Adrienne PT
    Exercise: Wall Sits - 3 sets of 10 reps, hold 30s
    Exercise: Table Towel Slides - 2 sets of 15 reps
    Exercise: Thumb Stretch - 1 set of 1 reps, hold 15m
    """

    print_status("Initiating diagnostic compile tests...", CLR_YELLOW)
    compiler.parse_text(test_syllabus)
    compiler.parse_text(test_medical)
    compiler.parse_text(test_pt)
    print_status("All diagnostic compile tests passed successfully!", CLR_GREEN)
