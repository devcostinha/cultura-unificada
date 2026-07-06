"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./FlyerCarousel.module.css";

const PAGE_SIZE = 6;

// Dois dias atrás — eventos mais velhos que isso não aparecem mais
function limiteData() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

export default function FlyerCarousel() {
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const trackRef = useRef(null);

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
      .channel("flyer-carousel-landing")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => {
        carregar();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const temMais = eventos.length < total;

  // Não mostra a seção se não tiver nenhum evento
  if (!carregando && eventos.length === 0) return null;

  return (
    <section className={styles.wrap}>
      <div className="container">
        <div className={styles.cabecalho}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              O que tá rolando
            </h2>
            <p className="text-muted" style={{ margin: 0 }}>
              Eventos da comunidade — desliza pra ver mais
            </p>
          </div>
        </div>

        <div className={styles.scrollTrack} ref={trackRef}>
          {carregando
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`${styles.flyerCard} skeleton`} />
              ))
            : eventos.map((ev) => <FlyerCard key={ev.id} evento={ev} />)}

          {!carregando && temMais && (
            <Link href="/eventos" className={styles.verMaisCard}>
              <span className={styles.verMaisIcone}>→</span>
              <span>Ver todos</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Card individual do flyer
// ─────────────────────────────────────────────────────────────
const ICONES_CATEGORIA = {
  Música: "🎵",
  Dança: "💃",
  Teatro: "🎭",
  "Artes Visuais": "🎨",
  Literatura: "📖",
  Audiovisual: "🎬",
  Circo: "🎪",
  Grafite: "🖌️",
  "Cultura Hip-Hop": "🎤",
  Sarau: "🎙️",
};

function FlyerCard({ evento }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const passado = evento.data_evento < hoje;

  // Formata a data de forma amigável
  let dataLabel = evento.data_evento;
  try {
    const [y, m, d] = evento.data_evento.split("-").map(Number);
    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    dataLabel = `${d} de ${meses[m - 1]}`;
  } catch {}

  const icone = ICONES_CATEGORIA[evento.categoria] || "🔥";

  return (
    <div className={`${styles.flyerCard} ${passado ? styles.passado : ""}`}>
      {evento.imagem_url ? (
        <img
          src={evento.imagem_url}
          alt={evento.titulo}
          className={styles.flyerImg}
          loading="lazy"
        />
      ) : (
        // Placeholder visual quando não tem imagem
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcone}>{icone}</span>
          <span className={styles.placeholderTitulo}>{evento.titulo}</span>
          <span className={styles.placeholderCategoria}>{evento.categoria}</span>
        </div>
      )}

      {/* Gradiente + info por cima da imagem */}
      <div className={styles.overlay}>
        {passado && (
          <span className={styles.badgePassado}>Já rolou</span>
        )}
        <span className={styles.dataLabel}>{dataLabel}</span>
        <strong className={styles.tituloOverlay}>{evento.titulo}</strong>
        <span className={styles.localOverlay}>{evento.local} · {evento.bairro}</span>
      </div>
    </div>
  );
}
