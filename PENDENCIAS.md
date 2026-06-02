# Pendências — TransFrete

Itens a realizar depois. Ordenados por prioridade. Nada aqui bloqueia o uso
básico da aplicação (cadastro, login, fretes, propostas, veículos já funcionam).

---

## 1. Criar o arquivo `.env` (alta)

O `.env` ainda **não existe** — a aplicação está usando os defaults do XAMPP
embutidos em `api/config.php` (`127.0.0.1`, db `transfrete`, user `root`, senha vazia).

- [ ] Copiar `.env.example` → `.env` na raiz do projeto.
- [ ] Preencher `DB_*` se o seu MySQL não for o padrão do XAMPP.
- [ ] **Preencher `GEMINI_API_KEY`** (ver item 2).

> Sem o `.env`, o banco funciona, mas o recurso de IA (Gemini) não.

## 2. Integração Gemini — "Dicas de Rota Segura" (alta)

O endpoint `api/gemini.php` está implementado, mas **inoperante** até a chave existir.

- [ ] Gerar uma API key em https://aistudio.google.com/app/apikey
- [ ] Colocar em `.env` como `GEMINI_API_KEY=...`
- [ ] Confirmar o modelo usado: hoje é `gemini-1.5-flash` (endpoint `v1beta`).
      Trocar para o modelo desejado/disponível na sua conta, se necessário.
- [ ] Testar na tela de detalhe do frete (botão "Dicas de Rota Segura").
- [ ] Tratar limites/erros da API (quota, timeout) — hoje devolve 500 genérico.

## 3. Envio real de e-mail no "Fale Conosco" (média)

`api/contato.php` usa `mail()` com o erro silenciado (`@`) e destinatário fixo
`contato@transfrete.local`. Em ambiente local **não envia de fato** (sem MTA).

- [ ] Configurar `[mail function]` no `php.ini` do XAMPP (sendmail/SMTP), ou
- [ ] Trocar por uma lib de SMTP (ex.: PHPMailer) com credenciais reais.
- [ ] Definir o e-mail de destino real (remover o fixo `@transfrete.local`).

## 4. Limpar dados de teste do banco (média)

Durante a validação foram inseridos usuários/fretes/veículos de teste
(`anunciante_teste@transfrete.local`, `motorista_teste@transfrete.local`, etc.).

- [ ] Reimportar `database.sql` (faz `DROP/CREATE` limpo) **ou** apagar as linhas de teste
      antes da entrega.

## 5. Preparar entrega / hospedagem (média)

- [ ] Subir o projeto na hospedagem e colocar o link em `url.txt` (na raiz).
- [ ] Confirmar a `<meta name="plagiarism" ...>` em todas as views/telas exigidas.
- [ ] Rodar `npm run build` no `frontend/` e servir o `dist/` (Apache/host),
      apontando para o backend de produção.
- [ ] **Importar os municípios IBGE no banco de produção**: depois de
      `database.sql`, importar `municipios_data.sql` (5.571 municípios, DTB 2024).
      Sem isso os selects de origem/destino ficam vazios e nenhum frete pode ser criado.

## 6. Ajustes de produção (CORS / sessão) (média)

Hoje está calibrado para dev local (Vite em `:5173`, backend em `:8000` via proxy).

- [ ] `api/helpers.php` → `cors_headers()`: trocar `Access-Control-Allow-Origin`
      de `http://localhost:5173` para o domínio de produção.
- [ ] `frontend` → ajustar `VITE_API_URL` (ou proxy) para a URL real da API
      (ex.: `http://localhost/transfrete/api` se servir pelo Apache do XAMPP).
- [ ] Cookies de sessão: em produção com HTTPS, habilitar `Secure` e definir
      `SameSite` adequado no `php.ini`/`session_set_cookie_params`.

## 7. Melhorias opcionais (baixa)

- [ ] Endpoint `GET /api/veiculos.php` para listar os veículos do motorista.
      Hoje `MeusVeiculosPage` só mostra os veículos cadastrados na sessão atual
      (o contrato não previu um GET de listagem). Se adicionar, **atualizar o
      `docs/API_CONTRACT.md`** (é a fonte da verdade para os dois lados).
- [ ] Gestão do status das propostas (aceitar/recusar) — hoje só "pendente".
- [ ] `eslint-plugin-boundaries` no frontend para impor as fronteiras entre features.

---

## Correções já aplicadas

- ✅ **Cadastro não logava no servidor** — `cadastro.php` chamava `session_start()`
  mas não gravava `$_SESSION['usuario']`. A UI mostrava o usuário "logado", mas
  ações autenticadas (ex.: cadastrar veículo) retornavam `401 "Você precisa estar
  autenticado."`. Corrigido: o cadastro agora cria a sessão (com
  `session_regenerate_id`) e registra o log de acesso, igual ao login.
