import os
import sys
import sqlite3
import argparse
import random
import string
import shutil
import subprocess
from datetime import datetime, timedelta


# --- DB path resolution (shared) ---
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/app')))
from db_paths import get_careplan_db_path, get_repo_root
DB_PATH = str(get_careplan_db_path())
DB_DIR = os.path.dirname(DB_PATH)

SCHEMA = [
    '''CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        disease_id TEXT NOT NULL,
        disease_name TEXT NOT NULL,
        treatment_mode TEXT CHECK(treatment_mode IN ('SCIENTIFIC','AYURVEDIC')) NOT NULL,
        start_date TEXT NOT NULL,
        created_at TEXT NOT NULL
    )''',
    '''CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        user_id TEXT,
        title TEXT NOT NULL,
        details TEXT,
        scheduled_at TEXT NOT NULL,
        status TEXT CHECK(status IN ('PENDING','COMPLETED','MISSED')) NOT NULL,
        completed_at TEXT,
        reminder_enabled INTEGER NOT NULL,
        reminder_offsets_minutes TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(plan_id) REFERENCES plans(id)
    )''',
    '''CREATE TABLE IF NOT EXISTS task_events (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        event_type TEXT CHECK(event_type IN ('REMINDER_SENT','OPENED_TASK','COMPLETED','MISSED','RESCHEDULED','POLICY_APPLIED')) NOT NULL,
        event_at TEXT NOT NULL,
        meta_json TEXT,
        FOREIGN KEY(task_id) REFERENCES tasks(id)
    )''',
    '''CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        role TEXT CHECK(role IN ('user','assistant')) NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(plan_id) REFERENCES plans(id)
    )'''
]

def ensure_db(reset=False):
    os.makedirs(DB_DIR, exist_ok=True)
    print(f"[DEBUG] Resolved DB_PATH: {DB_PATH}")
    print(f"[DEBUG] Repo root: {get_repo_root()}")
    print(f"[DEBUG] Current working directory: {os.getcwd()}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    if reset:
        # Drop all tables in dependency order
        for tbl in ['task_events', 'chat_messages', 'tasks', 'plans']:
            c.execute(f'DROP TABLE IF EXISTS {tbl}')
        conn.commit()
    # Always run CREATE TABLE IF NOT EXISTS to ensure schema
    for stmt in SCHEMA:
        c.execute(stmt)
    conn.commit()  # Commit table creation regardless of reset
    # Verification log: print tables
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in c.fetchall()]
    print(f"[ensure_db] Tables in DB: {tables}")
    # Print tasks table columns
    c.execute("PRAGMA table_info(tasks)")
    task_cols = [row[1] for row in c.fetchall()]
    print(f"[ensure_db] tasks columns: {task_cols}")
    if 'user_id' not in task_cols:
        print("FAIL: tasks table missing user_id column. Stopping.")
        exit(1)
    conn.close()

def random_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

def generate_synthetic_data(users=25, days=60, tasks_per_user=60, seed=None):
    if seed is not None:
        random.seed(seed)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    plans = []
    now = datetime.utcnow()
    plan_user_map = {}
    for u in range(users):
        plan_id = random_id()
        user_id = random_id()
        disease_id = random.choice(['d1','d2','d3'])
        disease_name = random.choice(['Aloe Rust','Aloe Rot','Healthy'])
        treatment_mode = random.choice(['SCIENTIFIC','AYURVEDIC'])
        start_date = (now - timedelta(days=random.randint(0,days))).isoformat()
        created_at = (now - timedelta(days=random.randint(0,days))).isoformat()
        c.execute('INSERT INTO plans (id, user_id, disease_id, disease_name, treatment_mode, start_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  (plan_id, user_id, disease_id, disease_name, treatment_mode, start_date, created_at))
        plans.append(plan_id)
        plan_user_map[plan_id] = user_id
    total_tasks = users * tasks_per_user
    missed_count = int(0.2 * total_tasks) + random.randint(0, int(0.1 * total_tasks))
    missed_indices = set(random.sample(range(total_tasks), missed_count))
    for i in range(total_tasks):
        plan_id = random.choice(plans)
        user_id = plan_user_map[plan_id]
        task_id = random_id()
        title = f"Task {i+1}"
        details = f"Synthetic task details {i+1}"
        scheduled_at = (now - timedelta(days=random.randint(0,days), hours=random.randint(0,23))).isoformat()
        status = 'MISSED' if i in missed_indices else 'COMPLETED'
        completed_at = (datetime.fromisoformat(scheduled_at) + timedelta(hours=random.randint(1,12))).isoformat() if status == 'COMPLETED' else None
        reminder_enabled = random.choice([0,1])
        reminder_offsets_minutes = '[60,10]'
        created_at = scheduled_at
        c.execute('INSERT INTO tasks (id, plan_id, user_id, title, details, scheduled_at, status, completed_at, reminder_enabled, reminder_offsets_minutes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  (task_id, plan_id, user_id, title, details, scheduled_at, status, completed_at, reminder_enabled, reminder_offsets_minutes, created_at))
        # Add some events
        if status == 'MISSED':
            c.execute('INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)',
                      (random_id(), task_id, 'MISSED', (datetime.fromisoformat(scheduled_at) + timedelta(hours=6)).isoformat(), None))
        else:
            c.execute('INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)',
                      (random_id(), task_id, 'COMPLETED', completed_at, None))
    conn.commit()
    # Print counts
    c.execute('SELECT COUNT(*) FROM plans')
    total_plans = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM tasks')
    total_tasks = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM tasks WHERE status='COMPLETED'")
    completed_tasks = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM tasks WHERE status='MISSED'")
    missed_tasks = c.fetchone()[0]
    miss_rate = missed_tasks / total_tasks if total_tasks else 0
    c.execute("SELECT COUNT(*) FROM tasks WHERE user_id IS NULL")
    null_user_id = c.fetchone()[0]
    print(f"total_plans: {total_plans}, total_tasks: {total_tasks}, completed_tasks: {completed_tasks}, missed_tasks: {missed_tasks}, miss_rate: {miss_rate:.2%}, null_user_id: {null_user_id}")
    if null_user_id > 0:
        print("FAIL: Some tasks have NULL user_id. Stopping.")
        exit(1)
    conn.close()

def run_training_pipeline():
    here = os.path.dirname(__file__)
    # Build dataset
    subprocess.run(['python', 'build_dataset.py', '--db_path', '../../server/data/careplan.db', '--out_csv', 'artifacts/behavior_dataset.csv'], check=True, cwd=here)
    # Train model
    subprocess.run(['python', 'train.py', '--csv', 'artifacts/behavior_dataset.csv', '--model', 'artifacts/model.joblib', '--schema', 'artifacts/feature_schema.json', '--model_type', 'logistic'], check=True, cwd=here)
    # Eval
    subprocess.run(['python', 'eval.py', '--csv', 'artifacts/behavior_dataset.csv', '--model', 'artifacts/model.joblib', '--metrics', 'artifacts/metrics.json'], check=True, cwd=here)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reset-db', action='store_true', help='Delete all careplan data before generating')
    parser.add_argument('--users', type=int, default=25)
    parser.add_argument('--days', type=int, default=60)
    parser.add_argument('--tasks-per-user', type=int, default=60)
    parser.add_argument('--seed', type=int, default=None)
    args = parser.parse_args()
    ensure_db(reset=args.reset_db)
    generate_synthetic_data(users=args.users, days=args.days, tasks_per_user=args.tasks_per_user, seed=args.seed)
    run_training_pipeline()

if __name__ == '__main__':
    main()
