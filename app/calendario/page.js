"use client";

import { useEffect, useMemo, useState } from "react";
import { isSameDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { AREAS_ATUACAO, BAIRROS_ZONA_LESTE, PERIODOS_FILTRO } from "@/lib/constants";
import CalendarGrid from "@/components/CalendarGrid";
import EventCard from "@/components/EventCard";
import EventFormModal from "@/components/EventFormModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

export default function CalendarioPage() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [viewMode, setViewMode] = useState("calendario");
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroBairro, setFiltroBairro] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");

  async function carregarEventos() {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data_evento", { ascending: true });

    if (!error) setEventos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregarEventos();

    // Realtime: evento cadastrado em qualquer dispositivo aparece aqui
    // instantaneamente, sem precisar recarregar a página.
    const channel = supabase
      .channel("calendario-eventos")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => {
        carregarEventos();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const eventosFiltrados = useMemo(() => {
    const agora = new Date();
    const limite = new Date();
    if (filtroPeriodo === "semana") limite.setDate(agora.getDate() + 7);
    if (filtroPeriodo === "mes") limite.setDate(agora.getDate() + 30);

    return eventos.filter((ev) => {
      const okCategoria = filtroCategoria === "todas" || ev.categoria === filtroCategoria;
      const okBairro = filtroBairro === "todos" || ev.bairro === filtroBairro;
      let okPeriodo = true;
      if (filtroPeriodo !== "todos") {
        const dataEv = new Date(`${ev.data_evento}T00:00:00`);
        okPeriodo = dataEv >= new Date(agora.toDateString()) && dataEv <= limite;
      }
      return okCategoria && okBairro && okPeriodo;
    });
  }, [eventos, filtroCategoria, filtroBairro, filtroPeriodo]);

  const eventosDoDiaSelecionado = useMemo(() => {
    if (!diaSelecionado) return [];
    return eventosFiltrados.filter((ev) =>
      isSameDay(new Date(`${ev.data_evento}T00:00:00`), diaSelecionado)
    );
  }, [eventosFiltrados, diaSelecionado]);

  const eventosAgrupadosPorData = useMemo(() => {
    const grupos = {};
    eventosFiltrados.forEach((ev) => {
      grupos[ev.data_evento] = grupos[ev.data_evento] || [];
      grupos[ev.data_evento].push(ev);
    });
    return Object.entries(grupos).sort(([a], [b]) => (a > b ? 1 : -1));
  }, [eventosFiltrados]);

  function handleAdicionarClick() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setModalAberto(true);
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <h1 className="heading">Calendário Unificado</h1>
          <p className="text-muted" style={{ margin: 0, maxWidth: 600 }}>
            Todos os eventos culturais da Zona Leste em um só calendário,
            cadastrados pela própria comunidade e atualizados em tempo real.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdicionarClick}>
          + Adicionar evento
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={viewMode === "calendario" ? styles.active : ""}
            onClick={() => setViewMode("calendario")}
          >
            📅 Calendário
          </button>
          <button
            type="button"
            className={viewMode === "lista" ? styles.active : ""}
            onClick={() => setViewMode("lista")}
          >
            📋 Lista
          </button>
        </div>

        <div className={styles.filters}>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="todas">Todas as áreas</option>
            {AREAS_ATUACAO.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)}>
            <option value="todos">Todos os bairros</option>
            {BAIRROS_ZONA_LESTE.map((bairro) => (
              <option key={bairro} value={bairro}>
                {bairro}
              </option>
            ))}
          </select>

          <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
            {PERIODOS_FILTRO.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {carregando ? (
        <LoadingSpinner label="Carregando eventos…" />
      ) : viewMode === "calendario" ? (
        <div className={styles.calendarLayout}>
          <div className="card">
            <CalendarGrid
              mes={mesAtual}
              eventos={eventosFiltrados}
              diaSelecionado={diaSelecionado}
              onMudarMes={setMesAtual}
              onSelecionarDia={setDiaSelecionado}
            />
          </div>
          <div>
            <div className={styles.dayPanelTitle}>
              {diaSelecionado
                ? format(diaSelecionado, "d 'de' MMMM", { locale: ptBR })
                : "Selecione um dia"}
            </div>
            {diaSelecionado && eventosDoDiaSelecionado.length === 0 && (
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                Nenhum evento neste dia.
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {eventosDoDiaSelecionado.map((ev) => (
                <EventCard key={ev.id} evento={ev} />
              ))}
            </div>
          </div>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="empty-state card">Nenhum evento encontrado com esses filtros.</div>
      ) : (
        eventosAgrupadosPorData.map(([data, evs]) => (
          <div key={data} className={styles.listGroup}>
            <div className={styles.listGroupTitle}>
              {format(new Date(`${data}T00:00:00`), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="grid-3">
              {evs.map((ev) => (
                <EventCard key={ev.id} evento={ev} />
              ))}
            </div>
          </div>
        ))
      )}

      {modalAberto && (
        <EventFormModal
          user={user}
          onClose={() => setModalAberto(false)}
          onCreated={carregarEventos}
        />
      )}
    </div>
  );
}
