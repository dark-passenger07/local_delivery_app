# Local Delivery App

A full-stack mobile application connecting **customers** with **local vendors** for delivery-based subscriptions, requests, and order management.

---

## Architecture

```
frontend (React Native + Expo)
    ↓ HTTP / WebSocket
backend (Node.js + Express + TypeScript)
    ↓ ORM
PostgreSQL (Prisma)
```

## Tech Stack

### Frontend
- **Framework**: React Native + Expo
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **State Management**: Zustand with AsyncStorage persistence
- **Networking**: Axios, Socket.io Client
- **UI Utilities**: lucide-react-native, react-native-safe-area-context, react-native-toast-message

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT with httpOnly cookies + cookie-parser
- **Validation**: Zod (with zod-prisma-types integration)

---

## Project Structure

```
D:\internship\local_delivery_app\
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema + Zod generator config
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── middlewares/            # Auth, role guards, profile checks
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # Business logic
│   │   ├── libs/
│   │   │   └── db.ts               # Prisma client singleton
│   │   ├── generated/zod/          # Auto-generated Zod types from Prisma
│   │   └── index.ts                # App entry, CORS, Socket.io setup
│   ├── .env                        # Backend environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts            # Axios instance (baseURL from env)
│   │   ├── context/
│   │   │   ├── vendorContext/      # Zustand stores (Auth, Products, Requests, etc.)
│   │   │   └── customerContext/    # Customer-specific state
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx   # Role-based routing (Auth / Customer / Vendor)
│   │   │   ├── AuthNavigator.tsx   # Login + Signup stack
│   │   │   ├── CustomerNavigator.tsx # Customer bottom tabs
│   │   │   └── VendorNavigator.tsx   # Vendor bottom tabs
│   │   └── screens/
│   │       ├── auth/
│   │       │   ├── LoginScreen.tsx
│   │       │   └── SignupScreen.tsx
│   │       ├── customer/           # Home, Vendor, Requests, Subscriptions, Profile
│   │       └── vendor/             # Home, Customers, My Products, Requests, Profile, Setup
│   ├── .env                        # Frontend environment variables
│   ├── App.tsx                     # SafeAreaProvider + NavigationContainer
│   ├── app.json                    # Expo config
│   └── package.json
│
└── readme.md
```

---

## Prerequisites

- Node.js >= 18
- PostgreSQL database
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for mobile emulation)

---

## Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd local_delivery_app
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Backend runs on `http://localhost:4000` (or configured port).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Use **Expo Go** app or an emulator to view the app.

---

## Environment Variables

### Backend `.env`
Create `backend/.env` using the fields below:

```env
PORT=4000
JWT_SECRET=your_jwt_secret_here_change_in_production
NODE_ENV=development

DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>?sslmode=require
```

**Fields:**
| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port |
| `JWT_SECRET` | Secret key for signing JWTs |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |

### Frontend `.env`
Create `frontend/.env` using the fields below:

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

**Fields:**
| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_BACKEND_URL` | Backend API base URL exposed to the Expo app |

**Note for Android emulator:** If using Android Studio AVD, replace `localhost` with `10.0.2.2`.
**Note for physical device:** Use your machine’s LAN IP (e.g. `http://192.168.x.x:4000`).

---

## Database (Prisma)

The Prisma schema (`backend/prisma/schema.prisma`) defines the data model:

- **User**: name, phone, address, role (`CUSTOMER` | `VENDOR`)
- **Vendor**: businessName, businessPhone, linked to User
- **Product**: productName, description, unit, belongs to Vendor
- **VendorCustomers**: vendor-customer relationship with unique constraint
- **CustomerSubscription**: dailyQuantity, product linkage
- **Requests**: type (`NOTE` | `SKIP` | `INCREASE` | `DECREASE`), status (`PENDING` | `ACCEPTED` | `REJECTED`), message, dates

After changing `schema.prisma`:
```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

---

## App Flow

### Entry Point
`frontend/App.tsx`
- Wraps the app in `<SafeAreaProvider>` and `<NavigationContainer>`.

### Routing
`frontend/src/navigation/RootNavigator.tsx`
1. Reads auth state from **Zustand** (persisted in `AsyncStorage`).
2. **Unauthenticated** → `AuthNavigator` (Login / Signup).
3. **Customer** → `CustomerTabNavigator`:
   - Home, Vendor, Requests, Subscriptions, Profile.
4. **Vendor**:
   - If profile missing → `VendorSetUpScreen`.
   - Otherwise → `VendorTabNavigator`:
     - Home, Customers, My Products, Requests, Profile.

### Authentication
- Login/Signup sets cookies via backend `jsonwebtoken` + `cookie-parser`.
- Axios instance uses `withCredentials: true`.
- Auth state is persisted with Zustand + AsyncStorage.

### Role-Based Access
- Backend middlewares (`isRoleCustomer`, `isRoleVendor`, `isAuthenticated`) guard routes.
- Frontend navigators render different tab sets per role.

---

## API Routes Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Create user + vendor/customer profile |
| POST | `/auth/login` | Phone-based login |
| POST | `/auth/logout` | Clear session cookies |
| GET | `/auth/me` | Get current authenticated user |
| POST | `/vendor/...` | Vendor profile operations |
| POST | `/product/...` | Product CRUD |
| GET | `/customer/...` | Customer-vendor relations |
| POST | `/subscription/...` | Subscription management |
| POST | `/request/...` | Customer requests (skip, increase, notes) |

---

## Real-Time

- **Socket.io** is initialized in `backend/src/index.ts`.
- Users join personal rooms keyed by `userId` for real-time notifications.
- Frontend connects via `socket.io-client` in request/context stores.

---

## Scripts

### Backend
```bash
npm run dev   # Start with tsx watch
npm run build # Compile TypeScript
npm run start # Run compiled JS
```

### Frontend
```bash
npm start      # Start Expo dev server
npm run android # Open on Android emulator
npm run ios    # Open on iOS simulator
npm run web    # Open in browser
```

---

## Notes

- The app is currently in **development** mode. Hardcoded allowed origins exist in `backend/src/index.ts` for CORS.
- Default backend port is `4000`; frontend must point its `EXPO_PUBLIC_BACKEND_URL` to the same host/port.
- Ensure your PostgreSQL database is running and the connection string is correct before starting the backend.
