-- ====================================================================
-- SISTEMA FOOD — BANCO DE DADOS MYSQL (HOSTINGER)
-- ====================================================================

CREATE TABLE IF NOT EXISTS food_restaurants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) DEFAULT '',
    active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_users (
    id CHAR(32) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_restaurant_memberships (
    restaurant_id VARCHAR(64) NOT NULL,
    user_id CHAR(32) NOT NULL,
    role ENUM('gerente', 'garcom', 'cozinha', 'caixa') NOT NULL DEFAULT 'gerente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (restaurant_id, user_id),
    CONSTRAINT fk_food_membership_restaurant FOREIGN KEY (restaurant_id) REFERENCES food_restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_food_membership_user FOREIGN KEY (user_id) REFERENCES food_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_state (
    restaurant_id VARCHAR(64) NOT NULL,
    data_key VARCHAR(64) NOT NULL,
    data_json LONGTEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (restaurant_id, data_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_transactions (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL,
    timestamp VARCHAR(32),
    source VARCHAR(64),
    waiter VARCHAR(128),
    operator VARCHAR(128),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    service_tax DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(32),
    status VARCHAR(32),
    items_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_orders (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL,
    order_number VARCHAR(64),
    table_number VARCHAR(64),
    customer_name VARCHAR(128),
    status VARCHAR(32),
    total DECIMAL(10,2) DEFAULT 0.00,
    items_json LONGTEXT,
    observation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
