# Implementation Tasks: Backend & Database Setup

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies for the Express.js backend with Neon PostgreSQL database.

**Independent Test**: Can run the initial server without errors.

- [X] T001 Create the backend directory structure with proper subdirectories (controllers, routes, middlewares)
- [X] T002 Initialize npm package with TypeScript configuration in backend directory
- [X] T003 Install primary dependencies: express, prisma, @prisma/client, dotenv, cors, zod
- [X] T004 Install dev dependencies: typescript, @types/node, @types/express, tsx, nodemon
- [X] T005 Initialize Prisma with PostgreSQL provider and create initial schema.prisma file
- [X] T006 Create .env.example file with DATABASE_URL template and other required environment variables
- [X] T007 Create tsconfig.json with proper TypeScript configuration for Node.js project

## Phase 2: Foundational

**Goal**: Set up the core infrastructure needed by all user stories, including database models and Prisma client.

**Independent Test**: Can connect to database and run migrations successfully.

- [X] T008 [P] Define Prisma schema with User model based on data model specification
- [X] T009 [P] Define Prisma schema with Product model based on data model specification
- [X] T010 [P] Define Prisma schema with Cart model based on data model specification
- [X] T011 [P] Define Prisma schema with Wishlist model based on data model specification
- [X] T012 [P] Define Prisma schema with Order model based on data model specification
- [X] T013 Run Prisma migration to create database tables in Neon PostgreSQL
- [X] T014 Generate Prisma client for TypeScript usage
- [X] T015 Create global error handler middleware in backend/middlewares/errorHandler.ts
- [X] T016 Set up Express app configuration with CORS, JSON parsing, and middleware in server.ts
- [X] T017 Implement database connection validation in server.ts

## Phase 3: User Story 1 - Browse Products (Priority: P1)

**Goal**: Implement the product browsing functionality allowing customers to view available products.

**Independent Test**: Can make a GET request to /api/products endpoint and receive a list of products with name, description, price, and images. Can request a specific product by ID and receive detailed information.

- [X] T018 [P] [US1] Create productController.ts with getAllProducts function implementing search/filter/sort
- [X] T019 [P] [US1] Create productController.ts with getProductById function
- [X] T020 [P] [US1] Create productController.ts with createProduct function (admin only placeholder)
- [X] T021 [US1] Create products route in backend/routes/products.ts with GET /api/products endpoint
- [X] T022 [US1] Create products route in backend/routes/products.ts with GET /api/products/:id endpoint
- [X] T023 [US1] Create products route in backend/routes/products.ts with POST /api/products endpoint (admin only)
- [X] T024 [US1] Integrate products routes with server.ts
- [X] T025 [US1] Implement search, filter, and sort functionality for products endpoint
- [X] T026 [US1] Add input validation to product endpoints using Zod
- [X] T027 [US1] Add error handling to product controllers
- [X] T028 [US1] Create seed data for products with placeholder images from homestore-sparkle

## Phase 4: User Story 2 - Manage Shopping Cart (Priority: P1)

**Goal**: Implement cart functionality allowing customers to add products to their shopping cart and view cart items.

**Independent Test**: Can make POST request to /api/cart to add items and GET request to /api/cart to retrieve them. The feature delivers core shopping cart functionality.

- [X] T029 [P] [US2] Create cartController.ts with addCartItem function implementing stock reservation
- [X] T030 [P] [US2] Create cartController.ts with getCartItems function
- [X] T031 [P] [US2] Create cartController.ts with updateCartItem function
- [X] T032 [P] [US2] Create cartController.ts with removeCartItem function
- [X] T033 [US2] Create cart route in backend/routes/cart.ts with POST /api/cart endpoint
- [X] T034 [US2] Create cart route in backend/routes/cart.ts with GET /api/cart endpoint
- [X] T035 [US2] Create cart route in backend/routes/cart.ts with PUT /api/cart/:id endpoint
- [X] T036 [US2] Create cart route in backend/routes/cart.ts with DELETE /api/cart/:id endpoint
- [X] T037 [US2] Integrate cart routes with server.ts
- [X] T038 [US2] Implement immediate stock reservation when items are added to cart
- [X] T039 [US2] Implement cart expiration policy (24 hours) to restore stock
- [X] T040 [US2] Add input validation to cart endpoints using Zod
- [X] T041 [US2] Add error handling to cart controllers

## Phase 5: User Story 3 - Wishlist Management (Priority: P2)

**Goal**: Implement wishlist functionality allowing customers to save products for future purchase.

**Independent Test**: Can make POST request to /api/wishlist to add items and GET request to /api/wishlist to retrieve them. The feature delivers the ability to save products for future reference.

- [X] T042 [P] [US3] Create wishlistController.ts with addItemToWishlist function
- [X] T043 [P] [US3] Create wishlistController.ts with getWishlistItems function
- [X] T044 [P] [US3] Create wishlistController.ts with removeItemFromWishlist function
- [X] T045 [US3] Create wishlist route in backend/routes/wishlist.ts with POST /api/wishlist endpoint
- [X] T046 [US3] Create wishlist route in backend/routes/wishlist.ts with GET /api/wishlist endpoint
- [X] T047 [US3] Create wishlist route in backend/routes/wishlist.ts with DELETE /api/wishlist/:id endpoint
- [X] T048 [US3] Integrate wishlist routes with server.ts
- [X] T049 [US3] Add input validation to wishlist endpoints using Zod
- [X] T050 [US3] Add error handling to wishlist controllers

## Phase 6: User Story 4 - Complete Purchase Process (Priority: P1)

**Goal**: Implement order processing functionality allowing customers to place orders from their cart.

**Independent Test**: Can make POST request to /api/orders with cart items and shipping information. The feature delivers the ability to finalize purchases.

- [X] T051 [P] [US4] Create orderController.ts with createOrder function implementing simulated checkout
- [X] T052 [P] [US4] Create orderController.ts with getUserOrders function
- [X] T053 [P] [US4] Create orderController.ts with getOrderById function
- [X] T054 [US4] Create orders route in backend/routes/orders.ts with POST /api/orders endpoint
- [X] T055 [US4] Create orders route in backend/routes/orders.ts with GET /api/orders endpoint
- [X] T056 [US4] Create orders route in backend/routes/orders.ts with GET /api/orders/:id endpoint
- [X] T057 [US4] Integrate orders routes with server.ts
- [X] T058 [US4] Implement order creation with standard e-commerce statuses
- [X] T059 [US4] Implement order state transition logic (Pending → Confirmed → Processing → etc.)
- [X] T060 [US4] Implement cart clearing after successful order creation
- [X] T061 [US4] Add input validation to order endpoints using Zod
- [X] T062 [US4] Add error handling to order controllers

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Complete the implementation with proper documentation, environment configuration, and final testing.

**Independent Test**: All defined API endpoints return correct data with appropriate HTTP status codes.

- [X] T063 Add comprehensive logging to all controllers for debugging and monitoring
- [X] T064 Add environment validation at startup to ensure required variables are set
- [X] T065 Create README.md with setup instructions and API documentation
- [X] T066 Implement comprehensive error responses with appropriate HTTP status codes (400, 404, 500)
- [X] T067 Add input sanitization to all endpoints to prevent injection attacks
- [X] T068 Create database seed script to populate initial products with images from homestore-sparkle
- [X] T069 Test all endpoints with Postman to verify they return correct data
- [X] T070 Add proper TypeScript types and interfaces for all controllers and models
- [X] T071 Set up health check endpoint for server monitoring
- [X] T072 Final testing to ensure backend runs successfully with node server.ts

## Dependencies

User Story 2 (Cart) and User Story 3 (Wishlist) depend on User Story 1 (Products) for product-related functionality.
User Story 4 (Orders) depends on User Story 2 (Cart) for cart-to-order conversion.

## Parallel Execution Examples

Per User Story 1:
- T018-T020 can be done in parallel (all controller functions)
- T021-T023 can be done in parallel (all route definitions)

Per User Story 2:
- T029-T032 can be done in parallel (all controller functions)
- T033-T036 can be done in parallel (all route definitions)

Per User Story 3:
- T042-T044 can be done in parallel (all controller functions)
- T045-T047 can be done in parallel (all route definitions)

Per User Story 4:
- T051-T053 can be done in parallel (all controller functions)
- T054-T056 can be done in parallel (all route definitions)

## Implementation Strategy

The tasks follow an MVP-first approach where the core functionality is implemented before enhancements. User Story 1 (Browse Products) can serve as the initial MVP with just product listing and detail viewing.

Each user story is designed to be incrementally built and tested, with foundational components (Phase 2) providing the base for all user-facing functionality.
