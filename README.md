# Doctor Tracker Backend

REST API for the Doctor Tracker application. The backend manages authentication, doctors, patients, patient assignments, and dashboard statistics.

## Tech Stack

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- HTTP-only cookies
- express-validator
- bcryptjs
- CORS and cookie-parser

## Project Structure

```text
backend/
|-- server.js                 # Application entry point
|-- config/database.js        # MongoDB connection
|-- controllers/              # Request handlers
|-- middlewares/              # Authentication and validation
|-- models/                   # Mongoose models
|-- routes/                   # API route definitions
|-- validators/               # Request validation rules
|-- utils/                    # Shared helpers
|-- .env.example              # Environment variable template
|-- package.json
`-- server.js
```

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database (local or hosted)

## Environment Variables

Create a `.env` file in the `backend/` directory:

```dotenv
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=1d
SETUP_SECRET=your_private_user_creation_secret
NODE_ENV=development
```

| Variable         | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `PORT`           | API port. Defaults to `5001`.                                |
| `MONGODB_URI`    | MongoDB connection string.                                   |
| `JWT_SECRET`     | Secret used to sign and verify JWTs.                         |
| `JWT_EXPIRES_IN` | JWT lifetime, for example `1d` or `12h`.                     |
| `SETUP_SECRET`   | Private secret for the one-time initial user setup endpoint. |
| `NODE_ENV`       | Set to `production` to enable secure login cookies.          |

Do not commit `.env` or real secrets.

## Installation

```bash
npm install
```

## Running the Server

Development mode with automatic restarts:

```bash
npm run dev
```

The server is available at `http://localhost:5001`. It accepts requests from `http://localhost:3000` and allows credentials.

## Initial User Setup

Create the first application user once:

```bash
curl -X POST http://localhost:5001/api/auth/create-user \
  -H "Content-Type: application/json" \
  -H "X-Setup-Secret: your_private_user_creation_secret" \
  -d '{
    "name": "Administrator",
    "email": "admin@example.com",
    "password": "change-this-password"
  }'
```

User creation is disabled after one user exists. The setup secret must match `SETUP_SECRET`.

## Authentication

Login creates an HTTP-only `token` cookie:

```text
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "change-this-password"
}
```

Protected routes also accept a bearer token:

```text
Authorization: Bearer <jwt>
```

## API Routes

### Authentication

| Method | Endpoint                |       Access | Description                         |
| ------ | ----------------------- | -----------: | ----------------------------------- |
| POST   | `/api/auth/create-user` | Setup secret | Create the initial user             |
| POST   | `/api/auth/login`       |       Public | Authenticate and set the JWT cookie |
| POST   | `/api/auth/logout`      |       Public | Clear the JWT cookie                |
| GET    | `/api/auth/me`          |    Protected | Get the current user                |

### Doctors

| Method | Endpoint                                        | Description                                               |
| ------ | ----------------------------------------------- | --------------------------------------------------------- |
| POST   | `/api/doctors`                                  | Create a doctor                                           |
| GET    | `/api/doctors`                                  | List doctors with filters and pagination                  |
| GET    | `/api/doctors/:id`                              | Get a doctor                                              |
| PUT    | `/api/doctors/:id`                              | Update a doctor                                           |
| DELETE | `/api/doctors/:id`                              | Delete an unassigned doctor                               |
| GET    | `/api/doctors/:id/patients`                     | List patients assigned to a doctor                        |
| POST   | `/api/doctors/:id/patients`                     | Assign an existing patient or create and assign a patient |
| PATCH  | `/api/doctors/:id/patients/:patientId/unassign` | Remove a patient's doctor assignment                      |

Doctor list query parameters include `page`, `limit`, `search`, `specialization`, `hospital`, `startDate`, and `endDate`.

### Patients

| Method | Endpoint            | Description                               |
| ------ | ------------------- | ----------------------------------------- |
| GET    | `/api/patients`     | List patients with filters and pagination |
| GET    | `/api/patients/:id` | Get a patient                             |
| PUT    | `/api/patients/:id` | Update a patient                          |
| DELETE | `/api/patients/:id` | Delete a patient                          |

Patient list query parameters include `page`, `limit`, `search`, `condition`, `gender`, `doctor`, `startDate`, and `endDate`.

### Dashboard

| Method | Endpoint                             | Description                                         |
| ------ | ------------------------------------ | --------------------------------------------------- |
| GET    | `/api/dashboard/overview`            | Totals for doctors and assigned/unassigned patients |
| GET    | `/api/dashboard/patients-per-doctor` | Patient counts grouped by doctor                    |
| GET    | `/api/dashboard/statistics`          | Doctor and patient creation trends                  |

`statistics` accepts optional ISO `startDate` and `endDate` query parameters.

All doctor, patient, and dashboard routes require authentication.

## Response Format

Successful responses normally include:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

List responses include a `pagination` object:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

Errors use HTTP status codes and a JSON `message`.

## Testing

No automated test suite is currently configured. The package's test script returns an intentional placeholder error.
