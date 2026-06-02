import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarCategorias, criarFrete } from "./fretesApi.js";
import MunicipioSelect from "./MunicipioSelect.jsx";
import Button from "../../shared/design-system/Button.jsx";
import Input from "../../shared/design-system/Input.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

export default function NovoFretePage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    categoria_id: "",
    origem_ibge: "",
    destino_ibge: "",
    peso: "",
    preco: "",
  });
  const [fields, setFields] = useState({});
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarCategorias();
        if (!ativo) return;
        setCategorias(lista);
        if (lista.length) {
          setForm((f) => ({ ...f, categoria_id: String(lista[0].id) }));
        }
      } catch (err) {
        if (ativo) setErro(err.message);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validar() {
    const f = {};
    if (!form.categoria_id) f.categoria_id = "Selecione a categoria.";
    if (!form.origem_ibge) f.origem_ibge = "Selecione o município de origem.";
    if (!form.destino_ibge) f.destino_ibge = "Selecione o município de destino.";
    if (!form.peso || Number(form.peso) <= 0) f.peso = "Peso invalido.";
    if (!form.preco || Number(form.preco) <= 0) f.preco = "Preco invalido.";
    return f;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    const validacao = validar();
    if (Object.keys(validacao).length) {
      setFields(validacao);
      return;
    }
    setFields({});
    setEnviando(true);
    try {
      const frete = await criarFrete({
        categoria_id: Number(form.categoria_id),
        origem_ibge: Number(form.origem_ibge),
        destino_ibge: Number(form.destino_ibge),
        peso: Number(form.peso),
        preco: Number(form.preco),
      });
      navigate(`/fretes/${frete.id}`, { replace: true });
    } catch (err) {
      setErro(err.message);
      if (err.fields) setFields(err.fields);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">
          Publicar novo frete
        </h1>
        {erro && (
          <Alert variant="error" className="mb-4">
            {erro}
          </Alert>
        )}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="categoria_id"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Categoria
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={form.categoria_id}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_categoria}
                </option>
              ))}
            </select>
            {fields.categoria_id && (
              <p className="mt-1 text-xs text-red-600">{fields.categoria_id}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MunicipioSelect
              label="Origem"
              onChange={(codigo) =>
                setForm((f) => ({ ...f, origem_ibge: codigo }))
              }
              error={fields.origem_ibge}
            />
            <MunicipioSelect
              label="Destino"
              onChange={(codigo) =>
                setForm((f) => ({ ...f, destino_ibge: codigo }))
              }
              error={fields.destino_ibge}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="peso"
              name="peso"
              type="number"
              step="0.01"
              min="0"
              label="Peso (kg)"
              value={form.peso}
              onChange={onChange}
              error={fields.peso}
            />
            <Input
              id="preco"
              name="preco"
              type="number"
              step="0.01"
              min="0"
              label="Preco (R$)"
              value={form.preco}
              onChange={onChange}
              error={fields.preco}
            />
          </div>

          <Button type="submit" disabled={enviando}>
            {enviando ? "Publicando..." : "Publicar frete"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
