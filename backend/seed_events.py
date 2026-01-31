import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import uuid

async def seed_events():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["community_matching_db"]
    
    # Sample events with diverse value profiles and themes
    events = [
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "AI & Machine Learning Workshop",
            "description": "Hands-on workshop covering latest ML techniques, neural networks, and practical applications. Bring your laptop!",
            "event_type": "workshop",
            "date": datetime.now(timezone.utc) + timedelta(days=7),
            "location": "Tech Hub, Downtown",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 45,
            "value_profile": {
                "community_oriented": 0.6,
                "structured": 0.8,
                "competitive": 0.5,
                "intellectual": 0.95,
                "tradition": 0.2
            },
            "tags": ["AI", "Technology", "Learning", "Workshop"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "Sunset Yoga & Meditation Retreat",
            "description": "Join us for a peaceful evening of yoga, meditation, and mindfulness by the lake. All levels welcome.",
            "event_type": "wellness",
            "date": datetime.now(timezone.utc) + timedelta(days=3),
            "location": "Lakeside Park",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 28,
            "value_profile": {
                "community_oriented": 0.75,
                "structured": 0.4,
                "competitive": 0.1,
                "intellectual": 0.3,
                "tradition": 0.7
            },
            "tags": ["Wellness", "Yoga", "Meditation", "Mindfulness"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "Startup Pitch Night 2026",
            "description": "Watch innovative startups pitch their ideas to investors. Networking session follows. Great for entrepreneurs!",
            "event_type": "networking",
            "date": datetime.now(timezone.utc) + timedelta(days=10),
            "location": "Innovation Center",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 120,
            "value_profile": {
                "community_oriented": 0.65,
                "structured": 0.7,
                "competitive": 0.9,
                "intellectual": 0.85,
                "tradition": 0.15
            },
            "tags": ["Startup", "Business", "Networking", "Innovation"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "Mountain Hiking Adventure",
            "description": "Challenging 10-mile hike through scenic mountain trails. Experience required. Bring water and snacks!",
            "event_type": "outdoor",
            "date": datetime.now(timezone.utc) + timedelta(days=5),
            "location": "Blue Ridge Mountains",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 35,
            "value_profile": {
                "community_oriented": 0.5,
                "structured": 0.3,
                "competitive": 0.6,
                "intellectual": 0.2,
                "tradition": 0.1
            },
            "tags": ["Outdoor", "Hiking", "Adventure", "Nature"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "Book Discussion: Classic Literature",
            "description": "Monthly book club meeting to discuss 'Pride and Prejudice'. Tea and snacks provided. Thoughtful discourse expected.",
            "event_type": "cultural",
            "date": datetime.now(timezone.utc) + timedelta(days=14),
            "location": "City Library",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 22,
            "value_profile": {
                "community_oriented": 0.8,
                "structured": 0.75,
                "competitive": 0.2,
                "intellectual": 0.9,
                "tradition": 0.8
            },
            "tags": ["Books", "Literature", "Discussion", "Culture"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "Creative Arts Jam Session",
            "description": "Bring your instruments, paints, or creative energy! Open mic, collaborative art projects, and spontaneous performances.",
            "event_type": "social",
            "date": datetime.now(timezone.utc) + timedelta(days=2),
            "location": "Arts District Studio",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 40,
            "value_profile": {
                "community_oriented": 0.7,
                "structured": 0.2,
                "competitive": 0.25,
                "intellectual": 0.6,
                "tradition": 0.15
            },
            "tags": ["Arts", "Music", "Creative", "Social"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "5K Charity Run for Education",
            "description": "Competitive 5K race benefiting local schools. Prizes for top finishers. All ages welcome!",
            "event_type": "sports",
            "date": datetime.now(timezone.utc) + timedelta(days=21),
            "location": "City Park",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 150,
            "value_profile": {
                "community_oriented": 0.8,
                "structured": 0.85,
                "competitive": 0.85,
                "intellectual": 0.3,
                "tradition": 0.5
            },
            "tags": ["Sports", "Running", "Charity", "Competition"]
        },
        {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "name": "Local History Walking Tour",
            "description": "Explore the city's hidden historical gems with our expert guide. Learn fascinating stories from the past.",
            "event_type": "educational",
            "date": datetime.now(timezone.utc) + timedelta(days=6),
            "location": "Historic District",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "attendees": ["system"],
            "attendee_count": 18,
            "value_profile": {
                "community_oriented": 0.65,
                "structured": 0.7,
                "competitive": 0.15,
                "intellectual": 0.85,
                "tradition": 0.95
            },
            "tags": ["History", "Education", "Walking", "Culture"]
        }
    ]
    
    # Clear existing events (optional)
    await db.events.delete_many({"creator_id": "system"})
    
    # Insert events
    result = await db.events.insert_many(events)
    print(f"✅ Inserted {len(result.inserted_ids)} events")
    
    # Print events
    for event in events:
        print(f"  - {event['name']} ({event['event_type']}) - {event['attendee_count']} attendees")
        print(f"    📅 {event['date'].strftime('%B %d, %Y')} @ {event['location']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_events())
