# Nutritions - Nutrition Calculator

A modern web application for calculating and tracking nutritional information of foods and meals.

## Project Overview

This project consists of two main components:

- **Frontend (UI)**: A modern web interface built with React
- **Backend**: A Node.js/ExpressJS server with RESTful API, database integration, and validation

## Features

- Calculate nutritional values for foods and meals
- Track daily nutritional intake
- User authentication and registration
- Meal planning and tracking
- User-friendly interface
- Responsive design for mobile and desktop
- RESTful API with proper validation
- Database storage for users and meals

## Project Structure

```
.
├── ui/                    # Frontend application (React)
│   ├── src/              # Source code
│   ├── public/           # Public assets
│   └── package.json      # Frontend dependencies
│
└── server/                # Backend service (ExpressJS)
    ├── config/           # Configuration files
    ├── models/           # Database models (Sequelize ORM)
    ├── routes/           # API routes
    │   └── api/v1/      # Versioned API endpoints
    ├── middleware/       # Custom middleware (validation, auth)
    ├── database/         # SQLite database files
    └── package.json      # Backend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Nutritions.git
cd Nutritions
```

2. Install frontend dependencies:

```bash
cd ui
npm install
```

3. Install backend dependencies:

```bash
cd ../server
npm install
```

4. (Optional) Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` and set your `JWT_SECRET` and `PORT` if needed.

## Running the Application

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd server
npm start
```

The backend server will start on `http://localhost:5000` (or the port specified in your `.env` file).

You should see:
```
Database connected successfully
Server is running on port 5000
API endpoints available at http://localhost:5000/api/v1
```

### 2. Start the Frontend Development Server

Open a new terminal and run:

```bash
cd ui
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

The backend provides RESTful API endpoints following the `/api/v1/` naming convention:

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register a new user
  - Body: `{ email, username, password, firstName, lastName, phone }`
  - Returns: User object and JWT token

- `POST /api/v1/auth/login` - Login user
  - Body: `{ email, username, password? }`
  - Returns: User object and JWT token

- `POST /api/v1/auth/google` - Google OAuth authentication
  - Body: `{ email, name, picture, googleId }`
  - Returns: User object and JWT token

### User Endpoints

- `GET /api/v1/users` - Get all users (for testing)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user (requires authentication)
- `DELETE /api/v1/users/:id` - Delete user (requires authentication)

### Meal Endpoints (All require authentication)

- `GET /api/v1/meals` - Get all meals for authenticated user
- `GET /api/v1/meals/:id` - Get meal by ID
- `POST /api/v1/meals` - Create new meal
  - Body: `{ day, mealType, name, calories, protein?, carbs?, fat?, recipeId?, recipeData? }`
- `PUT /api/v1/meals/:id` - Update meal
- `DELETE /api/v1/meals/:id` - Delete meal
- `GET /api/v1/meals/week/:day` - Get meals for a specific day (monday-sunday)

### Health Check

- `GET /health` - Server health check

## Functionalities and How to Use Them

### 1. User Registration and Authentication

**Registration:**
- Navigate to the Sign Up page
- Fill in your email, username, password, first name, last name, and optional phone number
- The system validates:
  - Email format (must be a valid email)
  - Username (3-30 characters, alphanumeric and underscores only)
  - Password (minimum 6 characters)
  - Phone number format (if provided)

**Login:**
- Enter your email and username on the Sign In page
- Optionally use Google OAuth for quick authentication
- Upon successful login, you receive a JWT token for authenticated requests

### 2. Calorie Calculator

- Fill in your body information (age, gender, weight, height, activity level)
- The system calculates your daily calorie needs
- Results are displayed with recommended calorie goals

### 3. Meal Planning

- Select your calorie goal
- Browse and select meals for each day of the week
- Meals are automatically saved to your account
- View your weekly meal plan

### 4. Meal Management

- Create, read, update, and delete meals through the API
- Meals are organized by day (Monday-Sunday) and meal type (breakfast, lunch, dinner, snack)
- Track nutritional information (calories, protein, carbs, fat)

### 5. Data Validation

The application includes comprehensive validation:

- **Email validation**: Ensures proper email format
- **Phone validation**: Validates phone number format (supports international formats)
- **Username validation**: 3-30 characters, alphanumeric and underscores
- **Password validation**: Minimum 6 characters
- **Meal data validation**: Validates day, meal type, calories, and nutritional values

All validation errors are returned with clear error messages.

## Database

The application uses **SQLite** database with **Sequelize ORM** for data management.

- Database file: `server/database/nutrition.db`
- Models: User, Meal
- Automatic table creation on first run
- Relationships: User has many Meals

## API Usage Examples

### Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Create a Meal (with authentication)

```bash
curl -X POST http://localhost:5000/api/v1/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "day": "monday",
    "mealType": "breakfast",
    "name": "Oatmeal with fruits",
    "calories": 350,
    "protein": 12.5,
    "carbs": 55.0,
    "fat": 8.0
  }'
```

## CodeSandbox Link

[Add your CodeSandbox link here]

Example: `https://codesandbox.io/s/nutritions-app-xxxxx`

## Development

- Frontend code is in the `ui/src` directory
- Backend code is in the `server` directory
- API routes follow RESTful conventions with `/api/v1/` prefix
- All endpoints use standard HTTP methods (GET, POST, PUT, DELETE)
- Validation middleware ensures data integrity
- Error handling provides consistent error responses

## Technology Stack

**Frontend:**
- React
- Redux
- Material-UI
- Axios

**Backend:**
- Node.js
- ExpressJS
- Sequelize ORM
- SQLite
- JWT Authentication
- Express Validator

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/Nutritions
