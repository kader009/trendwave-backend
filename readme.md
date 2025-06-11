# TrendWave Backend

Backend server for the **TrendWave** project built with Node.js, Express, and MongoDB.  
This backend handles API requests, user authentication, role-based access control, and database operations.

## Features

- JWT-based Authentication & Authorization
- Role-Based Access Control (RBAC)
  - **Admin**: Full access to all features
  - **Seller**: Can create and manage products
  - **Customer**: Can browse, add wishlist, and buy products
- RESTful API structure
- MongoDB with Mongoose ODM
- Cookie-based token management (httpOnly & secure)
- Centralized error and validation handling
- Environment-based configuration with `.env` support
- CORS setup for cross-origin requests

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (via Mongoose)
- **JWT** (JSON Web Tokens)
- **dotenv** – environment configuration
- **cors** – cross-origin support
- **cookie-parser** – to handle cookies
- **bcryptjs** – for password hashing
- **helmet** – for HTTP header security

---

## 👥 User Roles & Access

TrendWave supports three user roles with different access levels:

| Role     | Permissions                                    |
| -------- | ---------------------------------------------- |
| Admin    | Full control over users, courses, and settings |
| Seller   | Can create and manage products                 |
| Customer | Can browse, add wishlist, and buy products     |

Each protected route uses middleware to verify the user's role and grant/deny access accordingly.

---

## Installation & Setup

### 🔧 Prerequisites

- Node.js (v21 or higher)
- MongoDB (local or MongoDB Atlas)
- Git (for cloning)

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/kader009/trendwave-backend.git
```

```bash
# 2. Install all dependencies
npm install
```

```bash
# 3. Create your environment variables file (if you have)
cp .env.example .env
```

```bash
# 4. Start the development server
npm run dev
```
