"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { useRole } from "@/lib/useRole";
import NotificationBell from "@/components/NotificationBell";
import InstallButton from "@/components/InstallButton";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/artistas", label: "Artistas" },
  { href: "/calendario", label: "Calendário Unificado" },
  { href: "/mapa", label: "Mapeamento Cultural" },
  { href: "/editais", label: "Editais" },
  { href: "/sugestoes", label: "Sugestões" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className="gradient-text">Cultura Unificada</span>
        </Link>

        <nav className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {!loading && user && (
            <>
              <NotificationBell />
              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost btn-sm hide-mobile" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                  ⚙ Admin
                </Link>
              )}
              <Link href="/perfil" className="btn btn-ghost btn-sm hide-mobile">
                Meu Perfil
              </Link>
              <button type="button" className="btn btn-outline btn-sm hide-mobile" onClick={handleSignOut}>
                Sair
              </button>
            </>
          )}

          {!loading && !user && (
            <div className="hide-mobile" style={{ display: "flex", gap: "10px" }}>
              <Link href="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link href="/registro" className="btn btn-primary btn-sm">
                Registro
              </Link>
            </div>
          )}

          <InstallButton />

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobilePanel}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          {!loading && user && (
            <>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                  ⚙ Admin
                </Link>
              )}
              <Link href="/perfil" onClick={() => setMenuOpen(false)}>
                Meu Perfil
              </Link>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleSignOut}>
                Sair
              </button>
            </>
          )}

          {!loading && !user && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/registro" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Registro
              </Link>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
