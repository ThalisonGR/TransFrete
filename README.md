# TransFrete

Plataforma SPA para publicação e gestão de fretes, conectando **anunciantes**
(transportadoras) a **motoristas** autônomos.

## Stack

- **Frontend:** React + Vite + Tailwind CSS (estrutura vertical por feature)
- **Backend:** PHP 8 puro com PDO
- **Banco:** MySQL 8
- **IA:** Google Gemini (dicas de rota)

## Estrutura

```
api/        # Backend PHP (endpoints REST, sessão, PDO)
frontend/   # SPA React (Vite)
```

## Rodando em desenvolvimento

### Backend
1. Importar `database.sql` e `municipios_data.sql` no MySQL.
2. Copiar `api/.env.example` → `api/.env` (ou usar os defaults do XAMPP) e definir `GEMINI_API_KEY`.
3. Servir: `php -S localhost:8000` na raiz do projeto.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Abre em `http://localhost:5173` (o Vite faz proxy de `/api` para o backend).

## Funcionalidades

- Cadastro/login (motorista ou anunciante) com sessão segura
- Publicação de fretes com origem/destino por município (IBGE)
- Listagem de fretes com filtros (categoria, UF/cidade de origem e destino, preço, peso)
- Candidatura de motoristas e aprovação pelo anunciante
- Fretes fechados ficam privados (anunciante + motorista aprovado)
