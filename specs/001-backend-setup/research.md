# Research Summary: Backend & Database Setup

## Decision: ORM Selection
**Rationale**: Prisma chosen over TypeORM and Knex for its excellent Neon PostgreSQL support, intuitive schema definition, and better TypeScript integration. Prisma's migration system works seamlessly with Neon's serverless architecture.
**Alternatives considered**:
- TypeORM: More complex setup, less intuitive schema definition
- Knex: Lower-level, requires more manual SQL work

## Decision: Validation Library
**Rationale**: Zod chosen over Joi for superior TypeScript integration, better type inference, and simpler schema definition syntax that aligns with the project's TypeScript usage.
**Alternatives considered**:
- Joi: Good but requires separate TypeScript definitions

## Decision: Image Storage Approach
**Rationale**: Array of URLs in product model chosen as placeholders since the spec mentions using images from the homestore-sparkle directory. This allows for flexibility when actual image hosting is determined later.
**Alternatives considered**:
- Direct S3 integration: Too complex for initial implementation
- Base64 encoding: Would increase database size significantly

## Decision: Currency Management
**Rationale**: Fixed USD currency implemented as specified in the feature spec, with price fields stored as decimals for precision.
**Alternatives considered**:
- Multi-currency support: Not required per specification

## Decision: Stock Reservation Policy
**Rationale**: Immediate stock reservation implemented when items are added to cart (as clarified in spec), with 24-hour expiration to prevent indefinite inventory lockup.
**Alternatives considered**:
- Reservation only at checkout: Higher risk of overselling

## Decision: Error Handling Strategy
**Rationale**: Centralized error handling middleware chosen to ensure consistent error responses across all endpoints as required by the spec.
**Alternatives considered**:
- Individual error handling in each controller: Would lead to inconsistent error responses