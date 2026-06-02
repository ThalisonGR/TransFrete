import { useState } from "react";
import { Link } from "react-router-dom";
import { candidatar } from "./propostasApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import Button from "../../shared/design-system/Button.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

// Botao de candidatura a um frete. Condicionado a motorista logado.
// Trata os erros do contrato: NO_VEHICLE (403), DUPLICATE_PROPOSAL (409).
export default function CandidatarButton({ freteId }) {
  const { usuario } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | enviando | feito
  const [erro, setErro] = useState("");
  const [codigo, setCodigo] = useState("");

  if (!usuario) {
    return (
      <Alert variant="info">
        <Link to="/login" className="font-semibold underline">
          Entre como motorista
        </Link>{" "}
        para se candidatar a este frete.
      </Alert>
    );
  }

  if (usuario.tipo_usuario !== "motorista") {
    return (
      <Alert variant="info">
        Apenas motoristas podem se candidatar a fretes.
      </Alert>
    );
  }

  async function onClick() {
    setErro("");
    setCodigo("");
    setStatus("enviando");
    try {
      await candidatar(freteId);
      setStatus("feito");
    } catch (err) {
      setStatus("idle");
      setErro(err.message);
      setCodigo(err.code);
    }
  }

  if (status === "feito") {
    return (
      <Alert variant="success">
        Candidatura enviada! Status: pendente.
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {erro && (
        <Alert variant="error">
          {erro}
          {codigo === "NO_VEHICLE" && (
            <>
              {" "}
              <Link to="/meus-veiculos" className="font-semibold underline">
                Cadastrar veiculo
              </Link>
            </>
          )}
        </Alert>
      )}
      <Button onClick={onClick} disabled={status === "enviando"} className="w-full">
        {status === "enviando" ? "Enviando..." : "Candidatar-se a este frete"}
      </Button>
    </div>
  );
}
