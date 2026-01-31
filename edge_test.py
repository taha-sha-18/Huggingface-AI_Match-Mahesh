#!/usr/bin/env python3
"""
Additional Backend Tests for Edge Cases
"""

import requests
import json

BASE_URL = "https://huggingface-key.preview.emergentagent.com/api"

def test_specific_scenarios():
    """Test specific edge cases"""
    print("🔍 Testing specific edge cases...")
    
    # Test 1: Register a new user and complete full flow
    test_email = "test.user.edge@example.com"
    register_data = {
        "email": test_email,
        "password": "TestPass123!",
        "name": "Test Edge User"
    }
    
    # Register
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        data = response.json()
        token = data.get("token")
        print("✅ New user registered successfully")
        
        # Test game submission with valid data
        headers = {"Authorization": f"Bearer {token}"}
        game_data = {
            "selections": [
                {"round": 1, "word": "adventure"},
                {"round": 2, "word": "autonomy"},
                {"round": 3, "word": "organization"},
                {"round": 4, "word": "excellence"},
                {"round": 5, "word": "independence"},
                {"round": 6, "word": "self-reliance"},
                {"round": 7, "word": "achievement"},
                {"round": 8, "word": "family"}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/game/submit", json=game_data, headers=headers)
        if response.status_code == 200:
            print("✅ Game submission works correctly")
            
            # Test AI matches after game completion
            response = requests.get(f"{BASE_URL}/matches", headers=headers)
            if response.status_code == 200:
                matches = response.json()
                print(f"✅ AI matching works: {len(matches)} matches found")
                
                if matches:
                    top_match = matches[0]
                    print(f"   Top match: {top_match['community_name']} ({top_match['compatibility_score']}%)")
            else:
                print(f"❌ AI matching failed: {response.status_code}")
        else:
            print(f"❌ Game submission failed: {response.status_code}")
    else:
        print(f"❌ User registration failed: {response.status_code}")

if __name__ == "__main__":
    test_specific_scenarios()