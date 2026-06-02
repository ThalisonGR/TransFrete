import { Link } from "react-router-dom";
import Card from "../../shared/design-system/Card.jsx";
import Button from "../../shared/design-system/Button.jsx";

export function formatarPreco(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarPeso(valor) {
  const numero = Number(valor) || 0;
  return `${numero.toLocaleString("pt-BR")} kg`;
}

export default function FreteCard({ frete }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-slate-800">
            {frete.origem} <span className="text-slate-400">to</span>{" "}
            {frete.destino}
          </p>
          <p className="text-sm text-slate-500">{frete.categoria_nome}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-brand">
          {formatarPreco(frete.preco)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div>
          <dt className="text-slate-400">Peso</dt>
          <dd>{formatarPeso(frete.peso)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Anunciante</dt>
          <dd>{frete.anunciante_nome}</dd>
        </div>
      </dl>

      <Link to={`/fretes/${frete.id}`} className="mt-1">
        <Button variant="secondary" className="w-full">
          Ver detalhes
        </Button>
      </Link>
    </Card>
  );
}
