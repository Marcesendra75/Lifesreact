-- ============================================
-- LIFE'S — Schema MySQL completo
-- ============================================

CREATE DATABASE IF NOT EXISTS lifes_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lifes_db;

-- ── Usuarios ──
CREATE TABLE IF NOT EXISTS users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  avatar_url        VARCHAR(500),
  cover_url         VARCHAR(500),
  bio               TEXT,
  birth_date        DATE,
  country           VARCHAR(100),
  city              VARCHAR(100),
  membership_level  ENUM('bronze','silver','gold','gold2','diamond','triple_diamond') DEFAULT 'bronze',
  is_verified       TINYINT(1) DEFAULT 0,
  is_active         TINYINT(1) DEFAULT 1,
  reset_token       VARCHAR(255),
  reset_token_exp   DATETIME,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Memorias / Posts ──
CREATE TABLE IF NOT EXISTS memories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  type          ENUM('photo','video','text','audio','milestone') NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  media_url     VARCHAR(500),
  thumbnail_url VARCHAR(500),
  date          DATE,
  location      VARCHAR(255),
  privacy       ENUM('public','family','friend','acquaintance','partner','follower','private') DEFAULT 'family',
  likes         INT DEFAULT 0,
  comments      INT DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Tags de memorias ──
CREATE TABLE IF NOT EXISTS memory_tags (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  memory_id  INT NOT NULL,
  tag        VARCHAR(100) NOT NULL,
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- ── Árbol genealógico ──
CREATE TABLE IF NOT EXISTS family_members (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  owner_id    INT NOT NULL,
  linked_user INT,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100),
  birth_date  DATE,
  death_date  DATE,
  avatar_url  VARCHAR(500),
  relation    VARCHAR(100),
  country     VARCHAR(100),
  city        VARCHAR(100),
  bio         TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_user) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS family_relations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  member_id  INT NOT NULL,
  related_id INT NOT NULL,
  type       ENUM('parent','child','spouse','sibling') NOT NULL,
  FOREIGN KEY (member_id)  REFERENCES family_members(id) ON DELETE CASCADE,
  FOREIGN KEY (related_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- ── Cápsulas del tiempo ──
CREATE TABLE IF NOT EXISTS time_capsules (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  title            VARCHAR(255) NOT NULL,
  message          TEXT,
  video_url        VARCHAR(500),
  recipient_name   VARCHAR(200) NOT NULL,
  recipient_email  VARCHAR(255) NOT NULL,
  scheduled_date   DATE NOT NULL,
  is_sent          TINYINT(1) DEFAULT 0,
  sent_at          DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Último tributo ──
CREATE TABLE IF NOT EXISTS farewell_videos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  title            VARCHAR(255) NOT NULL,
  video_url        VARCHAR(500) NOT NULL,
  recipient_name   VARCHAR(200) NOT NULL,
  recipient_email  VARCHAR(255),
  message          TEXT,
  is_private       TINYINT(1) DEFAULT 1,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Ecos del pasado ──
CREATE TABLE IF NOT EXISTS digital_echoes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Postales digitales ──
CREATE TABLE IF NOT EXISTS digital_postals (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  memory_id         INT,
  recipient_name    VARCHAR(200) NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_country VARCHAR(100) NOT NULL,
  calligraphy_font  VARCHAR(100),
  message           TEXT,
  status            ENUM('pending','paid','printing','shipped','delivered') DEFAULT 'pending',
  tracking_code     VARCHAR(100),
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE SET NULL
);

-- ── Ahorro forzoso ──
CREATE TABLE IF NOT EXISTS savings_plans (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  monthly_amount   DECIMAL(8,2) NOT NULL,
  currency         VARCHAR(10) DEFAULT 'USD',
  start_date       DATE NOT NULL,
  unlock_date      DATE NOT NULL,
  current_balance  DECIMAL(12,2) DEFAULT 0,
  interest_rate    DECIMAL(5,2) DEFAULT 0,
  is_active        TINYINT(1) DEFAULT 1,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS savings_transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  plan_id     INT NOT NULL,
  amount      DECIMAL(8,2) NOT NULL,
  type        ENUM('deposit','interest','withdrawal') DEFAULT 'deposit',
  description VARCHAR(255),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES savings_plans(id) ON DELETE CASCADE
);

-- ── Seguidores ──
CREATE TABLE IF NOT EXISTS follows (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  followed_id INT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_id, followed_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Likes ──
CREATE TABLE IF NOT EXISTS memory_likes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  memory_id  INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (user_id, memory_id),
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- ── Comentarios ──
CREATE TABLE IF NOT EXISTS memory_comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  memory_id  INT NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- ── Notificaciones ──
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT,
  is_read    TINYINT(1) DEFAULT 0,
  link       VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Tarjetas físicas de bóveda ──
CREATE TABLE IF NOT EXISTS vault_cards (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  -- Datos reales verificados (valiosos para futuros proyectos)
  legal_name      VARCHAR(200) NOT NULL,
  dni             VARCHAR(20)  NOT NULL,
  address         TEXT         NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  country         VARCHAR(100) NOT NULL,
  province        VARCHAR(100),
  postal_code     VARCHAR(20),
  -- Estado de la tarjeta
  status          ENUM('requested','shipped','active') DEFAULT 'requested',
  qr_code         VARCHAR(500),           -- código QR único generado al activar
  tracking_number VARCHAR(100),           -- número de seguimiento del envío
  requested_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  shipped_at      DATETIME,
  activated_at    DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Herederos ──
CREATE TABLE IF NOT EXISTS heirs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  phone        VARCHAR(30),
  relation     VARCHAR(100) NOT NULL,
  percentage   DECIMAL(5,2) NOT NULL DEFAULT 0,  -- % de herencia (suma debe ser 100)
  is_verified  TINYINT(1) DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Testamento digital ──
CREATE TABLE IF NOT EXISTS testaments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  content        LONGTEXT,              -- texto del testamento
  video_url      VARCHAR(500),          -- video testamento
  is_locked      TINYINT(1) DEFAULT 0, -- bloqueado = no se puede editar
  last_modified  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Caja de valores (crypto / documentos) ──
CREATE TABLE IF NOT EXISTS vault_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        ENUM('document','crypto','password','note','other') NOT NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT,                    -- encriptado en producción
  file_url    VARCHAR(500),
  is_private  TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Agregar columnas de seguridad a users ──
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS security_level ENUM('standard','triple') DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS vault_status   ENUM('no_card','requested','shipped','active') DEFAULT 'no_card';
