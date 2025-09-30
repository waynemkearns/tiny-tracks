# TinyTracks API Documentation

This document describes the TinyTracks API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to: `/api`

## Authentication

Most endpoints require authentication via session cookies. To authenticate:

1. `POST /api/login` with username and password
2. Store the returned session cookie
3. Include this cookie in subsequent requests

## Endpoints

### Authentication

#### Login

```
POST /api/login
```

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "id": "number",
  "username": "string"
}
```

Status codes:
- 200: Success
- 401: Invalid credentials

#### Logout

```
POST /api/logout
```

Response: Empty with status 200

### User Management

#### Get User

```
GET /api/users/:id
```

Response:
```json
{
  "id": "number",
  "username": "string",
  "pregnancyMode": "boolean"
}
```

#### Update Pregnancy Mode

```
PUT /api/users/:id/pregnancy-mode
```

Request body:
```json
{
  "pregnancyMode": "boolean"
}
```

Response:
```json
{
  "id": "number",
  "username": "string",
  "pregnancyMode": "boolean"
}
```

### Babies

#### List Babies

```
GET /api/users/:userId/babies
```

Response:
```json
[
  {
    "id": "number",
    "name": "string",
    "birthDate": "string (ISO date)",
    "gender": "string"
  }
]
```

#### Create Baby

```
POST /api/users/:userId/babies
```

Request body:
```json
{
  "name": "string",
  "birthDate": "string (ISO date)",
  "gender": "string"
}
```

Response: Created baby object

#### Get Baby

```
GET /api/babies/:id
```

Response: Baby object

### Pregnancy

#### Create Pregnancy

```
POST /api/users/:userId/pregnancies
```

Request body:
```json
{
  "estimatedDueDate": "string (ISO date)",
  "lastPeriodDate": "string (ISO date)",
  "notes": "string (optional)"
}
```

Response: Created pregnancy object

#### Get Pregnancy

```
GET /api/pregnancies/:id
```

Response:
```json
{
  "id": "number",
  "userId": "number",
  "estimatedDueDate": "string (ISO date)",
  "lastPeriodDate": "string (ISO date)",
  "notes": "string",
  "isActive": "boolean",
  "babyId": "number (optional)",
  "createdAt": "string (ISO date)"
}
```

#### List User Pregnancies

```
GET /api/users/:userId/pregnancies
```

Response: Array of pregnancy objects

#### Get Gestational Age

```
GET /api/pregnancies/:id/gestational-age
```

Response:
```json
{
  "weeks": "number",
  "days": "number",
  "trimester": "number",
  "daysRemaining": "number"
}
```

#### Birth Transition

```
POST /api/pregnancies/:pregnancyId/birth
```

Request body:
```json
{
  "babyName": "string",
  "birthDate": "string (ISO date)",
  "gender": "string"
}
```

Response:
```json
{
  "baby": {
    "id": "number",
    "name": "string",
    "birthDate": "string (ISO date)",
    "gender": "string"
  },
  "pregnancy": {
    "id": "number",
    "isActive": false,
    "babyId": "number"
  },
  "user": {
    "id": "number",
    "pregnancyMode": false
  }
}
```

### Contractions

#### Create Contraction

```
POST /api/pregnancies/:pregnancyId/contractions
```

Request body:
```json
{
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date) (optional)",
  "duration": "number (seconds) (optional)",
  "intensity": "number (1-10)",
  "notes": "string (optional)"
}
```

Response: Created contraction object

#### Get Contractions

```
GET /api/pregnancies/:pregnancyId/contractions
```

Query parameters:
- `limit`: Maximum number of records to return
- `offset`: Number of records to skip
- `startDate`: Filter by date (ISO format)
- `endDate`: Filter by date (ISO format)

Response: Array of contraction objects

### Fetal Movements

#### Create Movement

```
POST /api/pregnancies/:pregnancyId/movements
```

Request body:
```json
{
  "timestamp": "string (ISO date)",
  "duration": "number (seconds) (optional)",
  "responseToStimuli": "string (optional)",
  "notes": "string (optional)"
}
```

Response: Created movement object

#### Get Movements

```
GET /api/pregnancies/:pregnancyId/movements
```

Query parameters:
- `limit`: Maximum number of records to return
- `offset`: Number of records to skip
- `startDate`: Filter by date (ISO format)
- `endDate`: Filter by date (ISO format)

Response: Array of movement objects

### Maternal Health

#### Create Health Record

```
POST /api/pregnancies/:pregnancyId/health
```

Request body:
```json
{
  "type": "string (blood_pressure, weight, symptom, mood)",
  "timestamp": "string (ISO date)",
  "value": "string",
  "details": "object (varies by type)",
  "notes": "string (optional)"
}
```

Response: Created health record object

#### Get Health Records

```
GET /api/pregnancies/:pregnancyId/health
```

Query parameters:
- `type`: Filter by record type
- `limit`: Maximum number of records to return
- `offset`: Number of records to skip
- `startDate`: Filter by date (ISO format)
- `endDate`: Filter by date (ISO format)

Response: Array of health record objects

### Baby Tracking

#### Create Feed

```
POST /api/babies/:babyId/feeds
```

Request body:
```json
{
  "type": "string (bottle, left_breast, right_breast, both_breasts, solid)",
  "amount": "number (optional, ml for bottle)",
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date) (optional)",
  "duration": "number (seconds) (optional)",
  "notes": "string (optional)"
}
```

Response: Created feed object

#### Get Feeds

```
GET /api/babies/:babyId/feeds
```

Query parameters similar to other endpoints.

#### Create Nappy

```
POST /api/babies/:babyId/nappies
```

Request body:
```json
{
  "type": "string (wet, dirty, both)",
  "timestamp": "string (ISO date)",
  "notes": "string (optional)"
}
```

Response: Created nappy object

#### Create Sleep Session

```
POST /api/babies/:babyId/sleep
```

Request body:
```json
{
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date) (optional)",
  "duration": "number (seconds) (optional)",
  "quality": "string (optional)",
  "location": "string (optional)",
  "notes": "string (optional)"
}
```

Response: Created sleep session object

#### Create Growth Record

```
POST /api/babies/:babyId/growth
```

Request body:
```json
{
  "timestamp": "string (ISO date)",
  "weight": "number (grams) (optional)",
  "height": "number (cm) (optional)",
  "headCircumference": "number (cm) (optional)",
  "notes": "string (optional)"
}
```

Response: Created growth record object

## Error Handling

All endpoints return standard HTTP status codes:

- 200: Success
- 201: Resource created
- 400: Bad request (invalid parameters)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 500: Server error

Error response format:

```json
{
  "error": "string (error message)",
  "details": "object (optional detailed error information)"
}
```

## Pagination

Endpoints that return lists support standard pagination:

- `limit`: Maximum number of items to return (default: 50)
- `offset`: Number of items to skip (default: 0)

Response format for paginated lists:

```json
{
  "data": [
    // array of objects
  ],
  "pagination": {
    "total": "number (total count)",
    "limit": "number",
    "offset": "number"
  }
}
```

## Filtering

Most list endpoints support filtering by date range:

- `startDate`: ISO date string
- `endDate`: ISO date string
