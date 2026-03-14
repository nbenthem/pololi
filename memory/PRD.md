# MicroSkill - Micro-Learning Platform

## Product Overview
A micro-learning application for learning "micro-skills" in 5 minutes. Content is AI-generated and user-contributed, with a Frutiger Aero glassmorphism design.

## Architecture
- **Frontend**: React + TailwindCSS + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB (motor async driver)
- **Auth**: Cookie-based sessions (email/password + Google OAuth)
- **AI**: Claude Sonnet 4.5 via Emergent LLM key for content generation

## Core Features

### Authentication
- Email/password registration and login
- Google OAuth via Emergent-managed auth
- Cookie-based session management (7-day expiry)
- Admin user: admin@microskill.com / admin123

### Lessons
- 19 lessons across 8 categories
- Each lesson has: title, description, key_points, practical_examples, conclusion, insights, quiz, resources, image
- Hero images from Unsplash
- Interactive quiz with confetti on completion
- External resource links for deeper learning
- Section tabs: Contenido, Insights, Recursos, Quiz

### User-Created Lessons
- Multi-step form: Basico > Contenido > Quiz > Recursos > Revisar
- Users earn 50 points for creating lessons
- Authors earn 5 points when others complete their lessons

### Gamification
- Points system (10 for completing, 50 for creating, 5 for others completing your lessons, 20 for daily streak)
- 10 levels: Novato to Leyenda
- 9 achievement badges (Primer Paso, Aprendiz, Erudito, Creador, Mentor, Constante, Imparable, Experto, Maestro)
- Streak tracking (current + longest)
- Level badge displayed on profile avatar

### Profile & Settings
- Overview tab: stats, level progress bar, favorites, completed lessons
- Badges tab: 10 level badges with progress bars, unlocked achievements
- Settings tab: theme toggle (light/dark), language (ES/EN), badge visibility, social links (Twitter, LinkedIn, GitHub, Instagram, Website)

### Dashboard vs Explore
- **Dashboard**: Personalized - welcome, stats, gamification summary, quick actions (Explore/Create), recommendations, pending lessons
- **Explore**: Full library - search, category filters with counts, grid/list view toggle, all lessons with images

## What's Been Implemented (Feb 2026)
- [x] Complete auth system (email + Google OAuth)
- [x] Interactive lesson detail with tabs (Content/Insights/Resources/Quiz)
- [x] Hero images and reading progress bar
- [x] Interactive quiz component with confetti celebration
- [x] User-created lessons with multi-step form
- [x] Gamification (points, levels, badges, streaks)
- [x] Profile with settings (theme, language, social links, badge toggle)
- [x] Dashboard differentiated from Explore
- [x] NavBar with Create button
- [x] 19 lessons with images, quizzes, insights, and resources
- [x] Favorites and progress tracking
- [x] Personalized recommendations

## API Endpoints
- POST /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/session
- GET /api/auth/me
- GET /api/categories
- GET /api/lessons, /api/lessons/recommendations, /api/lessons/{id}
- POST /api/lessons/create, /api/lessons/generate
- GET/PUT /api/progress/{lesson_id}
- GET/POST/DELETE /api/favorites/{lesson_id}
- GET /api/user/stats, GET/PUT /api/user/settings
- GET /api/gamification/me, /api/gamification/leaderboard, /api/gamification/badges

## DB Collections
- users, user_sessions, categories, lessons, user_progress, user_favorites, user_gamification, user_settings

## Upcoming/Backlog
- P1: Dark mode CSS implementation (toggle exists, CSS vars needed)
- P1: Language switching (i18n - toggle exists, strings hardcoded in Spanish)
- P2: Content moderation (pending/approved/rejected) for user submissions
- P2: Leaderboard UI page
- P3: Public searchable user profiles
- P3: Social interaction between users
- P3: AI-powered lesson generation from frontend
- P3: Backend refactoring (split server.py into routers)
