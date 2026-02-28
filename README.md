# E-Commerce Platform

Full-stack e-commerce platform with AI-powered stock management, built as a Software Engineering showcase.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                   React + TypeScript                             │
│              (client/ - port 3001)                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Pages   │  │Components│  │ Contexts │  │   Services     │  │
│  │ Home     │  │ Navbar   │  │ Auth     │  │ productService │  │
│  │ Products │  │ Layout   │  │ Cart     │  │ authService    │  │
│  │ Cart     │  │ Card     │  │          │  │ aiService      │  │
│  │Dashboard │  │          │  │          │  │                │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────┬────────┘  │
│                                                      │           │
└──────────────────────────────────────────────────────┼───────────┘
                                                       │ REST API
                                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND (TypeScript)                          │
│               Node.js + Express + TypeORM                        │
│                  (src/ - port 3000)                               │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐               │
│  │ Controllers│  │  Services  │  │ Repositories │               │
│  │ Product    │──│ Product    │──│ Product      │               │
│  │ Auth       │  │ Auth       │  │ User         │──┐            │
│  │ Order      │  │ Order      │  │ Order        │  │            │
│  │ Category   │  │ Category   │  │ Category     │  │            │
│  │ AI (proxy) │  │ AI         │  │ SalesRecord  │  │            │
│  └────────────┘  └────────────┘  └──────────────┘  │            │
│                                                      │            │
│  ┌────────────┐  ┌────────────┐                     │            │
│  │ Middleware │  │   Routes   │                     │            │
│  │ Auth JWT   │  │ /api/*     │                     │            │
│  │ Validation │  │            │                     │            │
│  │ Error      │  │            │                     │            │
│  └────────────┘  └────────────┘                     │            │
│                                                      ▼            │
│                                              ┌──────────────┐    │
│                                              │  PostgreSQL  │    │
│                                              │  (port 5432) │    │
│                                              └──────────────┘    │
└─────────────────────────┬────────────────────────────────────────┘
                          │ REST API
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                  AI MICROSERVICE (Python)                         │
│               FastAPI + scikit-learn                              │
│              (ai-service/ - port 8000)                            │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Endpoints      │  │         ML Model                     │  │
│  │                  │  │                                      │  │
│  │ POST /predict    │  │  RandomForestRegressor               │  │
│  │   → 7/14/30 day  │  │  Features:                          │  │
│  │     demand pred.  │  │  - day_of_week, month               │  │
│  │                  │  │  - rolling_avg_7d, rolling_avg_30d   │  │
│  │ GET /alerts      │  │  - stock_level                       │  │
│  │   → stock alerts  │  │                                      │  │
│  │                  │  │  Training data: sales_data.csv        │  │
│  │ GET /health      │  │  (365 days × 10 products)            │  │
│  └──────────────────┘  └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Design Patterns

- **Repository Pattern** - Data access layer abstraction (`src/repositories/`)
- **Service Layer** - Business logic separation (`src/services/`)
- **MVC Architecture** - Controllers handle HTTP, services handle logic, models define data
- **Dependency Injection** - Manual DI in `app.ts` for testability

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, React Router, Axios |
| Backend | Node.js, Express, TypeScript, TypeORM |
| Database | PostgreSQL |
| AI Service | Python, FastAPI, scikit-learn (Random Forest) |
| Testing | Jest, Supertest, pytest |
| CI/CD | GitHub Actions |
| DevOps | Docker, Docker Compose, Nginx |
| Cloud (IaC) | AWS ECS/Fargate, Terraform |
| Code Quality | ESLint, Prettier |

## Project Structure

```
.
├── src/                    # Backend TypeScript
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── models/             # TypeORM entities
│   ├── routes/             # Express route definitions
│   ├── middleware/          # Auth, validation, error handling
│   ├── config/             # Database & app configuration
│   ├── types/              # TypeScript interfaces
│   ├── app.ts              # Express app setup + DI
│   └── server.ts           # Entry point
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API client layer
│   │   ├── context/        # React contexts (Auth, Cart)
│   │   └── types/          # TypeScript interfaces
│   └── public/
├── ai-service/             # Python AI microservice
│   ├── app/
│   │   ├── main.py         # FastAPI endpoints
│   │   ├── model.py        # ML model (Random Forest)
│   │   └── schemas.py      # Pydantic schemas
│   ├── data/
│   │   └── sales_data.csv  # Training data (3,650 records)
│   └── tests/
├── __tests__/              # Backend tests
│   ├── unit/
│   │   ├── services/       # Service layer tests
│   │   └── repositories/   # Repository tests
│   └── integration/        # API route tests (supertest)
├── infrastructure/            # Terraform IaC (AWS ECS/Fargate)
│   ├── main.tf                # VPC, ECS, RDS, ALB, ECR
│   ├── variables.tf           # Input variables
│   └── outputs.tf             # Stack outputs
├── docker-compose.yml         # Multi-service orchestration
├── Dockerfile                 # Backend container (multi-stage)
├── .github/workflows/         # CI/CD pipeline
├── .eslintrc.js               # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration (strict)
└── jest.config.ts          # Jest configuration
```

## Setup

### Docker (Recommended)

```bash
# Start all services (backend, frontend, AI, PostgreSQL)
docker compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3000
# AI Service: http://localhost:8000
```

### Manual Setup

#### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

### 1. Backend

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run in development
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm start
```

### 3. AI Microservice

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE ecommerce;
```

TypeORM will auto-sync the schema in development mode.

## Testing

### Backend (TypeScript)

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### AI Service (Python)

```bash
cd ai-service
python -m pytest tests/ -v
```

### Test Count

| Suite | Tests |
|-------|-------|
| Backend Unit (Services) | 16 |
| Backend Unit (Repositories) | 6 |
| Backend Integration (API) | 10 |
| AI Service (pytest) | 9 |
| **Total** | **41** |

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run typecheck
```

## API Endpoints

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (auth)
- `PUT /api/products/:id` - Update product (auth)
- `DELETE /api/products/:id` - Delete product (auth)

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (auth)

### Orders
- `POST /api/orders` - Create order (auth)
- `GET /api/orders/my-orders` - User orders (auth)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Category with products

### AI (Stock Prediction)
- `POST /api/ai/predict` - Demand prediction for a product
- `GET /api/ai/alerts` - Stock alerts
- `GET /api/ai/health` - AI service health

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Lint & Type Check** - ESLint + `tsc --noEmit` + Prettier check
2. **Backend Tests** - Jest unit + integration tests
3. **Backend Build** - TypeScript compilation
4. **AI Service Tests** - pytest
5. **Frontend Build** - React production build
6. **Docker Build** - Build and validate all container images

## Cloud Deployment (AWS)

Infrastructure as Code with Terraform in `infrastructure/`:

- **VPC** - Multi-AZ networking with public/private subnets
- **ECS Fargate** - Serverless container orchestration for all services
- **RDS PostgreSQL** - Managed database with encryption and automated backups
- **ECR** - Container registry with vulnerability scanning
- **ALB** - Application Load Balancer with health checks
- **CloudWatch** - Centralized logging

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init
terraform plan
terraform apply
```

## License

ISC
