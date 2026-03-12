#!/usr/bin/env python3
"""Create admin user for testing gamification"""
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
import uuid

ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = MongoClient(mongo_url)
db = client[db_name]

# Create admin user
admin_user_id = "admin_user_123"
admin_email = "admin@microskill.com"
admin_name = "Admin Usuario"

# Check if admin already exists
existing = db.users.find_one({"email": admin_email})

if existing:
    print(f"⊘ Admin user already exists: {admin_email}")
    admin_user_id = existing["user_id"]
else:
    user_doc = {
        "user_id": admin_user_id,
        "email": admin_email,
        "name": admin_name,
        "picture": "https://ui-avatars.com/api/?name=Admin&background=0EA5E9&color=fff&size=200",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    db.users.insert_one(user_doc)
    print(f"✓ Created admin user: {admin_email}")

# Create a long-lasting session token
session_token = "admin_session_permanent_token"
expires_at = datetime.now(timezone.utc) + timedelta(days=365)  # 1 year

existing_session = db.user_sessions.find_one({"session_token": session_token})

if existing_session:
    print(f"⊘ Session already exists")
else:
    session_doc = {
        "user_id": admin_user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    db.user_sessions.insert_one(session_doc)
    print(f"✓ Created permanent session")

# Initialize gamification for admin with some starter data
gamif_doc = {
    "user_id": admin_user_id,
    "points": 250,
    "level": 3,
    "badges": ["first_lesson", "apprentice", "creator"],
    "current_streak": 5,
    "longest_streak": 10,
    "last_activity_date": datetime.now(timezone.utc).date().isoformat(),
    "lessons_created": 2,
    "lessons_completed": 12
}

existing_gamif = db.user_gamification.find_one({"user_id": admin_user_id})
if existing_gamif:
    db.user_gamification.update_one(
        {"user_id": admin_user_id},
        {"$set": gamif_doc}
    )
    print(f"✓ Updated admin gamification data")
else:
    db.user_gamification.insert_one(gamif_doc)
    print(f"✓ Created admin gamification data")

# Add some completed lessons for admin
lesson_ids = ["lesson_001", "lesson_002", "lesson_003", "lesson_009", "lesson_010"]
for lesson_id in lesson_ids:
    existing_progress = db.user_progress.find_one({
        "user_id": admin_user_id,
        "lesson_id": lesson_id
    })
    
    if not existing_progress:
        progress_doc = {
            "user_id": admin_user_id,
            "lesson_id": lesson_id,
            "completed": True,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        db.user_progress.insert_one(progress_doc)

print(f"✓ Added {len(lesson_ids)} completed lessons")

# Add some favorites
favorite_ids = ["lesson_017", "lesson_018"]
for lesson_id in favorite_ids:
    existing_fav = db.user_favorites.find_one({
        "user_id": admin_user_id,
        "lesson_id": lesson_id
    })
    
    if not existing_fav:
        favorite_doc = {
            "user_id": admin_user_id,
            "lesson_id": lesson_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.user_favorites.insert_one(favorite_doc)

print(f"✓ Added {len(favorite_ids)} favorites")

print("\n" + "="*60)
print("✅ ADMIN USER CREATED SUCCESSFULLY!")
print("="*60)
print(f"\nEmail: {admin_email}")
print(f"User ID: {admin_user_id}")
print(f"Session Token: {session_token}")
print(f"\nGamification Stats:")
print(f"  - Points: 250")
print(f"  - Level: 3")
print(f"  - Badges: 3 (Primer Paso, Aprendiz, Creador)")
print(f"  - Current Streak: 5 días")
print(f"  - Lessons Completed: 12")
print(f"  - Lessons Created: 2")
print(f"\n🔑 Para usar este usuario, copia el session_token en las cookies de tu navegador")
print("="*60)
