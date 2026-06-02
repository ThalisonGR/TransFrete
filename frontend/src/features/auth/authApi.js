import { apiGet, apiPost } from "../../shared/api/client.js";

// POST /login.php -> { usuario }
export async function loginRequest({ email, senha }) {
  const data = await apiPost("/login.php", { email, senha });
  return data.usuario;
}

// POST /cadastro.php -> { usuario }
export async function cadastroRequest({ nome, email, senha, tipo_usuario }) {
  const data = await apiPost("/cadastro.php", {
    nome,
    email,
    senha,
    tipo_usuario,
  });
  return data.usuario;
}

// POST /logout.php
export async function logoutRequest() {
  await apiPost("/logout.php", {});
}

// GET /me.php -> { usuario }
export async function meRequest() {
  const data = await apiGet("/me.php");
  return data.usuario;
}
