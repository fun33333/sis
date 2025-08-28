
---

## 📝 docs/api.md
```md
# 📡 API Documentation

## Base URL



## Authentication
- JWT-based auth
- Refresh tokens
- Role-based access control

## Endpoints

### Auth
- `POST /auth/login`
- `POST /auth/register`

### Users
- `GET /users`
- `GET /users/:id`
- `POST /users`

### Example Request
```http
GET /users/123
Authorization: Bearer <token>
