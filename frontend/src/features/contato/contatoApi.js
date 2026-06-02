import { apiPost } from "../../shared/api/client.js";

// POST /contato.php (publico). Mensagem deve ter > 20 caracteres.
export async function enviarContato({ nome, email, mensagem }) {
  await apiPost("/contato.php", { nome, email, mensagem });
}
