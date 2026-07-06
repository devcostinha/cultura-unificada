import styles from "./Cards.module.css";

function formatarData(dataIso) {
  if (!dataIso) return "Sem prazo definido";
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function EditalCard({ edital }) {
  return (
    <div className="card-gradient-border">
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{edital.titulo}</h3>
        <span className="badge-outline" style={{ borderRadius: 999, padding: "4px 12px", fontSize: "0.72rem" }}>
          {edital.subcategoria ? `${edital.categoria} · ${edital.subcategoria}` : edital.categoria}
        </span>
      </div>
      {edital.entidade_responsavel && (
        <div className={styles.metaRow}>🏛️ {edital.entidade_responsavel}</div>
      )}
      <div className={styles.metaRow}>⏳ Prazo: {formatarData(edital.prazo)}</div>
      {edital.descricao && <p style={{ fontSize: "0.92rem" }}>{edital.descricao}</p>}
      {edital.link && (
        <div className={styles.footerRow}>
          <a
            href={edital.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Acessar edital ↗
          </a>
        </div>
      )}
    </div>
  );
}
