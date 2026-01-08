import requests
import json

CAREPLAN_BASE = "http://localhost:8000/api/careplan"
CHAT_BASE = "http://localhost:8000/api/chat"

report = []

def log(title, req=None, resp=None, expect=None):
    print(f"\n=== {title} ===")
    if req:
        print("Request:", json.dumps(req, indent=2))
    if resp is not None:
        print("Response:", json.dumps(resp, indent=2) if isinstance(resp, dict) else resp)
    if expect:
        print("Expected:", expect)
    report.append({"title": title, "request": req, "response": resp, "expect": expect})

def check_pass(cond, msg):
    if cond:
        print(f"PASS: {msg}")
    else:
        print(f"FAIL: {msg}")
    return cond



# 1. List plans
r = requests.get(f"{CAREPLAN_BASE}/plans")
resp = r.json() if r.ok else None
plans = resp['plans'] if resp and 'plans' in resp else []
log("List plans", expect="200 OK, list of plans", resp=plans)
check_pass(isinstance(plans, list) and len(plans) > 0, "Plans returned and not empty")
plan_id = plans[0]['id'] if plans else None


# 2. Plan detail
r = requests.get(f"{CAREPLAN_BASE}/plans/{plan_id}")
plan_detail = r.json() if r.ok else None
log("Plan detail", expect="200 OK, plan detail", resp=plan_detail)
check_pass(plan_detail and plan_detail['plan']['id'] == plan_id, "Plan detail matches plan_id")


# 3. Complete a task
r = requests.get(f"{CAREPLAN_BASE}/plans/{plan_id}")
tasks = plan_detail.get('tasks', [])
pending = [t for t in tasks if t['status'] == 'PENDING']
task_id = pending[0]['id'] if pending else tasks[0]['id']
r = requests.post(f"{CAREPLAN_BASE}/tasks/{task_id}/complete")
log("Complete task", req={"task_id": task_id}, resp=r.json() if r.ok else r.text)


# 4. Check task status updated
r = requests.get(f"{CAREPLAN_BASE}/plans/{plan_id}")
plan_detail2 = r.json() if r.ok else None
updated = [t for t in plan_detail2.get('tasks', []) if t['id'] == task_id][0]
check_pass(updated['status'] == 'COMPLETED', "Task status updated to COMPLETED")


# 5. Run miss labeling job
r = requests.post(f"{CAREPLAN_BASE}/run_miss_check")
log("Run miss labeling job", resp=r.json() if r.ok else r.text)


# 6. Model info
r = requests.get(f"{CAREPLAN_BASE}/model_info")
model_info = r.json() if r.ok else None
log("Model info", resp=model_info)
check_pass(model_info and 'model_version' in model_info, "Model info includes version")


# 7. Miss risk for a task
r = requests.post(f"{CAREPLAN_BASE}/tasks/{task_id}/miss_risk")
miss_risk = r.json() if r.ok else None
log("Miss risk for task", req={"task_id": task_id}, resp=miss_risk)
check_pass(miss_risk and 'miss_risk' in miss_risk, "Miss risk returned")


# 8. Apply adaptive policy
r = requests.post(f"{CAREPLAN_BASE}/tasks/{task_id}/apply_adaptive_policy")
log("Apply adaptive policy", req={"task_id": task_id}, resp=r.json() if r.ok else r.text)


# 9. Chat endpoint (Gemini)
r = requests.post(f"{CHAT_BASE}/", json={"message": "What should I do today?"})
chat_resp = r.json() if r.ok else r.text
log("Chat endpoint", req={"message": "What should I do today?"}, resp=chat_resp)
check_pass(isinstance(chat_resp, dict) and 'reply' in chat_resp, "Chat reply returned")

# 10. Print summary
print("\n--- SUMMARY ---")
for entry in report:
    print(f"- {entry['title']}: {str(entry['response'])[:100]}")

print("\nAll backend API checks complete.")
