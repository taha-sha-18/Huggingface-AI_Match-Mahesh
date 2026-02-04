"""
Real MongoDB Admin Interface
Provides browsing collections, viewing documents, and running queries
"""
from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
from bson import ObjectId, json_util
from datetime import datetime
from typing import Optional

db_admin_router = APIRouter(prefix="/api/db-admin")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    return json.loads(json_util.dumps(doc))

def format_value(value):
    """Format a value for HTML display"""
    if isinstance(value, dict):
        return f'<pre class="json-preview">{json.dumps(serialize_doc(value), indent=2)}</pre>'
    elif isinstance(value, list):
        if len(value) > 3:
            preview = value[:3]
            return f'<span class="array-preview">[{len(value)} items]</span>'
        return f'<span class="array-preview">{json.dumps(serialize_doc(value))}</span>'
    elif isinstance(value, ObjectId):
        return f'<span class="objectid">{str(value)}</span>'
    elif isinstance(value, datetime):
        return f'<span class="datetime">{value.isoformat()}</span>'
    elif isinstance(value, bool):
        return f'<span class="boolean">{str(value).lower()}</span>'
    elif value is None:
        return '<span class="null">null</span>'
    elif isinstance(value, (int, float)):
        return f'<span class="number">{value}</span>'
    else:
        text = str(value)
        if len(text) > 100:
            return f'<span class="string" title="{text[:500]}...">{text[:100]}...</span>'
        return f'<span class="string">"{text}"</span>'

# CSS Styles for the admin interface
ADMIN_CSS = """
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    
    /* Header */
    .header {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .header h1 { color: #60a5fa; font-size: 24px; }
    .header .db-info { color: #94a3b8; font-size: 14px; }
    
    /* Navigation */
    .nav-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    .nav-tab {
        background: #1e293b;
        border: 1px solid #334155;
        color: #94a3b8;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
    }
    .nav-tab:hover, .nav-tab.active {
        background: #334155;
        color: #60a5fa;
        border-color: #60a5fa;
    }
    
    /* Cards */
    .card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
    }
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #334155;
    }
    .card-title { color: #f1f5f9; font-size: 18px; font-weight: 600; }
    .card-count { 
        background: #3b82f6;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
    }
    
    /* Collection Grid */
    .collection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 15px;
    }
    .collection-card {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        display: block;
    }
    .collection-card:hover {
        border-color: #60a5fa;
        transform: translateY(-2px);
    }
    .collection-name {
        color: #60a5fa;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
    }
    .collection-stats {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #94a3b8;
    }
    
    /* Table */
    .table-container { overflow-x: auto; }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }
    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #334155;
    }
    th {
        background: #0f172a;
        color: #94a3b8;
        font-weight: 600;
        position: sticky;
        top: 0;
    }
    tr:hover { background: #1e3a5f; }
    
    /* Data types */
    .objectid { color: #fbbf24; font-family: monospace; font-size: 12px; }
    .string { color: #34d399; }
    .number { color: #60a5fa; }
    .boolean { color: #f472b6; }
    .null { color: #94a3b8; font-style: italic; }
    .datetime { color: #a78bfa; font-size: 12px; }
    .array-preview { color: #fb923c; }
    .json-preview {
        background: #0f172a;
        padding: 8px;
        border-radius: 4px;
        font-size: 11px;
        max-height: 150px;
        overflow: auto;
        color: #94a3b8;
    }
    
    /* Query Section */
    .query-section {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
    }
    .query-input {
        width: 100%;
        background: #0f172a;
        border: 1px solid #334155;
        color: #e2e8f0;
        padding: 12px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        resize: vertical;
        min-height: 80px;
    }
    .query-input:focus {
        outline: none;
        border-color: #60a5fa;
    }
    
    /* Buttons */
    .btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }
    .btn:hover { background: #2563eb; }
    .btn-secondary {
        background: #475569;
    }
    .btn-secondary:hover { background: #64748b; }
    .btn-danger { background: #ef4444; }
    .btn-danger:hover { background: #dc2626; }
    .btn-group { display: flex; gap: 10px; margin-top: 15px; }
    
    /* Pagination */
    .pagination {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-top: 20px;
    }
    .page-btn {
        background: #1e293b;
        border: 1px solid #334155;
        color: #94a3b8;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
    }
    .page-btn:hover, .page-btn.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }
    
    /* Document View */
    .document-json {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 20px;
        font-family: monospace;
        font-size: 13px;
        overflow-x: auto;
        white-space: pre-wrap;
    }
    
    /* Breadcrumb */
    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 14px;
    }
    .breadcrumb a {
        color: #60a5fa;
        text-decoration: none;
    }
    .breadcrumb span { color: #64748b; }
    
    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }
    .empty-state h3 { margin-bottom: 10px; color: #94a3b8; }
    
    /* Actions */
    .actions { display: flex; gap: 8px; }
    .action-btn {
        background: transparent;
        border: 1px solid #334155;
        color: #94a3b8;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
    }
    .action-btn:hover {
        border-color: #60a5fa;
        color: #60a5fa;
    }
    .action-btn.delete:hover {
        border-color: #ef4444;
        color: #ef4444;
    }
</style>
"""

@db_admin_router.get("/", response_class=HTMLResponse)
async def admin_home():
    """Main admin dashboard showing all databases"""
    try:
        # Get list of databases
        db_list = await client.list_database_names()
        
        # Get stats for each database
        db_stats = []
        for db_name in db_list:
            if db_name not in ['admin', 'config', 'local']:
                db = client[db_name]
                collections = await db.list_collection_names()
                db_stats.append({
                    'name': db_name,
                    'collections': len(collections)
                })
        
        db_cards = ""
        for db in db_stats:
            db_cards += f'''
            <a href="/api/db-admin/db/{db['name']}" class="collection-card">
                <div class="collection-name">📁 {db['name']}</div>
                <div class="collection-stats">
                    <span>📚 {db['collections']} collections</span>
                </div>
            </a>
            '''
        
        if not db_cards:
            db_cards = '<div class="empty-state"><h3>No databases found</h3></div>'
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>MongoDB Admin</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            {ADMIN_CSS}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>🍃 MongoDB Admin</h1>
                        <div class="db-info">Connected to {mongo_url}</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Databases</span>
                        <span class="card-count">{len(db_stats)} databases</span>
                    </div>
                    <div class="collection-grid">
                        {db_cards}
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error: {str(e)}</h1>", status_code=500)


@db_admin_router.get("/db/{db_name}", response_class=HTMLResponse)
async def view_database(db_name: str):
    """View collections in a database"""
    try:
        db = client[db_name]
        collections = await db.list_collection_names()
        
        # Get stats for each collection
        collection_stats = []
        for coll_name in collections:
            count = await db[coll_name].count_documents({})
            collection_stats.append({
                'name': coll_name,
                'count': count
            })
        
        collection_cards = ""
        for coll in sorted(collection_stats, key=lambda x: x['name']):
            collection_cards += f'''
            <a href="/api/db-admin/db/{db_name}/collection/{coll['name']}" class="collection-card">
                <div class="collection-name">📄 {coll['name']}</div>
                <div class="collection-stats">
                    <span>📊 {coll['count']:,} documents</span>
                </div>
            </a>
            '''
        
        if not collection_cards:
            collection_cards = '<div class="empty-state"><h3>No collections found</h3></div>'
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{db_name} - MongoDB Admin</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            {ADMIN_CSS}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>🍃 MongoDB Admin</h1>
                        <div class="db-info">{db_name}</div>
                    </div>
                </div>
                
                <div class="breadcrumb">
                    <a href="/api/db-admin/">Home</a>
                    <span>›</span>
                    <span>{db_name}</span>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Collections in {db_name}</span>
                        <span class="card-count">{len(collections)} collections</span>
                    </div>
                    <div class="collection-grid">
                        {collection_cards}
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error: {str(e)}</h1>", status_code=500)


@db_admin_router.get("/db/{db_name}/collection/{collection_name}", response_class=HTMLResponse)
async def view_collection(db_name: str, collection_name: str, page: int = 1, limit: int = 20):
    """View documents in a collection"""
    try:
        db = client[db_name]
        collection = db[collection_name]
        
        # Get total count
        total_count = await collection.count_documents({})
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit
        
        # Fetch documents
        cursor = collection.find({}).skip(skip).limit(limit).sort('_id', -1)
        documents = await cursor.to_list(length=limit)
        
        # Get all unique keys from documents
        all_keys = set()
        for doc in documents:
            all_keys.update(doc.keys())
        
        # Prioritize common keys
        priority_keys = ['_id', 'user_id', 'email', 'name', 'created_at', 'updated_at']
        ordered_keys = [k for k in priority_keys if k in all_keys]
        ordered_keys.extend([k for k in sorted(all_keys) if k not in ordered_keys])
        ordered_keys = ordered_keys[:8]  # Limit columns
        
        # Build table header
        header_html = "<tr>"
        for key in ordered_keys:
            header_html += f"<th>{key}</th>"
        header_html += "<th>Actions</th></tr>"
        
        # Build table rows
        rows_html = ""
        for doc in documents:
            rows_html += "<tr>"
            for key in ordered_keys:
                value = doc.get(key, '')
                rows_html += f"<td>{format_value(value)}</td>"
            doc_id = str(doc.get('_id', ''))
            rows_html += f'''
                <td class="actions">
                    <a href="/api/db-admin/db/{db_name}/collection/{collection_name}/doc/{doc_id}" class="action-btn">View</a>
                </td>
            </tr>'''
        
        if not rows_html:
            rows_html = f'<tr><td colspan="{len(ordered_keys)+1}" class="empty-state">No documents found</td></tr>'
        
        # Build pagination
        pagination_html = ""
        if total_pages > 1:
            pagination_html = '<div class="pagination">'
            if page > 1:
                pagination_html += f'<a href="?page={page-1}&limit={limit}" class="page-btn">‹ Prev</a>'
            
            start_page = max(1, page - 2)
            end_page = min(total_pages, page + 2)
            
            for p in range(start_page, end_page + 1):
                active = "active" if p == page else ""
                pagination_html += f'<a href="?page={p}&limit={limit}" class="page-btn {active}">{p}</a>'
            
            if page < total_pages:
                pagination_html += f'<a href="?page={page+1}&limit={limit}" class="page-btn">Next ›</a>'
            pagination_html += '</div>'
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{collection_name} - MongoDB Admin</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            {ADMIN_CSS}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>🍃 MongoDB Admin</h1>
                        <div class="db-info">{db_name} / {collection_name}</div>
                    </div>
                </div>
                
                <div class="breadcrumb">
                    <a href="/api/db-admin/">Home</a>
                    <span>›</span>
                    <a href="/api/db-admin/db/{db_name}">{db_name}</a>
                    <span>›</span>
                    <span>{collection_name}</span>
                </div>
                
                <div class="query-section">
                    <form action="/api/db-admin/db/{db_name}/collection/{collection_name}/query" method="POST">
                        <label style="color: #94a3b8; margin-bottom: 8px; display: block;">Run Query (JSON filter)</label>
                        <textarea name="query" class="query-input" placeholder='{{"email": "test@example.com"}}'></textarea>
                        <div class="btn-group">
                            <button type="submit" class="btn">Run Query</button>
                            <a href="/api/db-admin/db/{db_name}/collection/{collection_name}" class="btn btn-secondary">Reset</a>
                        </div>
                    </form>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Documents</span>
                        <span class="card-count">{total_count:,} total • Page {page} of {total_pages}</span>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>{header_html}</thead>
                            <tbody>{rows_html}</tbody>
                        </table>
                    </div>
                    {pagination_html}
                </div>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error: {str(e)}</h1>", status_code=500)


@db_admin_router.post("/db/{db_name}/collection/{collection_name}/query", response_class=HTMLResponse)
async def query_collection(db_name: str, collection_name: str, query: str = Form(...)):
    """Run a query on a collection"""
    try:
        db = client[db_name]
        collection = db[collection_name]
        
        # Parse query
        try:
            filter_query = json.loads(query) if query.strip() else {}
        except json.JSONDecodeError as e:
            return HTMLResponse(content=f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Query Error - MongoDB Admin</title>
                {ADMIN_CSS}
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <h2 style="color: #ef4444;">Invalid JSON Query</h2>
                        <p style="color: #94a3b8; margin: 20px 0;">{str(e)}</p>
                        <a href="/api/db-admin/db/{db_name}/collection/{collection_name}" class="btn">Go Back</a>
                    </div>
                </div>
            </body>
            </html>
            """)
        
        # Execute query
        cursor = collection.find(filter_query).limit(100)
        documents = await cursor.to_list(length=100)
        count = len(documents)
        
        # Format results
        results_html = ""
        for i, doc in enumerate(documents):
            doc_json = json.dumps(serialize_doc(doc), indent=2)
            doc_id = str(doc.get('_id', ''))
            results_html += f'''
            <div class="card" style="margin-bottom: 15px;">
                <div class="card-header">
                    <span class="card-title">Document {i+1}</span>
                    <a href="/api/db-admin/db/{db_name}/collection/{collection_name}/doc/{doc_id}" class="action-btn">View Full</a>
                </div>
                <pre class="document-json">{doc_json}</pre>
            </div>
            '''
        
        if not results_html:
            results_html = '<div class="empty-state"><h3>No documents match your query</h3></div>'
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Query Results - MongoDB Admin</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            {ADMIN_CSS}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>🍃 MongoDB Admin</h1>
                        <div class="db-info">Query Results</div>
                    </div>
                </div>
                
                <div class="breadcrumb">
                    <a href="/api/db-admin/">Home</a>
                    <span>›</span>
                    <a href="/api/db-admin/db/{db_name}">{db_name}</a>
                    <span>›</span>
                    <a href="/api/db-admin/db/{db_name}/collection/{collection_name}">{collection_name}</a>
                    <span>›</span>
                    <span>Query Results</span>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Query</span>
                    </div>
                    <pre class="document-json">{query}</pre>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <span class="card-count" style="font-size: 14px;">{count} results (max 100)</span>
                </div>
                
                {results_html}
                
                <div style="margin-top: 20px;">
                    <a href="/api/db-admin/db/{db_name}/collection/{collection_name}" class="btn btn-secondary">← Back to Collection</a>
                </div>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error: {str(e)}</h1>", status_code=500)


@db_admin_router.get("/db/{db_name}/collection/{collection_name}/doc/{doc_id}", response_class=HTMLResponse)
async def view_document(db_name: str, collection_name: str, doc_id: str):
    """View a single document"""
    try:
        db = client[db_name]
        collection = db[collection_name]
        
        # Try to find by ObjectId first, then by string _id
        doc = None
        try:
            doc = await collection.find_one({"_id": ObjectId(doc_id)})
        except:
            doc = await collection.find_one({"_id": doc_id})
        
        if not doc:
            return HTMLResponse(content="<h1>Document not found</h1>", status_code=404)
        
        doc_json = json.dumps(serialize_doc(doc), indent=2)
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Document - MongoDB Admin</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            {ADMIN_CSS}
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>🍃 MongoDB Admin</h1>
                        <div class="db-info">Document View</div>
                    </div>
                </div>
                
                <div class="breadcrumb">
                    <a href="/api/db-admin/">Home</a>
                    <span>›</span>
                    <a href="/api/db-admin/db/{db_name}">{db_name}</a>
                    <span>›</span>
                    <a href="/api/db-admin/db/{db_name}/collection/{collection_name}">{collection_name}</a>
                    <span>›</span>
                    <span>Document</span>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Document ID: {doc_id}</span>
                    </div>
                    <pre class="document-json">{doc_json}</pre>
                </div>
                
                <div style="margin-top: 20px;">
                    <a href="/api/db-admin/db/{db_name}/collection/{collection_name}" class="btn btn-secondary">← Back to Collection</a>
                </div>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error: {str(e)}</h1>", status_code=500)


# API endpoints for programmatic access
@db_admin_router.get("/api/databases")
async def api_list_databases():
    """API: List all databases"""
    db_list = await client.list_database_names()
    return {"databases": [d for d in db_list if d not in ['admin', 'config', 'local']]}


@db_admin_router.get("/api/db/{db_name}/collections")
async def api_list_collections(db_name: str):
    """API: List collections in a database"""
    db = client[db_name]
    collections = await db.list_collection_names()
    return {"collections": collections}


@db_admin_router.get("/api/db/{db_name}/collection/{collection_name}/documents")
async def api_list_documents(db_name: str, collection_name: str, skip: int = 0, limit: int = 20):
    """API: List documents in a collection"""
    db = client[db_name]
    collection = db[collection_name]
    
    total = await collection.count_documents({})
    cursor = collection.find({}).skip(skip).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    return {
        "total": total,
        "documents": [serialize_doc(d) for d in documents]
    }
