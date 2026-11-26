# 🛂 PassPort — "El Retorno del Token" 🔐

> "Passwords get hashed. Sessions get revoked. Tokens get verified."

Secure authentication and session management API built with Node.js, Express, Prisma and PostgreSQL.

---

## 🎬 Description

This project simulates the authentication core of PassPort Inc., a startup building a digital identity manager where users store and share sensitive documents.

The system lets users register, log in and keep a session alive using either **cookies** or **JWT**, while protecting the platform against the most common web attacks.

The system includes:

- User registration and login with email and password
- Two session mechanisms: cookie-based and JWT (Bearer)
- Role-based access control (`user` and `admin`)
- CSRF protection for cookie sessions
- Brute-force protection with temporary account locking
- A full audit trail of login attempts

Every session lives in the database, so any session (cookie or JWT) can be revoked at logout.

---

## 🧠 Objective

Build a realistic authentication system to practice:

- Password hashing with Argon2
- Cookie sessions vs JWT authentication
- Session lifecycle management (create, validate, revoke)
- Role-Based Access Control (RBAC)
- CSRF protection (double-submit cookie)
- Brute-force mitigation and login auditing
- Secure cookie configuration and HTTP security headers
- Layered backend architecture with Express

---

## 🛠️ Technologies Used

### Backend
- **Node.js**
- **Express 5**
- **Zod** (input validation)

### Database
- **PostgreSQL**
- **Prisma ORM** (with `@prisma/adapter-pg`)

### Security
- **Argon2** (password hashing)
- **jsonwebtoken** (JWT signing and verification)
- **Helmet** (HTTP security headers + CSP)
- **Node `crypto`** (SHA-256 token hashing, CSRF tokens, AES-256-GCM utility)
- **cookie-parser**, **CORS**

### DevOps
- **Docker Compose** (PostgreSQL)
- **dotenv**
- **Nodemon**

---

## 🧩 System Architecture

The API follows a layered architecture, where each layer has a single responsibility:

```text
Client
   ↓
Routes → Middleware (auth, roles, CSRF)
   ↓
Controllers → Validators (Zod)
   ↓
Services (auth, JWT, session, password, CSRF)
   ↓
Prisma → PostgreSQL
```

| Layer | Responsibility |
|---|---|
| Routes | Map endpoints to controllers and attach middleware |
| Middleware | Authenticate requests, authorize roles, validate CSRF |
| Controllers | Handle HTTP: validate input, set cookies, map errors to status codes |
| Services | Business logic: hashing, sessions, tokens, lockout rules |
| Prisma | Persistence for users, roles, sessions and login attempts |

---

## ⚙️ How It Works

### 🔹 Registration

1. The client sends email and password.
2. The input is validated and the email is normalized.
3. The password is hashed with Argon2.
4. The user is stored with the default `user` role.

### 🔹 Login

1. The client sends credentials.
2. The server checks that the account exists, is active and is not locked.
3. The password is verified against its Argon2 hash.
4. On failure, the attempt is logged and the failure counter increases. After 5 failures the account is locked for 15 minutes.
5. On success, a session is created in the database and a JWT is signed with the session ID inside.
6. The server stores only the **SHA-256 hash** of the JWT, never the token itself.
7. The response sets two cookies (`sessionId`, `csrfToken`) and returns the JWT in the body.

### 🔹 Authenticated Requests

The client chooses which credential to present:

```text
Authorization: Bearer <JWT>     →  JWT + session check
Cookie: sessionId=<id>          →  session check (+ CSRF on state-changing routes)
```

In both cases the server verifies that the session exists, is not revoked and has not expired.

### 🔹 Logout

The session is marked as revoked in the database and both cookies are cleared. Since the JWT is tied to that session, it stops working immediately too.

---

## 🔐 Security Measures

| Threat | Protection |
|---|---|
| Plain-text passwords | Argon2 hashing |
| Stolen database | Only password hashes and SHA-256 token hashes are stored |
| Token theft after logout | Server-side session revocation checked on every request |
| Cookie theft via JS | `httpOnly` session cookie |
| Cookie leakage over HTTP | `secure` flag enabled in production |
| CSRF | Double-submit token (cookie + `X-CSRF-Token` header), compared in constant time |
| Brute force | Account lock after 5 failed attempts (15 min) + login attempt audit log |
| Malicious input | Zod schema validation on all auth payloads |
| Script injection / clickjacking | Helmet security headers with a strict Content Security Policy |
| Privilege escalation | Role check middleware (`authorizeRoles`) |

---

## 📡 Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | API status |
| POST | `/auth/register` | Public | Create a user account |
| POST | `/auth/login` | Public | Log in, create session and JWT |
| GET | `/auth/me` | Authenticated | Current user data |
| GET | `/auth/admin` | Admin only | Admin panel |
| POST | `/auth/logout` | Authenticated + CSRF | Revoke the session |

### Response codes

| Code | Meaning |
|---|---|
| 400 | Invalid input |
| 401 | Invalid credentials or invalid/expired session |
| 403 | Inactive account, forbidden role, or CSRF failure |
| 409 | Email already registered |
| 423 | Account temporarily locked |

---

## 🧪 Example Workflow

### 1. Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123"}'
```

### 2. Login

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123"}'
```

**Response (simplified):**

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "sessionId": "<uuid>",
  "user": { "id": "<uuid>", "email": "user@example.com", "role": { "name": "user" } }
}
```

### 3a. Use the JWT

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <jwt>"
```

### 3b. Or use the cookie

```bash
curl http://localhost:3000/auth/me -b cookies.txt
```

### 4. Logout (cookie session requires the CSRF header)

```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt \
  -H "X-CSRF-Token: <value of the csrfToken cookie>"
```

---

## 🗄️ Data Model

```text
Role ──< User ──< Session
              └──< LoginAttempt
```

| Model | Purpose |
|---|---|
| `Role` | `user` and `admin` |
| `User` | Email, password hash, role, active flag, failed attempts, lock expiry |
| `Session` | Token hash, expiry and revocation date |
| `LoginAttempt` | Email, IP address and result of every login attempt |

---

## 📂 Project Structure

```text
Authentication-System-Challenge-10-TheHuddle/

├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── csrf.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── jwt.service.js
│   │   ├── session.service.js
│   │   ├── password.service.js
│   │   ├── csrf.service.js
│   │   └── encryption.service.js
│   ├── validators/
│   │   └── auth.validator.js
│   ├── app.js
│   └── server.js
│
├── docker-compose.yml
├── prisma.config.ts
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Installation

### 1. Clone repository

```bash
git clone https://github.com/JuanCastro-H/Authentication-System-Challenge-10-TheHuddle.git
cd Authentication-System-Challenge-10-TheHuddle
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

The database is exposed on port `5433`. Credentials are defined in `docker-compose.yml` and are for local development only.

### 4. Create environment variables

For security reasons, the real `.env` file is not included in the repository.

Copy the provided example and fill in the values:

```bash
cp .env.example .env
```

### 📌 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default `3000`) |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT lifetime (e.g. `15m`) |
| `NODE_ENV` | `development` or `production` (enables the `secure` cookie flag) |

Example `DATABASE_URL` for the Docker database:

```env
DATABASE_URL=postgresql://passport:<password>@localhost:5433/passport_db
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Generate the Prisma client and run migrations

```bash
npx prisma generate
npm run db:migrate
```

Prisma settings (schema path, migrations and seed command) live in `prisma.config.ts`.

### 6. Seed initial data

Creates the `user` and `admin` roles and a test admin account (`admin@example.com`). The password is defined in `prisma/seed.js` — change it before any real deployment.

```bash
npx prisma db seed
```

### 7. Start the server

```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## ▶️ Usage

After starting the server:

```text
http://localhost:3000
```

1. Register a user with `POST /auth/register`.
2. Log in with `POST /auth/login` and choose cookie or JWT for later requests.
3. Access `GET /auth/me` to see the authenticated user.
4. Log in as the seeded admin to access `GET /auth/admin`.
5. Log out with `POST /auth/logout`.

### 📜 Available scripts

| Script | Description |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio to inspect the database |

---

## 📈 Key Features

✔ Registration and login with email and password  
✔ Argon2 password hashing  
✔ Cookie sessions with `httpOnly` and `secure` flags  
✔ JWT authentication (Bearer)  
✔ Server-side session store with revocation and expiry  
✔ Only token hashes stored in the database (SHA-256)  
✔ Role-based access control (`user` / `admin`)  
✔ CSRF protection with double-submit tokens  
✔ Account lockout after repeated failed logins  
✔ Login attempt audit log (email, IP, result)  
✔ Input validation with Zod  
✔ Security headers and CSP with Helmet  
✔ Layered architecture (routes, middleware, controllers, services)  
✔ Dockerized PostgreSQL  

---

## 🧃 Possible Improvements

- Encrypt sensitive data inside tokens (AES-256-GCM service already included, pending integration)
- IP-based rate limiting on login and register (`express-rate-limit`)
- Admin endpoints to review failed login attempts and manage users
- Secure password reset flow via email
- Automated tests for authentication, CSRF and lockout rules
- Front-end for registration and login
- Restrict CORS to trusted origins
- Refresh tokens and configurable "remember me" sessions
- Dockerize the API and add a CI/CD pipeline

---

## 👨‍💻 Author

**Juan Castro**

---

# 🇪🇸 Resumen en Español

PassPort es una API de autenticación y gestión de sesiones pensada para una plataforma de identidad digital donde los usuarios guardan documentos sensibles.

Permite registrarse e iniciar sesión con email y contraseña, y mantener la sesión mediante cookies o JWT, con control de acceso por roles y protección contra los ataques web más comunes.

---

## 🎯 Objetivo

El proyecto fue desarrollado para practicar:

- hashing seguro de contraseñas con Argon2,
- diferencias entre sesiones con cookies y autenticación con JWT,
- gestión del ciclo de vida de una sesión (crear, validar, revocar),
- control de acceso basado en roles (RBAC),
- protección CSRF,
- prevención de ataques de fuerza bruta,
- configuración segura de cookies y cabeceras HTTP.

---

## ⚙️ Funcionamiento

- El usuario se registra y su contraseña se guarda hasheada con Argon2.
- Al iniciar sesión, el servidor valida credenciales, crea una sesión en la base de datos y emite un JWT más dos cookies (`sessionId` y `csrfToken`).
- En cada petición, el cliente puede usar el JWT en la cabecera `Authorization` o la cookie de sesión; el servidor siempre verifica que la sesión exista, no esté revocada ni vencida.
- Tras 5 intentos fallidos, la cuenta se bloquea 15 minutos y cada intento queda registrado con su IP.
- Al cerrar sesión, la sesión se revoca y tanto la cookie como el JWT dejan de funcionar.

---

## 📊 Características destacadas

- Registro y login con hashing Argon2
- Sesiones con cookies seguras y autenticación JWT
- Sesiones revocables guardadas en base de datos
- Roles de usuario y administrador
- Protección CSRF con doble envío de token
- Bloqueo temporal de cuentas y auditoría de intentos de login
- Validación de entradas y cabeceras de seguridad con Helmet
- PostgreSQL con Prisma y Docker

---

## 🧠 Conclusión

El proyecto demuestra cómo construir un sistema de autenticación por capas, donde cada decisión de seguridad tiene una responsabilidad clara: hashing, sesiones, tokens, roles y detección de abuso.

Este enfoque permite:
- proteger las credenciales aunque la base de datos sea comprometida,
- revocar sesiones de forma inmediata,
- restringir el acceso según el rol del usuario,
- y ampliar el sistema con nuevas medidas de seguridad sin rehacer su arquitectura.
