#!/usr/bin/env python3
"""
Care Plan Component Verification Test
Tests all features: database, ML models, chat, and endpoints
"""
import os
import sys

def print_status(component, status, details=""):
    """Print colored status messages"""
    status_symbol = "[OK]" if status else "[FAIL]"
    status_text = "WORKING" if status else "NOT WORKING"
    print(f"\n{status_symbol} {component}: {status_text}")
    if details:
        print(f"  Details: {details}")

def check_database():
    """Check if careplan database exists and has required tables"""
    db_path = r"e:\Research\AloeVeraMate\apps\server\data\careplan.db"
    
    if not os.path.exists(db_path):
        print_status("Database (careplan.db)", False, "Database file not found")
        return False
    
    try:
        import sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check required tables
        required_tables = ['plans', 'tasks', 'task_events', 'chat_messages']
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing_tables = [row[0] for row in cursor.fetchall()]
        
        missing_tables = [t for t in required_tables if t not in existing_tables]
        
        if missing_tables:
            print_status("Database (careplan.db)", False, 
                        f"Missing tables: {', '.join(missing_tables)}")
            conn.close()
            return False
        
        # Check if there's any data
        cursor.execute("SELECT COUNT(*) FROM plans")
        plan_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tasks")
        task_count = cursor.fetchone()[0]
        
        conn.close()
        
        print_status("Database (careplan.db)", True, 
                    f"All tables present. Plans: {plan_count}, Tasks: {task_count}")
        return True
        
    except Exception as e:
        print_status("Database (careplan.db)", False, f"Error: {str(e)}")
        return False

def check_behavior_model():
    """Check if behavior ML model exists and can be loaded"""
    model_dir = r"e:\Research\AloeVeraMate\apps\server\artifacts\behavior"
    
    # Check if directory exists
    if not os.path.exists(model_dir):
        print_status("Behavior ML Model", False, 
                    f"Model directory not found at {model_dir}")
        print(f"  Hint: Run export.py from training_behavior to deploy the model")
        return False
    
    # Check required files
    required_files = ['model.joblib', 'feature_schema.json']
    missing_files = [f for f in required_files if not os.path.exists(os.path.join(model_dir, f))]
    
    if missing_files:
        print_status("Behavior ML Model", False, 
                    f"Missing files: {', '.join(missing_files)}")
        return False
    
    # Try to load the model
    try:
        import joblib
        import json
        
        model = joblib.load(os.path.join(model_dir, 'model.joblib'))
        with open(os.path.join(model_dir, 'feature_schema.json')) as f:
            schema = json.load(f)
        
        features = schema.get('features', [])
        print_status("Behavior ML Model", True, 
                    f"Model loaded successfully. Features: {len(features)}")
        return True
        
    except Exception as e:
        print_status("Behavior ML Model", False, f"Error loading model: {str(e)}")
        return False

def check_chat_gemini_config():
    """Check if Gemini API key is configured for chat"""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEYS")
    
    if not api_key:
        print_status("Chat (Gemini API)", False, 
                    "GEMINI_API_KEY environment variable not set")
        return False
    
    # Don't print the actual key for security
    key_preview = api_key[:10] + "..." if len(api_key) > 10 else "***"
    print_status("Chat (Gemini API)", True, 
                f"API key configured ({key_preview})")
    return True

def check_server_running():
    """Check if the server is currently running"""
    try:
        import requests
        response = requests.get("http://localhost:8000/careplan/health", timeout=2)
        
        if response.status_code == 200:
            data = response.json()
            print_status("Server (port 8000)", True, 
                        f"Server responding: {data}")
            return True
        else:
            print_status("Server (port 8000)", False, 
                        f"Server returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_status("Server (port 8000)", False, 
                    "Server not running or not reachable")
        return False
    except Exception as e:
        print_status("Server (port 8000)", False, f"Error: {str(e)}")
        return False

def check_careplan_endpoints():
    """Test careplan API endpoints if server is running"""
    try:
        import requests
        
        base_url = "http://localhost:8000/careplan"
        
        # Test health endpoint
        response = requests.get(f"{base_url}/health", timeout=2)
        if response.status_code != 200:
            print_status("CarePlan Endpoints", False, "Health endpoint failed")
            return False
        
        # Test templates endpoint
        response = requests.get(f"{base_url}/templates", timeout=2)
        if response.status_code != 200:
            print_status("CarePlan Endpoints", False, "Templates endpoint failed")
            return False
        
        templates = response.json()
        
        # Test model info endpoint
        response = requests.get(f"{base_url}/model_info", timeout=2)
        model_working = response.status_code == 200
        
        print_status("CarePlan Endpoints", True, 
                    f"Health, Templates OK. Templates: {len(templates)}. Model: {'OK' if model_working else 'N/A'}")
        return True
        
    except Exception as e:
        print_status("CarePlan Endpoints", False, f"Error: {str(e)}")
        return False

def check_chat_endpoint():
    """Test chat endpoint if server is running"""
    try:
        import requests
        
        response = requests.post(
            "http://localhost:8000/chat/",
            json={"message": "Hello, can you help me?"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get('reply', '')
            reply_preview = reply[:50] + "..." if len(reply) > 50 else reply
            print_status("Chat Endpoint (Gemini)", True, 
                        f"Chat responding: '{reply_preview}'")
            return True
        else:
            print_status("Chat Endpoint (Gemini)", False, 
                        f"Status {response.status_code}: {response.text[:100]}")
            return False
            
    except Exception as e:
        print_status("Chat Endpoint (Gemini)", False, f"Error: {str(e)}")
        return False

def main():
    print("="*70)
    print("CARE PLAN COMPONENT VERIFICATION")
    print("="*70)
    
    results = {}
    
    # Check components in order
    print("\n--- CHECKING DEPENDENCIES ---")
    results['database'] = check_database()
    results['behavior_model'] = check_behavior_model()
    results['chat_config'] = check_chat_gemini_config()
    
    print("\n--- CHECKING SERVER ---")
    results['server'] = check_server_running()
    
    if results['server']:
        print("\n--- CHECKING ENDPOINTS ---")
        results['careplan_endpoints'] = check_careplan_endpoints()
        results['chat_endpoint'] = check_chat_endpoint()
    else:
        print("\n[WARN] Server not running. Skipping endpoint tests.")
        print("  To start server: cd apps/server && python run.py")
        results['careplan_endpoints'] = None
        results['chat_endpoint'] = None
    
    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    working = sum(1 for v in results.values() if v is True)
    not_working = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    
    print(f"\n[OK] Working: {working}")
    print(f"[FAIL] Not Working: {not_working}")
    if skipped:
        print(f"[SKIP] Skipped: {skipped}")
    
    # Recommendations
    print("\n" + "="*70)
    print("RECOMMENDATIONS")
    print("="*70)
    
    if not results['database']:
        print("\n1. Create careplan database:")
        print("   cd apps/training_behavior")
        print("   python simulate_data.py --reset-db")
    
    if not results['behavior_model']:
        print("\n2. Deploy behavior model:")
        print("   cd apps/training_behavior")
        print("   python export.py --dest ../../server/artifacts/behavior/")
    
    if not results['chat_config']:
        print("\n3. Configure Gemini API:")
        print("   Set environment variable: GEMINI_API_KEY=your_key_here")
    
    if not results['server']:
        print("\n4. Start the server:")
        print("   cd apps/server")
        print("   python run.py")
    
    print("\n" + "="*70)
    
    # Exit code based on results
    if not_working > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
