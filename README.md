# InspectionToursSystem API Server

This Node.js/Express server provides authentication and inspection management APIs for the InspectionToursSystem project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust values as needed. Make sure
   `CORS_ALLOWED_ORIGINS` includes the origin of the frontend (see
   [`server/.env.example`](./.env.example)):
   ```bash
   cp .env.example .env
   ```
3. Start the server in development mode:
   ```bash
   npm run dev
   ```
   Or start normally:
   ```bash
   npm start
   ```

The server listens on the port defined in the `PORT` environment variable (defaults to `3000`).

## Environment Variables

The application reads the following variables from `.env`:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Port to run the HTTP server |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | Expiration time for generated tokens |
| `LOG_LEVEL` | Winston log level (`info`, `error`, etc.) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins for CORS. Leave empty to allow all origins |
| `RATE_LIMIT_WINDOW_MS` | Rate‑limit time window in milliseconds |
| `RATE_LIMIT_MAX` | Maximum number of requests per window |

See [`.env.example`](./.env.example) for example values.

## API Routes

All routes are prefixed with `/api`.

### Authentication

- `POST /api/auth/register` – Register a new user. Body parameters: `username`, `password`.
- `POST /api/auth/login` – Obtain a JWT token. Body parameters: `username`, `password`.
- `POST /api/auth/logout` – Dummy endpoint that always succeeds.

### Managers

Requires `Authorization: Bearer <token>` header.

- `POST /api/managers` – Create a manager. Body: `name`, `rank`, `department`.
- `GET /api/managers` – List all managers.
- `GET /api/managers/:id` – Get manager by ID.
- `GET /api/managers/:id/summary` – Get a manager along with all inspection rounds.
- `PUT /api/managers/:id` – Update manager fields (`name`, `rank`, `department`).
- `DELETE /api/managers/:id` – Remove a manager and its associated rounds.

### Inspection Rounds

Also require the `Authorization` header.

- `POST /api/rounds` – Create a round. Body: `managerId`, `location`, `day`.
- `GET /api/rounds` – List all rounds.
- `GET /api/rounds/:id` – Get round by ID.

### Example Request

```bash
curl -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Manager","rank":1,"department":"Dept"}' \
     http://localhost:3000/api/managers
```

## Running Tests

The project uses `jest` and `supertest`. Run the tests with:

```bash
npm test
```