import styles from "./Cards.module.css";

function formatarData(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function EventCard({ evento }) {
  return (
    <div className="card">
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{evento.titulo}</h3>
        <span className="badge">{evento.categoria}</span>
      </div>
      <div className={styles.metaRow}>
        📅 {formatarData(evento.data_evento)}
        {evento.horario ? ` às ${evento.horario.slice(0, 5)}` : ""}
      </div>
      <div className={styles.metaRow}>
        📍 {evento.local}
        {evento.bairro ? ` · ${evento.bairro}` : ""}
      </div>
      {evento.descricao && <p style={{ fontSize: "0.92rem" }}>{evento.descricao}</p>}
      {evento.link && (
        <a
          href={evento.link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          Mais informações ↗
        </a>
      )}
    </div>
  );
}
