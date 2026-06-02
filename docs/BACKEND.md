# Backend — TransFrete (PHP puro + PDO + MySQL)

> Segue o [Contrato da API](./API_CONTRACT.md). Toda resposta e endpoint
> deve obedecer ao contrato. Backend e frontend são independentes desde que
> ambos respeitem o contrato.

## 1. Stack e princípios

- **PHP 8.x sem frameworks**, acesso a dados via **PDO**.
- **MySQL 8.0**.
- Sem Composer obrigatório (pode ser usado só para `vlucas/phpdotenv` se desejado; opcional).
- Toda query usa **prepared statements** — nunca concatenar input em SQL.
- Respostas sempre JSON, com headers CORS e `Content-Type: application/json`.

## 2. Estrutura de pastas

```
api/
├── config.php          # Carrega credenciais (DB, GEMINI_API_KEY) — não versionar valores reais
├── db.php              # Cria e retorna a conexão PDO (singleton)
├── helpers.php         # respond_success(), respond_error(), read_json_body(),
│                       # require_auth(), require_role(), cors_headers()
├── cadastro.php
├── login.php
├── logout.php
├── me.php
├── categorias.php
├── fretes.php
├── detalhe_frete.php
├── frete.php
├── veiculo.php
├── proposta.php
├── gemini.php
└── contato.php
database.sql            # Schema + dados iniciais (categorias)
.env.example            # Modelo de variáveis de ambiente
```

## 3. Camada de infraestrutura

### `db.php`
- Função `db(): PDO` que cria conexão única.
- DSN: `mysql:host=...;dbname=transfrete;charset=utf8mb4`.
- Opções: `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES => false`.

### `helpers.php`
- `cors_headers()` — emite headers do contrato e trata `OPTIONS` (204).
- `read_json_body(): array` — lê e decodifica `php://input`.
- `respond_success($data, $status = 200)` — `{ success: true, data }`.
- `respond_error($code, $message, $status, $fields = null)` — formato de erro do contrato.
- `current_user(): ?array` — usuário da sessão (`$_SESSION['usuario']`) ou null.
- `require_auth(): array` — 401 se não logado.
- `require_role(string $role): array` — 403 se papel diferente.

Cada endpoint inicia com `cors_headers();` e `session_start();`.

## 4. Schema do banco (`database.sql`)

```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,             -- password_hash()
  tipo_usuario ENUM('motorista','anunciante') NOT NULL
);

CREATE TABLE veiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  motorista_id INT NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  placa VARCHAR(10) NOT NULL,
  FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
);

CREATE TABLE categorias_carga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_categoria VARCHAR(80) NOT NULL
);

CREATE TABLE fretes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anunciante_id INT NOT NULL,
  categoria_id INT NOT NULL,
  origem VARCHAR(160) NOT NULL,
  destino VARCHAR(160) NOT NULL,
  peso DECIMAL(10,2) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (anunciante_id) REFERENCES usuarios(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias_carga(id)
);

CREATE TABLE propostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  frete_id INT NOT NULL,
  motorista_id INT NOT NULL,
  status ENUM('pendente','aceita','recusada') NOT NULL DEFAULT 'pendente',
  data DATETIME NOT NULL,
  UNIQUE KEY uniq_proposta (frete_id, motorista_id),  -- impede proposta duplicada
  FOREIGN KEY (frete_id) REFERENCES fretes(id),
  FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
);

CREATE TABLE logs_acesso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```
Inserir categorias iniciais (Carga Seca, Refrigerada, Granel, Perigosa, etc.).

## 5. Regras de negócio por endpoint

| Endpoint | Regras |
| :--- | :--- |
| `cadastro.php` | valida email (formato + unique), senha mín. 6, `password_hash()`, tipo válido |
| `login.php` | `password_verify()`, `session_regenerate_id(true)`, grava log em `logs_acesso` |
| `frete.php` | `require_role('anunciante')`, categoria deve existir |
| `veiculo.php` | `require_role('motorista')` |
| `proposta.php` | `require_role('motorista')`; checar veículo (`NO_VEHICLE`); UNIQUE → `DUPLICATE_PROPOSAL` |
| `gemini.php` | monta prompt com origem/destino, chama Gemini via cURL, retorna texto |
| `contato.php` | `mensagem` > 20 chars; envia e-mail via `mail()` |

## 6. Segurança (checklist)

- [ ] Prepared statements em **todas** as queries (PDO).
- [ ] `password_hash()` no cadastro, `password_verify()` no login.
- [ ] `session_regenerate_id(true)` no login.
- [ ] Headers CORS conforme contrato; preflight `OPTIONS` → 204.
- [ ] Nunca retornar o campo `senha`.
- [ ] Validação de input no servidor além do frontend.

## 7. Como rodar (dev)

1. Importar `database.sql` no MySQL (phpMyAdmin).
2. Copiar `.env.example` → `.env` (ou editar `config.php`) com credenciais e `GEMINI_API_KEY`.
3. Servir: `php -S localhost:8000` na raiz do projeto (ou Apache/XAMPP em `htdocs`).
4. Base da API: `http://localhost:8000/api/...`.

## 8. Ordem de implementação sugerida

1. `db.php` + `helpers.php` + `config.php` + `database.sql`
2. `cadastro.php` → `login.php` → `me.php` → `logout.php`
3. `categorias.php` → `fretes.php` → `detalhe_frete.php`
4. `frete.php` → `veiculo.php` → `proposta.php`
5. `gemini.php` → `contato.php`
