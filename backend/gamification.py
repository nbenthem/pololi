"""Gamification helper functions"""
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase

# Puntos por acciones
POINTS = {
    "complete_lesson": 10,
    "create_lesson": 50,
    "lesson_completed_by_other": 5,
    "daily_streak": 20,
    "quiz_perfect": 5
}

# Niveles (puntos necesarios)
LEVELS = [
    0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000,
    15000, 20000, 30000, 50000, 75000, 100000
]

# Badges definitions
BADGES_DEFINITIONS = [
    {
        "badge_id": "first_lesson",
        "name": "Primer Paso",
        "description": "Completa tu primera lección",
        "icon": "👶",
        "points_required": 0,
        "condition": "lessons_completed >= 1"
    },
    {
        "badge_id": "apprentice",
        "name": "Aprendiz",
        "description": "Completa 10 lecciones",
        "icon": "📚",
        "points_required": 0,
        "condition": "lessons_completed >= 10"
    },
    {
        "badge_id": "scholar",
        "name": "Erudito",
        "description": "Completa 25 lecciones",
        "icon": "🎓",
        "points_required": 0,
        "condition": "lessons_completed >= 25"
    },
    {
        "badge_id": "creator",
        "name": "Creador",
        "description": "Crea tu primera lección",
        "icon": "✍️",
        "points_required": 0,
        "condition": "lessons_created >= 1"
    },
    {
        "badge_id": "mentor",
        "name": "Mentor",
        "description": "5 usuarios completaron tus lecciones",
        "icon": "👨‍🏫",
        "points_required": 0,
        "condition": "author_completions >= 5"
    },
    {
        "badge_id": "streak_7",
        "name": "Constante",
        "description": "7 días de racha",
        "icon": "🔥",
        "points_required": 0,
        "condition": "current_streak >= 7"
    },
    {
        "badge_id": "streak_30",
        "name": "Imparable",
        "description": "30 días de racha",
        "icon": "🔥🔥",
        "points_required": 0,
        "condition": "current_streak >= 30"
    },
    {
        "badge_id": "level_5",
        "name": "Experto",
        "description": "Alcanza nivel 5",
        "icon": "⭐",
        "points_required": 0,
        "condition": "level >= 5"
    },
    {
        "badge_id": "level_10",
        "name": "Maestro",
        "description": "Alcanza nivel 10",
        "icon": "🏆",
        "points_required": 0,
        "condition": "level >= 10"
    }
]

async def get_or_create_gamification(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    """Get user gamification data or create if not exists"""
    gamif = await db.user_gamification.find_one({"user_id": user_id}, {"_id": 0})
    
    if not gamif:
        gamif = {
            "user_id": user_id,
            "points": 0,
            "level": 1,
            "badges": [],
            "current_streak": 0,
            "longest_streak": 0,
            "last_activity_date": None,
            "lessons_created": 0,
            "lessons_completed": 0
        }
        await db.user_gamification.insert_one(gamif)
    
    return gamif

async def add_points(db: AsyncIOMotorDatabase, user_id: str, points: int, action: str):
    """Add points to user and update level"""
    gamif = await get_or_create_gamification(db, user_id)
    
    new_points = gamif["points"] + points
    new_level = calculate_level(new_points)
    
    # Update streak if completing lesson
    today = datetime.now(timezone.utc).date().isoformat()
    last_date = gamif.get("last_activity_date")
    
    new_streak = gamif["current_streak"]
    if action == "complete_lesson":
        if last_date:
            last = datetime.fromisoformat(last_date).date()
            today_date = datetime.now(timezone.utc).date()
            
            if (today_date - last).days == 1:
                # Consecutive day
                new_streak += 1
                new_points += POINTS["daily_streak"]
            elif (today_date - last).days > 1:
                # Streak broken
                new_streak = 1
            # Same day = no change
        else:
            new_streak = 1
    
    longest_streak = max(gamif["longest_streak"], new_streak)
    
    # Update in DB
    await db.user_gamification.update_one(
        {"user_id": user_id},
        {"$set": {
            "points": new_points,
            "level": new_level,
            "current_streak": new_streak,
            "longest_streak": longest_streak,
            "last_activity_date": today
        }}
    )
    
    # Check for new badges
    await check_and_award_badges(db, user_id)
    
    return {"points": new_points, "level": new_level, "streak": new_streak}

def calculate_level(points: int) -> int:
    """Calculate level based on points"""
    for i, threshold in enumerate(LEVELS):
        if points < threshold:
            return i
    return len(LEVELS)

async def check_and_award_badges(db: AsyncIOMotorDatabase, user_id: str):
    """Check if user earned new badges"""
    gamif = await get_or_create_gamification(db, user_id)
    current_badges = gamif.get("badges", [])
    
    # Get stats
    lessons_completed = gamif.get("lessons_completed", 0)
    lessons_created = gamif.get("lessons_created", 0)
    current_streak = gamif.get("current_streak", 0)
    level = gamif.get("level", 1)
    
    # Count how many users completed lessons created by this user
    user_lessons = await db.lessons.find({"author_id": user_id}, {"_id": 0, "lesson_id": 1}).to_list(1000)
    lesson_ids = [l["lesson_id"] for l in user_lessons]
    author_completions = 0
    if lesson_ids:
        author_completions = await db.user_progress.count_documents({
            "lesson_id": {"$in": lesson_ids},
            "completed": True,
            "user_id": {"$ne": user_id}  # Not counting self
        })
    
    # Check each badge
    new_badges = []
    for badge_def in BADGES_DEFINITIONS:
        badge_id = badge_def["badge_id"]
        
        if badge_id in current_badges:
            continue  # Already has it
        
        # Evaluate condition
        condition = badge_def["condition"]
        earned = eval(condition, {
            "lessons_completed": lessons_completed,
            "lessons_created": lessons_created,
            "current_streak": current_streak,
            "level": level,
            "author_completions": author_completions
        })
        
        if earned:
            new_badges.append(badge_id)
    
    # Award new badges
    if new_badges:
        await db.user_gamification.update_one(
            {"user_id": user_id},
            {"$addToSet": {"badges": {"$each": new_badges}}}
        )
    
    return new_badges

async def increment_lessons_completed(db: AsyncIOMotorDatabase, user_id: str):
    """Increment lessons completed counter"""
    await db.user_gamification.update_one(
        {"user_id": user_id},
        {"$inc": {"lessons_completed": 1}},
        upsert=True
    )

async def increment_lessons_created(db: AsyncIOMotorDatabase, user_id: str):
    """Increment lessons created counter"""
    await db.user_gamification.update_one(
        {"user_id": user_id},
        {"$inc": {"lessons_created": 1}},
        upsert=True
    )
