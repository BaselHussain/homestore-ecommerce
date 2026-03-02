# Data Model: Store Gaps Fixes

## Overview
Data model extensions and updates for the 005-store-gaps feature to implement remaining e-commerce functionality.

## Existing Entities (No Changes)

### Order
**Source:** `backend/prisma/schema.prisma`
- `id`: String (primary key, cuid)
- `userId`: String (foreign key to User)
- `status`: OrderStatus (enum: 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')
- `totalAmount`: Float
- `items`: Json (array of objects with productId, name, price, quantity)
- `shippingAddress`: Json (object with street, city, state, zipCode, country)
- `trackingNumber`: String? (optional)
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (default: now())

### User
**Source:** `backend/prisma/schema.prisma`
- `id`: String (primary key, cuid)
- `email`: String (unique)
- `name`: String
- `password`: String (hashed)
- `addresses`: Address[] (related to Address model)

### Address
**Source:** `backend/prisma/schema.prisma`
- `id`: String (primary key, cuid)
- `userId`: String (foreign key to User)
- `label`: String? (optional, e.g. "Home", "Work")
- `street`: String
- `city`: String
- `state`: String
- `zipCode`: String
- `country`: String (default: "USA")
- `isDefault`: Boolean (default: false)
- `createdAt`: DateTime (default: now())

## New/Updated Endpoints

### Contact Submission
**Purpose:** Store contact form submissions for potential follow-up
**Storage:** New implicit data structure in existing database (likely stored as logs or in a temporary table)

**Fields:**
- `name`: String (from form)
- `email`: String (from form)
- `message`: String (from form)
- `createdAt`: DateTime (timestamp of submission)

## State Transitions

### Order Status Transitions
**Current States:** Pending → Confirmed → Processing → Shipped → Delivered
**Exception States:** Cancelled, Refunded (can transition from any state)

### Address Management
**Operations:**
- Add: New address created with `isDefault: false` initially
- Set Default: Update `isDefault` to `true`, set all others to `false`
- Delete: Address removed from user's address list

## Validation Rules

### Contact Form Validation
- `name`: Required, min 2 characters, max 100 characters
- `email`: Required, valid email format
- `message`: Required, min 10 character, max 1000 characters

### Address Validation
- `street`: Required, max 200 characters
- `city`: Required, max 100 characters
- `state`: Required, max 100 characters
- `zipCode`: Required, max 20 characters
- `country`: Required, max 100 characters

### Password Change Validation
- Current password must match stored hash
- New password must meet basic requirements (min 8 characters)
- Rate limiting for failed attempts (handled by security layer)

## Relationships

### User → Orders
- One-to-Many relationship
- User can have multiple orders
- Orders are filtered by `userId` for user access control

### User → Addresses
- One-to-Many relationship
- User can have multiple addresses
- Only addresses belonging to user can be accessed

## Access Control

### Order Access
- Users can only access orders where `userId` matches their authenticated ID
- Backend validates user ownership on every order access request

### Address Access
- Users can only access/modify addresses where `userId` matches their authenticated ID
- Backend validates user ownership on every address operation