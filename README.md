# 🍔 QuickBite POS  
  
A full-stack, invite-only restaurant management platform built for modern food service operations. QuickBite connects customers, kitchen staff, and administrators through a unified, real-time system.  
  
---  
  
## 🧠 What is QuickBite?  
  
QuickBite is a Point-of-Sale (POS) and Kitchen Display System (KDS) designed for restaurants. It covers the full order lifecycle — from a customer browsing the menu and placing an order, to kitchen staff preparing it, to the admin reviewing analytics.  
  
---  
  
## 🏗️ Architecture Overview
```bash
quickbite/
├── backend/ # Node.js + Express REST API
│ ├── src/
│ │ ├── controllers/ # Business logic (orders, auth, menu, users)
│ │ ├── routes/ # API route definitions
│ │ ├── middlewares/ # JWT auth & role authorization
│ │ └── config/ # DB connection (Prisma + PostgreSQL)
│ └── prisma/
│ └── schema.prisma # Database models
└── frontend/ # React 19 SPA (Vite + Tailwind CSS)
└── src/
├── pages/ # Full page views
├── components/ # Reusable UI components
└── api.js # Centralized Axios client
```
---  
  
## 👥 User Roles  
  
QuickBite has three distinct roles:  
  
| Role | Access |  
|---|---|  
| **Public Customer** | Browse menu, place orders at `/order` (no login required) |  
| **Staff (Kitchen)** | View & manage the live KDS Kanban board (`/`) |  
| **Admin (Owner)** | Full access: Dashboard, Menu Management, Staff Management |  
  
> Admin accounts are **invite-only**. Registration requires a valid invite token.  
  
---  
  
## ✨ Features  
  
### 🛒 Customer Ordering (`/order`)  
- Browse menu items filtered by category (Burgers, Sides, Drinks, Salads, Wraps, Desserts) or search term  
- Add items to a cart, adjust quantities, remove items  
- Choose **Dine In** (with table number) or **Takeout**  
- Submit order directly to the kitchen  
- Track order progress after placement  
  
### 🍳 Kitchen Display System — KDS (`/`)  
- Real-time Kanban board with **5-second auto-polling**  
- Three columns: `PENDING` → `PREPARING` → `COMPLETED`  
- **Optimistic UI updates**: cards move instantly on click, reverting if the server fails  
- Elapsed time timer per order; orders older than 10 minutes are flagged as late  
- Clear completed orders (soft-archived, retained for analytics)  
  
### 📊 Admin Dashboard (`/AdminDashboard`)  
- Total Revenue, Completed Orders, Average Order Value (AOV), Active Kitchen load  
- Recent transactions table  
- Top 5 selling menu items by quantity  
  
### 🍽️ Menu Management (`/menu`)  
- Add, edit, and soft-delete menu items  
- Toggle item availability  
- Upload item images (multipart/form-data)  
- Filter by category and search  
  
### 👨‍🍳 Staff Management (`/staff`)  
- View all kitchen staff accounts  
- Create new chef accounts with temporary passwords  
- Deactivate staff accounts (soft delete via `isActive` flag)  
  
---  
  
## 🔄 Order Lifecycle
```bash
Customer Places Order (POST /api/orders)
↓
Status: PENDING ──→ PREPARING ──→ COMPLETED
↓ ↓
Kitchen KDS Board Staff clears → ARCHIVED
(retained for analytics)
```
---  
  
## 🛠️ Tech Stack  
  
### Backend  
- **Node.js** + **Express 5**  
- **PostgreSQL** (via **Prisma ORM**)  
- **JWT** authentication (`jsonwebtoken`)  
- **bcrypt** for password hashing  
- **Multer** for image uploads  
  
### Frontend  
- **React 19** + **Vite**  
- **Tailwind CSS 4**  
- **React Router DOM 7**  
- **Axios** (centralized API client)  
- **Lucide React** icons  
  
---  
  
## 🚀 Getting Started  
  
### Prerequisites  
- [Docker](https://www.docker.com/) & Docker Compose  
  
### 1. Clone the repository  
```bash  
git clone https://github.com/Abdellahsyani/quickbite.git  
cd quickbite
```

### 2. Configure environment variables
- Create a .env file in the project root:
    ```bash
    DB_USER=postgres  
    DB_PASSWD=yourpassword  
    DB_NAME=quickbite  
    DB_PORT=5432  
    PORT=3000  
    NODE_ENV=development  
    JWT_SECRET=your_super_secret_key  
    JWT_EXPIRES_IN=1d
    ```

### 3. Start all services
```bash
docker compose up --build
```
- This starts three services:
```bash
    quickbite_db — PostgreSQL 17 database
    quickbite_api — Express backend on http://localhost:3000
    quickbite_web — React frontend on http://localhost:5173 
```
- The API container automatically runs prisma migrate deploy on startup.

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login |
| `POST` | `/api/auth/register` | Invite token | Register admin |
| `GET` | `/api/menu` | Public | Get menu items |
| `POST` | `/api/menu` | Admin | Add menu item |
| `PATCH` | `/api/menu/:id` | Admin | Edit menu item |
| `POST` | `/api/orders` | Auth | Place an order |
| `GET` | `/api/orders` | Admin/Staff | Get all orders |
| `PATCH` | `/api/orders/:id/status` | Admin/Staff | Update order status |
| `DELETE` | `/api/orders/:id` | Admin/Staff | Archive order |
| `GET` | `/api/users/staff` | Admin | List staff |
| `POST` | `/api/users/staff` | Admin | Create staff account |
| `PATCH` | `/api/users/staff/:id/deactivate` | Admin | Deactivate staff |
