# Feature Flag & Remote Config System

Backend system demonstrating role-based access control (RBAC), feature flags, and remote configuration through database-driven permissions. Employee records serve as a demonstration resource for permission-driven runtime behavior.

**Live Application:** https://feature-flag-remote-config.onrender.com/  
**API Documentation:** https://feature-flag-remote-config.onrender.com/docs  
**Repository:** https://github.com/ss-th24/feature-flag-remote-config  
**API Design Doc:** https://github.com/ss-th24/feature-flag-remote-config/blob/main/docs/API.md

## Overview

Feature flags are implemented as permission toggles stored in PostgreSQL. Each role maintains a JSONB configuration that determines which actions are enabled at runtime. Permissions are fetched dynamically on each request, enabling:

- Runtime feature toggling without service redeployment
- Per-role access control
- Immediate UI behavior updates based on server-side configuration

This architecture mirrors production feature flag and remote configuration systems.

## Architecture

### Permission Model

Permissions are stored as JSONB in the `roles` table:

```json
{
  "employee-page": {
    "C": true,  // Create
    "R": true,  // Read
    "U": false, // Update
    "D": false  // Delete
  }
}
```

### Request Flow

1. Client authenticates and receives JWT token containing role information
2. Protected routes verify token via `authMiddleware` and fetch permissions from database
3. `roleAccessMiddleware` validates required permission for the action
4. Permission denied returns `403 Forbidden`
5. Frontend displays forbidden action popup for unauthorized operations

## Technology Stack

**Backend:** Node.js, Express.js, PostgreSQL, JWT, bcrypt, Zod  
**Frontend:** Vanilla JavaScript, HTML5, CSS3  
**Deployment:** Render

## Project Structure

```
feature-flag-remote-config/
├── app.js                      # Express application configuration
├── server.js                   # Application entry point
├── config/
│   └── db.js                  # PostgreSQL connection pool
├── routes/
│   ├── auth.routes.js         # Authentication endpoints
│   └── employee.routes.js    # Employee CRUD endpoints
├── middlewares/
│   ├── auth.middleware.js     # JWT verification and user context
│   ├── role.access.middleware.js  # Permission validation
│   └── error.middleware.js    # Centralized error handling
├── schemas/
│   ├── user.schemas.js        # User input validation
│   └── employee.schemas.js    # Employee input validation
├── errors/
│   └── AppError.js            # Custom error class
├── utils/
│   └── normalize.gender.js    # Gender normalization utility
└── public/                    # Static frontend assets
    ├── index.html
    ├── login.html
    ├── employees.html
    ├── css/style.css
    └── js/
        ├── api.js
        ├── signup.js
        ├── login.js
        └── employees.js
```

## Database Schema

### Tables

**roles**
- `role_id` UUID PRIMARY KEY
- `role_name` TEXT UNIQUE NOT NULL
- `permissions` JSONB NOT NULL

**users**
- `user_id` UUID PRIMARY KEY
- `user_name` VARCHAR(255) UNIQUE NOT NULL
- `user_password` VARCHAR(255) NOT NULL (bcrypt hash)
- `role_id` UUID REFERENCES roles(role_id)

**employees**
- `emp_id` UUID PRIMARY KEY
- `emp_name` VARCHAR(255) NOT NULL
- `emp_phone` VARCHAR(20) NOT NULL
- `emp_gender` CHAR(1) CHECK (emp_gender IN ('M', 'F', 'O'))

### Relationships

Users → Roles: Many-to-One (users.role_id → roles.role_id)

## API Endpoints

### Authentication

**GET /api/auth/users**  
Returns list of all usernames. No authentication required.

**POST /api/auth/users**  
Creates new user account.  
Request body: `{ username: string, password: string, role: string }`  
Roles: `superadmin`, `admin`, `contributor`, `viewer`, `guest`  
Response: `201 Created` with `{ result: "User Created Successfully" }`

**POST /api/auth/login**  
Authenticates user and returns JWT token.  
Request body: `{ username: string, password: string }`  
Response: `200 OK` with `{ token: string, message: string, permissions: object }`

### Employee Management

All employee endpoints require Bearer token authentication: `Authorization: Bearer <token>`

**GET /api/employees/employee-page**  
Returns array of all employees. Requires `R` permission on `employee-page`.

**POST /api/employees/employee-page**  
Creates new employee. Requires `C` permission.  
Request body: `{ name: string, phone: string, gender: string }`  
Phone format: `^(\+91)?[6-9]\d{9}$`  
Gender: `M`, `F`, `O` (normalized from variations)

**PUT /api/employees/employee-page/:id**  
Updates existing employee. Requires `U` permission.  
URL parameter: `id` (UUID)  
Request body: `{ name: string, phone: string, gender: string }`

**DELETE /api/employees/employee-page/:id**  
Deletes employee. Requires `D` permission.  
URL parameter: `id` (UUID)  
Response: `204 No Content`

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "err": {}
}
```

**Status Codes:**
- `400 Bad Request` - Validation errors (Zod)
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

## Security

- Password hashing via bcrypt with configurable salt rounds
- JWT-based authentication with secret key
- Parameterized SQL queries preventing injection
- Zod schema validation for all inputs
- Permission checks on all protected routes
- Error details exposed only in development mode

## Local Development

### Prerequisites

- Node.js
- PostgreSQL
- npm

### Setup

1. Clone repository:
```bash
git clone https://github.com/ss-th24/feature-flag-remote-config
cd feature-flag-remote-config
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `config/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWTSECRETKEY=your-secret-key
PORT=3000
```

4. Initialize database:
```sql
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    permissions JSONB NOT NULL
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(role_id) ON DELETE RESTRICT
);

CREATE TABLE employees (
    emp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_name VARCHAR(255) NOT NULL,
    emp_phone VARCHAR(20) NOT NULL,
    emp_gender CHAR(1) CHECK (emp_gender IN ('M', 'F', 'O'))
);

INSERT INTO roles (role_name, permissions) VALUES
('superadmin', '{"employee-page": {"C": true, "R": true, "U": true, "D": true}}'),
('admin', '{"employee-page": {"C": true, "R": true, "U": true, "D": false}}'),
('contributor', '{"employee-page": {"C": true, "R": true, "U": false, "D": false}}'),
('viewer', '{"employee-page": {"C": false, "R": true, "U": false, "D": false}}'),
('guest', '{"employee-page": {"C": false, "R": false, "U": false, "D": false}}');
```

5. Start server:
```bash
npm start
```

Development mode with auto-reload:
```bash
npx nodemon server.js
```

## Frontend

The application includes three pages:

1. **Signup** (`/`) - User registration with role selection
2. **Login** (`/login.html`) - Authentication
3. **Employee Records** (`/employees.html`) - Employee management interface

The frontend demonstrates permission-aware UI behavior. All action buttons remain visible; unauthorized actions trigger immediate forbidden popups on click rather than form submission.

## License

ISC
