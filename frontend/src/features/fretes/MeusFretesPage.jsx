import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarMeusFretes } from "./fretesApi.js";
import { formatarPreco, formatarPeso } from "./FreteCard.jsx";
import CandidatosFrete from "../propostas/CandidatosFrete.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Button from "../../shared/design-system/Button.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

export default function MeusFretesPage() {
  const [fretes, setFretes] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [abertos, setAbertos] = useState({}); // { [freteId]: bool }

  async function carregar() {
    try {
      const lista = await listarMeusFretes();
      setFretes(lista);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function toggle(id) {
    setAbertos((a) => ({ ...a, [id]: !a[id] }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Meus fretes</h1>
        <Link to="/fretes/novo">
          <Button>Publicar frete</Button>
        </Link>
      </div>

      {erro && (
        <Alert variant="error" className="mb-4">
          {erro}
        </Alert>
      )}

      {carregando ? (
        <p className="text-slate-500">Carregando...</p>
      ) : fretes.length === 0 ? (
        <Card>
          <p className="text-slate-600">
            Você ainda não publicou nenhum frete.{" "}
            <Link to="/fretes/novo" className="font-semibold text-brand">
              Publicar o primeiro
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
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Candidatos</th>
                <th className="px-5 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fretes.map((f) => (
                <FreteLinha
                  key={f.id}
                  frete={f}
                  aberto={!!abertos[f.id]}
                  onToggle={() => toggle(f.id)}
                  onAceito={carregar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FreteLinha({ frete: f, aberto, onToggle, onAceito }) {
  const fechado = f.status === "fechado";
  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-3 font-medium text-slate-800">
          {f.origem} <span className="text-slate-400">→</span> {f.destino}
        </td>
        <td className="px-4 py-3 text-slate-600">
          {f.categoria_nome} · {formatarPeso(f.peso)}
        </td>
        <td className="px-4 py-3 text-right font-bold text-brand">
          {formatarPreco(f.preco)}
        </td>
        <td className="px-4 py-3">
          {fechado ? (
            <div>
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                Fechado
              </span>
              {f.motorista_nome && (
                <p className="mt-1 text-xs text-slate-500">
                  Motorista: {f.motorista_nome}
                </p>
              )}
            </div>
          ) : (
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              Disponível
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-brand">
            {f.total_propostas}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            <Link to={`/fretes/${f.id}`}>
              <Button variant="secondary">Ver frete</Button>
            </Link>
            <Button onClick={onToggle}>
              {aberto ? "Ocultar" : "Candidatos"}
            </Button>
          </div>
        </td>
      </tr>
      {aberto && (
        <tr>
          <td colSpan={6} className="bg-slate-50 px-4 py-3">
            <CandidatosFrete
              freteId={f.id}
              freteFechado={fechado}
              onAceito={onAceito}
            />
          </td>
        </tr>
      )}
    </>
  );
}
