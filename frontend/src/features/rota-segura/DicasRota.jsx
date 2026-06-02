import { useState } from "react";
import { Link } from "react-router-dom";
import { buscarDicasRota } from "./geminiApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import Button from "../../shared/design-system/Button.jsx";
import Alert from "../../shared/design-system/Alert.jsx";

// Dicas de Rota Segura (Gemini). Endpoint exige sessao.
export default function DicasRota({ origem, destino }) {
  const { usuario } = useAuth();
  const [dicas, setDicas] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function onBuscar() {
    setErro("");
    setLoading(true);
    try {
      const texto = await buscarDicasRota(origem, destino);
      setDicas(texto);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">
        Dicas de Rota Segura
      </h2>

      {!usuario ? (
        <Alert variant="info">
          <Link to="/login" className="font-semibold underline">
            Entre
          </Link>{" "}
          para ver dicas de rota segura para este trajeto.
        </Alert>
      ) : (
        <>
          {erro && <Alert variant="error">{erro}</Alert>}
          {dicas ? (
            <div className="whitespace-pre-line rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {dicas}
            </div>
          ) : (
            <Button variant="secondary" onClick={onBuscar} disabled={loading}>
              {loading ? "Consultando IA..." : "Gerar dicas para esta rota"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
