// Wrapper central de Fetch para a API do TransFrete.
// - Base URL via VITE_API_URL (default "/api", servido pelo proxy do Vite em dev).
// - Sempre envia credentials: "include" (sessao PHP via cookie PHPSESSID).
// - Decodifica JSON; se success === false, lanca um Error com { code, message, fields }.

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor({ code, message, fields }) {
    super(message || "Erro inesperado.");
    this.name = "ApiError";
    this.code = code || "INTERNAL_ERROR";
    this.fields = fields || null;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    // Falha de rede / servidor inacessivel.
    throw new ApiError({
      code: "INTERNAL_ERROR",
      message: "Nao foi possivel conectar ao servidor.",
    });
  }

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiError({
        code: "INTERNAL_ERROR",
        message: "Resposta invalida do servidor.",
      });
    }
  }

  if (!body || body.success === false) {
    const error = (body && body.error) || {};
    throw new ApiError({
      code: error.code,
      message: error.message,
      fields: error.fields,
    });
  }

  return body.data;
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, payload) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}
