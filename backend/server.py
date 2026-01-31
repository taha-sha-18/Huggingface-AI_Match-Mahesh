from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt
import jwt
import requests
import numpy as np

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Environment variables
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
HUGGINGFACE_TOKEN = os.environ.get('HUGGINGFACE_TOKEN')
HUGGINGFACE_API_URL = "https://router.huggingface.co/pipeline/feature-extraction/BAAI/bge-base-en-v1.5"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    password_hash: Optional[str] = None
    value_profile: Optional[Dict[str, Any]] = None
    environment_preferences: Optional[Dict[str, Any]] = None
    game_completed: bool = False

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class Community(BaseModel):
    community_id: str
    name: str
    description: str
    image: Optional[str] = None
    creator_id: str
    created_at: datetime
    members: List[str] = []
    value_profile: Dict[str, float]
    environment_settings: Dict[str, str]
    member_count: int = 0

class CommunityCreate(BaseModel):
    name: str
    description: str
    image: Optional[str] = None
    value_profile: Dict[str, float]
    environment_settings: Dict[str, str]

class GameResponse(BaseModel):
    user_id: str
    round_number: int
    selected_word: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameSubmission(BaseModel):
    selections: List[Dict[str, Any]]  # List of {round: int, word: str}

class UserAction(BaseModel):
    user_id: str
    community_id: str
    action: str  # 'join' or 'skip'
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommunityMatch(BaseModel):
    community_id: str
    community_name: str
    description: str
    image: Optional[str] = None
    compatibility_score: float
    why_it_matches: str
    possible_friction: Optional[str] = None
    value_profile: Dict[str, float]
    environment_settings: Dict[str, str]
    member_count: int

class Event(BaseModel):
    event_id: str
    name: str
    description: str
    event_type: str  # workshop, meetup, conference, social, etc.
    date: datetime
    location: str
    image: Optional[str] = None
    creator_id: str
    created_at: datetime
    attendees: List[str] = []
    attendee_count: int = 0
    value_profile: Dict[str, float]
    tags: List[str] = []

class EventCreate(BaseModel):
    name: str
    description: str
    event_type: str
    date: datetime
    location: str
    image: Optional[str] = None
    value_profile: Dict[str, float]
    tags: List[str] = []

class EventMatch(BaseModel):
    event_id: str
    event_name: str
    description: str
    event_type: str
    date: datetime
    location: str
    image: Optional[str] = None
    compatibility_score: float
    why_it_matches: str
    possible_friction: Optional[str] = None
    value_profile: Dict[str, float]
    attendee_count: int
    tags: List[str]

# ==================== VALUE DISCOVERY GAME DATA ====================

# 10 core values with representative words for each
VALUE_WORDS = {
    "community_oriented": ["community", "together", "belonging", "family"],
    "independent": ["independence", "autonomy", "self-reliance", "freedom"],
    "structured": ["organization", "planning", "order", "discipline"],
    "spontaneous": ["spontaneity", "flexibility", "adventure", "surprise"],
    "competitive": ["competition", "achievement", "winning", "excellence"],
    "collaborative": ["cooperation", "teamwork", "harmony", "support"],
    "intellectual": ["knowledge", "learning", "wisdom", "analysis"],
    "experiential": ["experience", "action", "doing", "practice"],
    "tradition": ["tradition", "heritage", "roots", "stability"],
    "novelty": ["innovation", "creativity", "change", "exploration"],
}

# 8 rounds of tiles - each with 4 words representing different values
GAME_TILES = [
    # Round 1: Adventure vs Security vs Learning vs Connection
    ["adventure", "stability", "knowledge", "belonging"],
    # Round 2: Independence vs Teamwork vs Achievement vs Creativity
    ["autonomy", "cooperation", "winning", "innovation"],
    # Round 3: Planning vs Flexibility vs Tradition vs Experience
    ["organization", "spontaneity", "heritage", "action"],
    # Round 4: Competition vs Harmony vs Wisdom vs Change
    ["excellence", "harmony", "learning", "exploration"],
    # Round 5: Freedom vs Community vs Order vs Novelty
    ["independence", "together", "discipline", "creativity"],
    # Round 6: Self-reliance vs Support vs Analysis vs Practice
    ["self-reliance", "support", "analysis", "practice"],
    # Round 7: Achievement vs Collaboration vs Roots vs Surprise
    ["achievement", "teamwork", "roots", "surprise"],
    # Round 8: Family vs Freedom vs Planning vs Doing
    ["family", "freedom", "planning", "doing"],
]

# Map words to their primary value
WORD_TO_VALUE = {
    # Community-oriented
    "community": "community_oriented", "together": "community_oriented",
    "belonging": "community_oriented", "family": "community_oriented",
    # Independent
    "independence": "independent", "autonomy": "independent",
    "self-reliance": "independent", "freedom": "independent",
    # Structured
    "organization": "structured", "planning": "structured",
    "order": "structured", "discipline": "structured",
    # Spontaneous
    "spontaneity": "spontaneous", "flexibility": "spontaneous",
    "adventure": "spontaneous", "surprise": "spontaneous",
    # Competitive
    "competition": "competitive", "achievement": "competitive",
    "winning": "competitive", "excellence": "competitive",
    # Collaborative
    "cooperation": "collaborative", "teamwork": "collaborative",
    "harmony": "collaborative", "support": "collaborative",
    # Intellectual
    "knowledge": "intellectual", "learning": "intellectual",
    "wisdom": "intellectual", "analysis": "intellectual",
    # Experiential
    "experience": "experiential", "action": "experiential",
    "doing": "experiential", "practice": "experiential",
    # Tradition
    "tradition": "tradition", "heritage": "tradition",
    "roots": "tradition", "stability": "tradition",
    # Novelty
    "innovation": "novelty", "creativity": "novelty",
    "change": "novelty", "exploration": "novelty",
}

# ==================== HUGGINGFACE INTEGRATION ====================

def get_embedding(text: str) -> Optional[List[float]]:
    """Get embedding from HuggingFace API"""
    try:
        headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"}
        response = requests.post(
            HUGGINGFACE_API_URL,
            headers=headers,
            json={"inputs": text, "options": {"wait_for_model": True}}
        )
        if response.status_code == 200:
            result = response.json()
            # Handle both array and nested array responses
            if isinstance(result, list):
                if len(result) > 0 and isinstance(result[0], list):
                    return result[0]  # Return first embedding if nested
                return result
            return None
        else:
            logger.error(f"HuggingFace API error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error getting embedding: {str(e)}")
        return None

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))

# ==================== AUTHENTICATION HELPERS ====================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> User:
    """Get current user from session token or JWT"""
    # Try session_token from cookie first
    session_token = request.cookies.get('session_token')
    
    if session_token:
        # Emergent Auth session
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session["expires_at"]
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user_doc:
                    return User(**user_doc)
    
    # Try Authorization header (JWT for email/password auth)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get('user_id')
            if user_id:
                user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
                if user_doc:
                    return User(**user_doc)
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except (jwt.InvalidTokenError, jwt.DecodeError, Exception):
            raise HTTPException(status_code=401, detail="Invalid token")
    
    raise HTTPException(status_code=401, detail="Not authenticated")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    """Register new user with email/password"""
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "picture": None,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
        "game_completed": False,
        "value_profile": None,
        "environment_preferences": None
    }
    
    await db.users.insert_one(user_doc)
    
    # Create JWT token
    token = create_access_token({"user_id": user_id, "email": user_data.email})
    
    # Get user without _id for response
    user_response = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    return {
        "user": user_response,
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login with email/password"""
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not user_doc.get('password_hash'):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_access_token({"user_id": user_doc['user_id'], "email": user_doc['email']})
    
    # Remove password hash from response
    user_response = {k: v for k, v in user_doc.items() if k != 'password_hash'}
    
    return {
        "user": user_response,
        "token": token
    }

@api_router.get("/auth/session-data")
async def get_session_data(request: Request, response: Response):
    """Exchange session_id for session data (Emergent Auth)"""
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            user_data = auth_response.json()
        except Exception as e:
            logger.error(f"Error calling Emergent Auth API: {str(e)}")
            raise HTTPException(status_code=500, detail="Authentication service error")
    
    # Check if user exists, if not create
    user_doc = await db.users.find_one({"email": user_data['email']}, {"_id": 0})
    
    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": user_data['email'],
            "name": user_data['name'],
            "picture": user_data.get('picture'),
            "created_at": datetime.now(timezone.utc),
            "game_completed": False,
            "value_profile": None,
            "environment_preferences": None
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = user_data['session_token']
    await db.user_sessions.insert_one({
        "user_id": user_doc['user_id'],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return SessionDataResponse(**user_data)

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user"""
    user_dict = current_user.dict()
    user_dict.pop('password_hash', None)
    return user_dict

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}

# ==================== GAME ENDPOINTS ====================

@api_router.get("/game/tiles")
async def get_game_tiles(current_user: User = Depends(get_current_user)):
    """Get all game tiles for the value discovery game"""
    return {
        "rounds": GAME_TILES,
        "total_rounds": len(GAME_TILES)
    }

@api_router.post("/game/submit")
async def submit_game(submission: GameSubmission, current_user: User = Depends(get_current_user)):
    """Process game submissions and generate value profile"""
    try:
        # Save each selection
        for selection in submission.selections:
            await db.game_responses.insert_one({
                "user_id": current_user.user_id,
                "round_number": selection['round'],
                "selected_word": selection['word'],
                "timestamp": datetime.now(timezone.utc)
            })
        
        # Calculate value scores based on selections
        value_counts = {
            "community_oriented": 0, "independent": 0,
            "structured": 0, "spontaneous": 0,
            "competitive": 0, "collaborative": 0,
            "intellectual": 0, "experiential": 0,
            "tradition": 0, "novelty": 0
        }
        
        # Count selections for each value
        for selection in submission.selections:
            word = selection['word']
            value = WORD_TO_VALUE.get(word)
            if value:
                value_counts[value] += 1
        
        # Get embeddings for selected words to enhance inference (reserved for future use)
        # selected_words = [s['word'] for s in submission.selections]
        # words_text = ", ".join(selected_words)  # Reserved for future enhancement
        # user_embedding = get_embedding(words_text)  # Reserved for future enhancement
        
        # Calculate normalized scores (0-1 scale) with embedding influence
        total_selections = len(submission.selections)
        value_profile = {}
        
        # For opposing pairs, normalize to 0-1 scale where 0.5 is neutral
        value_profile["community_oriented"] = value_counts["community_oriented"] / total_selections
        value_profile["structured"] = value_counts["structured"] / total_selections
        value_profile["competitive"] = value_counts["competitive"] / total_selections
        value_profile["intellectual"] = value_counts["intellectual"] / total_selections
        value_profile["tradition"] = value_counts["tradition"] / total_selections
        value_profile["experiential"] = value_counts["experiential"] / total_selections
        
        # Determine social energy level
        community_score = value_counts["community_oriented"]
        if community_score >= 3:
            social_energy = "high"
        elif community_score >= 1:
            social_energy = "medium"
        else:
            social_energy = "low"
        
        # Infer environment preferences
        environment_preferences = {
            "group_size": "large" if value_profile["community_oriented"] > 0.6 else ("small" if value_profile["community_oriented"] < 0.3 else "medium"),
            "interaction_style": "deep conversations" if value_profile["intellectual"] > 0.5 else ("activity-based" if value_profile["experiential"] > 0.5 else "casual mingling"),
            "pace": "fast-paced" if value_profile["competitive"] > 0.5 else ("relaxed" if value_profile["tradition"] > 0.5 else "balanced"),
            "frequency": "high involvement" if value_profile["community_oriented"] > 0.6 else ("occasional" if value_profile["community_oriented"] < 0.3 else "regular"),
            "social_energy": social_energy
        }
        
        # Update user profile
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {
                "value_profile": value_profile,
                "environment_preferences": environment_preferences,
                "game_completed": True
            }}
        )
        
        return {
            "value_profile": value_profile,
            "environment_preferences": environment_preferences,
            "message": "Profile created successfully"
        }
        
    except Exception as e:
        logger.error(f"Error processing game submission: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== COMMUNITY ENDPOINTS ====================

@api_router.post("/communities")
async def create_community(community: CommunityCreate, current_user: User = Depends(get_current_user)):
    """Create a new community"""
    community_id = f"comm_{uuid.uuid4().hex[:12]}"
    
    community_doc = {
        "community_id": community_id,
        "name": community.name,
        "description": community.description,
        "image": community.image,
        "creator_id": current_user.user_id,
        "created_at": datetime.now(timezone.utc),
        "members": [current_user.user_id],
        "value_profile": community.value_profile,
        "environment_settings": community.environment_settings,
        "member_count": 1
    }
    
    await db.communities.insert_one(community_doc)
    return {"community_id": community_id, "message": "Community created successfully"}

@api_router.get("/communities")
async def get_communities(current_user: User = Depends(get_current_user)):
    """Get all communities"""
    communities = await db.communities.find({}, {"_id": 0}).to_list(1000)
    return communities

@api_router.get("/communities/{community_id}")
async def get_community(community_id: str, current_user: User = Depends(get_current_user)):
    """Get community details"""
    community = await db.communities.find_one({"community_id": community_id}, {"_id": 0})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community

@api_router.post("/communities/{community_id}/join")
async def join_community(community_id: str, current_user: User = Depends(get_current_user)):
    """Join a community"""
    community = await db.communities.find_one({"community_id": community_id}, {"_id": 0})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    if current_user.user_id in community['members']:
        return {"message": "Already a member"}
    
    # Add user to members
    await db.communities.update_one(
        {"community_id": community_id},
        {
            "$push": {"members": current_user.user_id},
            "$inc": {"member_count": 1}
        }
    )
    
    # Record action for feedback loop
    await db.user_actions.insert_one({
        "user_id": current_user.user_id,
        "community_id": community_id,
        "action": "join",
        "timestamp": datetime.now(timezone.utc)
    })
    
    return {"message": "Joined successfully"}

@api_router.post("/communities/{community_id}/leave")
async def leave_community(community_id: str, current_user: User = Depends(get_current_user)):
    """Leave a community"""
    await db.communities.update_one(
        {"community_id": community_id},
        {
            "$pull": {"members": current_user.user_id},
            "$inc": {"member_count": -1}
        }
    )
    return {"message": "Left successfully"}

@api_router.post("/communities/{community_id}/skip")
async def skip_community(community_id: str, current_user: User = Depends(get_current_user)):
    """Skip a community (for feedback loop)"""
    # Record skip action
    await db.user_actions.insert_one({
        "user_id": current_user.user_id,
        "community_id": community_id,
        "action": "skip",
        "timestamp": datetime.now(timezone.utc)
    })
    return {"message": "Skipped"}

@api_router.get("/communities/my/joined")
async def get_my_communities(current_user: User = Depends(get_current_user)):
    """Get communities user has joined"""
    communities = await db.communities.find(
        {"members": current_user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return communities

# ==================== MATCHING ENDPOINTS ====================

def generate_profile_text(value_profile: Dict[str, float], environment_prefs: Optional[Dict[str, str]] = None) -> str:
    """Generate descriptive text from value profile for embedding"""
    texts = []
    
    # Value descriptions
    if value_profile.get('community_oriented', 0) > 0.6:
        texts.append("highly community-oriented and collaborative")
    elif value_profile.get('community_oriented', 0) < 0.4:
        texts.append("independent and self-directed")
    
    if value_profile.get('intellectual', 0) > 0.6:
        texts.append("intellectually focused and analytical")
    elif value_profile.get('intellectual', 0) < 0.4:
        texts.append("hands-on and experiential")
    
    if value_profile.get('competitive', 0) > 0.6:
        texts.append("competitive and achievement-oriented")
    elif value_profile.get('competitive', 0) < 0.4:
        texts.append("collaborative and supportive")
    
    if value_profile.get('structured', 0) > 0.6:
        texts.append("organized and structured")
    elif value_profile.get('structured', 0) < 0.4:
        texts.append("spontaneous and flexible")
    
    if value_profile.get('tradition', 0) > 0.6:
        texts.append("traditional and heritage-focused")
    elif value_profile.get('tradition', 0) < 0.4:
        texts.append("innovative and novelty-seeking")
    
    # Add environment preferences if available
    if environment_prefs:
        texts.append(f"prefers {environment_prefs.get('interaction_style', 'balanced interaction')}")
        texts.append(f"enjoys {environment_prefs.get('pace', 'balanced')} pace activities")
    
    return " ".join(texts)

@api_router.get("/matches")
async def get_matches(current_user: User = Depends(get_current_user)):
    """Get AI-matched communities for user"""
    if not current_user.value_profile:
        raise HTTPException(status_code=400, detail="Complete value discovery game first")
    
    # Use simple fallback matching (embeddings were causing timeout issues)
    return await get_matches_fallback(current_user)

async def get_matches_fallback(current_user: User):
    """Fallback matching without embeddings"""
    all_communities = await db.communities.find({}, {"_id": 0}).to_list(1000)
    user_actions = await db.user_actions.find({"user_id": current_user.user_id}, {"_id": 0}).to_list(1000)
    skipped_communities = [a['community_id'] for a in user_actions if a['action'] == 'skip']
    
    matches = []
    for community in all_communities:
        if current_user.user_id in community.get('members', []):
            continue
        
        user_values = current_user.value_profile
        comm_values = community['value_profile']
        similarities = []
        for key in user_values.keys():
            if key in comm_values:
                diff = abs(user_values[key] - comm_values[key])
                similarity = 1 - diff
                similarities.append(similarity)
        
        base_score = (sum(similarities) / len(similarities)) * 100 if similarities else 50
        if community['community_id'] in skipped_communities:
            base_score *= 0.8
        
        matches.append(CommunityMatch(
            community_id=community['community_id'],
            community_name=community['name'],
            description=community['description'],
            image=community.get('image'),
            compatibility_score=round(base_score, 1),
            why_it_matches="Based on your value profile alignment",
            possible_friction=None,
            value_profile=community['value_profile'],
            environment_settings=community['environment_settings'],
            member_count=community.get('member_count', 0)
        ))
    
    matches.sort(key=lambda x: x.compatibility_score, reverse=True)
    return matches

# ==================== EVENT ENDPOINTS ====================

@api_router.get("/events")
async def get_events(current_user: User = Depends(get_current_user)):
    """Get all events"""
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    return events

@api_router.get("/events/{event_id}")
async def get_event(event_id: str, current_user: User = Depends(get_current_user)):
    """Get event details"""
    event = await db.events.find_one({"event_id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.post("/events")
async def create_event(event: EventCreate, current_user: User = Depends(get_current_user)):
    """Create a new event"""
    event_id = f"event_{uuid.uuid4().hex[:12]}"
    
    event_doc = {
        "event_id": event_id,
        "name": event.name,
        "description": event.description,
        "event_type": event.event_type,
        "date": event.date,
        "location": event.location,
        "image": event.image,
        "creator_id": current_user.user_id,
        "created_at": datetime.now(timezone.utc),
        "attendees": [current_user.user_id],
        "attendee_count": 1,
        "value_profile": event.value_profile,
        "tags": event.tags
    }
    
    await db.events.insert_one(event_doc)
    return {"event_id": event_id, "message": "Event created successfully"}

@api_router.post("/events/{event_id}/attend")
async def attend_event(event_id: str, current_user: User = Depends(get_current_user)):
    \"\"\"Attend an event\"\"\"
    event = await db.events.find_one({"event_id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.user_id in event['attendees']:
        return {"message": "Already attending"}
    
    await db.events.update_one(
        {"event_id": event_id},
        {
            "$push": {"attendees": current_user.user_id},
            "$inc": {"attendee_count": 1}
        }
    )
    return {"message": "Attending event"}

@api_router.post("/events/{event_id}/cancel")
async def cancel_event_attendance(event_id: str, current_user: User = Depends(get_current_user)):
    \"\"\"Cancel event attendance\"\"\"
    await db.events.update_one(
        {"event_id": event_id},
        {
            "$pull": {"attendees": current_user.user_id},
            "$inc": {"attendee_count": -1}
        }
    )
    return {"message": "Attendance cancelled"}

@api_router.get("/events/matches")
async def get_event_matches(current_user: User = Depends(get_current_user)):
    \"\"\"Get AI-matched events for user using HuggingFace embeddings\"\"\"
    if not current_user.value_profile:
        raise HTTPException(status_code=400, detail="Complete value discovery game first")
    
    # Generate user profile text for embedding
    user_text = generate_profile_text(
        current_user.value_profile,
        current_user.environment_preferences
    )
    
    # Get user embedding from HuggingFace
    user_embedding = get_embedding(user_text)
    if not user_embedding:
        logger.warning("Could not get user embedding for events")
        return []
    
    # Get all events
    all_events = await db.events.find({}, {"_id": 0}).to_list(1000)
    
    matches = []
    
    for event in all_events:
        # Skip past events
        if event['date'] < datetime.now(timezone.utc):
            continue
        
        # Skip if already attending
        if current_user.user_id in event.get('attendees', []):
            continue
        
        # Generate event profile text
        event_text = f"{event['name']}. {event['description']}. {event['event_type']} event. " + generate_profile_text(event['value_profile'])
        
        # Get event embedding
        event_embedding = get_embedding(event_text)
        if not event_embedding:
            continue
        
        # Calculate cosine similarity using embeddings
        similarity = cosine_similarity(user_embedding, event_embedding)
        base_score = similarity * 100  # Convert to 0-100 scale
        
        # Generate match explanation
        why_matches = f"This {event['event_type']} event aligns with your interests and values. "
        if current_user.value_profile.get('intellectual', 0.5) > 0.6 and event['value_profile'].get('intellectual', 0.5) > 0.6:
            why_matches += "You'll enjoy the intellectual aspects. "
        if current_user.value_profile.get('community_oriented', 0.5) > 0.6:
            why_matches += "Great opportunity to connect with like-minded people. "
        
        friction = None
        if abs(current_user.value_profile.get('competitive', 0.5) - event['value_profile'].get('competitive', 0.5)) > 0.5:
            friction = "The competitive nature might not match your preferences."
        
        matches.append(EventMatch(
            event_id=event['event_id'],
            event_name=event['name'],
            description=event['description'],
            event_type=event['event_type'],
            date=event['date'],
            location=event['location'],
            image=event.get('image'),
            compatibility_score=round(max(0, min(100, base_score)), 1),
            why_it_matches=why_matches.strip(),
            possible_friction=friction,
            value_profile=event['value_profile'],
            attendee_count=event.get('attendee_count', 0),
            tags=event.get('tags', [])
        ))
    
    # Sort by compatibility score
    matches.sort(key=lambda x: x.compatibility_score, reverse=True)
    
    return matches

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "AI Community Matching API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "huggingface_configured": HUGGINGFACE_TOKEN is not None
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
