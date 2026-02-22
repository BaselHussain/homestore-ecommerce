# Data Model: Backend & Database Setup

## Entities

### User
**Fields**:
- id (String, @id, @default(cuid())): Unique identifier
- email (String, @unique): User's email address (unique as clarified in spec)
- password_hash (String): Hashed password
- created_at (DateTime, @default(now())): Account creation timestamp

**Validation**:
- Email must be valid email format
- Email must be unique
- Password hash required

### Product
**Fields**:
- id (String, @id, @default(cuid())): Unique identifier
- name (String): Product name
- description (String): Product description (placeholder text initially)
- price (Decimal): Price in USD (fixed currency per spec)
- stock (Int): Available quantity in stock
- category (String): Product category
- images (Json): Array of image URLs (using homestore-sparkle images per clarification)
- created_at (DateTime, @default(now())): Creation timestamp

**Validation**:
- Name required
- Price must be positive
- Stock must be non-negative
- Category required

### Cart
**Fields**:
- id (String, @id, @default(cuid())): Unique identifier
- user_id (String, @map("userId")): Reference to User
- product_id (String, @map("productId")): Reference to Product
- quantity (Int): Number of items in cart
- created_at (DateTime, @default(now())): Added to cart timestamp

**Validation**:
- User and product references required
- Quantity must be positive
- Implements 24-hour expiration as per spec clarification

**Relationships**:
- One User to many Cart items
- One Product to many Cart items

### Wishlist
**Fields**:
- id (String, @id, @default(cuid())): Unique identifier
- user_id (String, @map("userId")): Reference to User
- product_id (String, @map("productId")): Reference to Product
- created_at (DateTime, @default(now())): Added to wishlist timestamp

**Validation**:
- User and product references required

**Relationships**:
- One User to many Wishlist items
- One Product to many Wishlist items

### Order
**Fields**:
- id (String, @id, @default(cuid())): Unique identifier
- user_id (String, @map("userId")): Reference to User
- total_amount (Decimal): Total order amount in USD
- status (String): Order status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded per spec clarification)
- shipping_address (Json): Shipping address information
- items (Json): Array of order items (Product ID, name, price, quantity)
- created_at (DateTime, @default(now())): Order creation timestamp

**Validation**:
- User reference required
- Total amount must be positive
- Status must be one of allowed values
- Shipping address required

**State Transitions**:
- Pending → Confirmed → Processing → Shipped → Delivered
- Pending/Confirmed/Processing → Cancelled
- Delivered → Refunded

## Database Relationships

```
User ||--o{ Cart: "has"
User ||--o{ Wishlist: "has"
User ||--o{ Order: "places"

Product ||--o{ Cart: "in"
Product ||--o{ Wishlist: "in"
```

## Constraints

1. **Unique Email**: User.email must be unique (per clarification)
2. **Positive Prices**: All price fields must be positive decimals
3. **Non-negative Stock**: Product.stock must be >= 0
4. **Valid Statuses**: Order.status must be one of: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded
5. **Positive Quantities**: Cart.quantity and other quantity fields must be positive