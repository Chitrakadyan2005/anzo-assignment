# ER Diagram Notes

## Database: `anzo_inventory`

### 1) `items`

* `id` (PK)
* `item_code`
* `item_name`
* `description`
* `unit`
* `category`
* `created_at`
* `updated_at`

### 2) `pallets`

* `id` (PK)
* `pallet_code`
* `status`
* `created_at`
* `updated_at`

### 3) `pallet_items`

* `id` (PK)
* `pallet_id` (FK → pallets.id)
* `item_id` (FK → items.id)
* `quantity`
* `created_at`
* `updated_at`

### 4) `inventory`

* `id` (PK)
* `item_id` (FK → items.id)
* `quantity_on_hand`
* `updated_at`

### 5) `stock_transactions`

* `id` (PK)
* `item_id` (FK → items.id)
* `transaction_type`
* `quantity`
* `reference_type`
* `reference_id`
* `notes`
* `created_at`

---

# Relationships

## One-to-many

* One `pallet` can have many `pallet_items`
* One `item` can appear in many `pallet_items`
* One `item` can have many `stock_transactions`

## One-to-one / one current inventory row per item

* One `item` has one `inventory` row

---

# Relationship Summary

* `pallets.id` → `pallet_items.pallet_id`
* `items.id` → `pallet_items.item_id`
* `items.id` → `inventory.item_id`
* `items.id` → `stock_transactions.item_id`
