# Feature Flag & Remote Config System

A backend-focused system demonstrating role-based access control (RBAC),
feature flags, and remote configuration.  
Employee records are used as a demo resource to showcase permission-driven
behavior at runtime.

## 🔗 Live Website
👉 [![Live](https://img.shields.io/badge/Status-Live-green)](https://feature-flag-remote-config.onrender.com/)

---

## Feature Flags & Remote Configuration

In this system, **feature flags are implemented as permission toggles stored in the database**.
Each role has a JSON-based configuration that determines which actions are enabled at runtime.

Because permissions are fetched dynamically on each request:
- Features can be enabled or disabled **without redeploying the service**
- Access can be controlled **per role**
- UI behavior updates immediately based on server-side configuration

This models real-world feature flag and remote configuration systems used in production.

---

## Features

- 🔐 **JWT Authentication** – Secure login and token-based authentication
- 👥 **Role-Based Access Control (RBAC)** – Permission-based access using roles
- 🏳️ **Feature Flags** – Runtime toggling of features via database config
- 📝 **Employee Records (CRUD)** – Demo resource for permissions
- ✅ **Input Validation** – Zod schema validation
- 🔒 **Security** – bcrypt hashing, parameterized SQL queries
- 🎯 **Centralized Error Handling**
- 🎨 **Permission-Aware UI** – Disabled actions show forbidden feedback

---

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- JWT
- bcrypt
- Zod
- pg

### Frontend
- Vanilla JavaScript
- HTML5 / CSS3
- Fetch API

---

## Project Structure

```
feature-flag-remote-config/
├── app.js                      # Express app configuration
├── server.js                   # Server entry point
├── config/
│   └── db.js                  # Database connection configuration
├── routes/
│   ├── auth.routes.js         # Authentication routes (signup, login)
│   └── employee.routes.js     # Employee CRUD routes
├── middlewares/
│   ├── auth.middleware.js     # JWT authentication middleware
│   ├── role.access.middleware.js  # RBAC permission checking
│   └── error.middleware.js    # Centralized error handler
├── schemas/
│   ├── user.schemas.js        # User validation schemas
│   └── employee.schemas.js    # Employee validation schemas
├── errors/
│   └── AppError.js            # Custom error class
├── utils/
│   └── normalize.gender.js    # Gender normalization utility
└── public/                    # Frontend static files
    ├── index.html             # Signup page
    ├── login.html             # Login page
    ├── employees.html         # Employee management page
    ├── css/
    │   └── style.css          # Application styles
    └── js/
        ├── api.js             # API helper functions
        ├── signup.js          # Signup page logic
        ├── login.js           # Login page logic
        └── employees.js       # Employee page logic
```
## Deployment

This project is deployed in a production environment using **Render**.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ss-th24/feature-flag-remote-config
   cd feature-flag-remote-config
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   PORT=3000
   connectionString=postgresql://username:password@localhost:5432/database_name
   JWTSECRETKEY=your-secret-jwt-key-here
   SALT_ROUNDS=10
   ```

4. **Database Setup**
   - Ensure PostgreSQL is installed and running
   - Create a database for the project
   - Create the following tables:
   
   ```sql
   -- Roles table
   CREATE TABLE roles (
       role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       role_name TEXT UNIQUE NOT NULL,
       permissions JSONB NOT NULL
   );

   -- Users table
   CREATE TABLE users (
       user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_name VARCHAR(255) UNIQUE NOT NULL,
       user_password VARCHAR(255) NOT NULL,
       role_id UUID REFERENCES roles(role_id) ON DELETE RESTRICT
   );

   -- Employees table
   CREATE TABLE employees (
       emp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       emp_name VARCHAR(255) NOT NULL,
       emp_phone VARCHAR(20) NOT NULL,
       emp_gender CHAR(1) CHECK (emp_gender IN ('M', 'F', 'O'))
   );
   ```
   
   - Insert roles with permissions:
   ```sql
   INSERT INTO roles (role_name, permissions) VALUES
   ('superadmin', '{"employee-page": {"C": true, "R": true, "U": true, "D": true}}'),
   ('admin', '{"employee-page": {"C": true, "R": true, "U": true, "D": false}}'),
   ('contributor', '{"employee-page": {"C": true, "R": true, "U": false, "D": false}}'),
   ('viewer', '{"employee-page": {"C": false, "R": true, "U": false, "D": false}}'),
   ('guest', '{"employee-page": {"C": false, "R": false, "U": false, "D": false}}');
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npx nodemon server.js
   ```

6. **Access the application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The server will serve the frontend pages automatically

## Frontend Pages

### 1. Signup Page (`/` or `/index.html`)
- **URL**: `http://localhost:3000/`
- **Features**:
  - Username input (minimum 6 characters)
  - Password input (minimum 6 characters)
  - Role dropdown with options: Super Admin, Admin, Guest, Viewer, Contributor
  - Form validation
  - Auto-redirect to login after successful signup

### 2. Login Page (`/login.html`)
- **URL**: `http://localhost:3000/login.html`
- **Features**:
  - Username and password authentication
  - JWT token storage in localStorage
  - Auto-redirect to employee page on success
  - Error message display

### 3. Employee Records Page (`/employees.html`)
- **URL**: `http://localhost:3000/employees.html`
- **Features**:
  - **Show/Hide Employees Button**: Toggle visibility of employee table
  - **Employee Table**: Displays Name, Phone, and Gender (3 columns)
  - **Action Buttons**: Three dots (⋮) menu for each employee with Edit/Delete options
  - **Add Employee Button**: Opens modal to create new employee
  - **Permission-Based UI**: 
    - All buttons are visible but show "Forbidden Action" popup if user lacks permission
    - Popup appears immediately on button click (not on form submission)
  - **Logout Button**: Small button in top-right corner
  - **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### Authentication Endpoints

#### 1. Get All Users
- **GET** `/api/auth/users`
- **Description**: Retrieve list of all users
- **Authentication**: Not required

**Response:**
```json
{
  "users": [
    {"user_name": "john_doe"},
    {"user_name": "jane_smith"}
  ]
}
```

#### 2. User Signup
- **POST** `/api/auth/users`
- **Description**: Create a new user account
- **Authentication**: Not required

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123",
  "role": "admin"
}
```

**Available Roles:**
- `superadmin`
- `admin`
- `guest`
- `viewer`
- `contributor`

**Response:**
```json
{
  "result": "User Created Successfully"
}
```

#### 3. User Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Authentication**: Not required

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Logged In Successfully",
  "permissions": {
    "employee-page": {
      "C": true,
      "R": true,
      "U": false,
      "D": false
    }
  }
}
```

### Employee Endpoints

All employee endpoints require authentication via Bearer token in the Authorization header.

**Authorization Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

#### 1. Get All Employees
- **GET** `/api/employees/employee-page`
- **Description**: Retrieve all employees
- **Authentication**: Required
- **Permission**: `R` (Read) on `employee-page`

**Response:**
```json
[
  {
    "emp_id": "uuid-here",
    "emp_name": "John Doe",
    "emp_phone": "+919876543210",
    "emp_gender": "M"
  }
]
```

#### 2. Create Employee
- **POST** `/api/employees/employee-page`
- **Description**: Create a new employee
- **Authentication**: Required
- **Permission**: `C` (Create) on `employee-page`

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+919876543210",
  "gender": "M"
}
```

**Gender Values:** `M`, `F`, `O` (or `male`, `female`, `other` - will be normalized)

**Response:**
```json
{
  "message": "Employee Created Successfully"
}
```

#### 3. Update Employee
- **PUT** `/api/employees/employee-page/:id`
- **Description**: Update an existing employee
- **Authentication**: Required
- **Permission**: `U` (Update) on `employee-page`

**URL Parameters:**
- `id` - Employee UUID

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+919876543211",
  "gender": "M"
}
```

**Response:**
```json
{
  "message": "Updated Successfully"
}
```

#### 4. Delete Employee
- **DELETE** `/api/employees/employee-page/:id`
- **Description**: Delete an employee
- **Authentication**: Required
- **Permission**: `D` (Delete) on `employee-page`

**URL Parameters:**
- `id` - Employee UUID

**Response:**
- Status: `204 No Content`

## Database Schema

### Tables

#### `roles`
- `role_id` (UUID PRIMARY KEY)
- `role_name` (TEXT, UNIQUE)
- `permissions` (JSONB) - Stores permission object for each page/feature

#### `users`
- `user_id` (UUID PRIMARY KEY)
- `user_name` (VARCHAR, UNIQUE)
- `user_password` (VARCHAR) - Stores bcrypt hash
- `role_id` (UUID, FOREIGN KEY → roles.role_id)

#### `employees`
- `emp_id` (UUID PRIMARY KEY)
- `emp_name` (VARCHAR)
- `emp_phone` (VARCHAR)
- `emp_gender` (CHAR(1)) - Values: 'M', 'F', 'O'

### Relationships

- **Users → Roles**: Many-to-One relationship
  - Each user has one role
  - Each role can have many users
  - Foreign key: `users.role_id` references `roles.role_id`

## Role-Based Access Control (RBAC)

The system uses a permission-based access control where each role has specific permissions for different pages/features.

**Permission Format:**
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

**How It Works:**
1. User logs in and receives JWT token with role information
2. On each protected route, `authMiddleware` verifies token and fetches permissions
3. `roleAccessMiddleware` checks if user has required permission for the action
4. If permission denied, returns `403 Forbidden` error
5. Frontend shows "Forbidden Action" popup when unauthorized operations are attempted

Users can only perform operations they have permission for. Attempts to access restricted resources will return a `403 Forbidden` error.

## Error Handling

The application uses a centralized error handler that processes different error types:

- **400 Bad Request** - Invalid input format (Zod validation errors)
- **401 Unauthorized** - Authentication required or invalid credentials
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side errors

**Error Response Format:**
```json
{
  "message": "Error message",
  "err": {}
}
```

## Validation

### User Validation
- **Username**: Minimum 6 characters, non-empty
- **Password**: Minimum 6 characters, non-empty
- **Role**: Must be one of: `superadmin`, `admin`, `guest`, `viewer`, `contributor`

### Employee Validation
- **Name**: Non-empty string
- **Phone**: Must match Indian phone format `^(\+91)?[6-9]\d{9}$`
- **Gender**: `M`, `F`, or `O` (accepts variations like `male`, `female`, `other` - automatically normalized)
- **ID**: Must be a valid UUID

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with configurable salt rounds before storage
2. **JWT Tokens**: Secure token-based authentication with secret key
3. **SQL Injection Protection**: All database queries use parameterized statements
4. **Input Validation**: Comprehensive validation using Zod schemas
5. **RBAC**: Fine-grained permission checking for all protected routes
6. **Error Message Sanitization**: Error details only shown in development mode

## Frontend Features

### Permission-Based UI
- All action buttons (Add, Edit, Delete) are always visible
- Permission checks happen on button click (not form submission)
- "Forbidden Action" popup appears immediately if user lacks permission
- Smooth user experience with clear feedback

### User Experience
- Modern, minimal design with gradient backgrounds
- Responsive layout for mobile and desktop
- Loading states and success/error messages
- Toggle functionality for showing/hiding employee list
- Modal dialogs for adding/editing employees
- Clean table design with floating action buttons

## Usage Flow

1. **Signup**: Create account with username, password, and role selection
2. **Login**: Authenticate with credentials, receive JWT token
3. **Access Employee Page**: View employee records (requires Read permission)
4. **Show Employees**: Click "Show Employees" button to load and display employee list
5. **Add Employee**: Click "Add Employee" button (requires Create permission)
6. **Edit Employee**: Click three dots (⋮) → Edit (requires Update permission)
7. **Delete Employee**: Click three dots (⋮) → Delete (requires Delete permission)
8. **Forbidden Actions**: If permission denied, popup appears immediately

## Development

### Running in Development Mode
```bash
npx nodemon server.js
```

### Project Structure Notes
- Backend follows MVC-like pattern with clear separation
- Frontend uses vanilla JavaScript for simplicity
- API calls are centralized in `api.js`
- All routes are prefixed with `/api`
- Static files served from `/public` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC
