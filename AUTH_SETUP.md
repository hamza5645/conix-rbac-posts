# Authentication Setup Guide

This document describes the JWT-based authentication implementation in this NestJS application.

## Overview

The authentication system uses:

- **Passport.js** for authentication strategies
- **JWT (JSON Web Tokens)** for token-based authentication
- **bcrypt** for password hashing
- **Access & Refresh Tokens** for secure session management

## Architecture

### Modules

- **AuthModule**: Main authentication module
- **UsersModule**: User management (imported by AuthModule)

### Key Components

#### DTOs (Data Transfer Objects)

- `LoginDto`: Email and password for login
- `RegisterDto`: User registration data
- `AuthResponseDto`: Response containing tokens and user info
- `RefreshTokenDto`: Refresh token for token renewal

#### Strategies

- `JwtStrategy`: Validates access tokens from Authorization header
- `JwtRefreshStrategy`: Validates refresh tokens from request body

#### Guards

- `JwtAuthGuard`: Protects routes requiring authentication
- `JwtRefreshAuthGuard`: Protects the refresh endpoint

#### Services

- `AuthService`: Handles authentication logic (login, register, token generation)
- `UsersService`: Updated with bcrypt password hashing and findByEmail method

## File Structure

```
src/modules/auth/
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── auth-response.dto.ts
│   └── refresh-token.dto.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── jwt-refresh.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── jwt-refresh-auth.guard.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.module.ts
```

## Environment Configuration

Required environment variables in `.env`:

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=7d
```

## API Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "roleIds": [1, 2] // Optional
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### POST /auth/login

Authenticate with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## Usage Examples

### Protecting a Route

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    // Access authenticated user data
    console.log(req.user); // { userId, email, roles }
    return this.postsService.findAll();
  }
}
```

### Accessing User Information in a Protected Route

```typescript
@Get('my-posts')
@UseGuards(JwtAuthGuard)
async getMyPosts(@Request() req) {
  const userId = req.user.userId;
  return this.postsService.findByUserId(userId);
}
```

### Making Authenticated Requests (Client Side)

```typescript
// Using fetch
const response = await fetch('http://localhost:3000/posts', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

// Using axios
const response = await axios.get('http://localhost:3000/posts', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with a salt round of 10
2. **Token Expiration**: Access tokens expire quickly (default: 15 minutes)
3. **Refresh Tokens**: Long-lived tokens (default: 7 days) for obtaining new access tokens
4. **User Status Check**: Inactive users cannot authenticate
5. **Separate Secrets**: Different secrets for access and refresh tokens

## Token Payload

JWT tokens contain the following payload:

```typescript
{
  sub: number; // User ID
  email: string; // User email
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
```

## Request User Object

After successful authentication, the request object contains:

```typescript
req.user = {
  userId: number;
  email: string;
  roles: Role[];    // User roles with permissions
}
```

## Error Handling

The authentication system throws appropriate HTTP exceptions:

- `401 Unauthorized`: Invalid credentials or token
- `409 Conflict`: User already exists (registration)
- `401 Unauthorized`: Inactive user account

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Access Protected Endpoint

```bash
curl -X GET http://localhost:3000/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Integration with Swagger

All authentication endpoints are documented in Swagger UI. After starting the application, visit:

```
http://localhost:3000/api
```

You can test all endpoints directly from the Swagger interface.

## Future Enhancements

Potential improvements for the authentication system:

1. **Token Blacklisting**: Implement Redis-based token blacklist for logout
2. **Email Verification**: Add email confirmation for new registrations
3. **Password Reset**: Implement forgot password functionality
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **Two-Factor Authentication**: Add 2FA support
6. **OAuth Integration**: Add social login (Google, GitHub, etc.)
7. **Refresh Token Rotation**: Implement refresh token rotation for enhanced security
8. **Password Complexity**: Add password strength validation
