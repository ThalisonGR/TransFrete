import { apiGet } from "../../shared/api/client.js";

// GET /gemini.php?origem=...&destino=... -> { dicas: string }
export async function buscarDicasRota(origem, destino) {
  const qs = new URLSearchParams({ origem, destino }).toString();
  const data = await apiGet(`/gemini.php?${qs}`);
  return data.dicas;
}
