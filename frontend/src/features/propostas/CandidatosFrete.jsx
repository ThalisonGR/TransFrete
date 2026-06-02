import { useEffect, useState } from "react";
import { listarPropostasDoFrete, aceitarProposta } from "./propostasApi.js";
import Alert from "../../shared/design-system/Alert.jsx";
import Button from "../../shared/design-system/Button.jsx";

const STATUS_LABEL = {
  pendente: { texto: "Pendente", cls: "bg-amber-50 text-amber-700" },
  aceita: { texto: "Aceita", cls: "bg-green-50 text-green-700" },
  recusada: { texto: "Recusada", cls: "bg-red-50 text-red-700" },
};

function StatusBadge({ status }) {
  const info = STATUS_LABEL[status] || {
    texto: status,
    cls: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.cls}`}>
      {info.texto}
    </span>
  );
}

// Lista os motoristas que se candidataram a um frete (visão do anunciante).
// freteFechado: se o frete já foi fechado (esconde os botões de aceitar).
// onAceito: callback após aceitar (para o pai recarregar a lista de fretes).
export default function CandidatosFrete({ freteId, freteFechado, onAceito }) {
  const [propostas, setPropostas] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [aceitandoId, setAceitandoId] = useState(null);

  async function carregar() {
    setCarregando(true);
    try {
      const lista = await listarPropostasDoFrete(freteId);
      setPropostas(lista);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    (async () => {
      try {
        const lista = await listarPropostasDoFrete(freteId);
        if (ativo) setPropostas(lista);
      } catch (err) {
        if (ativo) setErro(err.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [freteId]);

  async function onAceitar(propostaId) {
    setErro("");
    setAceitandoId(propostaId);
    try {
      await aceitarProposta(propostaId);
      await carregar();
      if (onAceito) onAceito();
    } catch (err) {
      setErro(err.message);
    } finally {
      setAceitandoId(null);
    }
  }

  const fechado = freteFechado || (propostas || []).some((p) => p.status === "aceita");

  if (carregando) {
    return <p className="text-sm text-slate-500">Carregando candidatos...</p>;
  }
  if (erro) {
    return <Alert variant="error">{erro}</Alert>;
  }
  if (!propostas || propostas.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nenhum motorista se candidatou a este frete ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Motorista</th>
            <th className="px-3 py-2">E-mail</th>
            <th className="px-3 py-2">Veículos</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Candidatou-se em</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {propostas.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-3 py-2 font-medium text-slate-800">
                {p.motorista.nome}
              </td>
              <td className="px-3 py-2">
                <a
                  href={`mailto:${p.motorista.email}`}
                  className="text-brand hover:underline"
                >
                  {p.motorista.email}
                </a>
              </td>
              <td className="px-3 py-2 text-slate-600">
                {p.motorista.veiculos.length > 0
                  ? p.motorista.veiculos
                      .map((v) => `${v.modelo} (${v.placa})`)
                      .join(", ")
                  : "—"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-3 py-2 text-slate-500">{p.data}</td>
              <td className="px-3 py-2 text-right">
                {!fechado && p.status === "pendente" && (
                  <Button
                    onClick={() => onAceitar(p.id)}
                    disabled={aceitandoId !== null}
                  >
                    {aceitandoId === p.id ? "Aceitando..." : "Aceitar"}
                  </Button>
                )}
                {p.status === "aceita" && (
                  <span className="text-xs font-semibold text-green-700">
                    ✓ Aprovado
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
