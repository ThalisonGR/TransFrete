import { useEffect, useState } from "react";
import { listarUfs, listarMunicipios } from "./localidadesApi.js";

const selectCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-slate-100 disabled:text-slate-400";

// Seleção de município em cascata: UF -> Cidade.
// Comunica o código IBGE da cidade escolhida via onChange(codigoOuVazio).
export default function MunicipioSelect({ label, onChange, error }) {
  const [ufs, setUfs] = useState([]);
  const [uf, setUf] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarUfs();
        if (ativo) setUfs(lista);
      } catch {
        // sem UFs o campo fica vazio; o backend ainda valida no envio
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!uf) {
      setMunicipios([]);
      return;
    }
    let ativo = true;
    setCarregando(true);
    (async () => {
      try {
        const lista = await listarMunicipios(uf);
        if (ativo) setMunicipios(lista);
      } catch {
        if (ativo) setMunicipios([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [uf]);

  function onUf(e) {
    setUf(e.target.value);
    setCidade("");
    onChange(""); // limpa a seleção anterior ao trocar de estado
  }

  function onCidade(e) {
    setCidade(e.target.value);
    onChange(e.target.value);
  }

  return (
    <div>
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <div className="grid grid-cols-3 gap-2">
        <select
          aria-label={`${label} - UF`}
          value={uf}
          onChange={onUf}
          className={selectCls}
        >
          <option value="">UF</option>
          {ufs.map((u) => (
            <option key={u.sigla} value={u.sigla}>
              {u.sigla}
            </option>
          ))}
        </select>

        <select
          aria-label={`${label} - Cidade`}
          value={cidade}
          onChange={onCidade}
          disabled={!uf || carregando}
          className={`col-span-2 ${selectCls}`}
        >
          <option value="">
            {!uf
              ? "Selecione a UF primeiro"
              : carregando
              ? "Carregando..."
              : "Selecione a cidade"}
          </option>
          {municipios.map((m) => (
            <option key={m.codigo_ibge} value={m.codigo_ibge}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
