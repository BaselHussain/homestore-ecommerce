# Data Model: Frontend & Core Features

## Entities

### Product
**Fields**:
- id (string): Unique identifier for the product
- name (string): Product name
- description (string): Product description
- price (number): Price in USD
- image (string): Image URL/path
- category (string): Product category
- availability (boolean): Whether the product is in stock

**Validation**:
- Name required
- Price must be positive
- Image URL must be valid

**Relationships**:
- One product can be in multiple cart items
- One product can be in multiple wishlist items

### CartItem
**Fields**:
- id (string): Unique identifier for the cart item
- productId (string): Reference to Product
- quantity (number): Number of items in cart
- addedAt (Date): Timestamp when added to cart

**Validation**:
- Product reference required
- Quantity must be positive integer
- Product must be available

### WishlistItem
**Fields**:
- id (string): Unique identifier for the wishlist item
- productId (string): Reference to Product
- addedAt (Date): Timestamp when added to wishlist

**Validation**:
- Product reference required

### ShippingAddress
**Fields**:
- street (string): Street address
- city (string): City name
- state (string): State name
- zip (string): ZIP code
- country (string): Country name

**Validation**:
- All fields required

### Order
**Fields**:
- id (string): Unique identifier for the order
- shippingAddress (ShippingAddress): Shipping address object
- items (CartItem[]): Array of cart items at time of order
- totalAmount (number): Total order amount
- status (string): Order status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded)
- createdAt (Date): Order creation timestamp

**Validation**:
- Shipping address required
- Items array must not be empty
- Total amount must be positive
- Status must be valid

## State Models (Frontend)

### CartState
**Fields**:
- items (CartItem[]): Array of items in the cart
- subtotal (number): Sum of all item prices * quantities

### WishlistState
**Fields**:
- items (WishlistItem[]): Array of items in the wishlist

## API Response Models

### ProductListResponse
**Fields**:
- products (Product[]): Array of product objects
- pagination (object): Pagination information

### ProductDetailResponse
**Fields**:
- product (Product): Single product object
- relatedProducts (Product[]): Array of related products