import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { validarCadastro } from "./authValidation.js";
import Button from "../../shared/design-system/Button.jsx";
import Input from "../../shared/design-system/Input.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

export default function CadastroPage() {
  const { cadastro } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo_usuario: "motorista",
  });
  const [fields, setFields] = useState({});
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    const validacao = validarCadastro(form);
    if (Object.keys(validacao).length) {
      setFields(validacao);
      return;
    }
    setFields({});
    setEnviando(true);
    try {
      await cadastro(form);
      navigate("/", { replace: true });
    } catch (err) {
      setErro(err.message);
      if (err.fields) setFields(err.fields);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Criar conta</h1>
        {erro && (
          <Alert variant="error" className="mb-4">
            {erro}
          </Alert>
        )}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            id="nome"
            name="nome"
            type="text"
            label="Nome"
            value={form.nome}
            onChange={onChange}
            error={fields.nome}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={onChange}
            error={fields.email}
            autoComplete="email"
          />
          <Input
            id="senha"
            name="senha"
            type="password"
            label="Senha"
            value={form.senha}
            onChange={onChange}
            error={fields.senha}
            autoComplete="new-password"
          />
          <div>
            <label
              htmlFor="tipo_usuario"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Tipo de usuario
            </label>
            <select
              id="tipo_usuario"
              name="tipo_usuario"
              value={form.tipo_usuario}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="motorista">Motorista</option>
              <option value="anunciante">Anunciante</option>
            </select>
            {fields.tipo_usuario && (
              <p className="mt-1 text-xs text-red-600">{fields.tipo_usuario}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Ja tem conta?{" "}
          <Link to="/login" className="font-semibold text-brand">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
