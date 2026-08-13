import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider as UrqlProvider } from "urql";
import { anilistClient } from "./lib/anilist";
import { AuthProvider, useAuth } from "./lib/auth";
import AppShell from "./components/AppShell";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Discover from "./pages/Discover";
import Journal from "./pages/Journal";
import Archive from "./pages/Archive";
import "./index.css";

function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-display text-2xl text-rose">hoshii</p>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UrqlProvider value={anilistClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route
              element={
                <Protected>
                  <AppShell />
                </Protected>
              }
            >
              <Route index element={<Home />} />
              <Route path="library" element={<Library />} />
              <Route path="discover" element={<Discover />} />
              <Route path="journal" element={<Journal />} />
              <Route path="archive" element={<Archive />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </UrqlProvider>
  </StrictMode>
);
