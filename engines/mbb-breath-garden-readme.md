# 🌿 The mbb Somatic Breath & Moss Garden (TUI)
## Unified Biological Telemetry for Low-Spoon Caretaking

The **Somatic Breath & Moss Garden** is a lightweight, system-agnostic, and self-hosted terminal widget engineered to translate your passive existence and active somatic movement directly into a thriving visual sanctuary.

Unlike standard fitness and medical trackers that require continuous manual data entry, pushy alarm configurations, or high-friction cloud accounts, this widget operates entirely on **passive and local event-sourcing principles**. It runs seamlessly within your decoupled markdown database (`mddb`) on your 1GB RackNerd VPS, taking up absolutely zero battery life and zero mental spoons.

---

### 🛡️ The Core Philosophy: "Existing is Meaningful Work"

Traditional productivity applications operate under a high-vigilance "deficit model"—if you are too exhausted to log your stats, they display angry red indicators, empty charts, or warning notices, triggering a task-avoidance and shame spiral.

This garden completely rejects that paradigm:
1. **Passive Respiration Accumulation:** The background state engine estimates your baseline respiration rate (approx. 12-16 breaths per minute) simply by tracking the passage of time since your last log. If you are having an intense executive freeze, a severe migraine prodrome, or are simply resting horizontally, **your breathing is still actively growing green moss across the baseline of your screen.** Simply by existing, you are doing meaningful work.
2. **Kinetic Growth Synergy:**
   * **The Baseline Moss:** Grows lush and green as you breathe, proving your lungs are doing valuable, somatic labor.
   * **The Soughing Ferns (`*|*`):** Sprout and branch out dynamically as you register daily movement steps.
   * **The Velvet Rosettes (`_/*\_`):** Bloom with vibrant purple flowers when both your respiratory baseline and kinetic steps are active, reflecting optimal systemic energy levels.
3. **Compostable Failures:** There are no "broken habit streaks." If you stay stationary for a day, the flowers don't die in shame; the garden simply settles into a soft, restful baseline, waiting patiently for your next spark of movement.

---

### 🎨 Visual State Transitions (Strict 4-Line Padded Terminal Grid)

To prevent terminal layouts from tearing or flickering during rendering, the entire garden is mathematically locked to a 4-line space-padded visual layout:

#### **Stage 1: Sovereign Rest (Passive Existence Only)**
You are lying completely still, recovering from a migraine or processing stress. The flowers and ferns sleep, but your passive respiration is still nourishing a clean baseline.
```text
                                                            <- [ PASSIVE BREATHS: 1,420 ]
   ( ._._. )                 ( ._._. )                      (Existing is doing meaningful work)
   ====Y=======================Y=====                       <- [ PHYSICAL STEPS: 0 ]
  _/\\________________________/\\_
```

#### **Stage 2: Kinetic Sprouting (Steps Registered)**
You have moved around your room, logging some steps. The ferns begin to sprout their initial stems, and the baseline moss starts to thicken.
```text
           |                                                <- [ PASSIVE BREATHS: 2,150 ]
   ( ._._. )    \|/          ( ._._. )                      (Existing is doing meaningful work)
   ====Y========Y==============Y=====                       <- [ PHYSICAL STEPS: 2,500 ]
  _/\\_..____,,_..____,,____.._/\\_
```

#### **Stage 3: Full Canopy Synergy (High Energy & Movement)**
Your physical steps and your deep breathing sync up, prompting both gorgeous velvet flowers to open their purple petals and the ferns to fully expand.
```text
    _/*\\_     *|* *|*     _/*\\_                           <- [ PASSIVE BREATHS: 8,450 ]
   (_@_@_)     \\|/ \\|/     (_@_@_)                          (Existing is doing meaningful work)
   ====Y========Y===Y==========Y=====                       <- [ PHYSICAL STEPS: 12,400 ]
  _/\\_..__U_,,_.._.._,,_U__.._/\\_
```

---

### ⚙️ VPS CLI Command API

You can programmatically trigger step and breath logs from local cron-jobs, Tasker widgets, or voice-macro intents:

* **Log Steps (e.g., from a fitness band webhook):**
  ```bash
  python3 mbb-breath-garden.py step 1500
  ```
* **Log Active Breaths (e.g., after an anxiety-calming routine):**
  ```bash
  python3 mbb-breath-garden.py breath 80
  ```
* **Fetch the Visual TUI Frame (to display in your dashboard):**
  ```bash
  python3 mbb-breath-garden.py status
  ```

This garden is a beautiful, peaceful, and deeply respectful testament to somatic recovery. It honors your body's physical limits while celebrating your quiet, resilient growth simply by staying open and staying alive.
