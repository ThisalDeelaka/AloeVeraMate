from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional


import os
import httpx
import itertools

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

# --- Gemini API integration ---

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# Support multiple Gemini API keys (comma-separated in GEMINI_API_KEYS)
def get_gemini_api_keys():
    keys = os.getenv("GEMINI_API_KEYS")
    if keys:
        return [k.strip() for k in keys.split(",") if k.strip()]
    key = os.getenv("GEMINI_API_KEY")
    return [key] if key else []

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    reply: str

async def call_gemini_api(messages):
    keys = get_gemini_api_keys()
    if not keys:
        raise RuntimeError("Gemini API key(s) not configured")
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"role": m["role"], "parts": [{"text": m["content"]}]} for m in messages]
    }
    last_exc = None
    for key in itertools.cycle(keys):
        url = f"{GEMINI_API_URL}?key={key}"
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=30)
                if resp.status_code == 429:
                    # Try next key
                    continue
                resp.raise_for_status()
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            last_exc = e
            break
    raise RuntimeError(f"Gemini API error: {last_exc}")

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest = Body(...)):
    import os
    print("[DEBUG] GEMINI_API_KEY at endpoint:", os.getenv("GEMINI_API_KEY"))
    # Compose message history (for now, just the current message)
    messages = [
        {"role": "user", "content": req.message}
    ]
    try:
        reply = await call_gemini_api(messages)
    except Exception as e:
        raise HTTPException(500, f"Gemini API error: {str(e)}")
    return ChatResponse(session_id=req.session_id or "default", reply=reply)

@router.get("/{session_id}")
async def get_chat_history(session_id: str):
    raise HTTPException(503, "MongoDB chat is not available in this deployment. Use /careplan/chat/{plan_id} for plan chat history.")
