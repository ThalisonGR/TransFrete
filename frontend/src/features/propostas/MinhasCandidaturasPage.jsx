import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarMinhasPropostas } from "./propostasApi.js";
import { formatarPreco } from "../fretes/FreteCard.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Button from "../../shared/design-system/Button.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

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
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.cls}`}
    >
      {info.texto}
    </span>
  );
}

export default function MinhasCandidaturasPage() {
  const [propostas, setPropostas] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarMinhasPropostas();
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
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Minhas candidaturas
      </h1>

      {erro && (
        <Alert variant="error" className="mb-4">
          {erro}
        </Alert>
      )}

      {carregando ? (
        <p className="text-slate-500">Carregando...</p>
      ) : propostas.length === 0 ? (
        <Card>
          <p className="text-slate-600">
            Você ainda não se candidatou a nenhum frete.{" "}
            <Link to="/" className="font-semibold text-brand">
              Ver fretes disponíveis
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Rota</th>
                <th className="px-4 py-3">Anunciante</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propostas.map((p) => {
                const acessivel =
                  p.status === "aceita" || p.frete.status === "disponivel";
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.frete.origem}{" "}
                      <span className="text-slate-400">→</span>{" "}
                      {p.frete.destino}
                      <span className="block text-xs text-slate-400">
                        {p.frete.categoria_nome}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.frete.anunciante_nome}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-brand">
                      {formatarPreco(p.frete.preco)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {acessivel && (
                        <Link to={`/fretes/${p.frete.id}`}>
                          <Button variant="secondary">Ver frete</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
