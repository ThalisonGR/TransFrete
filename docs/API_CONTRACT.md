# Contrato da API — TransFrete

> **Fonte da verdade compartilhada entre Backend e Frontend.**
> Este documento é o que permite agentes trabalharem em paralelo: enquanto
> ambos respeitarem este contrato, backend e frontend podem ser desenvolvidos
> de forma independente. **Qualquer mudança aqui deve ser acordada antes de
> alterar código dos dois lados.**

## 1. Convenções gerais

- **Base URL:** `/api` (ex.: `http://localhost/transfrete/api/login.php`)
- **Formato:** todo corpo de requisição e resposta é **JSON** (`Content-Type: application/json`).
- **Autenticação:** sessão PHP via cookie (`PHPSESSID`). O frontend deve enviar
  `credentials: "include"` em todas as chamadas `fetch`.
- **CORS:** backend responde com:
  - `Access-Control-Allow-Origin: http://localhost:5173` (origem do Vite em dev)
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- Toda rota responde a `OPTIONS` (preflight) com `204 No Content`.

## 2. Formato de resposta padrão

### Sucesso
```json
{
  "success": true,
  "data": { }
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O email já está cadastrado.",
    "fields": { "email": "Email já em uso" }
  }
}
```

`fields` é opcional e só aparece em erros de validação por campo.

### Códigos de status HTTP
| Status | Uso |
| :--- | :--- |
| 200 | Sucesso (GET / ação concluída) |
| 201 | Recurso criado (cadastro, proposta) |
| 400 | Erro de validação / requisição malformada |
| 401 | Não autenticado |
| 403 | Autenticado mas sem permissão (ex.: motorista publicando frete) |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex.: email duplicado, proposta repetida) |
| 500 | Erro interno |

### Códigos de erro (`error.code`)
`VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
`EMAIL_TAKEN`, `NO_VEHICLE`, `DUPLICATE_PROPOSAL`, `CONFLICT`, `INTERNAL_ERROR`.

## 3. Modelos (shapes JSON)

### Usuario
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "tipo_usuario": "motorista"
}
```
`tipo_usuario`: `"motorista"` | `"anunciante"`. **A senha nunca é retornada.**

### Veiculo
```json
{ "id": 1, "motorista_id": 1, "modelo": "Mercedes Atego", "placa": "ABC1D23" }
```

### Categoria
```json
{ "id": 1, "nome_categoria": "Carga Seca" }
```

### UF e Município (IBGE — DTB 2024)
```json
// UF
{ "sigla": "SP", "nome": "São Paulo" }
// Município
{ "codigo_ibge": 3550308, "nome": "São Paulo", "uf_sigla": "SP" }
```

### Frete
Origem e destino são **municípios IBGE**. O frete guarda os códigos
(`origem_ibge` / `destino_ibge`); a API também devolve o nome formatado
`"Cidade - UF"` em `origem` / `destino` (via join), para exibição.
```json
{
  "id": 1,
  "anunciante_id": 2,
  "anunciante_nome": "Transportes XYZ",
  "categoria_id": 1,
  "categoria_nome": "Carga Seca",
  "origem": "São Paulo - SP",
  "origem_ibge": 3550308,
  "origem_uf": "SP",
  "destino": "Curitiba - PR",
  "destino_ibge": 4106902,
  "destino_uf": "PR",
  "peso": 1200.5,
  "preco": 3500.00,
  "status": "disponivel",
  "motorista_id": null,
  "motorista_nome": null
}
```
`status`: `"disponivel"` | `"fechado"`. Quando **fechado**, `motorista_id`/
`motorista_nome` indicam o motorista aprovado. Fretes fechados **não** aparecem
em `GET /fretes.php` e só podem ser vistos pelo anunciante dono e pelo motorista
aprovado.

### Proposta
```json
{
  "id": 1,
  "frete_id": 1,
  "motorista_id": 1,
  "status": "pendente",
  "data": "2026-05-31 14:30:00"
}
```
`status`: `"pendente"` | `"aceita"` | `"recusada"`.

## 4. Endpoints

### POST `/api/cadastro.php`
Cria usuário. **201** em sucesso.
```json
// Request
{ "nome": "João", "email": "joao@email.com", "senha": "segredo123", "tipo_usuario": "motorista" }
// Response (201)
{ "success": true, "data": { "usuario": { "id": 1, "nome": "João", "email": "joao@email.com", "tipo_usuario": "motorista" } } }
```
Erros: `EMAIL_TAKEN` (409), `VALIDATION_ERROR` (400).

### POST `/api/login.php`
Autentica e inicia sessão segura (`session_regenerate_id`). **200**.
```json
// Request
{ "email": "joao@email.com", "senha": "segredo123" }
// Response (200)
{ "success": true, "data": { "usuario": { "id": 1, "nome": "João", "email": "joao@email.com", "tipo_usuario": "motorista" } } }
```
Erros: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401).

### POST `/api/logout.php`
Encerra a sessão. **200**. `{ "success": true, "data": {} }`

### GET `/api/me.php`
Retorna o usuário logado (para o frontend reidratar a sessão). **200** ou **401**.
```json
{ "success": true, "data": { "usuario": { "id": 1, "nome": "João", "email": "joao@email.com", "tipo_usuario": "motorista" } } }
```

### GET `/api/categorias.php`
Lista categorias (público). **200**.
```json
{ "success": true, "data": { "categorias": [ { "id": 1, "nome_categoria": "Carga Seca" } ] } }
```

### GET `/api/fretes.php`
Lista todos os fretes (público). **200**.
```json
{ "success": true, "data": { "fretes": [ /* Frete[] */ ] } }
```

### GET `/api/detalhe_frete.php?id=X`
Retorna um frete. **200** ou **404** (`NOT_FOUND`).
```json
{ "success": true, "data": { "frete": { /* Frete */ } } }
```

### GET `/api/ufs.php`
Lista as UFs disponíveis (público). **200**.
```json
{ "success": true, "data": { "ufs": [ { "sigla": "SP", "nome": "São Paulo" } ] } }
```

### GET `/api/municipios.php?uf=SP`
Lista os municípios de uma UF (público). **200**; 400 se `uf` inválida.
```json
{ "success": true, "data": { "municipios": [ { "codigo_ibge": 3550308, "nome": "São Paulo", "uf_sigla": "SP" } ] } }
```

### POST `/api/frete.php`
Cria frete. **Apenas anunciante** (senão 403 `FORBIDDEN`). Origem/destino são
**códigos IBGE** de municípios existentes (senão 400). **201**.
```json
// Request
{ "categoria_id": 1, "origem_ibge": 3550308, "destino_ibge": 4106902, "peso": 1200.5, "preco": 3500.00 }
// Response (201)
{ "success": true, "data": { "frete": { /* Frete */ } } }
```

### POST `/api/veiculo.php`
Cadastra veículo do motorista logado. **201**.
```json
// Request
{ "modelo": "Mercedes Atego", "placa": "ABC1D23" }
// Response (201)
{ "success": true, "data": { "veiculo": { /* Veiculo */ } } }
```

### POST `/api/aceitar_proposta.php`
O **anunciante dono** aceita um motorista para o frete. **200** (retorna o frete).
- Marca a proposta como `aceita`, as demais do frete como `recusada`, e o frete
  como `fechado` com o `motorista_id` aprovado.
- 403 `FORBIDDEN` se não for dono; 404 se a proposta não existe; 409 `CONFLICT`
  se o frete já estiver fechado.
```json
// Request
{ "proposta_id": 1 }
// Response (200)
{ "success": true, "data": { "frete": { /* Frete, status "fechado" */ } } }
```

### GET `/api/minhas_propostas.php`
Candidaturas do **motorista logado**, com o frete e o status. **200**.
```json
{ "success": true, "data": { "propostas": [
  { "id": 1, "status": "aceita", "data": "2026-06-02 00:09:47",
    "frete": { "id": 1, "origem": "São Paulo - SP", "destino": "Curitiba - PR",
               "categoria_nome": "Carga Seca", "anunciante_nome": "Transportes XYZ",
               "preco": 3500, "status": "fechado" } }
] } }
```

### POST `/api/proposta.php`
Motorista se candidata a um frete. **201**.
- Requer estar logado como motorista (senão 403).
- Motorista **sem veículo** → 403 `NO_VEHICLE`.
- Proposta já existente para o mesmo frete → 409 `DUPLICATE_PROPOSAL`.
- Frete já **fechado** → 409 `CONFLICT`.
```json
// Request
{ "frete_id": 1 }
// Response (201)
{ "success": true, "data": { "proposta": { /* Proposta, status "pendente" */ } } }
```

### GET `/api/meus_fretes.php`
Lista os fretes publicados pelo **anunciante logado**, cada um com a contagem
de candidaturas. Apenas anunciante (senão 403). **200**.
```json
{ "success": true, "data": { "fretes": [ { /* Frete */, "total_propostas": 2 } ] } }
```

### GET `/api/propostas_frete.php?frete_id=X`
Lista os motoristas que se candidataram a um frete. Apenas o **anunciante dono
do frete** (senão 403 `FORBIDDEN`; 404 se o frete não existe). **200**.
```json
{
  "success": true,
  "data": {
    "propostas": [
      {
        "id": 1, "frete_id": 1, "motorista_id": 3,
        "status": "pendente", "data": "2026-06-01 23:40:46",
        "motorista": {
          "id": 3, "nome": "João", "email": "joao@email.com",
          "veiculos": [ { "modelo": "Mercedes Atego", "placa": "ABC1D23" } ]
        }
      }
    ]
  }
}
```

### GET `/api/gemini.php?origem=...&destino=...`
Dicas de rota segura via Gemini. **200**.
```json
{ "success": true, "data": { "dicas": "Texto com conselhos logísticos e de segurança..." } }
```

### POST `/api/contato.php`
Fale Conosco. Mensagem deve ter **> 20 caracteres** (senão 400). **200**.
```json
// Request
{ "nome": "João", "email": "joao@email.com", "mensagem": "Mensagem com mais de vinte caracteres aqui." }
// Response (200)
{ "success": true, "data": {} }
```

## 5. Resumo da tabela de rotas

| Método | Rota | Auth | Papel |
| :--- | :--- | :--- | :--- |
| POST | `/api/cadastro.php` | — | — |
| POST | `/api/login.php` | — | — |
| POST | `/api/logout.php` | sessão | qualquer |
| GET | `/api/me.php` | sessão | qualquer |
| GET | `/api/categorias.php` | — | — |
| GET | `/api/ufs.php` | — | — |
| GET | `/api/municipios.php` | — | — |
| GET | `/api/fretes.php` | — | — |
| GET | `/api/detalhe_frete.php` | — | — |
| GET | `/api/meus_fretes.php` | sessão | anunciante |
| GET | `/api/propostas_frete.php` | sessão | anunciante (dono) |
| POST | `/api/frete.php` | sessão | anunciante |
| POST | `/api/veiculo.php` | sessão | motorista |
| POST | `/api/proposta.php` | sessão | motorista |
| POST | `/api/aceitar_proposta.php` | sessão | anunciante (dono) |
| GET | `/api/minhas_propostas.php` | sessão | motorista |
| GET | `/api/gemini.php` | sessão | qualquer |
| POST | `/api/contato.php` | — | — |

## 6. Versionamento do contrato

- **v1** — versão inicial (este documento).
- Mudanças que quebram compatibilidade exigem nova versão e aviso aos dois agentes.
