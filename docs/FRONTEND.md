# Frontend — TransFrete (React + Vite + Tailwind)

> Consome a API descrita no [Contrato da API](./API_CONTRACT.md). Durante o
> desenvolvimento paralelo, o frontend só depende dos **shapes** e **rotas** do
> contrato — não da implementação do backend.

## 1. Stack

- **React 18 + Vite**
- **Tailwind CSS** (pode-se trocar por Bootstrap, mas o padrão aqui é Tailwind)
- **React Router** para navegação (é uma SPA)
- **Fetch API** com um wrapper central (`src/api/client.js`)
- Estado de autenticação via **Context** (`AuthContext`)

## 2. Estrutura de pastas — codebase vertical (por feature)

Baseada em [The Vertical Codebase (TkDodo)](https://tkdodo.eu/blog/the-vertical-codebase).
Princípios:

- **Código que muda junto fica junto.** Cada feature reúne suas páginas,
  componentes, hooks, chamadas de API, tipos e validações na mesma pasta.
- **Sem pastas horizontais globais** (`components/`, `hooks/`, `utils/`,
  `pages/`). Em vez disso, organizamos por domínio em `src/features/`.
- **Nomes prefixados pela feature** (`fretesApi.js`, `useFretes.js`,
  `freteValidation.js`) para deixar a origem explícita e evitar `index.js` ambíguos.
- **Baixo acoplamento:** uma feature não importa arquivos internos de outra.
  O que precisar ser compartilhado sobe para `src/shared/`.
- **`design-system`** concentra só o que é genuinamente reutilizável e sem
  regra de negócio (Button, Input, Card, etc.).

```
frontend/
├── index.html                  # contém <meta name="plagiarism" ...>
├── vite.config.js              # proxy /api → backend em dev
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # composição de rotas (importa as pages das features)
│   │
│   ├── shared/                 # transversal, sem regra de negócio de domínio
│   │   ├── api/
│   │   │   └── client.js       # fetch wrapper (credentials: include, trata {success,error})
│   │   ├── design-system/      # componentes reutilizáveis e burros
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Alert.jsx
│   │   ├── layout/
│   │   │   └── Navbar.jsx
│   │   └── routing/
│   │       └── ProtectedRoute.jsx
│   │
│   └── features/               # uma pasta por vertical de domínio
│       ├── auth/
│       │   ├── AuthContext.jsx     # estado de sessão (usuario, login, logout)
│       │   ├── LoginPage.jsx       # POST /login.php
│       │   ├── CadastroPage.jsx    # POST /cadastro.php (motorista/anunciante)
│       │   ├── authApi.js          # login, cadastro, logout, me
│       │   └── authValidation.js   # regex email, senha mín. 6
│       │
│       ├── fretes/
│       │   ├── HomePage.jsx            # GET /fretes.php (listagem)
│       │   ├── DetalheFretePage.jsx    # GET /detalhe_frete.php?id=X
│       │   ├── NovoFretePage.jsx       # GET /categorias.php + POST /frete.php (anunciante)
│       │   ├── FreteCard.jsx
│       │   ├── fretesApi.js
│       │   └── useFretes.js
│       │
│       ├── propostas/
│       │   ├── CandidatarButton.jsx    # POST /proposta.php (motorista)
│       │   └── propostasApi.js
│       │
│       ├── veiculos/
│       │   ├── MeusVeiculosPage.jsx    # POST /veiculo.php (motorista)
│       │   └── veiculosApi.js
│       │
│       ├── rota-segura/                # recurso Gemini ("Dicas de Rota Segura")
│       │   ├── DicasRota.jsx           # usado dentro de DetalheFretePage
│       │   └── geminiApi.js            # GET /gemini.php
│       │
│       └── contato/
│           ├── ContatoPage.jsx         # POST /contato.php
│           └── contatoApi.js
```

### Regras de fronteira (boundaries)

- `features/*` **podem** importar de `shared/*`, mas **não** de outra `features/*`.
- Composição entre features acontece só nas **pages** (ex.: `DetalheFretePage`
  importa `CandidatarButton` e `DicasRota`). Mesmo assim, exponha apenas o que
  for "público" da feature; trate o restante como interno.
- Opcional: aplicar `eslint-plugin-boundaries` para impedir imports cruzados
  indevidos e deep imports.

## 3. Wrapper de API (`src/api/client.js`)

- Base URL via env (`VITE_API_URL`, default `/api` com proxy do Vite).
- Sempre `credentials: "include"`.
- Decodifica JSON; se `success === false`, lança um erro com `code`, `message`, `fields`.
- Helpers `apiGet(path)` e `apiPost(path, body)`.

```js
// Exemplo de uso
import { apiPost } from "./client";
const { usuario } = await apiPost("/login.php", { email, senha });
```

## 4. Autenticação (AuthContext)

- No mount, chama `GET /me.php` para reidratar a sessão.
- Expõe `usuario`, `login()`, `logout()`, `cadastro()`, `loading`.
- `ProtectedRoute` redireciona para `/login` se não autenticado.
- Componentes condicionam ações ao `usuario.tipo_usuario`
  (ex.: botão "Publicar Frete" só para anunciante; "Candidatar" só para motorista).

## 5. Páginas e mapeamento de endpoints

| Feature / Página | Endpoints usados |
| :--- | :--- |
| `fretes/HomePage` | `GET /fretes.php` |
| `fretes/DetalheFretePage` | `GET /detalhe_frete.php?id=X` + `propostas/CandidatarButton` (`POST /proposta.php`) + `rota-segura/DicasRota` (`GET /gemini.php`) |
| `auth/LoginPage` | `POST /login.php` |
| `auth/CadastroPage` | `POST /cadastro.php` |
| `fretes/NovoFretePage` | `GET /categorias.php`, `POST /frete.php` |
| `veiculos/MeusVeiculosPage` | `POST /veiculo.php` |
| `contato/ContatoPage` | `POST /contato.php` (valida mensagem > 20 chars no front também) |

## 6. Validações no frontend (espelham o backend)

- Email por regex no cadastro/login.
- Senha mínima 6 caracteres.
- Mensagem do "Fale Conosco" > 20 caracteres.
- Tratamento de erros do contrato: exibir `error.message`; se houver
  `error.fields`, destacar campos correspondentes.

## 7. Requisitos da disciplina

- `<meta name="plagiarism" content="...">` no `index.html` e na página de termos.
- Layout responsivo com Tailwind.

## 8. Como rodar (dev)

1. `cd frontend && npm install`
2. Configurar `VITE_API_URL` (ou proxy no `vite.config.js` apontando para o backend).
3. `npm run dev` → `http://localhost:5173`.

## 9. Ordem de implementação sugerida

1. Scaffold Vite + Tailwind + Router + `shared/` (client.js, design-system, layout, routing)
2. `features/auth` (AuthContext + LoginPage + CadastroPage) + Navbar
3. `features/fretes` — HomePage + FreteCard + useFretes
4. `features/fretes/DetalheFretePage` + `features/propostas` + `features/rota-segura` (Gemini)
5. `features/fretes/NovoFretePage` (anunciante) + `features/veiculos` (motorista)
6. `features/contato`
