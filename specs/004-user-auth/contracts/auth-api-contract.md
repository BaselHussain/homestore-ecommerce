# API Contract: Authentication & User Experience

## Auth Endpoints

### POST /api/auth/login
**Description**: Authenticate user with email and password

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "token": "jwt-token-string",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response (401)**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /api/auth/signup
**Description**: Register a new user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "User Name"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Response (400)**:
```json
{
  "success": false,
  "error": "Invalid input or user already exists"
}
```

### POST /api/auth/logout
**Description**: Log out current user and invalidate session

**Request**: (authenticated request with JWT)

**Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/forgot-password
**Description**: Send password reset email

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

### POST /api/auth/reset-password
**Description**: Reset password with token

**Request**:
```json
{
  "token": "reset-token",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## User Profile Endpoints

### GET /api/users/profile
**Description**: Get current user's profile information

**Request**: (authenticated request with JWT)

**Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "addresses": [
      {
        "id": "address-uuid",
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "country": "Country",
        "isDefault": true,
        "label": "Home"
      }
    ]
  }
}
```

### PUT /api/users/profile
**Description**: Update user's profile information

**Request**: (authenticated request with JWT)
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "newemail@example.com",
    "name": "New Name"
  }
}
```

### GET /api/users/orders
**Description**: Get current user's order history

**Request**: (authenticated request with JWT)

**Response (200)**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid",
      "status": "delivered",
      "total": 99.99,
      "currency": "USD",
      "createdAt": "2023-01-01T00:00:00Z",
      "trackingNumber": "TRK123456789"
    }
  ]
}
```

### POST /api/users/addresses
**Description**: Add new address to user's profile

**Request**: (authenticated request with JWT)
```json
{
  "street": "456 New St",
  "city": "New City",
  "state": "New State",
  "zipCode": "54321",
  "country": "New Country",
  "label": "Work"
}
```

**Response (201)**:
```json
{
  "success": true,
  "address": {
    "id": "new-address-uuid",
    "street": "456 New St",
    "city": "New City",
    "state": "New State",
    "zipCode": "54321",
    "country": "New Country",
    "label": "Work",
    "isDefault": false
  }
}
```