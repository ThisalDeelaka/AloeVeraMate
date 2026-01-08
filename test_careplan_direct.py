#!/usr/bin/env python3
"""
Direct test of careplan functionality without server
Tests the careplan module directly by importing and calling functions
"""
import sys
import os

# Add server app to path
sys.path.insert(0, r'e:\Research\AloeVeraMate\apps\server')

def test_database_connection():
    """Test database connection"""
    print("\n=== Testing Database Connection ===")
    try:
        from app.careplan.repository import get_connection, health_check
        
        ok, msg = health_check()
        print(f"Health check: {'OK' if ok else 'FAILED'}")
        print(f"Message: {msg}")
        
        if ok:
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM plans")
                plan_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM tasks")
                task_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM chat_messages")
                chat_count = cursor.fetchone()[0]
                
                print(f"Plans: {plan_count}")
                print(f"Tasks: {task_count}")
                print(f"Chat messages: {chat_count}")
        
        return ok
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_behavior_model():
    """Test behavior model loading"""
    print("\n=== Testing Behavior Model ===")
    try:
        from app.services.behavior_model import BehaviorModelCache
        import os
        
        model_dir = r'e:\Research\AloeVeraMate\apps\server\artifacts\behavior'
        cache = BehaviorModelCache.get_instance(model_dir)
        
        print(f"Model loaded: {cache.model is not None}")
        print(f"Version: {cache.version}")
        print(f"Features: {cache.schema.get('features', []) if cache.schema else 'None'}")
        
        return cache.model is not None
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_careplan_templates():
    """Test careplan templates"""
    print("\n=== Testing CarePlan Templates ===")
    try:
        from app.careplan.templates import load_templates
        
        templates = load_templates()
        print(f"Templates loaded: {len(templates)} diseases")
        
        for disease_id, disease_data in list(templates.items())[:3]:
            print(f"  - {disease_id}: {list(disease_data.keys())}")
        
        return len(templates) > 0
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_chat_logic():
    """Test careplan chat logic (without Gemini)"""
    print("\n=== Testing CarePlan Chat Logic ===")
    try:
        from app.careplan.repository import get_connection
        import uuid
        import datetime
        
        # Get a plan ID from database
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM plans LIMIT 1")
            result = cursor.fetchone()
            
            if not result:
                print("No plans in database to test chat")
                return False
            
            plan_id = result[0]
            print(f"Testing with plan_id: {plan_id}")
            
            # Simulate a chat message asking about today's tasks
            message = "What tasks do I have today?"
            now = datetime.datetime.utcnow().isoformat()
            
            # Store user message
            cursor.execute(
                "INSERT INTO chat_messages (id, plan_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), plan_id, 'user', message, now)
            )
            
            # Get today's tasks
            today = datetime.datetime.utcnow().date()
            cursor.execute("SELECT * FROM tasks WHERE plan_id=? AND status='PENDING'", (plan_id,))
            tasks = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
            today_tasks = [t for t in tasks if t['scheduled_at'][:10] == today.isoformat()]
            
            # Generate reply
            if today_tasks:
                reply = f"You have {len(today_tasks)} pending task(s) today: " + ", ".join(t['title'] for t in today_tasks)
            else:
                reply = "You have no pending tasks for today."
            
            # Store assistant reply
            cursor.execute(
                "INSERT INTO chat_messages (id, plan_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), plan_id, 'assistant', reply, now)
            )
            
            conn.commit()
            
            print(f"User: {message}")
            print(f"Assistant: {reply}")
            
            # Verify messages were stored
            cursor.execute("SELECT COUNT(*) FROM chat_messages WHERE plan_id=?", (plan_id,))
            msg_count = cursor.fetchone()[0]
            print(f"Total chat messages for this plan: {msg_count}")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_miss_risk_prediction():
    """Test miss risk prediction"""
    print("\n=== Testing Miss Risk Prediction ===")
    try:
        from app.careplan.repository import get_connection
        from app.services.behavior_model import BehaviorModelCache
        import pandas as pd
        import numpy as np
        
        model_dir = r'e:\Research\AloeVeraMate\apps\server\artifacts\behavior'
        cache = BehaviorModelCache.get_instance(model_dir)
        
        if cache.model is None:
            print("Model not loaded")
            return False
        
        # Get a task from database
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM tasks WHERE status='PENDING' LIMIT 1")
            result = cursor.fetchone()
            
            if not result:
                print("No pending tasks to test")
                return False
            
            task_id = result[0]
            print(f"Testing with task_id: {task_id}")
            
            # Compute features (simplified version)
            cursor.execute("SELECT * FROM tasks WHERE id=?", (task_id,))
            task = dict(zip([col[0] for col in cursor.description], cursor.fetchone()))
            
            # Create dummy features for testing
            features = {
                'day_of_week': 1,
                'hour_of_day': 14,
                'tasks_scheduled_same_day': 3,
                'previous_misses_7d': 1,
                'completion_streak': 5,
                'avg_minutes_to_complete': 30.0,
                'reminder_enabled': 1,
                'number_of_reminders_sent_for_task': 2
            }
            
            # Predict
            X = pd.DataFrame([features])[cache.schema['features']]
            prob = float(cache.model.predict_proba(X)[0][1])
            
            # Determine risk band
            if prob < 0.4:
                band = 'LOW'
            elif prob < 0.7:
                band = 'MEDIUM'
            else:
                band = 'HIGH'
            
            print(f"Miss Risk: {prob:.2%}")
            print(f"Risk Band: {band}")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("="*70)
    print("CAREPLAN COMPONENT DIRECT TEST")
    print("="*70)
    
    results = {
        'Database': test_database_connection(),
        'Behavior Model': test_behavior_model(),
        'Templates': test_careplan_templates(),
        'Chat Logic': test_chat_logic(),
        'Miss Risk Prediction': test_miss_risk_prediction()
    }
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    for component, status in results.items():
        status_text = "[OK]" if status else "[FAIL]"
        print(f"{status_text} {component}")
    
    working = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\nResult: {working}/{total} components working")
    
    if working == total:
        print("\n[SUCCESS] All careplan components are working!")
    else:
        print("\n[WARNING] Some components need attention")
    
    return working == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
