# Data Model: User Authentication & User Experience

## User Entity
- **id**: string (UUID) - Unique identifier for user
- **email**: string - User's email address (unique, validated)
- **password**: string - Hashed password (min 8 chars with upper, lower, number, special char)
- **name**: string - User's full name
- **emailVerified**: boolean - Whether email has been verified
- **createdAt**: Date - Account creation timestamp
- **updatedAt**: Date - Last update timestamp
- **preferences**: object - User preferences (theme, language, etc.)

## Session Entity
- **id**: string (UUID) - Unique identifier for session
- **userId**: string - Reference to user
- **token**: string - JWT token value
- **expiresAt**: Date - Token expiration time
- **createdAt**: Date - Session creation timestamp
- **lastAccessedAt**: Date - Last time session was used
- **isPersistent**: boolean - Whether session should persist across browser sessions

## Address Entity
- **id**: string (UUID) - Unique identifier for address
- **userId**: string - Reference to user who owns the address
- **street**: string - Street address
- **city**: string - City name
- **state**: string - State/province
- **zipCode**: string - Postal code
- **country**: string - Country code/name
- **isDefault**: boolean - Whether this is the default address
- **label**: string - Address label (e.g., "Home", "Work")

## Order Entity
- **id**: string (UUID) - Unique identifier for order
- **userId**: string - Reference to user who placed the order (null for guest orders)
- **items**: array - Array of ordered products (id, name, price, quantity, etc.)
- **status**: enum - Order status (pending, confirmed, shipped, delivered, cancelled)
- **total**: number - Order total amount
- **currency**: string - Currency code (fixed as USD)
- **shippingAddress**: object - Shipping address information
- **billingAddress**: object - Billing address information
- **paymentStatus**: enum - Payment status (pending, paid, failed)
- **createdAt**: Date - Order creation timestamp
- **updatedAt**: Date - Last status update timestamp
- **trackingNumber**: string - Shipping tracking number (when shipped)

## PasswordResetToken Entity
- **id**: string (UUID) - Unique identifier for the token
- **userId**: string - Reference to user requesting reset
- **token**: string - Reset token (secure, randomly generated)
- **expiresAt**: Date - Token expiration time (short-lived)
- **used**: boolean - Whether the token has been used
- **createdAt**: Date - Token creation timestamp

## Validation Rules
- **User**: Email must be valid format, password must meet strength requirements
- **Session**: Must have valid expiration time, tokens must be properly formatted
- **Address**: Required fields (street, city, state, zip, country)
- **Order**: Total must be positive, items must have valid structure
- **PasswordResetToken**: Must have future expiration date, single-use tokens

## State Transitions
- **User**: Unverified → Verified (via email verification)
- **Order**: pending → confirmed → shipped → delivered (or cancelled)
- **Payment**: pending → paid (or failed)
- **Session**: active → expired (via timer)