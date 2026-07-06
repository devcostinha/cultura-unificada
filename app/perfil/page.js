"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { AREAS_ATUACAO, BAIRROS_ZONA_LESTE } from "@/lib/constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

const VAZIO = {
  nome_artistico: "",
  area_atuacao: AREAS_ATUACAO[0],
  coletivo: "",
  telefone: "",
  email: "",
  regiao_atuacao: BAIRROS_ZONA_LESTE[0],
};

export default function PerfilPage() {
  const { user, loading } = useRequireAuth();
  const [form, setForm] = useState(VAZIO);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [existe, setExiste] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!user) return;

    async function carregar() {
      const { data, error } = await supabase
        .from("artistas")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setForm({
          nome_artistico: data.nome_artistico || "",
          area_atuacao: data.area_atuacao || AREAS_ATUACAO[0],
          coletivo: data.coletivo || "",
          telefone: data.telefone || "",
          email: data.email || user.email,
          regiao_atuacao: data.regiao_atuacao || BAIRROS_ZONA_LESTE[0],
        });
        setExiste(true);
      } else {
        setForm((f) => ({ ...f, email: user.email }));
      }
      setCarregandoPerfil(false);
    }

    carregar();
  }, [user]);

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);

    const { error } = await supabase.from("artistas").upsert({
      id: user.id,
      ...form,
    });

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setExiste(true);
    setSucesso("Perfil salvo com sucesso!");
  }

  const linkPublico = user ? `/artistas/${user.id}` : "";

  function copiarLink() {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(`${window.location.origin}${linkPublico}`);
    setSucesso("Link do seu perfil público copiado!");
  }

  if (loading || carregandoPerfil) {
    return (
      <div className="container" style={{ padding: "64px 0" }}>
        <LoadingSpinner label="Carregando seu perfil…" />
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <h1 className="heading">Meu perfil de artista</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Esses dados aparecem na sua página pública e nos seus eventos
            cadastrados no Calendário Unificado.
          </p>
        </div>
      </div>

      {existe && (
        <div className={styles.shareBox}>
          <span>🔗 Seu perfil público:</span>
          <Link href={linkPublico}>{linkPublico}</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={copiarLink}>
            Copiar link
          </button>
        </div>
      )}

      {erro && <div className="form-error">{erro}</div>}
      {sucesso && <div className="form-success">{sucesso}</div>}

      <form onSubmit={handleSubmit} className={`card ${styles.formCard}`}>
        <div className="form-field">
          <label htmlFor="nome_artistico">Nome artístico</label>
          <input
            id="nome_artistico"
            required
            value={form.nome_artistico}
            onChange={(e) => handleChange("nome_artistico", e.target.value)}
            placeholder="Como você quer ser conhecido(a)?"
          />
        </div>

        <div className={styles.row2}>
          <div className="form-field">
            <label htmlFor="area_atuacao">Área de atuação</label>
            <select
              id="area_atuacao"
              value={form.area_atuacao}
              onChange={(e) => handleChange("area_atuacao", e.target.value)}
            >
              {AREAS_ATUACAO.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="regiao_atuacao">Região de atuação (Zona Leste)</label>
            <select
              id="regiao_atuacao"
              value={form.regiao_atuacao}
              onChange={(e) => handleChange("regiao_atuacao", e.target.value)}
            >
              {BAIRROS_ZONA_LESTE.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="coletivo">Representa algum coletivo? (opcional)</label>
          <input
            id="coletivo"
            value={form.coletivo}
            onChange={(e) => handleChange("coletivo", e.target.value)}
            placeholder="Nome do coletivo, se houver"
          />
        </div>

        <div className={styles.row2}>
          <div className="form-field">
            <label htmlFor="telefone">Telefone de contato</label>
            <input
              id="telefone"
              value={form.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              placeholder="(11) 90000-0000"
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">E-mail de contato</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={salvando}>
          {salvando ? "Salvando…" : existe ? "Atualizar perfil" : "Criar meu perfil"}
        </button>
      </form>
    </div>
  );
}
