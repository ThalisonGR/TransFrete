import { useState } from "react";
import { cadastrarVeiculo } from "./veiculosApi.js";
import Button from "../../shared/design-system/Button.jsx";
import Input from "../../shared/design-system/Input.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

//const PLACA_REGEX = /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/; // Mercosul ou antiga

export default function MeusVeiculosPage() {
  const [form, setForm] = useState({ modelo: "", placa: "" });
  const [fields, setFields] = useState({});
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  // O contrato expoe apenas POST /veiculo.php; acumulamos os cadastrados na sessao.
  const [veiculos, setVeiculos] = useState([]);

  function onChange(e) {
    const value =
      e.target.name === "placa"
        ? e.target.value.toUpperCase()
        : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  function validar() {
    const f = {};
    if (!form.modelo.trim()) f.modelo = "Informe o modelo.";
    // if (!PLACA_REGEX.test(form.placa.trim())) f.placa = "Placa invalida.";
    return f;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    const validacao = validar();
    if (Object.keys(validacao).length) {
      setFields(validacao);
      return;
    }
    setFields({});
    setEnviando(true);
    try {
      const veiculo = await cadastrarVeiculo({
        modelo: form.modelo.trim(),
        placa: form.placa.trim(),
      });
      setVeiculos((lista) => [...lista, veiculo]);
      setForm({ modelo: "", placa: "" });
      setSucesso("Veiculo cadastrado com sucesso!");
    } catch (err) {
      setErro(err.message);
      if (err.fields) setFields(err.fields);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Meus veiculos</h1>

      <Card className="mb-6">
        {erro && (
          <Alert variant="error" className="mb-4">
            {erro}
          </Alert>
        )}
        {sucesso && (
          <Alert variant="success" className="mb-4">
            {sucesso}
          </Alert>
        )}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            id="modelo"
            name="modelo"
            label="Modelo"
            placeholder="Mercedes Atego"
            value={form.modelo}
            onChange={onChange}
            error={fields.modelo}
          />
          <Input
            id="placa"
            name="placa"
            label="Placa"
            placeholder="ABC1D23"
            maxLength={7}
            value={form.placa}
            onChange={onChange}
            error={fields.placa}
          />
          <Button type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar veiculo"}
          </Button>
        </form>
      </Card>

      {veiculos.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-700">
            Cadastrados nesta sessao
          </h2>
          {veiculos.map((v) => (
            <Card key={v.id} className="flex items-center justify-between py-3">
              <span className="font-medium text-slate-800">{v.modelo}</span>
              <span className="rounded bg-slate-100 px-2 py-1 text-sm font-mono text-slate-600">
                {v.placa}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
