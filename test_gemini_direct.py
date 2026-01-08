import httpx
import asyncio
import time

GEMINI_API_KEY = "AIzaSyBS_FKmPDzR3F6OjXoLIH-paGlrtpfRGcQ"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async def test_gemini():
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": "Say hello in one word"}]}]
    }
    
    start = time.time()
    try:
        async with httpx.AsyncClient() as client:
            print("Sending request to Gemini API...")
            resp = await client.post(url, json=payload, timeout=30)
            elapsed = time.time() - start
            
            print(f"Status: {resp.status_code}")
            print(f"Time: {elapsed:.2f}s")
            
            if resp.status_code == 200:
                data = resp.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"]
                print(f"Reply: {reply}")
            else:
                print(f"Error: {resp.text}")
    except Exception as e:
        elapsed = time.time() - start
        print(f"Exception after {elapsed:.2f}s: {e}")

asyncio.run(test_gemini())
