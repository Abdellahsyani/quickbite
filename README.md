# QuickBite API 🍔

A robust, production-ready RESTful API for restaurant order and catalog management built with Node.js, Express, Prisma ORM, and PostgreSQL.

---

## Features

- **Authentication & Security:** JWT-based stateless authentication with password hashing via `bcryptjs` and custom Role-Based Access Control (RBAC).
- **Menu Management:** Full CRUD operations for menu items with dynamic category and availability tracking.
- **Order Processing:** Multi-item cart checkout with server-side price validation, stock availability verification, and real-time order status transitions.
- **Data Integrity:** Relational schema modeling with Prisma and PostgreSQL, backed by persistent Docker storage.
- **Role Isolation:** Granular authorization layers dividing administrative functions (`admin`) from user workflows (`customer`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma ORM |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js |
| **DevOps & Tools** | Docker, Docker Compose, Nodemon |

---

## Project Structure

```text
quickbite/
├── prisma/
│   ├── migrations/          # Chronological database migrations
│   └── schema.prisma        # Database models, relations & enums
├── src/
│   ├── config/
│   │   └── db.js            # Prisma client instance & DB lifecycle
│   ├── controllers/         # Request handling & HTTP response logic
│   ├── middlewares/         # JWT verification & RBAC guards
│   ├── routes/              # Express REST routing pipelines
│   └── app.js               # Application entry point & middleware mounting
├── docker-compose.yml       # Local PostgreSQL service definition
├── .env.example             # Template for required environment variables
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- `npm` or `yarn`

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/](https://github.com/)<your-username>/quickbite.git
cd quickbite
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/quickbite?schema=public"
JWT_SECRET="your_secure_random_jwt_secret_key"
JWT_EXPIRES_IN="1d"
NODE_ENV="development"
```

### 3. Spin Up the Database

Start the PostgreSQL database container via Docker:

```bash
docker compose up -d
```

### 4. Run Migrations & Generate Prisma Client

Apply all schema migrations to your local database:

```bash
npx prisma migrate dev
```

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## API Reference

### Authentication & Profile

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer or admin account |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and receive a JWT |
| `GET` | `/api/profile` | Authenticated | Fetch current authenticated user's profile |
| `PUT` | `/api/profile` | Authenticated | Update current user's profile details |

### Menu Management

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menu` | Public | Retrieve catalog of all menu items |
| `GET` | `/api/menu/:id` | Public | Retrieve detailed information for a single item |
| `POST` | `/api/menu` | Admin | Add a new menu item |
| `PUT` | `/api/menu/:id` | Admin | Fully replace a menu item record |
| `PATCH` | `/api/menu/:id` | Admin | Partially update item fields (price, availability) |
| `DELETE` | `/api/menu/:id` | Admin | Remove an item from the menu catalog |

### Order Operations

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Place an order with multiple menu items and quantities |
| `GET` | `/api/orders/mine` | Customer | List order history for the logged-in user |
| `GET` | `/api/orders/:id` | Authenticated | View a specific receipt (scoped to owner or Admin) |
| `GET` | `/api/orders` | Admin | Retrieve all restaurant orders across the platform |
| `PATCH` | `/api/orders/:id/status`| Admin | Advance status (`PENDING` $\rightarrow$ `PREPARING` $\rightarrow$ `COMPLETED` / `CANCELLED`) |

---

## License

This project is open source and available under the [MIT License](LICENSE).
