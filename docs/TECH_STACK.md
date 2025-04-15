# Formatic - Technical Documentation

## Environment & Versions

| Tool/Technology | Version | Purpose |
|----------------|---------|---------|
| Node.js | v22.14.0 | JavaScript runtime |
| npm | v10.9.2 | Package manager (Node.js default) |
| Yarn | Latest | Alternative package manager |
| Git | v2.39.5 | Version control |
| Docker | v27.5.1 | Containerization |
| Docker Compose | v2.32.4 | Multi-container Docker management |
| NestJS CLI | Latest | CLI for NestJS development |

## Database

| Service | Details |
|---------|---------|
| PostgreSQL (AWS RDS) | Endpoint: formatic-dev-db.c7edc3pems97.eu-west-2.rds.amazonaws.com |
| | Username: postgres |
| | Database: formatic-dev-db |
| | Port: 5432 |

## Project Structure
formatic/                       # Root directory
├── .github/                    # GitHub configuration
│   └── workflows/              # GitHub Actions workflows
├── backend/                    # NestJS application
│   ├── src/                    # Source code
│   │   ├── main.ts             # Entry point
│   │   ├── app.module.ts       # Root module
│   │   └── modules/            # Feature modules
│   │       ├── auth/           # Authentication
│   │       ├── forms/          # Form management
│   │       └── submissions/    # Form submissions
│   ├── test/                   # Test files
│   ├── prisma/                 # Prisma ORM
│   │   └── schema.prisma       # Database schema
│   └── package.json            # Dependencies
├── frontend/                   # Next.js application
│   ├── pages/                  # Next.js pages
│   │   ├── admin/              # Super Admin section
│   │   ├── client/             # Client dashboard
│   │   └── [clientName]/       # Dynamic public forms
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # CSS/styling
│   └── package.json            # Dependencies
├── shared/                     # Shared code
│   └── types.ts                # TypeScript interfaces
├── docs/                       # Documentation
│   └── TECH_STACK.md           # Tech stack documentation
├── .gitignore                  # Git ignore file
└── README.md                   # Project README

## Frontend Technologies

| Technology | Purpose |
|------------|---------|
| Next.js | React framework with SSR/SSG |
| React | UI library |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first CSS framework |
| React Query | Data fetching & caching |

## Backend Technologies

| Technology | Purpose |
|------------|---------|
| NestJS | Node.js framework |
| TypeScript | Type-safe JavaScript |
| Prisma | ORM for database access |
| JWT | Authentication |
| AWS SDK | S3 integration for file uploads |

## Infrastructure

| Service | Purpose |
|---------|---------|
| AWS RDS | PostgreSQL database hosting |
| AWS S3 | File storage |
| AWS ECS (Fargate) | Containerized application hosting |

## Branching Strategy

- `main` - Production code
- `staging` - Pre-production testing
- `dev` - Development branch (default)
- Feature branches - Branch from `dev` for new features

## CI/CD

Will use GitHub Actions for:
- Linting and testing
- Building Docker images
- Deploying to different environments based on branch

