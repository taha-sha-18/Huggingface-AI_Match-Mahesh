#!/usr/bin/env python3
"""
Comprehensive Backend Testing for AI Community Matching System
Tests all API endpoints with realistic data scenarios
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://huggingface-key.preview.emergentagent.com/api"
TEST_USER_EMAIL = "alice.johnson@example.com"
TEST_USER_PASSWORD = "SecurePass123!"
TEST_USER_NAME = "Alice Johnson"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_community_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response, status_code)"""
        url = f"{self.base_url}{endpoint}"
        request_headers = {"Content-Type": "application/json"}
        
        if headers:
            request_headers.update(headers)
        
        if self.auth_token:
            request_headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                return False, None, 0
            
            return True, response, response.status_code
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, None, 0
    
    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        
        # Test root endpoint
        success, response, status = self.make_request("GET", "/")
        if success and status == 200:
            self.log_result("Root endpoint", True, "API is accessible")
        else:
            self.log_result("Root endpoint", False, f"Status: {status}")
        
        # Test health endpoint
        success, response, status = self.make_request("GET", "/health")
        if success and status == 200:
            data = response.json()
            hf_configured = data.get("huggingface_configured", False)
            self.log_result("Health check", True, f"HuggingFace configured: {hf_configured}")
        else:
            self.log_result("Health check", False, f"Status: {status}")
    
    def test_authentication_flow(self):
        """Test complete authentication flow"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test user registration
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        }
        
        success, response, status = self.make_request("POST", "/auth/register", register_data)
        if success and status == 200:
            data = response.json()
            self.auth_token = data.get("token")
            self.user_id = data.get("user", {}).get("user_id")
            self.log_result("User registration", True, f"User ID: {self.user_id}")
        else:
            # Try login if user already exists
            if status == 400:
                self.log_result("User registration", True, "User already exists, proceeding to login")
                self.test_login()
            else:
                self.log_result("User registration", False, f"Status: {status}")
                return
        
        # Test get current user
        success, response, status = self.make_request("GET", "/auth/me")
        if success and status == 200:
            data = response.json()
            self.log_result("Get current user", True, f"Email: {data.get('email')}")
        else:
            self.log_result("Get current user", False, f"Status: {status}")
        
        # Test unauthorized access
        temp_token = self.auth_token
        self.auth_token = "invalid_token"
        success, response, status = self.make_request("GET", "/auth/me")
        if success and status == 401:
            self.log_result("Unauthorized access protection", True, "Correctly rejected invalid token")
        else:
            self.log_result("Unauthorized access protection", False, f"Status: {status}")
        self.auth_token = temp_token
    
    def test_login(self):
        """Test user login"""
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        success, response, status = self.make_request("POST", "/auth/login", login_data)
        if success and status == 200:
            data = response.json()
            self.auth_token = data.get("token")
            self.user_id = data.get("user", {}).get("user_id")
            self.log_result("User login", True, f"Token received")
        else:
            self.log_result("User login", False, f"Status: {status}")
    
    def test_value_discovery_game(self):
        """Test value discovery game flow"""
        print("\n=== VALUE DISCOVERY GAME TESTS ===")
        
        # Test get game tiles
        success, response, status = self.make_request("GET", "/game/tiles")
        if success and status == 200:
            data = response.json()
            rounds = data.get("rounds", [])
            total_rounds = data.get("total_rounds", 0)
            if len(rounds) == 8 and total_rounds == 8:
                self.log_result("Get game tiles", True, f"8 rounds with 4 words each")
            else:
                self.log_result("Get game tiles", False, f"Expected 8 rounds, got {len(rounds)}")
        else:
            self.log_result("Get game tiles", False, f"Status: {status}")
            return
        
        # Test game submission with realistic selections
        game_selections = [
            {"round": 1, "word": "knowledge"},
            {"round": 2, "word": "cooperation"},
            {"round": 3, "word": "organization"},
            {"round": 4, "word": "harmony"},
            {"round": 5, "word": "together"},
            {"round": 6, "word": "support"},
            {"round": 7, "word": "teamwork"},
            {"round": 8, "word": "planning"}
        ]
        
        submission_data = {"selections": game_selections}
        success, response, status = self.make_request("POST", "/game/submit", submission_data)
        if success and status == 200:
            data = response.json()
            value_profile = data.get("value_profile", {})
            env_prefs = data.get("environment_preferences", {})
            if value_profile and env_prefs:
                self.log_result("Game submission", True, f"Profile created with {len(value_profile)} values")
            else:
                self.log_result("Game submission", False, "Missing profile data")
        else:
            self.log_result("Game submission", False, f"Status: {status}")
        
        # Verify user profile was updated
        success, response, status = self.make_request("GET", "/auth/me")
        if success and status == 200:
            data = response.json()
            if data.get("game_completed") and data.get("value_profile"):
                self.log_result("Profile update verification", True, "User profile updated correctly")
            else:
                self.log_result("Profile update verification", False, "Profile not updated")
        else:
            self.log_result("Profile update verification", False, f"Status: {status}")
    
    def test_community_endpoints(self):
        """Test community CRUD operations"""
        print("\n=== COMMUNITY ENDPOINTS TESTS ===")
        
        # Test get all communities
        success, response, status = self.make_request("GET", "/communities")
        if success and status == 200:
            communities = response.json()
            self.log_result("Get all communities", True, f"Found {len(communities)} communities")
        else:
            self.log_result("Get all communities", False, f"Status: {status}")
        
        # Test create community
        community_data = {
            "name": "Tech Innovators Hub",
            "description": "A community for technology enthusiasts and innovators who love to collaborate on cutting-edge projects.",
            "image": "https://example.com/tech-hub.jpg",
            "value_profile": {
                "community_oriented": 0.8,
                "structured": 0.6,
                "competitive": 0.4,
                "intellectual": 0.9,
                "tradition": 0.2
            },
            "environment_settings": {
                "group_size": "medium",
                "interaction_style": "deep conversations",
                "pace": "balanced",
                "frequency": "regular"
            }
        }
        
        success, response, status = self.make_request("POST", "/communities", community_data)
        if success and status == 200:
            data = response.json()
            self.test_community_id = data.get("community_id")
            self.log_result("Create community", True, f"Community ID: {self.test_community_id}")
        else:
            self.log_result("Create community", False, f"Status: {status}")
        
        # Test get single community
        if self.test_community_id:
            success, response, status = self.make_request("GET", f"/communities/{self.test_community_id}")
            if success and status == 200:
                data = response.json()
                self.log_result("Get single community", True, f"Name: {data.get('name')}")
            else:
                self.log_result("Get single community", False, f"Status: {status}")
        
        # Test get user's joined communities
        success, response, status = self.make_request("GET", "/communities/my/joined")
        if success and status == 200:
            communities = response.json()
            self.log_result("Get joined communities", True, f"User is in {len(communities)} communities")
        else:
            self.log_result("Get joined communities", False, f"Status: {status}")
    
    def test_community_actions(self):
        """Test community join/skip/leave actions"""
        print("\n=== COMMUNITY ACTIONS TESTS ===")
        
        if not self.test_community_id:
            self.log_result("Community actions", False, "No test community available")
            return
        
        # Test skip community
        success, response, status = self.make_request("POST", f"/communities/{self.test_community_id}/skip")
        if success and status == 200:
            self.log_result("Skip community", True, "Skip action recorded")
        else:
            self.log_result("Skip community", False, f"Status: {status}")
        
        # Test join community
        success, response, status = self.make_request("POST", f"/communities/{self.test_community_id}/join")
        if success and status == 200:
            self.log_result("Join community", True, "Successfully joined")
        else:
            self.log_result("Join community", False, f"Status: {status}")
        
        # Test join same community again (should handle gracefully)
        success, response, status = self.make_request("POST", f"/communities/{self.test_community_id}/join")
        if success and status == 200:
            data = response.json()
            if "already" in data.get("message", "").lower():
                self.log_result("Duplicate join protection", True, "Correctly handled duplicate join")
            else:
                self.log_result("Duplicate join protection", False, "Should prevent duplicate joins")
        else:
            self.log_result("Duplicate join protection", False, f"Status: {status}")
        
        # Test leave community
        success, response, status = self.make_request("POST", f"/communities/{self.test_community_id}/leave")
        if success and status == 200:
            self.log_result("Leave community", True, "Successfully left")
        else:
            self.log_result("Leave community", False, f"Status: {status}")
    
    def test_ai_matching(self):
        """Test AI matching functionality"""
        print("\n=== AI MATCHING TESTS ===")
        
        # Test get matches (should work after completing game)
        success, response, status = self.make_request("GET", "/matches")
        if success and status == 200:
            matches = response.json()
            if isinstance(matches, list):
                self.log_result("Get AI matches", True, f"Found {len(matches)} potential matches")
                
                # Verify match structure
                if matches:
                    match = matches[0]
                    required_fields = ["community_id", "community_name", "compatibility_score", "why_it_matches"]
                    if all(field in match for field in required_fields):
                        score = match.get("compatibility_score", 0)
                        self.log_result("Match data structure", True, f"Top match score: {score}%")
                    else:
                        self.log_result("Match data structure", False, "Missing required fields")
            else:
                self.log_result("Get AI matches", False, "Response is not a list")
        elif status == 400:
            self.log_result("Get AI matches", True, "Correctly requires completed game")
        else:
            self.log_result("Get AI matches", False, f"Status: {status}")
    
    def test_edge_cases(self):
        """Test edge cases and error handling"""
        print("\n=== EDGE CASES TESTS ===")
        
        # Test invalid community ID
        success, response, status = self.make_request("GET", "/communities/invalid_id")
        if success and status == 404:
            self.log_result("Invalid community ID", True, "Correctly returns 404")
        else:
            self.log_result("Invalid community ID", False, f"Status: {status}")
        
        # Test invalid login credentials
        temp_token = self.auth_token
        self.auth_token = None
        
        invalid_login = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response, status = self.make_request("POST", "/auth/login", invalid_login)
        if success and status == 401:
            self.log_result("Invalid login credentials", True, "Correctly rejected")
        else:
            self.log_result("Invalid login credentials", False, f"Status: {status}")
        
        self.auth_token = temp_token
        
        # Test malformed game submission
        invalid_game = {"selections": [{"invalid": "data"}]}
        success, response, status = self.make_request("POST", "/game/submit", invalid_game)
        if success and status in [400, 422, 500]:
            self.log_result("Invalid game submission", True, "Correctly handled malformed data")
        else:
            self.log_result("Invalid game submission", False, f"Status: {status}")
    
    def test_logout(self):
        """Test logout functionality"""
        print("\n=== LOGOUT TEST ===")
        
        success, response, status = self.make_request("POST", "/auth/logout")
        if success and status == 200:
            self.log_result("User logout", True, "Successfully logged out")
        else:
            self.log_result("User logout", False, f"Status: {status}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting AI Community Matching Backend Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run test suites in order
        self.test_health_check()
        self.test_authentication_flow()
        self.test_value_discovery_game()
        self.test_community_endpoints()
        self.test_community_actions()
        self.test_ai_matching()
        self.test_edge_cases()
        self.test_logout()
        
        end_time = time.time()
        duration = round(end_time - start_time, 2)
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"⏱️  Duration: {duration}s")
        
        if self.results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed'])) * 100
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 Excellent! Backend is working well.")
        elif success_rate >= 75:
            print("👍 Good! Minor issues to address.")
        else:
            print("⚠️  Significant issues found. Review failed tests.")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()