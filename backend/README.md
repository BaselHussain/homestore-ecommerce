# Homestore Backend API

Express.js backend for the Homestore e-commerce website, built with TypeScript, Prisma ORM, and Neon PostgreSQL.

## Prerequisites

- Node.js 20.x
- npm
- [Neon](https://console.neon.tech) PostgreSQL account

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your Neon database connection string:

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
PORT=5000
NODE_ENV=development
```

### 3. Run database migration

```bash
npm run db:migrate
```

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Seed initial products

```bash
npm run db:seed
```

### 6. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

All endpoints that operate on user data require the `x-user-id` header (a valid User ID from the database).

### Health

| Method | Endpoint  | Description        |
|--------|-----------|--------------------|
| GET    | /health   | Server health check |

### Products

| Method | Endpoint              | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | /api/products         | List products (search/filter/sort) |
| GET    | /api/products/:id     | Get product by ID                 |
| POST   | /api/products         | Create product (admin placeholder) |

**Query parameters for GET /api/products:**
- `search` — text search on name and description
- `category` — filter by category (case-insensitive)
- `sort` — `price_asc`, `price_desc`, `name_asc`, `name_desc`, `created_at_desc`
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 100)

### Cart

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | /api/cart        | Get cart items + total   |
| POST   | /api/cart        | Add item to cart         |
| PUT    | /api/cart/:id    | Update item quantity     |
| DELETE | /api/cart/:id    | Remove item from cart    |

**Cart notes:**
- Stock is reserved immediately when items are added
- Cart items expire after 24 hours; stock is restored on expiry

### Wishlist

| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | /api/wishlist        | Get wishlist items        |
| POST   | /api/wishlist        | Add item to wishlist      |
| DELETE | /api/wishlist/:id    | Remove item from wishlist |

### Orders

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/orders                | Get user's orders                  |
| GET    | /api/orders/:id            | Get order by ID                    |
| POST   | /api/orders                | Create order from cart             |
| PATCH  | /api/orders/:id/status     | Update order status                |

**Order status flow:**
```
Pending → Confirmed → Processing → Shipped → Delivered → Refunded
Pending/Confirmed/Processing → Cancelled
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Human-readable error description",
    "statusCode": 404
  }
}
```

| Status | Meaning                     |
|--------|-----------------------------|
| 400    | Bad request / validation    |
| 404    | Resource not found          |
| 500    | Internal server error       |

## Development

```bash
# View database via Prisma Studio
npm run db:studio

# TypeScript type checking
npx tsc --noEmit
```
