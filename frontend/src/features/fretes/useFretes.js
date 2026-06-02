import { useEffect, useState } from "react";
import { listarFretes } from "./fretesApi.js";

// Hook de listagem de fretes (GET /fretes.php).
export function useFretes() {
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    (async () => {
      setLoading(true);
      setErro("");
      try {
        const lista = await listarFretes();
        if (ativo) setFretes(lista);
      } catch (err) {
        if (ativo) setErro(err.message);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return { fretes, loading, erro };
}
