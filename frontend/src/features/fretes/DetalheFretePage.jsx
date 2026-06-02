import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarFrete } from "./fretesApi.js";
import { formatarPreco, formatarPeso } from "./FreteCard.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Alert from "../../shared/design-system/Alert.jsx";
import CandidatarButton from "../propostas/CandidatarButton.jsx";
import DicasRota from "../rota-segura/DicasRota.jsx";

export default function DetalheFretePage() {
  const { id } = useParams();
  const [frete, setFrete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    (async () => {
      setLoading(true);
      setErro("");
      try {
        const f = await buscarFrete(id);
        if (ativo) setFrete(f);
      } catch (err) {
        if (ativo) setErro(err.message);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-slate-500">
        Carregando frete...
      </div>
    );
  }

  if (erro || !frete) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Alert variant="error">{erro || "Frete nao encontrado."}</Alert>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm font-semibold text-brand">
        &larr; Voltar
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                {frete.origem} <span className="text-slate-400">to</span>{" "}
                {frete.destino}
              </h1>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-base font-bold text-brand">
                {formatarPreco(frete.preco)}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-400">Categoria</dt>
                <dd className="font-medium text-slate-700">
                  {frete.categoria_nome}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Peso</dt>
                <dd className="font-medium text-slate-700">
                  {formatarPeso(frete.peso)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Anunciante</dt>
                <dd className="font-medium text-slate-700">
                  {frete.anunciante_nome}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <CandidatarButton freteId={frete.id} />
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <DicasRota origem={frete.origem} destino={frete.destino} />
          </Card>
        </div>
      </div>
    </div>
  );
}
