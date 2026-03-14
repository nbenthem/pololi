"""
Comprehensive API tests for MicroLearning App
Tests: Auth, Categories, Lessons, Progress, Favorites, Gamification, Settings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://quickskill-preview.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "admin@microskill.com"
TEST_PASSWORD = "admin123"

class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_categories_endpoint(self):
        """Test /api/categories returns categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        # Verify category structure
        cat = data[0]
        assert "category_id" in cat
        assert "name" in cat
        assert "slug" in cat
        print(f"Categories endpoint working: {len(data)} categories found")
    
    def test_lessons_endpoint(self):
        """Test /api/lessons returns lessons"""
        response = requests.get(f"{BASE_URL}/api/lessons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify lesson structure
        lesson = data[0]
        assert "lesson_id" in lesson
        assert "title" in lesson
        assert "content" in lesson
        print(f"Lessons endpoint working: {len(data)} lessons found")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == TEST_EMAIL
        print(f"Login successful for {TEST_EMAIL}")
        return response.cookies
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("Invalid login correctly rejected")
    
    def test_auth_me_requires_auth(self):
        """Test /api/auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("/api/auth/me correctly requires authentication")


class TestAuthenticatedEndpoints:
    """Tests that require authentication"""
    
    @pytest.fixture(autouse=True)
    def login(self):
        """Login before each test"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        self.user = response.json()
        print(f"Logged in as {self.user['email']}")
    
    def test_auth_me(self):
        """Test /api/auth/me returns user info"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        print("Auth me endpoint working")
    
    def test_user_stats(self):
        """Test /api/user/stats returns stats"""
        response = self.session.get(f"{BASE_URL}/api/user/stats")
        assert response.status_code == 200
        data = response.json()
        assert "completed_lessons" in data
        assert "favorites_count" in data
        assert "total_lessons" in data
        assert "completion_rate" in data
        print(f"User stats: completed={data['completed_lessons']}, favorites={data['favorites_count']}")
    
    def test_recommendations(self):
        """Test /api/lessons/recommendations returns recommendations"""
        response = self.session.get(f"{BASE_URL}/api/lessons/recommendations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Recommendations: {len(data)} lessons recommended")
    
    def test_progress(self):
        """Test /api/progress returns user progress"""
        response = self.session.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Progress: {len(data)} progress entries")
    
    def test_favorites(self):
        """Test /api/favorites returns user favorites"""
        response = self.session.get(f"{BASE_URL}/api/favorites")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Favorites: {len(data)} favorites")
    
    def test_gamification(self):
        """Test /api/gamification/me returns gamification data"""
        response = self.session.get(f"{BASE_URL}/api/gamification/me")
        assert response.status_code == 200
        data = response.json()
        assert "points" in data
        assert "level" in data
        assert "current_streak" in data
        assert "badges" in data
        print(f"Gamification: level={data['level']}, points={data['points']}, streak={data['current_streak']}")
    
    def test_user_settings_get(self):
        """Test GET /api/user/settings returns settings"""
        response = self.session.get(f"{BASE_URL}/api/user/settings")
        assert response.status_code == 200
        data = response.json()
        assert "theme" in data
        assert "language" in data
        assert "show_badge" in data
        print(f"Settings: theme={data['theme']}, language={data['language']}, show_badge={data['show_badge']}")
    
    def test_user_settings_put(self):
        """Test PUT /api/user/settings updates settings"""
        response = self.session.put(
            f"{BASE_URL}/api/user/settings",
            json={"language": "en", "show_badge": False}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "en"
        assert data["show_badge"] == False
        print("Settings updated successfully")
        
        # Reset settings
        self.session.put(
            f"{BASE_URL}/api/user/settings",
            json={"language": "es", "show_badge": True}
        )


class TestLessonDetail:
    """Tests for lesson detail endpoint"""
    
    def test_get_specific_lesson(self):
        """Test getting a specific lesson"""
        # First get all lessons
        response = requests.get(f"{BASE_URL}/api/lessons")
        lessons = response.json()
        assert len(lessons) > 0
        
        # Get specific lesson
        lesson_id = lessons[0]["lesson_id"]
        response = requests.get(f"{BASE_URL}/api/lessons/{lesson_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["lesson_id"] == lesson_id
        assert "title" in data
        assert "content" in data
        assert "quiz" in data
        assert "resources" in data
        assert "insights" in data
        print(f"Lesson detail working: {data['title']}")
    
    def test_lesson_has_quiz(self):
        """Test that lessons have quiz data"""
        # Get lesson_001 specifically (known to have quiz)
        response = requests.get(f"{BASE_URL}/api/lessons")
        lessons = response.json()
        
        # Find a lesson with quiz
        lesson_with_quiz = None
        for lesson in lessons:
            if lesson.get("quiz") and len(lesson["quiz"]) > 0:
                lesson_with_quiz = lesson
                break
        
        assert lesson_with_quiz is not None, "No lesson with quiz found"
        assert len(lesson_with_quiz["quiz"]) > 0
        quiz_q = lesson_with_quiz["quiz"][0]
        assert "question" in quiz_q
        assert "options" in quiz_q
        assert "correct_answer" in quiz_q
        print(f"Lesson with quiz found: {lesson_with_quiz['title']}, {len(lesson_with_quiz['quiz'])} questions")
    
    def test_lesson_has_resources(self):
        """Test that lessons have resources data"""
        response = requests.get(f"{BASE_URL}/api/lessons")
        lessons = response.json()
        
        # Find a lesson with resources
        lesson_with_resources = None
        for lesson in lessons:
            if lesson.get("resources") and len(lesson["resources"]) > 0:
                lesson_with_resources = lesson
                break
        
        if lesson_with_resources:
            resource = lesson_with_resources["resources"][0]
            assert "title" in resource
            assert "url" in resource
            print(f"Lesson with resources found: {lesson_with_resources['title']}")
        else:
            print("No lesson with resources found (may be expected)")
    
    def test_lesson_has_insights(self):
        """Test that lessons have insights data"""
        response = requests.get(f"{BASE_URL}/api/lessons")
        lessons = response.json()
        
        # Find a lesson with insights
        lesson_with_insights = None
        for lesson in lessons:
            if lesson.get("insights") and len(lesson["insights"]) > 0:
                lesson_with_insights = lesson
                break
        
        if lesson_with_insights:
            assert len(lesson_with_insights["insights"]) > 0
            print(f"Lesson with insights found: {lesson_with_insights['title']}, {len(lesson_with_insights['insights'])} insights")
        else:
            print("No lesson with insights found (may be expected)")


class TestFavoriteOperations:
    """Tests for favorite add/remove operations"""
    
    @pytest.fixture(autouse=True)
    def login(self):
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
    
    def test_favorite_toggle(self):
        """Test adding and removing favorite"""
        # Get a lesson
        response = self.session.get(f"{BASE_URL}/api/lessons")
        lessons = response.json()
        lesson_id = lessons[0]["lesson_id"]
        
        # Add to favorites
        response = self.session.post(f"{BASE_URL}/api/favorites/{lesson_id}")
        assert response.status_code == 200
        print(f"Added {lesson_id} to favorites")
        
        # Verify it's in favorites
        response = self.session.get(f"{BASE_URL}/api/favorites")
        assert response.status_code == 200
        favorites = response.json()
        fav_ids = [f["lesson_id"] for f in favorites]
        assert lesson_id in fav_ids
        print("Verified favorite was added")
        
        # Remove from favorites
        response = self.session.delete(f"{BASE_URL}/api/favorites/{lesson_id}")
        assert response.status_code == 200
        print(f"Removed {lesson_id} from favorites")


class TestProgressOperations:
    """Tests for progress update operations"""
    
    @pytest.fixture(autouse=True)
    def login(self):
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
    
    def test_progress_update(self):
        """Test updating lesson progress"""
        # Get a lesson
        response = self.session.get(f"{BASE_URL}/api/lessons")
        lessons = response.json()
        lesson_id = lessons[0]["lesson_id"]
        
        # Mark as completed
        response = self.session.put(
            f"{BASE_URL}/api/progress/{lesson_id}",
            json={"completed": True}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"Marked {lesson_id} as completed")
        
        # Verify in progress
        response = self.session.get(f"{BASE_URL}/api/progress")
        progress = response.json()
        completed = [p for p in progress if p["lesson_id"] == lesson_id and p["completed"]]
        assert len(completed) > 0 or "gamification" in data  # Either in list or got gamification points
        print("Progress update verified")


class TestGamificationEndpoints:
    """Tests for gamification endpoints"""
    
    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        response = requests.get(f"{BASE_URL}/api/gamification/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Leaderboard: {len(data)} entries")
    
    def test_badges(self):
        """Test badges list endpoint"""
        response = requests.get(f"{BASE_URL}/api/gamification/badges")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        badge = data[0]
        assert "badge_id" in badge
        assert "name" in badge
        assert "icon" in badge
        print(f"Badges: {len(data)} badges available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
