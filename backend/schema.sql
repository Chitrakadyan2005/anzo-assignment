CREATE DATABASE IF NOT EXISTS anzo_inventory;
USE anzo_inventory;

-- =========================
-- 1. ITEMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    item_name VARCHAR(150) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 2. PALLETS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS pallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pallet_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('OPEN', 'RECEIVED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 3. PALLET ITEMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS pallet_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pallet_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pallet_items_pallet
        FOREIGN KEY (pallet_id) REFERENCES pallets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pallet_items_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_pallet_item UNIQUE (pallet_id, item_id)
);

-- =========================
-- 4. INVENTORY TABLE
-- =========================
CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL UNIQUE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE
);

-- =========================
-- 5. STOCK TRANSACTIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS stock_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    reference_type ENUM('PALLET', 'MANUAL') DEFAULT 'MANUAL',
    reference_id INT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_transactions_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE
);

-- =========================
-- 6. SUPPLIERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7. PURCHASE ORDERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'CLOSED') DEFAULT 'DRAFT',
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_po_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON DELETE RESTRICT
);

-- =========================
-- 8. PURCHASE ORDER ITEMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INT NOT NULL,
    item_id INT NOT NULL,
    ordered_quantity INT NOT NULL,
    received_quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_po_items_po
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_po_items_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE RESTRICT
);

-- =========================
-- 9. GOODS RECEIPTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS goods_receipts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grn_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_order_id INT NOT NULL,
    receipt_date DATE NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_grn_po
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
        ON DELETE RESTRICT
);

-- =========================
-- 10. GOODS RECEIPT ITEMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    goods_receipt_id INT NOT NULL,
    purchase_order_item_id INT NOT NULL,
    item_id INT NOT NULL,
    received_quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_grn_items_grn
        FOREIGN KEY (goods_receipt_id) REFERENCES goods_receipts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_grn_items_po_item
        FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_items(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_grn_items_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE RESTRICT
);