# API Documentation

## Base URL

`http://localhost:5000/api`

---

# 1. Items

## Create Item

**POST** `/items`

### Request Body

```json
{
  "item_code": "ITM001",
  "item_name": "Servo Motor",
  "description": "Industrial servo motor",
  "unit": "pcs",
  "category": "Electronics"
}
```

### Response

Creates a new item record.

---

## Get All Items

**GET** `/items`

### Response

Returns all items from the database.

---

## Get Item by ID

**GET** `/items/:id`

### Response

Returns a single item by item ID.

---

## Update Item

**PUT** `/items/:id`

### Request Body

```json
{
  "item_code": "ITM001",
  "item_name": "Updated Servo Motor",
  "description": "Updated description",
  "unit": "pcs",
  "category": "Electronics"
}
```

### Response

Updates an existing item.

---

## Delete Item

**DELETE** `/items/:id`

### Response

Deletes the specified item.

---

# 2. Pallets

## Create Pallet

**POST** `/pallets`

### Response

Creates a new pallet with auto-generated pallet code.

---

## Get All Pallets

**GET** `/pallets`

### Response

Returns all pallets with summary details.

---

## Get Pallet by ID

**GET** `/pallets/:id`

### Response

Returns pallet details along with pallet items.

---

## Add Item to Pallet

**POST** `/pallets/:palletId/items`

### Request Body

```json
{
  "item_id": 1,
  "quantity": 10
}
```

### Response

Adds an item to the specified pallet.

---

## Update Pallet Item

**PUT** `/pallets/:palletId/items/:palletItemId`

### Request Body

```json
{
  "quantity": 20
}
```

### Response

Updates the quantity of an item inside a pallet.

---

## Delete Pallet Item

**DELETE** `/pallets/:palletId/items/:palletItemId`

### Response

Removes an item from the specified pallet.

---

## Stock In From Pallet

**POST** `/pallets/:palletId/stock-in`

### Response

Transfers all pallet items into inventory, creates stock transactions, and marks the pallet as RECEIVED.

---

# 3. Inventory

## Get Inventory

**GET** `/inventory`

### Response

Returns current stock levels for all items.

---

## Stock Out Item

**POST** `/inventory/stock-out`

### Request Body

```json
{
  "item_id": 1,
  "quantity": 2,
  "notes": "Issued for production"
}
```

### Response

Reduces stock from inventory and records an OUT stock transaction.

---

## Get Stock Transactions

**GET** `/inventory/transactions`

### Response

Returns all stock IN/OUT transaction records.

---

# 4. Dashboard

## Get Dashboard Summary

**GET** `/dashboard/summary`

### Response

Returns:

* total number of items
* total number of pallets
* total stock quantity
* recent stock transactions
