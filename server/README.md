# Backend Server

ExpressJS backend server for the Nutrition Calculator application.

## Features

- RESTful API with `/api/v1/` prefix
- SQLite database with Sequelize ORM
- JWT authentication
- Input validation for all endpoints
- Error handling middleware
- CORS enabled

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create `.env` file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Documentation

See main README.md for complete API endpoint documentation.

## Database

The database is automatically created on first run. The SQLite database file is stored in `database/nutrition.db`.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens


