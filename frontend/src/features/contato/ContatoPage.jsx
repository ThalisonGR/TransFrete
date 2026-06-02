import { useState } from "react";
import { enviarContato } from "./contatoApi.js";
import Button from "../../shared/design-system/Button.jsx";
import Input from "../../shared/design-system/Input.jsx";
import Card from "../../shared/design-system/Card.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [fields, setFields] = useState({});
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validar() {
    const f = {};
    if (!form.nome.trim()) f.nome = "Informe o nome.";
    if (!EMAIL_REGEX.test(form.email.trim())) f.email = "Email invalido.";
    if (form.mensagem.trim().length <= 20) {
      f.mensagem = "A mensagem deve ter mais de 20 caracteres.";
    }
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
      await enviarContato({
        nome: form.nome.trim(),
        email: form.email.trim(),
        mensagem: form.mensagem.trim(),
      });
      setSucesso("Mensagem enviada com sucesso! Em breve retornaremos.");
      setForm({ nome: "", email: "", mensagem: "" });
    } catch (err) {
      setErro(err.message);
      if (err.fields) setFields(err.fields);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Card>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Fale conosco</h1>
        <p className="mb-6 text-sm text-slate-500">
          Tem alguma duvida ou sugestao? Envie uma mensagem.
        </p>
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
            id="nome"
            name="nome"
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
          />
          <Input
            as="textarea"
            id="mensagem"
            name="mensagem"
            label="Mensagem"
            rows={5}
            value={form.mensagem}
            onChange={onChange}
            error={fields.mensagem}
          />
          <Button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
