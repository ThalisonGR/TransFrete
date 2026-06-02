import { createContext, useContext, useEffect, useState } from "react";
import {
  loginRequest,
  cadastroRequest,
  logoutRequest,
  meRequest,
} from "./authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // No mount: reidrata a sessao via GET /me.php.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const u = await meRequest();
        if (ativo) setUsuario(u);
      } catch {
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  async function login(credenciais) {
    const u = await loginRequest(credenciais);
    setUsuario(u);
    return u;
  }

  async function cadastro(dados) {
    const u = await cadastroRequest(dados);
    setUsuario(u);
    return u;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUsuario(null);
    }
  }

  const value = { usuario, loading, login, cadastro, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  return ctx;
}
