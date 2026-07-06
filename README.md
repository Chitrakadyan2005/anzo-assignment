# Anzo Mini Inventory & Palletization System

A mini inventory and palletization system built as an assignment project.
The system allows warehouse users to manage items, create pallets, add items into pallets, stock items into inventory, issue stock out, and track stock transaction history.

---

# Features

* Item master management

  * Add item
  * View items
  * Update item
  * Delete item

* Pallet management

  * Create pallet with auto-generated pallet code
  * Add items to pallet
  * Update pallet item quantity
  * Remove pallet item
  * View pallet details

* Inventory management

  * Stock in inventory from pallet
  * Stock out inventory manually
  * View current stock levels
  * View stock transaction history

* Dashboard

  * Total items
  * Total pallets
  * Current stock quantity
  * Recent stock transactions

---

# Tech Stack

## Frontend

* React
* Vite
* Axios
* React Router DOM
* CSS

## Backend

* Node.js
* Express.js
* MySQL
* mysql2

---

# Project Structure

```bash id="g6q7ps"
anzo-assignment/
├─ frontend/
├─ backend/
│  ├─ schema.sql
├─ docs/
│  ├─ API_DOCUMENTATION.md
│  ├─ ER_DIAGRAM.md
│  └─ ER_DIAGRAM.png
└─ README.md
```

---

# Database Design

The project uses a normalized MySQL database with the following main tables:

* `items`
* `pallets`
* `pallet_items`
* `inventory`
* `stock_transactions`

ER diagram is available in:

```bash id="hq2l8d"
docs/ER_DIAGRAM.png
```

---

# API Documentation

API documentation is available in:

```bash id="qpd6i4"
docs/API_DOCUMENTATION.md
```

---

# Setup Instructions

## 1. Clone the repository

```bash id="b17c4k"
git clone <your-repo-url>
cd anzo-assignment
```

## 2. Backend setup

Go to backend folder:

```bash id="4g3qxy"
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env id="uvrggt"
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=anzo_inventory
```

Run the SQL schema in MySQL Workbench using:

```bash id="ocvvo4"
backend/schema.sql
```

Start backend server:

```bash id="vgwjlwm"
npm run dev
```

---

## 3. Frontend setup

Open a new terminal and go to frontend folder:

```bash id="4tqav2"
cd frontend
npm install
npm run dev
```

Frontend runs at:

```bash id="eg0x4y"
http://localhost:5173
```

Backend runs at:

```bash id="mjlwm9"
http://localhost:5000
```

---

# Sample Workflow

1. Create items
2. Create a pallet
3. Add items to pallet
4. Stock in pallet to inventory
5. View inventory
6. Perform stock out
7. View dashboard summary and stock transactions

---

# Deliverables Included

* Source Code
* Database Schema (`backend/schema.sql`)
* ER Diagram (`docs/ER_DIAGRAM.png`)
* API Documentation (`docs/API_DOCUMENTATION.md`)
* README with setup instructions
