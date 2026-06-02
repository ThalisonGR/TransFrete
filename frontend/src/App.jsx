import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./shared/layout/Navbar.jsx";
import ProtectedRoute from "./shared/routing/ProtectedRoute.jsx";

import HomePage from "./features/fretes/HomePage.jsx";
import DetalheFretePage from "./features/fretes/DetalheFretePage.jsx";
import NovoFretePage from "./features/fretes/NovoFretePage.jsx";
import MeusFretesPage from "./features/fretes/MeusFretesPage.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import CadastroPage from "./features/auth/CadastroPage.jsx";
import MeusVeiculosPage from "./features/veiculos/MeusVeiculosPage.jsx";
import MinhasCandidaturasPage from "./features/propostas/MinhasCandidaturasPage.jsx";
import ContatoPage from "./features/contato/ContatoPage.jsx";

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-800">404</h1>
      <p className="mt-2 text-slate-500">Pagina nao encontrada.</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-brand">
        Voltar para o inicio
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fretes/:id" element={<DetalheFretePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/contato" element={<ContatoPage />} />

          <Route
            path="/fretes/novo"
            element={
              <ProtectedRoute tipo="anunciante">
                <NovoFretePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-fretes"
            element={
              <ProtectedRoute tipo="anunciante">
                <MeusFretesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-veiculos"
            element={
              <ProtectedRoute tipo="motorista">
                <MeusVeiculosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minhas-candidaturas"
            element={
              <ProtectedRoute tipo="motorista">
                <MinhasCandidaturasPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        TransFrete &copy; 2026 - Projeto academico Web II
      </footer>
    </div>
  );
}
