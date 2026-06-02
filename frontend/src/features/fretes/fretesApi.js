import { apiGet, apiPost } from "../../shared/api/client.js";

// GET /fretes.php -> { fretes: Frete[] }
export async function listarFretes() {
  const data = await apiGet("/fretes.php");
  return data.fretes;
}

// GET /meus_fretes.php -> { fretes: (Frete & { total_propostas })[] } (apenas anunciante)
export async function listarMeusFretes() {
  const data = await apiGet("/meus_fretes.php");
  return data.fretes;
}

// GET /detalhe_frete.php?id=X -> { frete: Frete }
export async function buscarFrete(id) {
  const data = await apiGet(`/detalhe_frete.php?id=${encodeURIComponent(id)}`);
  return data.frete;
}

// GET /categorias.php -> { categorias: Categoria[] }
export async function listarCategorias() {
  const data = await apiGet("/categorias.php");
  return data.categorias;
}

// POST /frete.php -> { frete: Frete } (apenas anunciante)
export async function criarFrete({
  categoria_id,
  origem_ibge,
  destino_ibge,
  peso,
  preco,
}) {
  const data = await apiPost("/frete.php", {
    categoria_id,
    origem_ibge,
    destino_ibge,
    peso,
    preco,
  });
  return data.frete;
}
