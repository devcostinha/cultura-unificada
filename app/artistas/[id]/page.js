"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

export default function PerfilPublicoArtistaPage() {
  const { id } = useParams();
  const [artista, setArtista] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: artistaData, error } = await supabase
        .from("artistas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !artistaData) {
        setNaoEncontrado(true);
        setCarregando(false);
        return;
      }

      setArtista(artistaData);

      const { data: eventosData } = await supabase
        .from("eventos")
        .select("*")
        .eq("user_id", id)
        .order("data_evento", { ascending: false });

      setEventos(eventosData || []);
      setCarregando(false);
    }

    if (id) carregar();
  }, [id]);

  if (carregando) {
    return (
      <div className="container" style={{ padding: "64px 0" }}>
        <LoadingSpinner label="Carregando perfil…" />
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <div className="container" style={{ padding: "64px 0" }}>
        <div className="empty-state card">Este perfil de artista não existe.</div>
      </div>
    );
  }

  const inicial = artista.nome_artistico?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <div className={styles.headTop}>
          <div className={styles.avatar}>{inicial}</div>
          <div>
            <h1 className="heading" style={{ marginBottom: 4 }}>
              {artista.nome_artistico}
            </h1>
            <span className="badge">{artista.area_atuacao}</span>
          </div>
        </div>
      </div>

      {artista.coletivo && (
        <p>
          🤝 Representa o coletivo <strong>{artista.coletivo}</strong>
        </p>
      )}
      <p className="text-muted">📍 Atua em {artista.regiao_atuacao}, Zona Leste</p>

      <div className={`card ${styles.contactList}`}>
        {artista.email && <span>✉️ {artista.email}</span>}
        {artista.telefone && <span>📞 {artista.telefone}</span>}
      </div>

      <h2 className="section-title" style={{ marginTop: 48, fontSize: "1.4rem" }}>
        Eventos no Calendário Unificado
      </h2>

      {eventos.length === 0 ? (
        <div className="empty-state card">
          Este artista ainda não cadastrou eventos no Calendário Unificado.
        </div>
      ) : (
        <div className="grid-3">
          {eventos.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  );
}
