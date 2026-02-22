# Quickstart Guide: Backend & Database Setup

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Neon PostgreSQL account and database created

## Setup Instructions

### 1. Environment Setup
```bash
# Navigate to the project root
cd e-commerce claude

# Create the backend directory
mkdir backend
cd backend
```

### 2. Initialize the Project
```bash
# Initialize npm package
npm init -y

# Install dependencies
npm install express prisma @prisma/client dotenv cors zod

# Install dev dependencies
npm install -D nodemon typescript @types/node @types/express tsx
```

### 3. Configure Prisma
```bash
# Initialize Prisma
npx prisma init

# Add your Neon database URL to .env
DATABASE_URL="your_neon_database_url_here"
```

### 4. Configure TypeScript
Create `tsconfig.json` in the backend directory:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Project Structure
Create the following directory structure:
```
backend/
├── server.ts                 # Express app entry point
├── package.json
├── .env
├── .env.example
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── productController.ts
│   │   ├── cartController.ts
│   │   ├── wishlistController.ts
│   │   └── orderController.ts
│   ├── routes/
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── wishlist.ts
│   │   └── orders.ts
│   └── middlewares/
│       └── errorHandler.ts
```

### 6. Prisma Schema
Update `prisma/schema.prisma` with the data model defined in data-model.md.

### 7. Run Migrations
```bash
# Generate and apply the database schema
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 8. Start the Server
```bash
# Run in development mode
npm run dev

# Or build and run
npm run build
node dist/server.js
```

## Environment Variables
Create a `.env` file with the following variables:
```
DATABASE_URL="your_neon_postgresql_connection_string"
PORT=5000
NODE_ENV=development
```

## API Endpoints
- `GET /api/products` - Get all products with search/filter/sort
- `GET /api/products/:id` - Get product by ID
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get user's cart
- `POST /api/wishlist` - Add item to wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/orders` - Create order (simulated checkout)

## Testing
Test the API using Postman or curl:
```bash
# Test product listing
curl http://localhost:5000/api/products

# Test adding to cart
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": "product_id", "quantity": 1}'
```