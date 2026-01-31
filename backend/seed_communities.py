import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

async def seed_communities():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["community_matching_db"]
    
    # Sample communities with diverse value profiles
    communities = [
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Tech Innovators Hub",
            "description": "A community for tech enthusiasts who love building, learning, and pushing boundaries. We meet weekly for hackathons and tech talks.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.7,
                "structured": 0.6,
                "competitive": 0.7,
                "intellectual": 0.9,
                "tradition": 0.2
            },
            "environment_settings": {
                "group_size": "medium",
                "interaction_style": "deep conversations",
                "pace": "fast-paced"
            },
            "member_count": 145
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Mindful Living Circle",
            "description": "Join us for meditation, yoga, and mindful discussions. A supportive space for personal growth and inner peace.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.8,
                "structured": 0.4,
                "competitive": 0.2,
                "intellectual": 0.5,
                "tradition": 0.6
            },
            "environment_settings": {
                "group_size": "small",
                "interaction_style": "deep conversations",
                "pace": "relaxed"
            },
            "member_count": 78
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Adventure Seekers Society",
            "description": "For those who crave adrenaline and new experiences! We organize hiking, rock climbing, and outdoor adventures every weekend.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.6,
                "structured": 0.3,
                "competitive": 0.6,
                "intellectual": 0.3,
                "tradition": 0.1
            },
            "environment_settings": {
                "group_size": "medium",
                "interaction_style": "activity-based",
                "pace": "fast-paced"
            },
            "member_count": 210
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Book Club Collective",
            "description": "Monthly book discussions, author meetups, and literary events. A welcoming space for all readers to share their love of books.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.75,
                "structured": 0.7,
                "competitive": 0.2,
                "intellectual": 0.85,
                "tradition": 0.5
            },
            "environment_settings": {
                "group_size": "small",
                "interaction_style": "deep conversations",
                "pace": "balanced"
            },
            "member_count": 92
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Startup Founders Network",
            "description": "Connect with fellow entrepreneurs, share insights, and collaborate on ventures. Weekly pitch nights and networking events.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.65,
                "structured": 0.55,
                "competitive": 0.85,
                "intellectual": 0.8,
                "tradition": 0.25
            },
            "environment_settings": {
                "group_size": "medium",
                "interaction_style": "casual mingling",
                "pace": "fast-paced"
            },
            "member_count": 167
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Creative Arts Collective",
            "description": "A welcoming space for artists, musicians, and creatives. Share your work, collaborate, and inspire each other.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.7,
                "structured": 0.35,
                "competitive": 0.3,
                "intellectual": 0.6,
                "tradition": 0.3
            },
            "environment_settings": {
                "group_size": "medium",
                "interaction_style": "activity-based",
                "pace": "balanced"
            },
            "member_count": 134
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Local History Society",
            "description": "Preserve and celebrate our community's heritage. Monthly talks, historical tours, and archival projects.",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.8,
                "structured": 0.75,
                "competitive": 0.2,
                "intellectual": 0.75,
                "tradition": 0.9
            },
            "environment_settings": {
                "group_size": "small",
                "interaction_style": "deep conversations",
                "pace": "relaxed"
            },
            "member_count": 56
        },
        {
            "community_id": f"comm_{uuid.uuid4().hex[:12]}",
            "name": "Fitness Warriors",
            "description": "Push your limits with group workouts, fitness challenges, and motivational support. All fitness levels welcome!",
            "image": None,
            "creator_id": "system",
            "created_at": datetime.now(timezone.utc),
            "members": ["system"],
            "value_profile": {
                "community_oriented": 0.75,
                "structured": 0.8,
                "competitive": 0.75,
                "intellectual": 0.3,
                "tradition": 0.4
            },
            "environment_settings": {
                "group_size": "large",
                "interaction_style": "activity-based",
                "pace": "fast-paced"
            },
            "member_count": 298
        }
    ]
    
    # Clear existing communities (optional)
    await db.communities.delete_many({"creator_id": "system"})
    
    # Insert communities
    result = await db.communities.insert_many(communities)
    print(f"✅ Inserted {len(result.inserted_ids)} communities")
    
    # Print communities
    for comm in communities:
        print(f"  - {comm['name']} ({comm['member_count']} members)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_communities())
