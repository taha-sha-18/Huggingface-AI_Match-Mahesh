from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import os

mongo_ui_router = APIRouter(prefix="/api/mongo-ui")

@mongo_ui_router.get("/", response_class=HTMLResponse)
async def mongo_ui():
    """Simple MongoDB browser UI"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>MongoDB Browser</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #1a1a1a;
                color: #fff;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            h1 {
                color: #6366F1;
                border-bottom: 2px solid #6366F1;
                padding-bottom: 10px;
            }
            .info {
                background: #2a2a2a;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .collections {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            .collection-card {
                background: #2a2a2a;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #6366F1;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .collection-card:hover {
                transform: translateY(-2px);
                background: #3a3a3a;
            }
            .collection-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #6366F1;
            }
            .collection-stat {
                font-size: 14px;
                color: #9CA3AF;
                margin: 5px 0;
            }
            code {
                background: #1a1a1a;
                padding: 2px 6px;
                border-radius: 4px;
                color: #F59E0B;
            }
            .note {
                background: #2a2a2a;
                border-left: 4px solid #F59E0B;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 MongoDB Database Browser</h1>
            
            <div class="info">
                <h2>Database: community_matching_db</h2>
                <p><strong>Connection:</strong> <code>mongodb://localhost:27017</code></p>
                <p><strong>Status:</strong> <span style="color: #10B981;">● Connected</span></p>
            </div>

            <div class="note">
                <strong>⚠️ Access MongoDB:</strong> Use mongosh or connect with MongoDB Compass
                <br><br>
                <strong>Connect String:</strong> <code>mongodb://localhost:27017/community_matching_db</code>
                <br><br>
                <strong>Command Line:</strong> <code>mongosh mongodb://localhost:27017/community_matching_db</code>
            </div>

            <h2>📁 Collections</h2>
            <div class="collections">
                <div class="collection-card" onclick="alert('Use mongosh to query: db.users.find().pretty()')">
                    <div class="collection-name">users</div>
                    <div class="collection-stat">User accounts & value profiles</div>
                    <div class="collection-stat">Fields: user_id, email, name, value_profile</div>
                </div>

                <div class="collection-card" onclick="alert('Use mongosh to query: db.communities.find().pretty()')">
                    <div class="collection-name">communities</div>
                    <div class="collection-stat">Community data</div>
                    <div class="collection-stat">Fields: community_id, name, description, members</div>
                </div>

                <div class="collection-card" onclick="alert('Use mongosh to query: db.events.find().sort({created_at: -1}).limit(10)')">
                    <div class="collection-name">events</div>
                    <div class="collection-stat">Analytics tracking</div>
                    <div class="collection-stat">Fields: event_name, user_id, metadata, created_at</div>
                </div>

                <div class="collection-card" onclick="alert('Use mongosh to query: db.game_responses.find().pretty()')">
                    <div class="collection-name">game_responses</div>
                    <div class="collection-stat">Value discovery game selections</div>
                    <div class="collection-stat">Fields: user_id, round_number, selected_word</div>
                </div>

                <div class="collection-card" onclick="alert('Use mongosh to query: db.user_actions.find().pretty()')">
                    <div class="collection-name">user_actions</div>
                    <div class="collection-stat">Join/skip feedback loop</div>
                    <div class="collection-stat">Fields: user_id, community_id, action</div>
                </div>
            </div>

            <div class="info" style="margin-top: 40px;">
                <h3>🔍 Quick Queries</h3>
                <p><code>db.users.countDocuments()</code> - Count total users</p>
                <p><code>db.events.find({event_name: "signup_complete"})</code> - View signups</p>
                <p><code>db.communities.find().sort({member_count: -1})</code> - Top communities</p>
                <p><code>db.events.aggregate([{$group: {_id: "$event_name", count: {$sum: 1}}}])</code> - Event counts</p>
            </div>
        </div>
    </body>
    </html>
    """
