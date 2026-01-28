# API Documentation

Complete API reference for the IEEE SIGHT AITR Dashboard.

## Base URL

Development: `http://localhost:3000/api`

---

## 📄 Documents API

### Get All Documents

**Endpoint:** `GET /api/documents`

**Query Parameters:**
- `year` (optional): Filter by year (e.g., 2026)
- `category` (optional): Filter by category (report, document, data)

**Example:**
```
GET /api/documents?year=2026&category=report
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Monthly Report - Jan 2026",
      "type": "PDF",
      "uploadDate": "2026-01-15T10:30:00.000Z",
      "size": "2.4 MB",
      "category": "report",
      "year": 2026,
      "driveFileId": "1AbC2DeF3GhI4JkL5MnO6PqR",
      "driveFileLink": "https://drive.google.com/file/d/...",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Single Document

**Endpoint:** `GET /api/documents/[id]`

**Parameters:**
- `id`: Document ID

**Example:**
```
GET /api/documents/507f1f77bcf86cd799439011
```

### Create Document

**Endpoint:** `POST /api/documents`

**Body:**
```json
{
  "name": "New Document",
  "type": "PDF",
  "size": "1.5 MB",
  "category": "document",
  "year": 2026,
  "driveFileId": "fileId123",
  "driveFileLink": "https://drive.google.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* document object */ }
}
```

### Delete Document

**Endpoint:** `DELETE /api/documents/[id]`

**Parameters:**
- `id`: Document ID

**Response:**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

---

## 📤 Upload API

### Upload File to Google Drive

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: File to upload (required)
- `name`: Display name (optional)
- `category`: Document category (optional, default: "document")

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'My Document');
formData.append('category', 'report');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "My Document",
    "driveFileId": "1AbC2DeF3GhI4JkL5MnO6PqR",
    "driveFileLink": "https://drive.google.com/..."
  },
  "message": "File uploaded successfully"
}
```

---

## 📊 Progress API

### Get Progress Data

**Endpoint:** `GET /api/progress`

**Query Parameters:**
- `year` (optional): Filter by year

**Example:**
```
GET /api/progress?year=2026
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "month": "January",
      "year": 2026,
      "events": 3,
      "members": 45,
      "documents": 12,
      "target": 5
    }
  ]
}
```

### Create Progress Entry

**Endpoint:** `POST /api/progress`

**Body:**
```json
{
  "month": "January",
  "year": 2026,
  "events": 3,
  "members": 45,
  "documents": 12,
  "target": 5
}
```

---

## 👥 Members API

### Get All Members

**Endpoint:** `GET /api/members`

**Query Parameters:**
- `year` (optional): Filter by join year

**Example:**
```
GET /api/members?year=2024
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Rajesh Kumar",
      "email": "rajesh@aitr.ac.in",
      "branch": "Computer Science",
      "year": "3rd Year",
      "eventsAttended": 12,
      "contributions": 8,
      "points": 450,
      "rank": 1,
      "joinYear": 2024,
      "achievements": [
        {
          "id": "a1",
          "title": "Event Organizer",
          "description": "Successfully organized Tech Workshop",
          "date": "2025-12-15T00:00:00.000Z",
          "category": "leadership",
          "icon": "🎯"
        }
      ]
    }
  ]
}
```

### Create Member

**Endpoint:** `POST /api/members`

**Body:**
```json
{
  "name": "New Student",
  "email": "student@aitr.ac.in",
  "branch": "Computer Science",
  "year": "2nd Year",
  "joinYear": 2024,
  "eventsAttended": 0,
  "contributions": 0,
  "points": 0,
  "achievements": []
}
```

---

## 🏆 Leaderboard API

### Get Current Leaderboard

**Endpoint:** `GET /api/leaderboard`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "name": "Rajesh Kumar",
      "memberId": "507f1f77bcf86cd799439013",
      "points": 450,
      "eventsAttended": 12,
      "contributions": 8,
      "trend": "same",
      "change": 0
    }
  ]
}
```

---

## 🏅 Monthly Winners API

### Get Monthly Winners

**Endpoint:** `GET /api/winners`

**Query Parameters:**
- `year` (optional): Filter by year

**Example:**
```
GET /api/winners?year=2026
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "month": "January",
      "year": 2026,
      "winner": {
        "name": "Rajesh Kumar",
        "memberId": "507f1f77bcf86cd799439013",
        "points": 450,
        "eventsAttended": 12,
        "contributions": 8
      },
      "topThree": [
        {
          "rank": 1,
          "name": "Rajesh Kumar",
          "memberId": "507f1f77bcf86cd799439013",
          "points": 450
        },
        {
          "rank": 2,
          "name": "Priya Sharma",
          "memberId": "507f1f77bcf86cd799439015",
          "points": 420
        },
        {
          "rank": 3,
          "name": "Amit Patel",
          "memberId": "507f1f77bcf86cd799439016",
          "points": 380
        }
      ]
    }
  ]
}
```

### Create Monthly Winner

**Endpoint:** `POST /api/winners`

**Body:**
```json
{
  "month": "January",
  "year": 2026,
  "winner": {
    "name": "Rajesh Kumar",
    "memberId": "507f1f77bcf86cd799439013",
    "points": 450,
    "eventsAttended": 12,
    "contributions": 8
  },
  "topThree": [
    /* top 3 array */
  ]
}
```

---

## 📅 Years API

### Get Available Years

**Endpoint:** `GET /api/years`

Returns all unique years from documents.

**Response:**
```json
{
  "success": true,
  "data": [2026, 2025, 2024]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- Rate limiting middleware
- API key authentication
- Request throttling

---

## Authentication

⚠️ **Important:** Current version has no authentication. Before production:

1. Add authentication middleware
2. Implement JWT or session-based auth
3. Add role-based access control (RBAC)
4. Secure sensitive endpoints

**Recommended Authentication Flow:**

```javascript
// Example middleware
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const token = request.headers.get('authorization');
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const user = await verifyToken(token);
  
  if (!user) {
    return new Response('Invalid token', { status: 401 });
  }
  
  // Add user to request
  request.user = user;
}
```

---

## Testing Examples

### Using cURL

**Get Documents:**
```bash
curl http://localhost:3000/api/documents?year=2026
```

**Upload File:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf" \
  -F "name=Test Document" \
  -F "category=report"
```

**Delete Document:**
```bash
curl -X DELETE http://localhost:3000/api/documents/507f1f77bcf86cd799439011
```

### Using JavaScript Fetch

**Get Members:**
```javascript
const response = await fetch('/api/members?year=2024');
const result = await response.json();

if (result.success) {
  console.log('Members:', result.data);
}
```

**Create Progress:**
```javascript
const response = await fetch('/api/progress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    month: 'January',
    year: 2026,
    events: 3,
    members: 45,
    documents: 12,
    target: 5
  })
});
```

---

## Best Practices

1. **Error Handling**: Always check `success` field
2. **Validation**: Validate data before sending
3. **Loading States**: Show loading indicators during API calls
4. **Caching**: Cache GET requests when appropriate
5. **Debouncing**: Debounce search queries

---

## Future Enhancements

- [ ] Pagination for large datasets
- [ ] Sorting and advanced filtering
- [ ] Bulk operations
- [ ] GraphQL API option
- [ ] WebSocket support for real-time updates
- [ ] API versioning (v1, v2, etc.)

---

For more information, see:
- [Setup Guide](SETUP.md)
- [Quick Start](QUICKSTART.md)
- [Main README](README.md)
