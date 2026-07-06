"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import EventCard from "@/components/EventCard";
import FlyerCarousel from "@/components/FlyerCarousel";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

const PILARES = [
  {
    icon: "🧑‍🎨",
    title: "Cadastro de Artistas",
    desc: "Sobe seu perfil como artista ou agente cultural da Zona Leste. Sua história, seu trabalho, na internet — do jeito que você quer contar.",
  },
  {
    icon: "📅",
    title: "Calendário Unificado",
    desc: "Tudo que rola na região, num calendário só. A comunidade atualiza em tempo real — você não perde nenhum rolê.",
  },
  {
    icon: "🗺️",
    title: "Mapeamento Cultural",
    desc: "Saraus, coletivos, espaços e projetos da Zona Leste marcados no mapa. Acha o que é perto de você, filtra por bairro e tipo.",
  },
  {
    icon: "📜",
    title: "Editais Abertos",
    desc: "Editais federais, estaduais, municipais e de empresa privada, organizados por categoria. Não perde mais prazo de inscrição.",
  },
];

export default function LandingPage() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function carregarProximosEventos() {
      const hoje = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .gte("data_evento", hoje)
        .order("data_evento", { ascending: true })
        .limit(3);

      if (!error && isMounted) {
        setEventos(data || []);
      }
      if (isMounted) setCarregando(false);
    }

    carregarProximosEventos();

    // Realtime: se alguém cadastrar um evento enquanto a landing está
    // aberta, a seção "Próximos eventos" atualiza sozinha.
    const channel = supabase
      .channel("landing-proximos-eventos")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => {
        carregarProximosEventos();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <span className={styles.heroEyebrow}>🔥 Da quebrada pra quebrada — Zona Leste SP</span>
            <h1 className={styles.heroTitle}>
              Aqui é a Zona Leste. Aqui tem cultura.
            </h1>
            <p className={styles.heroSubtitle}>
              Sobe seu perfil de artista, divulga seus eventos no Calendário
              Unificado, marca seu projeto no mapa e corre atrás dos editais
              — tudo num lugar só, feito pelas pessoas da quebrada, pra todo
              mundo da Zona Leste.
            </p>
            <div className={styles.heroActions}>
              <Link href="/registro" className="btn btn-primary">
                Criar minha conta
              </Link>
              <Link href="/calendario" className="btn btn-ghost" style={{ background: "rgba(255,246,238,0.15)", color: "#fff6ee", borderColor: "rgba(255,246,238,0.4)" }}>
                Ver Calendário Unificado
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">O que tem aqui</h2>
          <p className="section-subtitle">
            Quatro ferramentas feitas pra quem faz cultura na Zona Leste
            — do cadastro ao palco, da rua ao edital.
          </p>
          <div className="grid-4">
            {PILARES.map((pilar) => (
              <div key={pilar.title} className="card">
                <span className={styles.pillarIcon}>{pilar.icon}</span>
                <h3 style={{ fontSize: "1.05rem" }}>{pilar.title}</h3>
                <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: 0 }}>
                  {pilar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS (sugestão de melhoria 4) */}
      <section className="section gradient-bg-soft">
        <div className="container">
          <div className={styles.eventsHeader}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                Próximos rolês no Calendário Unificado
              </h2>
              <p className="text-muted" style={{ margin: 0 }}>
                A comunidade atualiza em tempo real — você não precisa
                recarregar nada.
              </p>
            </div>
            <Link href="/calendario" className="btn btn-outline btn-sm">
              Ver calendário completo
            </Link>
          </div>

          {carregando ? (
            <LoadingSpinner label="Carregando próximos eventos…" />
          ) : eventos.length === 0 ? (
            <div className="empty-state card">
              <p>Nenhum evento futuro cadastrado ainda.</p>
              <Link href="/registro" className="btn btn-primary btn-sm">
                Bora cadastrar o primeiro
              </Link>
            </div>
          ) : (
            <div className="grid-3">
              {eventos.map((evento) => (
                <EventCard key={evento.id} evento={evento} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MISSÃO */}
      <section className="section">
        <div className="container">
          <div className={styles.missionBlock}>
            <h2 className="section-title">
              Cultura que nasce e se{" "}
              <span className="gradient-text">multiplica na Zona Leste</span>
            </h2>
            <p style={{ maxWidth: 680, fontSize: "1.02rem" }}>
              A Zona Leste de São Paulo é um dos territórios mais ricos em
              produção cultural da cidade — saraus, coletivos, escolas de
              dança, teatro de rua, audiovisual independente e muito mais.
              O Cultura Unificada existe pra dar visibilidade pra esse
              ecossistema, conectar artistas e agentes culturais, e abrir
              caminho pra oportunidades como editais e eventos. Feito da
              quebrada, pra quebrada.
            </p>
          </div>
        </div>
      </section>

      {/* CARROSSEL DE FLYERS */}
      <FlyerCarousel />

      {/* CTA FINAL */}
      <section className="section">
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className="section-title" style={{ color: "inherit" }}>
              Entra no Cultura Unificada
            </h2>
            <p style={{ maxWidth: 520, margin: "0 auto 28px", opacity: 0.92 }}>
              Cria sua conta, monta seu perfil de artista e começa a
              divulgar seus eventos e projetos hoje mesmo. De graça.
            </p>
            <Link href="/registro" className="btn" style={{ background: "#fff6ee", color: "var(--color-primary)" }}>
              Criar minha conta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
