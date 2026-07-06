import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>Cultura Unificada</div>
          <p className={styles.tagline}>
            Espaço dos artistas, coletivos e agentes culturais da Zona Leste.
            Calendário Unificado, Mapeamento Cultural e Editais Abertos —
            feito da quebrada, pra quebrada.
          </p>
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h4>Plataforma</h4>
            <Link href="/artistas">Artistas</Link>
            <Link href="/calendario">Calendário Unificado</Link>
            <Link href="/mapa">Mapeamento Cultural</Link>
            <Link href="/editais">Editais Abertos</Link>
          </div>
          <div className={styles.column}>
            <h4>Conta</h4>
            <Link href="/login">Login</Link>
            <Link href="/registro">Criar conta</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        © {ano} Cultura Unificada — feito para a cultura da Zona Leste.
      </div>
    </footer>
  );
}
