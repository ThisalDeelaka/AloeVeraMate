import re
from fastapi import APIRouter, Body, HTTPException

# Ensure router is defined for endpoint registration
router = APIRouter(prefix="/careplan", tags=["Careplan"])
@router.post("/chat/{plan_id}")
def plan_chat(plan_id: str, body: dict = Body(...)):
    import uuid, datetime, json
    message = body.get('message', '').strip()
    if not message:
        raise HTTPException(400, "Message required")
    now = datetime.datetime.utcnow().isoformat()
    # Store user message
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO chat_messages (id, plan_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)", (str(uuid.uuid4()), plan_id, 'user', message, now))
        # Rule-based intent routing
        msg_lc = message.lower()
        reply = ""
        actions = []
        updated_tasks = []
        if 'today' in msg_lc:
            # Return today's pending tasks
            today = datetime.datetime.utcnow().date()
            c.execute("SELECT * FROM tasks WHERE plan_id=? AND status='PENDING'", (plan_id,))
            tasks = [dict(zip([col[0] for col in c.description], row)) for row in c.fetchall()]
            today_tasks = [t for t in tasks if t['scheduled_at'][:10] == today.isoformat()]
            if today_tasks:
                reply = f"You have {len(today_tasks)} pending task(s) today: " + ", ".join(t['title'] for t in today_tasks)
                actions.append('show_today_tasks')
                updated_tasks = today_tasks
            else:
                reply = "You have no pending tasks for today."
        elif 'reschedule' in msg_lc and re.search(r'\b(\d{1,2})(am|pm)\b', msg_lc):
            # Suggest reschedule
            m = re.search(r'\b(\d{1,2})(am|pm)\b', msg_lc)
            hour = int(m.group(1))
            if m.group(2) == 'pm' and hour != 12:
                hour += 12
            new_time = datetime.datetime.utcnow().replace(hour=hour, minute=0, second=0, microsecond=0)
            reply = f"Would you like to reschedule a task to {hour:02d}:00? Use the app's reschedule button."
            actions.append('suggest_reschedule')
        elif 'miss' in msg_lc or 'forgot' in msg_lc:
            reply = "It looks like you may miss a task. I recommend applying the Smart Reminder Plan for better results."
            actions.append('suggest_adaptive_policy')
        else:
            reply = "I'm here to help with your care plan. You can ask about today's tasks, rescheduling, or reminders."
            actions.append('show_plan')
        # Store assistant reply
        c.execute("INSERT INTO chat_messages (id, plan_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)", (str(uuid.uuid4()), plan_id, 'assistant', reply, now))
        conn.commit()
    return {"reply": reply, "actions": actions or None, "updated_tasks": updated_tasks or None}
from app.services.behavior_model import BehaviorModelCache
import numpy as np
def compute_features_for_task(task_id, conn):
    import pandas as pd
    # Load task and user history
    task = pd.read_sql_query(f"SELECT * FROM tasks WHERE id=?", conn, params=(task_id,)).iloc[0]
    user_id = task['user_id']
    scheduled_at = pd.to_datetime(task['scheduled_at'])
    # Get all tasks for user
    tasks = pd.read_sql_query("SELECT * FROM tasks WHERE user_id=?", conn, params=(user_id,))
    tasks['scheduled_at'] = pd.to_datetime(tasks['scheduled_at'])
    tasks['completed_at'] = pd.to_datetime(tasks['completed_at'], errors='coerce')
    # Get events
    events = pd.read_sql_query("SELECT * FROM task_events WHERE task_id=?", conn, params=(task_id,))
    events['event_at'] = pd.to_datetime(events['event_at'])
    # Features
    day_of_week = scheduled_at.weekday()
    hour_of_day = scheduled_at.hour
    tasks_scheduled_same_day = len(tasks[tasks['scheduled_at'].dt.date == scheduled_at.date()])
    prev_7d = tasks[(tasks['scheduled_at'] < scheduled_at) & (tasks['scheduled_at'] >= scheduled_at - pd.Timedelta(days=7))]
    previous_misses_7d = sum(prev_7d['status'] == 'MISSED')
    # Completion streak
    streak = 0
    for _, t in tasks[tasks['scheduled_at'] < scheduled_at].sort_values('scheduled_at', ascending=False).iterrows():
        if t['status'] == 'COMPLETED':
            streak += 1
        else:
            break
    completion_streak = streak
    # Avg minutes to complete (last 5 tasks)
    last_tasks = tasks[(tasks['completed_at'].notna()) & (tasks['completed_at'] < scheduled_at)].sort_values('completed_at', ascending=False).head(5)
    if len(last_tasks) > 0:
        avg_minutes_to_complete = ((last_tasks['completed_at'] - last_tasks['scheduled_at']).dt.total_seconds() / 60).mean()
    else:
        avg_minutes_to_complete = -1
    reminder_enabled = int(task.get('reminder_enabled', 1))
    number_of_reminders_sent_for_task = sum(events['event_type'] == 'REMINDER_SENT')
    features = {
        'day_of_week': day_of_week,
        'hour_of_day': hour_of_day,
        'tasks_scheduled_same_day': tasks_scheduled_same_day,
        'previous_misses_7d': previous_misses_7d,
        'completion_streak': completion_streak,
        'avg_minutes_to_complete': avg_minutes_to_complete,
        'reminder_enabled': reminder_enabled,
        'number_of_reminders_sent_for_task': number_of_reminders_sent_for_task
    }
    return features
def risk_band(prob):
    if prob < 0.4:
        return 'LOW'
    elif prob < 0.7:
        return 'MEDIUM'
    else:
        return 'HIGH'
def top_feature_reasons(model, features, feature_names, n=3):
    # For logistic regression, use coef_
    importances = None
    if hasattr(model, 'coef_'):
        importances = np.abs(model.coef_[0])
    elif hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    if importances is not None:
        sorted_idx = np.argsort(importances)[::-1]
        return [f"{feature_names[i]}: {features[feature_names[i]]}" for i in sorted_idx[:n]]
    return []
@router.post("/tasks/{task_id}/miss_risk")
def miss_risk(task_id: str):
    """Predict risk of missing a task using behavior model."""
    import pandas as pd
    model_dir = os.path.join(os.path.dirname(__file__), '../../artifacts/behavior')
    model_cache = BehaviorModelCache.get_instance(model_dir)
    model = model_cache.model
    schema = model_cache.schema
    if model is None or schema is None:
        raise HTTPException(503, "Behavior model not loaded")
    with get_connection() as conn:
        features = compute_features_for_task(task_id, conn)
        X = pd.DataFrame([features])[schema['features']]
        prob = float(model.predict_proba(X)[0][1])
        band = risk_band(prob)
        reasons = top_feature_reasons(model, features, schema['features'])
    return {
        "task_id": task_id,
        "miss_risk": prob,
        "risk_band": band,
        "reasons": reasons
    }
@router.post("/tasks/{task_id}/apply_adaptive_policy")
def apply_adaptive_policy(task_id: str):
    import pandas as pd, uuid, json, datetime
    model_dir = os.path.join(os.path.dirname(__file__), '../../artifacts/behavior')
    model_cache = BehaviorModelCache.get_instance(model_dir)
    model = model_cache.model
    schema = model_cache.schema
    if model is None or schema is None:
        raise HTTPException(503, "Behavior model not loaded")
    with get_connection() as conn:
        features = compute_features_for_task(task_id, conn)
        X = pd.DataFrame([features])[schema['features']]
        prob = float(model.predict_proba(X)[0][1])
        band = risk_band(prob)
        # Policy
        if band == 'LOW':
            offsets = [60, 10]
        elif band == 'MEDIUM':
            offsets = [180, 60, 10]
        else:
            offsets = [360, 180, 60, 10]
        # Update task
        c = conn.cursor()
        c.execute("UPDATE tasks SET reminder_offsets_minutes=? WHERE id=?", (json.dumps(offsets), task_id))
        # Log event
        now = datetime.datetime.utcnow().isoformat()
        c.execute("INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)" , (str(uuid.uuid4()), task_id, 'POLICY_APPLIED', now, json.dumps({"band": band, "offsets": offsets, "prob": prob})))
        conn.commit()
    return {"task_id": task_id, "applied_policy": band, "reminder_offsets_minutes": offsets}
@router.get("/model_info")
def model_info():
    model_dir = os.path.join(os.path.dirname(__file__), '../../artifacts/behavior')
    model_cache = BehaviorModelCache.get_instance(model_dir)
    return {
        "version": model_cache.version,
        "features": model_cache.schema['features'] if model_cache.schema else None,
        "thresholds": {"LOW": "<0.4", "MEDIUM": "0.4-0.7", "HIGH": ">0.7"}
    }
from app.config import settings
import pytz
@router.post("/run_miss_check")
def run_miss_check():
    """Mark overdue PENDING tasks as MISSED and log event."""
    import uuid, datetime, pytz
    now = datetime.datetime.utcnow().replace(tzinfo=pytz.UTC)
    grace = datetime.timedelta(hours=settings.MISSED_GRACE_HOURS)
    missed_count = 0
    with get_connection() as conn:
        c = conn.cursor()
        # Find all PENDING tasks past (scheduled_at + grace)
        c.execute("SELECT id, scheduled_at FROM tasks WHERE status='PENDING'")
        rows = c.fetchall()
        for task_id, scheduled_at in rows:
            try:
                sched_dt = datetime.datetime.fromisoformat(scheduled_at)
                if sched_dt.tzinfo is None:
                    sched_dt = sched_dt.replace(tzinfo=pytz.UTC)
            except Exception:
                continue
            if now > sched_dt + grace:
                # Mark as MISSED
                c.execute("UPDATE tasks SET status='MISSED' WHERE id=?", (task_id,))
                c.execute("INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)" , (str(uuid.uuid4()), task_id, 'MISSED', now.isoformat(), None))
                missed_count += 1
        conn.commit()
    return {"missed": missed_count}
from fastapi import APIRouter, HTTPException, Body
from app.careplan.repository import health_check, get_connection
from app.careplan.templates import load_templates
import uuid, datetime, json

router = APIRouter(prefix="/careplan", tags=["CarePlan"])

@router.get("/health")
def careplan_health():
    ok, msg = health_check()
    return {"ok": ok, "message": msg}

@router.get("/templates")
def get_templates():
    return load_templates()

@router.post("/plans")
def create_plan(body: dict = Body(...)):
    disease_id = body.get("disease_id")
    disease_name = body.get("disease_name")
    treatment_mode = body.get("treatment_mode")
    start_date = body.get("start_date")
    user_id = body.get("user_id")
    if not (disease_id and disease_name and treatment_mode and start_date):
        raise HTTPException(400, "Missing required fields")
    templates = load_templates()
    tpl = templates.get(disease_id, {}).get(treatment_mode)
    if not tpl:
        raise HTTPException(404, "Template not found")
    plan_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    plan = {
        "id": plan_id,
        "user_id": user_id,
        "disease_id": disease_id,
        "disease_name": disease_name,
        "treatment_mode": treatment_mode,
        "start_date": start_date,
        "created_at": now
    }
    # Insert plan
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO plans (id, user_id, disease_id, disease_name, treatment_mode, start_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (plan_id, user_id, disease_id, disease_name, treatment_mode, start_date, now))
        # Expand tasks from template
        tasks = []
        for t in tpl.get("tasks", []):
            task_id = str(uuid.uuid4())
            offset_days = t.get("offset_days", 0)
            scheduled_at = (datetime.datetime.fromisoformat(start_date) + datetime.timedelta(days=offset_days)).isoformat()
            task = {
                "id": task_id,
                "plan_id": plan_id,
                "title": t["title"],
                "details": t.get("details", ""),
                "scheduled_at": scheduled_at,
                "status": "PENDING",
                "completed_at": None,
                "reminder_enabled": int(t.get("reminder_enabled", True)),
                "reminder_offsets_minutes": json.dumps(t.get("reminder_offsets_minutes", [60, 10])),
                "created_at": now
            }
            c.execute("""
                INSERT INTO tasks (id, plan_id, title, details, scheduled_at, status, completed_at, reminder_enabled, reminder_offsets_minutes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (task_id, plan_id, task["title"], task["details"], task["scheduled_at"], task["status"], task["completed_at"], task["reminder_enabled"], task["reminder_offsets_minutes"], now))
            tasks.append(task)
        conn.commit()
    return {"plan": plan, "tasks": tasks}

@router.get("/plans")
def list_plans():
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM plans ORDER BY created_at DESC")
        plans = [dict(zip([col[0] for col in c.description], row)) for row in c.fetchall()]
        for plan in plans:
            c.execute("SELECT scheduled_at FROM tasks WHERE plan_id=? AND status='PENDING' ORDER BY scheduled_at ASC LIMIT 1", (plan["id"],))
            row = c.fetchone()
            plan["next_task_time"] = row[0] if row else None
    return {"plans": plans}

@router.get("/plans/{plan_id}")
def get_plan(plan_id: str):
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM plans WHERE id=?", (plan_id,))
        plan_row = c.fetchone()
        if not plan_row:
            raise HTTPException(404, "Plan not found")
        plan = dict(zip([col[0] for col in c.description], plan_row))
        c.execute("SELECT * FROM tasks WHERE plan_id=? ORDER BY scheduled_at ASC", (plan_id,))
        tasks = [dict(zip([col[0] for col in c.description], row)) for row in c.fetchall()]
    return {"plan": plan, "tasks": tasks}

@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: str):
    import datetime, uuid
    now = datetime.datetime.utcnow().isoformat()
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("UPDATE tasks SET status='COMPLETED', completed_at=? WHERE id=?", (now, task_id))
        c.execute("INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)" , (str(uuid.uuid4()), task_id, 'COMPLETED', now, None))
        conn.commit()
    return {"ok": True}

@router.post("/tasks/{task_id}/reschedule")
def reschedule_task(task_id: str, body: dict = Body(...)):
    import datetime, uuid, json
    new_time = body.get("new_scheduled_at")
    if not new_time:
        raise HTTPException(400, "Missing new_scheduled_at")
    now = datetime.datetime.utcnow().isoformat()
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("UPDATE tasks SET scheduled_at=? WHERE id=?", (new_time, task_id))
        c.execute("INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)" , (str(uuid.uuid4()), task_id, 'RESCHEDULED', now, json.dumps({"new_scheduled_at": new_time})))
        conn.commit()
    return {"ok": True}

@router.post("/tasks/{task_id}/miss")
def miss_task(task_id: str):
    import datetime, uuid
    now = datetime.datetime.utcnow().isoformat()
    with get_connection() as conn:
        c = conn.cursor()
        c.execute("UPDATE tasks SET status='MISSED' WHERE id=?", (task_id,))
        c.execute("INSERT INTO task_events (id, task_id, event_type, event_at, meta_json) VALUES (?, ?, ?, ?, ?)" , (str(uuid.uuid4()), task_id, 'MISSED', now, None))
        conn.commit()
    return {"ok": True}
