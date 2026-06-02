import { apiPost } from "../../shared/api/client.js";

// POST /veiculo.php -> { veiculo: Veiculo } (motorista logado)
export async function cadastrarVeiculo({ modelo, placa }) {
  const data = await apiPost("/veiculo.php", { modelo, placa });
  return data.veiculo;
}
