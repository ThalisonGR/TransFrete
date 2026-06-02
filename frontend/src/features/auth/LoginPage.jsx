import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { validarLogin } from "./authValidation.js";
import Button from "../../shared/design-system/Button.jsx";
import Input from "../../shared/design-system/Input.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", senha: "" });
  const [fields, setFields] = useState({});
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    const validacao = validarLogin(form);
    if (Object.keys(validacao).length) {
      setFields(validacao);
      return;
    }
    setFields({});
    setEnviando(true);
    try {
      await login(form);
      navigate(destino, { replace: true });
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
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Entrar</h1>
        {erro && (
          <Alert variant="error" className="mb-4">
            {erro}
          </Alert>
        )}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Nao tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-brand">
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
