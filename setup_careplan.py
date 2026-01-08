#!/usr/bin/env python3
"""
Quick setup script for Care Plan Component
Sets up database, exports ML model, and verifies setup
"""
import os
import sys
import subprocess

def run_command(cmd, cwd=None, description=""):
    """Run a command and handle errors"""
    print(f"\n{'='*70}")
    if description:
        print(f"STEP: {description}")
    print(f"Running: {' '.join(cmd)}")
    print(f"{'='*70}")
    
    try:
        result = subprocess.run(
            cmd, 
            cwd=cwd, 
            check=True, 
            capture_output=True, 
            text=True
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        print("✓ Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error (exit code {e.returncode})")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False

def main():
    repo_root = r"e:\Research\AloeVeraMate"
    training_behavior_dir = os.path.join(repo_root, "apps", "training_behavior")
    server_dir = os.path.join(repo_root, "apps", "server")
    
    print("="*70)
    print("CARE PLAN COMPONENT SETUP")
    print("="*70)
    print(f"\nRepository: {repo_root}")
    print(f"Training: {training_behavior_dir}")
    print(f"Server: {server_dir}")
    
    # Step 1: Create careplan database with synthetic data
    print("\n\n" + "="*70)
    print("STEP 1: Creating careplan database with synthetic data")
    print("="*70)
    
    if not run_command(
        [sys.executable, "simulate_data.py", "--reset-db"],
        cwd=training_behavior_dir,
        description="Generate synthetic careplan data"
    ):
        print("\n⚠ Failed to create database. Continuing anyway...")
    
    # Step 2: Export behavior model to server
    print("\n\n" + "="*70)
    print("STEP 2: Exporting behavior model to server")
    print("="*70)
    
    model_dest = os.path.join(server_dir, "artifacts", "behavior")
    
    if not run_command(
        [sys.executable, "export.py", "--dest", model_dest],
        cwd=training_behavior_dir,
        description="Export behavior ML model"
    ):
        print("\n⚠ Failed to export model. Continuing anyway...")
    
    # Step 3: Verify setup
    print("\n\n" + "="*70)
    print("STEP 3: Verifying setup")
    print("="*70)
    
    run_command(
        [sys.executable, "test_careplan_component.py"],
        cwd=repo_root,
        description="Verify careplan component"
    )
    
    print("\n\n" + "="*70)
    print("SETUP COMPLETE")
    print("="*70)
    print("\nNext steps:")
    print("1. Set GEMINI_API_KEY environment variable (for chat functionality)")
    print("2. Start the server: cd apps/server && python run.py")
    print("3. Test endpoints: python component3_backend_acceptance_test.py")
    print("\n")

if __name__ == "__main__":
    main()
