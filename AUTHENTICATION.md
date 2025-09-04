# Authentication System

This document describes the authentication system implemented in the BidApp application.

## Features

### ✅ Implemented
- **User Registration**: Users can create accounts with name, email, and password
- **User Login**: Secure login with email and password
- **User Logout**: Secure logout that clears authentication state
- **JWT Token Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **Protected Routes**: Certain pages require authentication
- **Persistent Sessions**: User sessions persist across browser refreshes
- **Authentication State Management**: Global authentication state with React Context

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout (client-side)

## Components

### Forms
- `LoginForm` - Login form with email/password fields
- `RegisterForm` - Registration form with name/email/password fields

### Layout
- `Header` - Navigation header with authentication state
- `ProtectedRoute` - Wrapper for protected pages

### Pages
- `/login` - Login page with toggle to registration
- `/register` - Registration page with toggle to login
- `/auctions` - Protected auctions listing page
- `/create` - Protected auction creation page

## Authentication Flow

1. **Registration**: User fills out registration form → API creates user → JWT token generated → User logged in
2. **Login**: User enters credentials → API validates → JWT token generated → User logged in
3. **Protected Access**: User visits protected page → AuthContext checks token → Redirects to login if invalid
4. **Logout**: User clicks logout → Token cleared from cookies → User state reset

## Security Features

- Passwords are hashed with bcrypt before storage
- JWT tokens expire after 7 days
- Tokens are stored in HTTP-only cookies
- Input validation on both client and server
- Protected routes automatically redirect unauthenticated users

## Usage

### Using the AuthContext
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, login, register, logout, loading } = useAuth()
  
  // Use authentication state and methods
}
```

### Protecting Routes
```tsx
import ProtectedRoute from '@/components/ProtectedRoute'

function MyPage() {
  return (
    <ProtectedRoute>
      <div>This content requires authentication</div>
    </ProtectedRoute>
  )
}
```

## Environment Variables

Make sure to set the following environment variables:

```env
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```

## Dependencies

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `js-cookie` - Cookie management
- `mongoose` - MongoDB object modeling

