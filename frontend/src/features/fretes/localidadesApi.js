import { apiGet } from "../../shared/api/client.js";

// GET /ufs.php -> { ufs: { sigla, nome }[] }
export async function listarUfs() {
  const data = await apiGet("/ufs.php");
  return data.ufs;
}

// GET /municipios.php?uf=SP -> { municipios: { codigo_ibge, nome, uf_sigla }[] }
export async function listarMunicipios(uf) {
  const data = await apiGet(`/municipios.php?uf=${encodeURIComponent(uf)}`);
  return data.municipios;
}
