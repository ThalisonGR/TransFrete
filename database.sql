-- ============================================================
-- TransFrete — Schema MySQL 8.0
-- Importe no phpMyAdmin ou via: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS transfrete
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE transfrete;

-- Remove tabelas existentes (ordem respeitando as FKs).
DROP TABLE IF EXISTS logs_acesso;
DROP TABLE IF EXISTS propostas;
DROP TABLE IF EXISTS fretes;
DROP TABLE IF EXISTS categorias_carga;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS municipios;

-- ------------------------------------------------------------
-- usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,             -- password_hash()
  tipo_usuario ENUM('motorista','anunciante') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- veiculos
-- ------------------------------------------------------------
CREATE TABLE veiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  motorista_id INT NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  placa VARCHAR(10) NOT NULL,
  FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- categorias_carga
-- ------------------------------------------------------------
CREATE TABLE categorias_carga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_categoria VARCHAR(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- municipios (IBGE — DTB 2024). Dados em municipios_data.sql.
-- ------------------------------------------------------------
CREATE TABLE municipios (
  codigo_ibge INT PRIMARY KEY,             -- código IBGE completo (7 dígitos)
  nome VARCHAR(120) NOT NULL,
  uf_sigla CHAR(2) NOT NULL,
  uf_nome VARCHAR(60) NOT NULL,
  INDEX idx_municipios_uf (uf_sigla),
  INDEX idx_municipios_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- fretes
-- ------------------------------------------------------------
CREATE TABLE fretes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anunciante_id INT NOT NULL,
  categoria_id INT NOT NULL,
  origem_ibge INT NOT NULL,                -- FK município de origem
  destino_ibge INT NOT NULL,               -- FK município de destino
  peso DECIMAL(10,2) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  status ENUM('disponivel','fechado') NOT NULL DEFAULT 'disponivel',
  motorista_id INT NULL,                   -- motorista aprovado (quando fechado)
  FOREIGN KEY (anunciante_id) REFERENCES usuarios(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias_carga(id),
  FOREIGN KEY (origem_ibge) REFERENCES municipios(codigo_ibge),
  FOREIGN KEY (destino_ibge) REFERENCES municipios(codigo_ibge),
  FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- propostas
-- ------------------------------------------------------------
CREATE TABLE propostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  frete_id INT NOT NULL,
  motorista_id INT NOT NULL,
  status ENUM('pendente','aceita','recusada') NOT NULL DEFAULT 'pendente',
  data DATETIME NOT NULL,
  UNIQUE KEY uniq_proposta (frete_id, motorista_id),  -- impede proposta duplicada
  FOREIGN KEY (frete_id) REFERENCES fretes(id),
  FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- logs_acesso
-- ------------------------------------------------------------
CREATE TABLE logs_acesso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Dados iniciais: categorias de carga
-- ------------------------------------------------------------
INSERT INTO categorias_carga (nome_categoria) VALUES
  ('Carga Seca'),
  ('Refrigerada'),
  ('Granel'),
  ('Carga Perigosa'),
  ('Carga Viva'),
  ('Frigorificada'),
  ('Carga Indivisível'),
  ('Mudança');
