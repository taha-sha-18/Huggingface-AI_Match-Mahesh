"""
MongoDB HTTP Proxy for external connections
Exposes MongoDB via HTTP for MongoDB Compass connection
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

mongo_proxy_router = APIRouter(prefix="/mongo-proxy")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'community_matching_db')

@mongo_proxy_router.get("/info")
async def get_mongo_info():
    """Get MongoDB connection information"""
    return {
        "connection_string": MONGO_URL,
        "database": DB_NAME,
        "note": "Use MongoDB Compass with SSH tunnel or connect via this proxy",
        "compass_instructions": {
            "step1": "Install MongoDB Compass",
            "step2": "Use connection string below",
            "step3": "Or use SSH tunnel to connect directly"
        }
    }

@mongo_proxy_router.get("/collections")
async def list_collections():
    """List all collections"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        collections = await db.list_collection_names()
        client.close()
        return {"collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@mongo_proxy_router.get("/collections/{collection_name}")
async def get_collection_data(collection_name: str, limit: int = 50, skip: int = 0):
    """Get data from a collection"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get documents
        cursor = db[collection_name].find({}, {"_id": 0}).skip(skip).limit(limit)
        documents = await cursor.to_list(length=limit)
        
        # Get count
        count = await db[collection_name].count_documents({})
        
        client.close()
        
        return {
            "collection": collection_name,
            "total": count,
            "skip": skip,
            "limit": limit,
            "documents": documents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@mongo_proxy_router.get("/stats")
async def get_database_stats():
    """Get database statistics"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        stats = await db.command("dbStats")
        
        client.close()
        
        return {
            "database": DB_NAME,
            "collections": stats.get("collections"),
            "objects": stats.get("objects"),
            "dataSize": stats.get("dataSize"),
            "storageSize": stats.get("storageSize"),
            "indexes": stats.get("indexes"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
