"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import EventFormModal from "@/components/EventFormModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

const PAGE_SIZE = 18;

function limiteData() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

const ICONES_CATEGORIA = {
  Música: "🎵", Dança: "💃", Teatro: "🎭", "Artes Visuais": "🎨",
  Literatura: "📖", Audiovisual: "🎬", Circo: "🎪", Grafite: "🖌️",
  "Cultura Hip-Hop": "🎤", Sarau: "🎙️",
};

export default function EventosPage() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar(acumular = false) {
    const from = acumular ? eventos.length : 0;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("eventos")
      .select("*", { count: "exact" })
      .gte("data_evento", limiteData())
      .order("data_evento", { ascending: true })
      .range(from, to);

    if (!error) {
      setEventos((prev) => (acumular ? [...prev, ...(data || [])] : data || []));
      setTotal(count || 0);
    }
    setCarregando(false);
    setCarregandoMais(false);
  }

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("eventos-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => {
        carregar();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdicionarClick() {
    if (!user) { window.location.href = "/login"; return; }
    setModalAberto(true);
  }

  const temMais = eventos.length < total;

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <div>
          <h1 className="heading">O que tá rolando</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Todos os eventos da comunidade — {total} no ar
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdicionarClick}>
          + Adicionar evento
        </button>
      </div>

      {carregando ? (
        <LoadingSpinner label="Carregando eventos…" />
      ) : eventos.length === 0 ? (
        <div className="empty-state card">
          <p>Nenhum evento cadastrado ainda.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleAdicionarClick}>
            Bora cadastrar o primeiro
          </button>
        </div>
      ) : (
        <>
          <div className={styles.grade}>
            {eventos.map((ev) => (
              <FlyerCardGrande key={ev.id} evento={ev} />
            ))}
          </div>

          {temMais && (
            <div className={styles.verMaisWrap}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={carregandoMais}
                onClick={() => { setCarregandoMais(true); carregar(true); }}
              >
                {carregandoMais ? "Carregando…" : `Ver mais (${total - eventos.length} restantes)`}
              </button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <EventFormModal
          user={user}
          onClose={() => setModalAberto(false)}
          onCreated={() => carregar()}
        />
      )}
    </div>
  );
}

function FlyerCardGrande({ evento }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const passado = evento.data_evento < hoje;
  const icone = ICONES_CATEGORIA[evento.categoria] || "🔥";

  let dataLabel = evento.data_evento;
  try {
    const [y, m, d] = evento.data_evento.split("-").map(Number);
    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    const hora = evento.horario ? ` · ${evento.horario.slice(0,5)}` : "";
    dataLabel = `${d} de ${meses[m - 1]}${hora}`;
  } catch {}

  return (
    <div className={`${styles.card} ${passado ? styles.passado : ""}`}>
      {evento.imagem_url ? (
        <img src={evento.imagem_url} alt={evento.titulo} className={styles.cardImg} loading="lazy" />
      ) : (
        <div className={styles.cardPlaceholder}>
          <span className={styles.placeholderIcone}>{icone}</span>
          <span className={styles.placeholderTitulo}>{evento.titulo}</span>
          <span className={styles.placeholderCat}>{evento.categoria}</span>
        </div>
      )}

      <div className={styles.cardOverlay}>
        {passado && <span className={styles.badgePassado}>Já rolou</span>}
        <span className={styles.dataLabel}>{dataLabel}</span>
        <strong className={styles.tituloOverlay}>{evento.titulo}</strong>
        <span className={styles.localOverlay}>{evento.local} · {evento.bairro}</span>
        {evento.link && (
          <a
            href={evento.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkOverlay}
          >
            Ver mais info →
          </a>
        )}
      </div>
    </div>
  );
}
