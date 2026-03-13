#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
import uuid

# Configuration
API_URL = "https://quickskill-preview.preview.emergentagent.com"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

class MicroLearningAPITester:
    def __init__(self):
        self.base_url = API_URL
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []
        
        # MongoDB setup for auth testing
        self.mongo_client = MongoClient(MONGO_URL)
        self.db = self.mongo_client[DB_NAME]

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def setup_test_auth(self):
        """Create test user and session in MongoDB"""
        try:
            self.user_id = f"test-user-{uuid.uuid4().hex[:12]}"
            self.session_token = f"test_session_{uuid.uuid4().hex}"
            
            # Create test user
            user_doc = {
                "user_id": self.user_id,
                "email": f"test.user.{int(datetime.now().timestamp())}@example.com",
                "name": "Test User",
                "picture": "https://via.placeholder.com/150",
                "created_at": datetime.now(timezone.utc)
            }
            self.db.users.insert_one(user_doc)
            
            # Create session
            session_doc = {
                "user_id": self.user_id,
                "session_token": self.session_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
                "created_at": datetime.now(timezone.utc)
            }
            self.db.user_sessions.insert_one(session_doc)
            
            print(f"🔧 Created test user: {self.user_id}")
            print(f"🔧 Created session token: {self.session_token}")
            return True
        except Exception as e:
            print(f"❌ Failed to setup test auth: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up test data"""
        try:
            if self.user_id:
                self.db.users.delete_many({"user_id": self.user_id})
                self.db.user_sessions.delete_many({"user_id": self.user_id})
                self.db.user_progress.delete_many({"user_id": self.user_id})
                self.db.user_favorites.delete_many({"user_id": self.user_id})
            print("🧹 Cleaned up test data")
        except Exception as e:
            print(f"⚠️ Cleanup failed: {e}")

    def make_request(self, method, endpoint, data=None, auth_required=True):
        """Make HTTP request with optional auth"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            return response
        except Exception as e:
            print(f"❌ Request error: {e}")
            return None

    def test_categories_endpoint(self):
        """Test /api/categories endpoint"""
        response = self.make_request('GET', 'categories', auth_required=False)
        if response and response.status_code == 200:
            categories = response.json()
            if len(categories) >= 4:  # Should have 4 seed categories
                expected_categories = ['Negociación', 'Psicología', 'Finanzas', 'Ciencia']
                category_names = [cat.get('name', '') for cat in categories]
                
                if all(exp in str(category_names) for exp in expected_categories):
                    self.log_result("Categories API returns 4 categories with correct names", True)
                else:
                    self.log_result("Categories API", False, f"Missing expected categories. Got: {category_names}")
            else:
                self.log_result("Categories API", False, f"Expected 4+ categories, got {len(categories)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Categories API", False, f"Status: {status}")

    def test_lessons_endpoint(self):
        """Test /api/lessons endpoint"""
        response = self.make_request('GET', 'lessons', auth_required=False)
        if response and response.status_code == 200:
            lessons = response.json()
            if len(lessons) >= 8:  # Should have 8 seed lessons
                self.log_result("Lessons API returns 8+ seed lessons", True)
                return lessons[0].get('lesson_id')  # Return first lesson ID for further tests
            else:
                self.log_result("Lessons API", False, f"Expected 8+ lessons, got {len(lessons)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Lessons API", False, f"Status: {status}")
        return None

    def test_auth_me(self):
        """Test /api/auth/me endpoint"""
        response = self.make_request('GET', 'auth/me')
        if response and response.status_code == 200:
            user_data = response.json()
            if user_data.get('user_id') == self.user_id:
                self.log_result("Auth /me endpoint returns valid user", True)
                return True
            else:
                self.log_result("Auth /me endpoint", False, "User ID mismatch")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Auth /me endpoint", False, f"Status: {status}")
        return False

    def test_user_stats(self):
        """Test /api/user/stats endpoint"""
        response = self.make_request('GET', 'user/stats')
        if response and response.status_code == 200:
            stats = response.json()
            required_fields = ['completed_lessons', 'favorites_count', 'total_lessons', 'completion_rate']
            if all(field in stats for field in required_fields):
                self.log_result("User stats API returns all required fields", True)
            else:
                self.log_result("User stats API", False, f"Missing fields in response: {stats}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("User stats API", False, f"Status: {status}")

    def test_lesson_detail(self, lesson_id):
        """Test /api/lessons/{id} endpoint"""
        if not lesson_id:
            self.log_result("Lesson detail API", False, "No lesson ID available")
            return
            
        response = self.make_request('GET', f'lessons/{lesson_id}')
        if response and response.status_code == 200:
            lesson = response.json()
            required_fields = ['lesson_id', 'title', 'description', 'content', 'category_id']
            if all(field in lesson for field in required_fields):
                self.log_result("Lesson detail API returns complete lesson data", True)
            else:
                self.log_result("Lesson detail API", False, f"Missing fields: {required_fields}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Lesson detail API", False, f"Status: {status}")

    def test_favorites_functionality(self, lesson_id):
        """Test favorites add/remove functionality"""
        if not lesson_id:
            self.log_result("Favorites functionality", False, "No lesson ID available")
            return
            
        # Add to favorites
        response = self.make_request('POST', f'favorites/{lesson_id}')
        if response and response.status_code == 200:
            # Check if added
            response = self.make_request('GET', 'favorites')
            if response and response.status_code == 200:
                favorites = response.json()
                if any(fav.get('lesson_id') == lesson_id for fav in favorites):
                    # Remove from favorites
                    response = self.make_request('DELETE', f'favorites/{lesson_id}')
                    if response and response.status_code == 200:
                        self.log_result("Favorites add/remove functionality", True)
                    else:
                        self.log_result("Favorites remove", False, "Failed to remove")
                else:
                    self.log_result("Favorites add", False, "Not found in favorites list")
            else:
                self.log_result("Favorites get", False, "Failed to get favorites")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Favorites add", False, f"Status: {status}")

    def test_progress_functionality(self, lesson_id):
        """Test progress update functionality"""
        if not lesson_id:
            self.log_result("Progress functionality", False, "No lesson ID available")
            return
            
        # Mark as completed
        response = self.make_request('PUT', f'progress/{lesson_id}', {'completed': True})
        if response and response.status_code == 200:
            # Check if marked
            response = self.make_request('GET', 'progress')
            if response and response.status_code == 200:
                progress = response.json()
                lesson_progress = next((p for p in progress if p.get('lesson_id') == lesson_id), None)
                if lesson_progress and lesson_progress.get('completed'):
                    self.log_result("Progress update functionality", True)
                else:
                    self.log_result("Progress update", False, "Progress not found or not completed")
            else:
                self.log_result("Progress get", False, "Failed to get progress")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Progress update", False, f"Status: {status}")

    def test_lesson_generation(self):
        """Test AI lesson generation (optional)"""
        try:
            # First get a category ID
            response = self.make_request('GET', 'categories', auth_required=False)
            if not response or response.status_code != 200:
                self.log_result("Lesson generation (skipped)", False, "Categories not available")
                return
                
            categories = response.json()
            if not categories:
                self.log_result("Lesson generation (skipped)", False, "No categories found")
                return
                
            category_id = categories[0].get('category_id')
            
            # Generate lesson
            response = self.make_request('POST', 'lessons/generate', {
                'topic': 'Técnicas básicas de comunicación efectiva',
                'category_id': category_id
            })
            
            if response and response.status_code == 200:
                lesson = response.json()
                if lesson.get('lesson_id') and lesson.get('title'):
                    self.log_result("AI lesson generation with Claude Sonnet 4.5", True)
                else:
                    self.log_result("AI lesson generation", False, "Invalid lesson structure")
            elif response and response.status_code == 500:
                self.log_result("AI lesson generation (API key issue)", False, "Claude API may not be configured")
            else:
                status = response.status_code if response else "No response"
                self.log_result("AI lesson generation", False, f"Status: {status}")
        except Exception as e:
            self.log_result("AI lesson generation", False, f"Error: {e}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting MicroLearning Backend API Tests\n")
        
        # Setup test authentication
        if not self.setup_test_auth():
            print("❌ Cannot proceed without auth setup")
            return
        
        try:
            # Test public endpoints
            print("📊 Testing Public Endpoints:")
            self.test_categories_endpoint()
            lesson_id = self.test_lessons_endpoint()
            
            # Test authenticated endpoints
            print("\n🔐 Testing Authenticated Endpoints:")
            auth_success = self.test_auth_me()
            
            if auth_success:
                self.test_user_stats()
                self.test_lesson_detail(lesson_id)
                
                # Test user functionality
                print("\n👤 Testing User Functionality:")
                self.test_favorites_functionality(lesson_id)
                self.test_progress_functionality(lesson_id)
                
                # Test AI generation (optional)
                print("\n🤖 Testing AI Features:")
                self.test_lesson_generation()
            else:
                print("⚠️ Skipping user tests due to auth failure")
                
        finally:
            self.cleanup_test_data()
        
        # Print summary
        print(f"\n📋 Test Summary:")
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        return self.tests_passed, self.tests_run, self.results

if __name__ == "__main__":
    tester = MicroLearningAPITester()
    passed, total, results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    exit_code = 0 if passed == total else 1
    sys.exit(exit_code)