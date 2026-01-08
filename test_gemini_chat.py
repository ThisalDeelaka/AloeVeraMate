import requests

BASE_URL = "http://127.0.0.1:8000/api/chat/"

payload = {
    "message": "How do I care for my aloe vera plant?"
}

response = requests.post(BASE_URL, json=payload)

print("Status Code:", response.status_code)
try:
    print("Response:", response.json())
except Exception:
    print("Raw Response:", response.text)
