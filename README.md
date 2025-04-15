# Formatic - Technical Documentation

## Environment & Versions

| Tool/Technology | Version | Purpose |
|----------------|---------|---------|
| Node.js | v22.14.0 | JavaScript runtime |
| npm | v10.9.2 | Package manager (Node.js default) |
| Git | v2.39.5 | Version control |
| Docker | v27.5.1 | Containerization |
| Docker Compose | v2.32.4 | Multi-container Docker management |
| NestJS | Latest | Backend framework |
| Next.js | Latest | React framework for frontend |
| Prisma | Latest | ORM for database access |
| Tailwind CSS | Latest | Utility-first CSS framework |
| PostgreSQL | Latest | Database (AWS RDS) |
| JWT | Latest | Authentication tokens |
| bcrypt | Latest | Password hashing |

## Database Connection

| Service | Details |
|---------|---------|
| PostgreSQL (AWS RDS) | Endpoint: formatic-dev-db.c7edc3pems97.eu-west-2.rds.amazonaws.com |
| | Username: postgres |
| | Database: formatic-dev-db |
| | Port: 5432 |

## Project Structure

```
formatic/                       # Root directory
├── .github/                    # GitHub configuration
│   └── workflows/              # GitHub Actions workflows
├── backend/                    # NestJS application
│   ├── src/                    # Source code
│   │   ├── main.ts             # Entry point with global pipes and CORS
│   │   ├── app.module.ts       # Root module
│   │   ├── app.controller.ts   # Root controller
│   │   ├── app.service.ts      # Root service
│   │   ├── prisma/             # Prisma module
│   │   │   ├── prisma.service.ts # Database connection service
│   │   │   └── prisma.module.ts # Global Prisma module
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.module.ts  # Auth module configuration
│   │   │   ├── auth.controller.ts # Login/Register endpoints
│   │   │   ├── auth.service.ts # Authentication logic
│   │   │   ├── constants.ts    # JWT constants
│   │   │   ├── strategies/     # Passport strategies
│   │   │   │   └── jwt.strategy.ts # JWT authentication
│   │   │   ├── guards/         # Authorization guards
│   │   │   │   ├── jwt-auth.guard.ts # JWT authentication guard
│   │   │   │   └── roles.guard.ts # Role-based authorization
│   │   │   ├── decorators/     # Custom decorators
│   │   │   │   └── roles.decorator.ts # Role requirements
│   │   │   └── dto/            # Data Transfer Objects
│   │   │       ├── login.dto.ts # Login payload
│   │   │       └── register.dto.ts # Registration payload
│   │   ├── users/              # Users module
│   │   │   ├── users.module.ts # Users module configuration
│   │   │   ├── users.controller.ts # User CRUD endpoints
│   │   │   ├── users.service.ts # User management logic
│   │   │   └── dto/            # Data Transfer Objects
│   │   │       ├── create-user.dto.ts # User creation
│   │   │       └── update-user.dto.ts # User updates
│   │   ├── forms/              # Forms module
│   │   │   ├── forms.module.ts # Forms module configuration
│   │   │   ├── forms.controller.ts # Form CRUD endpoints
│   │   │   ├── forms.service.ts # Form management logic
│   │   │   └── dto/            # Data Transfer Objects
│   │   │       ├── create-form.dto.ts # Form creation
│   │   │       ├── update-form.dto.ts # Form updates
│   │   │       └── create-form-field.dto.ts # Form field creation
│   │   └── submissions/        # Submissions module
│   │       ├── submissions.module.ts # Submissions module configuration
│   │       ├── submissions.controller.ts # Submission endpoints
│   │       ├── submissions.service.ts # Submission logic
│   │       └── dto/            # Data Transfer Objects
│   │           └── create-submission.dto.ts # Submission creation
│   ├── test/                   # Test files
│   ├── prisma/                 # Prisma ORM
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Database migrations
│   │   └── seeds/              # Seed data
│   │       └── seed.ts         # User seed script
│   ├── .env                    # Environment variables
│   ├── package.json            # Dependencies
│   └── tsconfig.json           # TypeScript configuration
├── frontend/                   # Next.js application
│   ├── src/                    # Source code
│   │   ├── app/                # Next.js App Router
│   │   │   ├── admin/          # Super Admin section
│   │   │   ├── client/         # Client dashboard
│   │   │   └── [clientName]/   # Dynamic public forms
│   │   ├── components/         # React components
│   │   └── lib/                # Utility functions
│   ├── public/                 # Static assets
│   └── package.json            # Dependencies
├── shared/                     # Shared code
│   └── types.ts                # TypeScript interfaces
├── docs/                       # Documentation
│   └── TECH_STACK.md           # Tech stack documentation
├── .gitignore                  # Git ignore file
└── README.md                   # Project README
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | /api/auth/login | Login and get JWT token | No |
| POST | /api/auth/register | Register a new client user | No |
| GET | /api/auth/profile | Get current user profile | Yes |

### Users

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|--------------|-------|
| GET | /api/users | List all users | Yes | SUPER_ADMIN |
| GET | /api/users/:id | Get a specific user | Yes | Owner or SUPER_ADMIN |
| POST | /api/users | Create a new user | Yes | SUPER_ADMIN |
| PATCH | /api/users/:id | Update a user | Yes | Owner or SUPER_ADMIN |
| DELETE | /api/users/:id | Delete a user | Yes | SUPER_ADMIN |

### Forms

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|--------------|-------|
| GET | /api/forms | List all forms (filtered by role) | Yes | Any |
| GET | /api/forms/:id | Get a specific form | Yes | Owner or SUPER_ADMIN |
| POST | /api/forms | Create a new form | Yes | Any |
| PATCH | /api/forms/:id | Update a form | Yes | Owner or SUPER_ADMIN |
| DELETE | /api/forms/:id | Delete a form | Yes | Owner or SUPER_ADMIN |
| POST | /api/forms/:id/fields | Add a field to a form | Yes | Owner or SUPER_ADMIN |
| PATCH | /api/forms/:id/fields/:fieldId | Update a form field | Yes | Owner or SUPER_ADMIN |
| DELETE | /api/forms/:id/fields/:fieldId | Delete a form field | Yes | Owner or SUPER_ADMIN |
| GET | /api/forms/public/:clientId/:slug | Get a public form by slug | No | N/A |

### Submissions

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|--------------|-------|
| GET | /api/submissions | List all submissions (filtered by role) | Yes | Any |
| GET | /api/submissions/:id | Get a specific submission | Yes | Form Owner or SUPER_ADMIN |
| GET | /api/submissions/form/:id | Get all submissions for a form | Yes | Form Owner or SUPER_ADMIN |
| POST | /api/submissions | Create a new submission | No | N/A |
| DELETE | /api/submissions/:id | Delete a submission | Yes | Form Owner or SUPER_ADMIN |

## Database Schema

### User Model
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String (Optional)
- role: Enum (SUPER_ADMIN, CLIENT)
- createdAt: DateTime
- updatedAt: DateTime

### Form Model
- id: UUID (Primary Key)
- title: String
- description: String (Optional)
- clientId: UUID (Foreign Key to User)
- slug: String (Unique)
- published: Boolean
- createdAt: DateTime
- updatedAt: DateTime

### FormField Model
- id: UUID (Primary Key)
- formId: UUID (Foreign Key to Form)
- type: Enum (TEXT, DROPDOWN, CHECKBOX, RADIO, FILE)
- label: String
- placeholder: String (Optional)
- required: Boolean
- options: String[] (For dropdown, checkbox, radio)
- order: Integer
- createdAt: DateTime
- updatedAt: DateTime

### Submission Model
- id: UUID (Primary Key)
- formId: UUID (Foreign Key to Form)
- data: JSON
- createdAt: DateTime

## Authentication System

- JWT-based authentication
- Role-based authorization with guards
- Password hashing with bcrypt
- Token expiration (1 day default)

## Environment Variables

```
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:immortal1497db@formatic-dev-db.c7edc3pems97.eu-west-2.rds.amazonaws.com:5432/formatic-dev-db"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-change-in-production"

# AWS Configuration
AWS_REGION="eu-west-2"
AWS_S3_BUCKET="formatic-uploads"
```

## Development Workflow

1. Start the backend:
```bash
cd backend
npm run start:dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Seed the database (if needed):
```bash
cd backend
npm run seed
```

## Testing

Authentication endpoints:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@formatic.com","password":"Admin123!"}'

# Get profile
curl -X GET http://localhost:3000/api/auth/profile -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Git Workflow

- `main`: Production branch
- `staging`: Pre-production testing
- `dev`: Development branch (default)
- Feature branches created from `dev`

## CI/CD

GitHub Actions (planned):
- Linting and testing
- Building Docker images
- Deploying to different environments based on branch

## Key Features

- **Unified Experience**: A single app manages Super Admin controls, Client dashboards, and End User form interactions.
- **Rapid Form Creation**: Clients can build, customize, and publish forms without technical knowledge.
- **Centralized Data**: All submissions are stored in one place, easily accessible through a client dashboard.
- **Role-Based Access**: Super Admin, Client, and End User roles with appropriate permissions.

## User Roles

- **Super Admin**: Full system control, manages all clients, forms, and data.
- **Client**: Creates and customizes forms, views submissions in their dashboard.
- **End User**: Fills out forms shared by clients (no login required).

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Avinash-jetwani/formatic.git
cd formatic
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the backend directory with:
DATABASE_URL="postgresql://username:password@hostname:port/database"
JWT_SECRET="your-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-s3-bucket"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Seed the database:
```bash
npm run seed
```

6. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

7. Start the development servers:
```bash
# In the backend directory
npm run start:dev

# In the frontend directory
npm run dev
```