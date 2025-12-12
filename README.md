# Welcome to Slopify Backend!

A modern, production-ready template for building e-commerce APIs with my own opinionated technologies and practices.
This project is a template with no business logic, designed to help you kickstart your own clone of a Shopify-like store backend.

( 🚧 Work in progress 🚧 )

## Stack

- 🚀 FastAPI for the API framework [FastAPI docs](https://fastapi.tiangolo.com/)
- 🗄️ PostgreSQL 17.4 for database
- 🔄 SQLModel for ORM
- 📦 Alembic for database migrations
- 🐳 Docker Compose for development and deployment
- 📖 Ruff for linting and formatting
- 🧪 pytest for testing
- 🔍 mypy for type checking
- 🎛️ Starlette Admin for admin panel
- (Upcoming) Sentry for error tracking

## Frontend

You can use any frontend you wish, or you can also use the provided Slopify Frontend template [here](https://github.com/alexdicksonroig/slopify-frontend)

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine
- Python 3.12+ (if running locally without Docker)

### Installation

1. Create a `.env` file in the root directory with your environment variables (use `.env.example` if available as a template)

2. Build and start the services using Docker Compose:

```bash
docker-compose up --build
```

### Development

Start the development server:

```bash
docker-compose up
```

Your API will be available at `http://localhost:8000`.

API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Running Migrations

To run database migrations:

```bash
docker-compose exec app alembic upgrade head
```

## Building for Production

Build the production image:

```bash
docker-compose build
```
