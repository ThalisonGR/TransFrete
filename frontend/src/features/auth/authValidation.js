// Validacoes que espelham o backend (Contrato da API).

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email) {
  if (!email || !email.trim()) return "Informe o email.";
  if (!EMAIL_REGEX.test(email.trim())) return "Email invalido.";
  return null;
}

export function validarSenha(senha) {
  if (!senha) return "Informe a senha.";
  if (senha.length < 6) return "A senha deve ter no minimo 6 caracteres.";
  return null;
}

export function validarNome(nome) {
  if (!nome || !nome.trim()) return "Informe o nome.";
  return null;
}

export function validarLogin({ email, senha }) {
  const fields = {};
  const emailErr = validarEmail(email);
  const senhaErr = validarSenha(senha);
  if (emailErr) fields.email = emailErr;
  if (senhaErr) fields.senha = senhaErr;
  return fields;
}

export function validarCadastro({ nome, email, senha, tipo_usuario }) {
  const fields = {};
  const nomeErr = validarNome(nome);
  const emailErr = validarEmail(email);
  const senhaErr = validarSenha(senha);
  if (nomeErr) fields.nome = nomeErr;
  if (emailErr) fields.email = emailErr;
  if (senhaErr) fields.senha = senhaErr;
  if (tipo_usuario !== "motorista" && tipo_usuario !== "anunciante") {
    fields.tipo_usuario = "Selecione o tipo de usuario.";
  }
  return fields;
}
