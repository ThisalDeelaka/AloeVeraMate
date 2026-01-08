from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional


import os
import httpx
import itertools

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

# --- Gemini API integration ---

# Get model from environment variable, default to gemini-1.5-flash
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

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
    import asyncio
    keys = get_gemini_api_keys()
    if not keys:
        raise RuntimeError("Gemini API key(s) not configured")
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"role": m["role"], "parts": [{"text": m["content"]}]} for m in messages]
    }
    
    for key in keys:
        url = f"{GEMINI_API_URL}?key={key}"
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 429:
                    # Rate limited - try next key
                    continue
                resp.raise_for_status()
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except httpx.TimeoutException:
            raise RuntimeError("Gemini API timeout after 30s")
        except Exception as e:
            raise RuntimeError(f"Gemini API error: {str(e)}")
    
    raise RuntimeError("All Gemini API keys are rate limited. Please try again later.")

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
