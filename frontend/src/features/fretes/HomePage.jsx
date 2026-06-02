import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFretes } from "./useFretes.js";
import { listarCategorias } from "./fretesApi.js";
import { listarUfs, listarMunicipios } from "./localidadesApi.js";
import { formatarPreco, formatarPeso } from "./FreteCard.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import Alert from "../../shared/design-system/Alert.jsx";
import Button from "../../shared/design-system/Button.jsx";

const FILTRO_INICIAL = {
  categoriaId: "",
  ufOrigem: "",
  cidadeOrigem: "",
  ufDestino: "",
  cidadeDestino: "",
  busca: "",
  precoMin: "",
  precoMax: "",
  pesoMin: "",
  pesoMax: "",
};

const campoCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand";

export default function HomePage() {
  const { fretes, loading, erro } = useFretes();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [ufs, setUfs] = useState([]);
  const [cidadesOrigem, setCidadesOrigem] = useState([]);
  const [cidadesDestino, setCidadesDestino] = useState([]);
  const [filtro, setFiltro] = useState(FILTRO_INICIAL);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [cats, listaUfs] = await Promise.all([
          listarCategorias(),
          listarUfs(),
        ]);
        if (!ativo) return;
        setCategorias(cats);
        setUfs(listaUfs);
      } catch {
        // a listagem ainda funciona sem os filtros
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  // Carrega as cidades quando a UF de origem muda.
  useEffect(() => {
    if (!filtro.ufOrigem) {
      setCidadesOrigem([]);
      return;
    }
    let ativo = true;
    (async () => {
      try {
        const lista = await listarMunicipios(filtro.ufOrigem);
        if (ativo) setCidadesOrigem(lista);
      } catch {
        if (ativo) setCidadesOrigem([]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [filtro.ufOrigem]);

  // Carrega as cidades quando a UF de destino muda.
  useEffect(() => {
    if (!filtro.ufDestino) {
      setCidadesDestino([]);
      return;
    }
    let ativo = true;
    (async () => {
      try {
        const lista = await listarMunicipios(filtro.ufDestino);
        if (ativo) setCidadesDestino(lista);
      } catch {
        if (ativo) setCidadesDestino([]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [filtro.ufDestino]);

  const filtrados = useMemo(() => {
    const termo = filtro.busca.trim().toLowerCase();
    const precoMin = filtro.precoMin ? Number(filtro.precoMin) : null;
    const precoMax = filtro.precoMax ? Number(filtro.precoMax) : null;
    const pesoMin = filtro.pesoMin ? Number(filtro.pesoMin) : null;
    const pesoMax = filtro.pesoMax ? Number(filtro.pesoMax) : null;

    return fretes.filter((f) => {
      if (filtro.categoriaId && String(f.categoria_id) !== filtro.categoriaId)
        return false;
      if (filtro.ufOrigem && f.origem_uf !== filtro.ufOrigem) return false;
      if (filtro.cidadeOrigem && String(f.origem_ibge) !== filtro.cidadeOrigem)
        return false;
      if (filtro.ufDestino && f.destino_uf !== filtro.ufDestino) return false;
      if (
        filtro.cidadeDestino &&
        String(f.destino_ibge) !== filtro.cidadeDestino
      )
        return false;
      if (precoMin !== null && f.preco < precoMin) return false;
      if (precoMax !== null && f.preco > precoMax) return false;
      if (pesoMin !== null && f.peso < pesoMin) return false;
      if (pesoMax !== null && f.peso > pesoMax) return false;
      if (termo) {
        const alvo = `${f.origem} ${f.destino} ${f.anunciante_nome} ${f.categoria_nome}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [fretes, filtro]);

  function set(campo, valor) {
    setFiltro((f) => ({ ...f, [campo]: valor }));
  }

  // Ao trocar a UF, zera a cidade correspondente.
  function setUfOrigem(valor) {
    setFiltro((f) => ({ ...f, ufOrigem: valor, cidadeOrigem: "" }));
  }
  function setUfDestino(valor) {
    setFiltro((f) => ({ ...f, ufDestino: valor, cidadeDestino: "" }));
  }

  const algumFiltro = Object.values(filtro).some((v) => v !== "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Fretes disponiveis</h1>
          <p className="text-slate-500">
            Encontre cargas para transportar ou publique a sua.
          </p>
        </div>
        {usuario?.tipo_usuario === "anunciante" && (
          <Link to="/fretes/novo">
            <Button>Publicar Frete</Button>
          </Link>
        )}
      </div>

      {erro && (
        <Alert variant="error" className="mb-4">
          {erro}
        </Alert>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar de filtros (vertical) */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Filtros
              </h2>
              {algumFiltro && (
                <button
                  type="button"
                  onClick={() => setFiltro(FILTRO_INICIAL)}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-4">
              <Campo label="Buscar">
                <input
                  type="text"
                  placeholder="Origem, destino, empresa..."
                  value={filtro.busca}
                  onChange={(e) => set("busca", e.target.value)}
                  className={campoCls}
                />
              </Campo>

              <Campo label="Categoria">
                <select
                  value={filtro.categoriaId}
                  onChange={(e) => set("categoriaId", e.target.value)}
                  className={campoCls}
                >
                  <option value="">Todas</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome_categoria}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Origem">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    aria-label="UF de origem"
                    value={filtro.ufOrigem}
                    onChange={(e) => setUfOrigem(e.target.value)}
                    className={campoCls}
                  >
                    <option value="">UF</option>
                    {ufs.map((u) => (
                      <option key={u.sigla} value={u.sigla}>
                        {u.sigla}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Cidade de origem"
                    value={filtro.cidadeOrigem}
                    onChange={(e) => set("cidadeOrigem", e.target.value)}
                    disabled={!filtro.ufOrigem}
                    className={`col-span-2 ${campoCls} disabled:bg-slate-100 disabled:text-slate-400`}
                  >
                    <option value="">
                      {filtro.ufOrigem ? "Todas as cidades" : "Selecione a UF"}
                    </option>
                    {cidadesOrigem.map((m) => (
                      <option key={m.codigo_ibge} value={m.codigo_ibge}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </Campo>

              <Campo label="Destino">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    aria-label="UF de destino"
                    value={filtro.ufDestino}
                    onChange={(e) => setUfDestino(e.target.value)}
                    className={campoCls}
                  >
                    <option value="">UF</option>
                    {ufs.map((u) => (
                      <option key={u.sigla} value={u.sigla}>
                        {u.sigla}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Cidade de destino"
                    value={filtro.cidadeDestino}
                    onChange={(e) => set("cidadeDestino", e.target.value)}
                    disabled={!filtro.ufDestino}
                    className={`col-span-2 ${campoCls} disabled:bg-slate-100 disabled:text-slate-400`}
                  >
                    <option value="">
                      {filtro.ufDestino ? "Todas as cidades" : "Selecione a UF"}
                    </option>
                    {cidadesDestino.map((m) => (
                      <option key={m.codigo_ibge} value={m.codigo_ibge}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </Campo>

              <Campo label="Preço (R$)">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="mín"
                    value={filtro.precoMin}
                    onChange={(e) => set("precoMin", e.target.value)}
                    className={campoCls}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="máx"
                    value={filtro.precoMax}
                    onChange={(e) => set("precoMax", e.target.value)}
                    className={campoCls}
                  />
                </div>
              </Campo>

              <Campo label="Peso (kg)">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="mín"
                    value={filtro.pesoMin}
                    onChange={(e) => set("pesoMin", e.target.value)}
                    className={campoCls}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="máx"
                    value={filtro.pesoMax}
                    onChange={(e) => set("pesoMax", e.target.value)}
                    className={campoCls}
                  />
                </div>
              </Campo>
            </div>
          </div>
        </aside>

        {/* Lista de fretes */}
        <div className="flex-1">
          {loading ? (
            <p className="text-slate-500">Carregando fretes...</p>
          ) : fretes.length === 0 ? (
            <p className="text-slate-500">Nenhum frete cadastrado no momento.</p>
          ) : filtrados.length === 0 ? (
            <p className="text-slate-500">
              Nenhum frete encontrado para os filtros selecionados.
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm text-slate-500">
                {filtrados.length} frete(s) encontrado(s)
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Rota</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Peso</th>
                      <th className="px-4 py-3">Anunciante</th>
                      <th className="px-4 py-3 text-right">Preço</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {f.origem} <span className="text-slate-400">→</span>{" "}
                          {f.destino}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {f.categoria_nome}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatarPeso(f.peso)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {f.anunciante_nome}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-brand">
                          {formatarPreco(f.preco)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/fretes/${f.id}`}>
                            <Button variant="secondary">Ver</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
