# Feature Flag & Remote Config System

A backend-focused system that demonstrates **role-based access control (RBAC)**,
**feature flags**, and **remote configuration** using database-driven permissions.

Employee records are used as a demo resource to showcase how feature availability
can be controlled at runtime without redeploying services.

## 🔗 Live Demo
👉 https://feature-flag-remote-config.onrender.com/

---

## What This Project Demonstrates

- **Feature flags implemented as database configuration**
- **Role-based permissions fetched at request time**
- **Runtime behavior changes without redeploy**
- **Clear separation of authentication and authorization**
- **Production-style backend design, not hardcoded logic**

This mirrors how real systems control access and feature rollout in production.

---

## Core Features

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Database-driven feature flags (JSON permissions)
- Permission-aware backend APIs
- Minimal UI to visualize access behavior
- Centralized error handling & input validation

---

## Tech Stack

**Backend**
- Node.js, Express
- PostgreSQL
- JWT, bcrypt
- Zod
- pg

**Frontend**
- Vanilla JavaScript
- HTML / CSS

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
---

## Deployment

Deployed on **Render** with a managed PostgreSQL instance.

---

## Why This Exists

Most demo projects hardcode permissions.

This project shows:
- why permissions belong in the **database**
- how feature flags act as **remote configuration**
- how backend systems stay flexible as they scale

---

## Future Improvements

- Admin-controlled permission toggling (UI)
- Redis caching for permission fetches
- Rate limiting
- Audit logs for configuration changes

---

## License

ISC
