
import sqlite3
import os
import sys
from pathlib import Path
from app.db_paths import get_careplan_db_path
DB_PATH = get_careplan_db_path()

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
        event_type TEXT CHECK(event_type IN ('REMINDER_SENT','OPENED_TASK','COMPLETED','MISSED','RESCHEDULED')) NOT NULL,
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

def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    print(f"[DEBUG] repository.py using DB_PATH: {DB_PATH}")
    return sqlite3.connect(str(DB_PATH))

def migrate():
    with get_connection() as conn:
        c = conn.cursor()
        for stmt in SCHEMA:
            c.execute(stmt)
        conn.commit()

def health_check():
    try:
        with get_connection() as conn:
            c = conn.cursor()
            c.execute('SELECT 1 FROM plans LIMIT 1')
        return True, 'OK'
    except Exception as e:
        return False, str(e)
