
import argparse
import sqlite3
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/app')))
from db_paths import get_careplan_db_path

# --- Feature engineering helpers ---
def get_day_of_week(dt):
    return dt.weekday()

def get_hour_of_day(dt):
    return dt.hour

def build_features(db_path):
    print(f"[DEBUG] build_features() using db_path: {db_path}")
    conn = sqlite3.connect(db_path)
    tasks = pd.read_sql_query("SELECT * FROM tasks", conn)
    events = pd.read_sql_query("SELECT * FROM task_events", conn)
    # Only use COMPLETED or MISSED
    tasks = tasks[tasks['status'].isin(['COMPLETED', 'MISSED'])].copy()
    # Parse datetimes
    tasks['scheduled_at'] = pd.to_datetime(tasks['scheduled_at'])
    tasks['completed_at'] = pd.to_datetime(tasks['completed_at'], errors='coerce')
    events['event_at'] = pd.to_datetime(events['event_at'])
    # Precompute reminders sent per task
    reminders = events[events['event_type']=='REMINDER_SENT'].groupby('task_id').size().to_dict()
    # Precompute previous misses/completions per user
    user_task_history = defaultdict(list)
    features = []
    for idx, row in tasks.iterrows():
        task_id = row['id']
        user_id = row.get('user_id', None)
        sched = row['scheduled_at']
        completed = row['completed_at']
        status = row['status']
        # Label
        missed = 1 if status == 'MISSED' else 0
        # Features
        day_of_week = get_day_of_week(sched)
        hour_of_day = get_hour_of_day(sched)
        same_day = tasks[(tasks['user_id']==user_id) & (tasks['scheduled_at'].dt.date==sched.date())]
        tasks_scheduled_same_day = len(same_day)
        # Previous 7d misses
        prev_7d = [t for t in user_task_history[user_id] if t['scheduled_at'] < sched and t['scheduled_at'] >= sched - timedelta(days=7)]
        previous_misses_7d = sum(1 for t in prev_7d if t['status']=='MISSED')
        # Completion streak
        streak = 0
        for t in reversed(user_task_history[user_id]):
            if t['status']=='COMPLETED':
                streak += 1
            else:
                break
        completion_streak = streak
        # Avg minutes to complete (last 5 tasks)
        last_tasks = [t for t in user_task_history[user_id] if t['completed_at'] is not pd.NaT and t['completed_at'] < sched]
        last_tasks = sorted(last_tasks, key=lambda x: x['completed_at'], reverse=True)[:5]
        if last_tasks:
            avg_minutes_to_complete = sum((t['completed_at']-t['scheduled_at']).total_seconds()/60 for t in last_tasks)/len(last_tasks)
        else:
            avg_minutes_to_complete = -1
        reminder_enabled = int(row.get('reminder_enabled', 1))
        number_of_reminders_sent_for_task = reminders.get(task_id, 0)
        features.append({
            'task_id': task_id,
            'user_id': user_id,
            'day_of_week': day_of_week,
            'hour_of_day': hour_of_day,
            'tasks_scheduled_same_day': tasks_scheduled_same_day,
            'previous_misses_7d': previous_misses_7d,
            'completion_streak': completion_streak,
            'avg_minutes_to_complete': avg_minutes_to_complete,
            'reminder_enabled': reminder_enabled,
            'number_of_reminders_sent_for_task': number_of_reminders_sent_for_task,
            'missed': missed
        })
        user_task_history[user_id].append({
            'scheduled_at': sched,
            'completed_at': completed,
            'status': status
        })
    df = pd.DataFrame(features)
    return df

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db_path', required=True)
    parser.add_argument('--out_csv', required=True)
    args = parser.parse_args()
    df = build_features(args.db_path)
    df.to_csv(args.out_csv, index=False)
    print(f"Wrote {len(df)} rows to {args.out_csv}")

if __name__ == '__main__':
    main()
