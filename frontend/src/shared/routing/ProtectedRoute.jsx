import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext.jsx";

// Protege rotas que exigem sessao. Opcionalmente restringe por tipo_usuario.
export default function ProtectedRoute({ children, tipo }) {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (tipo && usuario.tipo_usuario !== tipo) {
    return <Navigate to="/" replace />;
  }

  return children;
}
