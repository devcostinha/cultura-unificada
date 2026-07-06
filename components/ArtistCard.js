import Link from "next/link";
import styles from "./Cards.module.css";

export default function ArtistCard({ artista }) {
  return (
    <Link href={`/artistas/${artista.id}`} className="card" style={{ display: "block" }}>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{artista.nome_artistico}</h3>
        <span className="badge">{artista.area_atuacao}</span>
      </div>
      {artista.coletivo && (
        <div className={styles.metaRow}>🤝 Coletivo: {artista.coletivo}</div>
      )}
      <div className={styles.metaRow}>📍 {artista.regiao_atuacao}</div>
    </Link>
  );
}
