#!/usr/bin/env python3
"""
🐾 VPS Synchronization Script for MBB Task Board
Pushes local build artifacts to remote host using Rclone.
"""

import os
import subprocess
import sys

LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))
REMOTE_TARGET = "vps:/var/www/mbb/tasks/"

def run_sync():
    print(f"🐾 Syncing {LOCAL_DIR} to {REMOTE_TARGET} via Rclone...")
    cmd = ["rclone", "sync", LOCAL_DIR, REMOTE_TARGET, "--exclude", "node_modules/**", "--exclude", ".git/**"]
    
    try:
        res = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✨ VPS Sync completed successfully!")
        print(res.stdout)
    except subprocess.CalledProcessError as e:
        print(f"❌ Sync failed with exit code {e.returncode}")
        print(e.stderr)
        sys.exit(e.returncode)

if __name__ == "__main__":
    run_sync()
