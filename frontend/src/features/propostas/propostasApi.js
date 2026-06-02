import { apiGet, apiPost } from "../../shared/api/client.js";

// POST /proposta.php -> { proposta: Proposta } (apenas motorista)
export async function candidatar(frete_id) {
  const data = await apiPost("/proposta.php", { frete_id });
  return data.proposta;
}

// GET /propostas_frete.php?frete_id=X -> { propostas: PropostaComMotorista[] }
// (apenas o anunciante dono do frete)
export async function listarPropostasDoFrete(freteId) {
  const data = await apiGet(
    `/propostas_frete.php?frete_id=${encodeURIComponent(freteId)}`
  );
  return data.propostas;
}

// POST /aceitar_proposta.php -> { frete: Frete } (anunciante dono; fecha o frete)
export async function aceitarProposta(propostaId) {
  const data = await apiPost("/aceitar_proposta.php", {
    proposta_id: propostaId,
  });
  return data.frete;
}

// GET /minhas_propostas.php -> { propostas: { id, status, data, frete }[] } (motorista)
export async function listarMinhasPropostas() {
  const data = await apiGet("/minhas_propostas.php");
  return data.propostas;
}
