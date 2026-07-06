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