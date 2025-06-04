# 🎓 Edunest Backend

Edunest is a fully-featured educational platform with role-based access control for `Admin`, `Tutor`, and `Student` users. This backend is built using Node.js, Express.js, and MongoDB with secure authentication and authorization.

---

## 🚀 Features

- JWT-based Authentication & Authorization
- Role-Based Access Control (RBAC)
  - **Admin**: Full access to all features
  - **Tutor**: Can create and manage courses
  - **Student**: Can browse, enroll, and access courses
- RESTful API structure
- MongoDB with Mongoose ODM
- Cookie-based token management (httpOnly & secure)
- Centralized error and validation handling
- Environment-based configuration with `.env` support
- CORS setup for cross-origin requests

---

## 🛠 Tech Stack

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

Edunest supports three user roles with different access levels:

| Role    | Permissions |
|---------|-------------|
| Admin   | Full control over users, courses, and settings |
| Tutor   | Create and manage their own courses |
| Student | Browse and enroll in available courses |

Each protected route uses middleware to verify the user's role and grant/deny access accordingly.

---

## 📦 Installation & Setup

### 🔧 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Git (for cloning)

### ▶️ Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/edunest-backend.git

# 2. Navigate to the folder
cd edunest-backend

# 3. Install all dependencies
npm install

# 4. Create your environment variables file
cp .env.example .env

# 5. Start the development server
npm run dev
