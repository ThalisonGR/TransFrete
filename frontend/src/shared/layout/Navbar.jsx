import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext.jsx";
import Button from "../design-system/Button.jsx";

function navClass({ isActive }) {
  return `text-sm font-medium transition-colors ${
    isActive ? "text-brand" : "text-slate-600 hover:text-brand"
  }`;
}

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold text-brand">
          TransFrete
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <NavLink to="/" className={navClass} end>
            Fretes
          </NavLink>

          {usuario?.tipo_usuario === "anunciante" && (
            <>
              <NavLink to="/meus-fretes" className={navClass}>
                Meus Fretes
              </NavLink>
              <NavLink to="/fretes/novo" className={navClass}>
                Publicar Frete
              </NavLink>
            </>
          )}

          {usuario?.tipo_usuario === "motorista" && (
            <>
              <NavLink to="/minhas-candidaturas" className={navClass}>
                Minhas Candidaturas
              </NavLink>
              <NavLink to="/meus-veiculos" className={navClass}>
                Meus Veiculos
              </NavLink>
            </>
          )}

          <NavLink to="/contato" className={navClass}>
            Contato
          </NavLink>

          {usuario ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">
                Ola, {usuario.nome}
              </span>
              <Button variant="secondary" onClick={onLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
