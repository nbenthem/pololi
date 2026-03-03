from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    category_id: str
    name: str
    description: str
    color: str
    icon: str
    slug: str

class Lesson(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lesson_id: str
    title: str
    description: str
    category_id: str
    content: dict
    duration: int = 5
    created_at: datetime

class UserProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    lesson_id: str
    completed: bool
    completed_at: Optional[datetime] = None

class UserFavorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    lesson_id: str
    created_at: datetime

class SessionCreate(BaseModel):
    session_id: str

class GenerateLessonRequest(BaseModel):
    topic: str
    category_id: str

class ProgressUpdate(BaseModel):
    completed: bool

# Auth helper
async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)) -> User:
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# Auth endpoints
@api_router.post("/auth/session")
async def create_session(data: SessionCreate, response: Response):
    """Exchange session_id for user data and create session"""
    try:
        headers = {"X-Session-ID": data.session_id}
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers=headers,
            timeout=10
        )
        resp.raise_for_status()
        oauth_data = resp.json()
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        session_token = f"session_{uuid.uuid4().hex}"
        
        existing_user = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": oauth_data["name"],
                    "picture": oauth_data["picture"]
                }}
            )
        else:
            user_doc = {
                "user_id": user_id,
                "email": oauth_data["email"],
                "name": oauth_data["name"],
                "picture": oauth_data["picture"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7*24*60*60
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        return user
    except Exception as e:
        logger.error(f"Session creation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/auth/me", response_model=User)
async def get_me(user: User = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user: User = Depends(get_current_user)):
    await db.user_sessions.delete_many({"user_id": user.user_id})
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

# Lessons
@api_router.get("/lessons", response_model=List[Lesson])
async def get_lessons(category_id: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    lessons = await db.lessons.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for lesson in lessons:
        if isinstance(lesson['created_at'], str):
            lesson['created_at'] = datetime.fromisoformat(lesson['created_at'])
    return lessons

@api_router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if isinstance(lesson['created_at'], str):
        lesson['created_at'] = datetime.fromisoformat(lesson['created_at'])
    return lesson

@api_router.post("/lessons/generate", response_model=Lesson)
async def generate_lesson(data: GenerateLessonRequest, user: User = Depends(get_current_user)):
    """Generate a new lesson using Claude Sonnet 4.5"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"lesson_gen_{uuid.uuid4().hex[:8]}",
            system_message="Eres un experto educador que crea micro-lecciones brillantes de 5 minutos. El contenido debe ser claro, práctico y digno de un genio. Responde SOLO en formato JSON válido."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        prompt = f"""Crea una micro-lección de 5 minutos sobre: {data.topic}

Responde EXACTAMENTE en este formato JSON:
{{
  "title": "Título atractivo y claro",
  "description": "Descripción breve en 1-2 líneas",
  "key_points": [
    "Punto clave 1 con explicación clara y concisa",
    "Punto clave 2 con explicación clara y concisa",
    "Punto clave 3 con explicación clara y concisa",
    "Punto clave 4 con explicación clara y concisa",
    "Punto clave 5 con explicación clara y concisa"
  ],
  "practical_examples": [
    "Ejemplo práctico 1 aplicable a la vida real",
    "Ejemplo práctico 2 aplicable a la vida real"
  ],
  "conclusion": "Una conclusión breve y motivadora"
}}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        content_data = json.loads(response.strip())
        
        lesson_id = f"lesson_{uuid.uuid4().hex[:12]}"
        lesson_doc = {
            "lesson_id": lesson_id,
            "title": content_data["title"],
            "description": content_data["description"],
            "category_id": data.category_id,
            "content": content_data,
            "duration": 5,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.lessons.insert_one(lesson_doc)
        lesson_doc['created_at'] = datetime.fromisoformat(lesson_doc['created_at'])
        
        return Lesson(**lesson_doc)
    except Exception as e:
        logger.error(f"Lesson generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate lesson: {str(e)}")

# Progress
@api_router.get("/progress")
async def get_user_progress(user: User = Depends(get_current_user)):
    progress = await db.user_progress.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    for p in progress:
        if p.get('completed_at') and isinstance(p['completed_at'], str):
            p['completed_at'] = datetime.fromisoformat(p['completed_at'])
    return progress

@api_router.put("/progress/{lesson_id}")
async def update_progress(lesson_id: str, data: ProgressUpdate, user: User = Depends(get_current_user)):
    existing = await db.user_progress.find_one({
        "user_id": user.user_id,
        "lesson_id": lesson_id
    })
    
    if existing:
        update_data = {"completed": data.completed}
        if data.completed:
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        else:
            update_data["completed_at"] = None
        
        await db.user_progress.update_one(
            {"user_id": user.user_id, "lesson_id": lesson_id},
            {"$set": update_data}
        )
    else:
        progress_doc = {
            "user_id": user.user_id,
            "lesson_id": lesson_id,
            "completed": data.completed,
            "completed_at": datetime.now(timezone.utc).isoformat() if data.completed else None
        }
        await db.user_progress.insert_one(progress_doc)
    
    return {"message": "Progress updated"}

# Favorites
@api_router.get("/favorites")
async def get_favorites(user: User = Depends(get_current_user)):
    favorites = await db.user_favorites.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    lesson_ids = [f["lesson_id"] for f in favorites]
    lessons = await db.lessons.find({"lesson_id": {"$in": lesson_ids}}, {"_id": 0}).to_list(1000)
    for lesson in lessons:
        if isinstance(lesson['created_at'], str):
            lesson['created_at'] = datetime.fromisoformat(lesson['created_at'])
    return lessons

@api_router.post("/favorites/{lesson_id}")
async def add_favorite(lesson_id: str, user: User = Depends(get_current_user)):
    existing = await db.user_favorites.find_one({
        "user_id": user.user_id,
        "lesson_id": lesson_id
    })
    
    if existing:
        return {"message": "Already favorited"}
    
    favorite_doc = {
        "user_id": user.user_id,
        "lesson_id": lesson_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_favorites.insert_one(favorite_doc)
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{lesson_id}")
async def remove_favorite(lesson_id: str, user: User = Depends(get_current_user)):
    await db.user_favorites.delete_one({"user_id": user.user_id, "lesson_id": lesson_id})
    return {"message": "Removed from favorites"}

# User stats
@api_router.get("/user/stats")
async def get_user_stats(user: User = Depends(get_current_user)):
    completed = await db.user_progress.count_documents({"user_id": user.user_id, "completed": True})
    favorites = await db.user_favorites.count_documents({"user_id": user.user_id})
    total_lessons = await db.lessons.count_documents({})
    
    return {
        "completed_lessons": completed,
        "favorites_count": favorites,
        "total_lessons": total_lessons,
        "completion_rate": round((completed / total_lessons * 100), 1) if total_lessons > 0 else 0
    }

# Recommendations
@api_router.get("/lessons/recommendations", response_model=List[Lesson])
async def get_recommendations(user: User = Depends(get_current_user)):
    """Get personalized lesson recommendations based on completed lessons and user preferences"""
    # Get user's completed lessons
    progress_docs = await db.user_progress.find(
        {"user_id": user.user_id, "completed": True},
        {"_id": 0}
    ).to_list(1000)
    
    completed_lesson_ids = [p["lesson_id"] for p in progress_docs]
    
    # Get completed lessons details to find favorite categories
    if completed_lesson_ids:
        completed_lessons = await db.lessons.find(
            {"lesson_id": {"$in": completed_lesson_ids}},
            {"_id": 0}
        ).to_list(1000)
        
        # Count category preferences
        from collections import Counter
        category_counts = Counter([l["category_id"] for l in completed_lessons])
        
        # Get top 3 preferred categories
        preferred_categories = [cat for cat, _ in category_counts.most_common(3)]
    else:
        # New user - recommend from all categories
        preferred_categories = []
    
    # Build recommendation query
    query = {"lesson_id": {"$nin": completed_lesson_ids}}  # Exclude completed
    
    # Get recommendations
    recommendations = []
    
    # Strategy 1: From preferred categories (if user has history)
    if preferred_categories:
        category_recs = await db.lessons.find(
            {**query, "category_id": {"$in": preferred_categories}},
            {"_id": 0}
        ).limit(4).to_list(100)
        recommendations.extend(category_recs)
    
    # Strategy 2: Popular/recent lessons (diversify)
    if len(recommendations) < 6:
        other_recs = await db.lessons.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(6 - len(recommendations)).to_list(100)
        recommendations.extend(other_recs)
    
    # Convert datetime strings to datetime objects
    for lesson in recommendations:
        if isinstance(lesson['created_at'], str):
            lesson['created_at'] = datetime.fromisoformat(lesson['created_at'])
    
    return recommendations[:6]  # Return top 6 recommendations

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()