"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRole } from "@/lib/useRole";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

const CATEGORIAS = ["Todas", "Gestão Cultural", "Produção Cultural", "Legislação", "Tecnologia", "Comunicação", "Artes", "Outro"];
const FORMATOS   = ["Todos", "Online", "Presencial", "Híbrido"];

export default function CursosPage() {
  const { isAdmin } = useRole();
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState("Todas");
  const [formato, setFormato] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar() {
    const { data } = await supabase
      .from("cursos")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: false });
    setCursos(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = cursos.filter((c) => {
    const okCat = categoria === "Todas" || c.categoria === categoria;
    const okFmt = formato === "Todos" || c.formato === formato;
    return okCat && okFmt;
  });

  if (carregando) return <LoadingSpinner label="Carregando cursos…" />;

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <h1 className="heading">Cursos</h1>
          <p className="text-muted">Capacitação gratuita para artistas e gestores culturais da Zona Leste.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
            + Novo curso
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.filtroGrupo}>
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.filtroBtn} ${categoria === c ? styles.ativo : ""}`}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className={styles.filtroGrupo}>
          {FORMATOS.map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.filtroBtn} ${formato === f ? styles.ativo : ""}`}
              onClick={() => setFormato(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 && (
        <div className={styles.vazio}>
          <p>Nenhum curso encontrado com esses filtros.</p>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            Em breve teremos mais cursos disponíveis. Se conhece algum, manda uma sugestão!
          </p>
        </div>
      )}

      <div className={styles.grid}>
        {filtrados.map((curso) => (
          <CursoCard key={curso.id} curso={curso} isAdmin={isAdmin} onAtualizar={carregar} />
        ))}
      </div>

      {modalAberto && (
        <ModalCurso
          onFechar={() => setModalAberto(false)}
          onSalvar={() => { setModalAberto(false); carregar(); }}
        />
      )}
    </div>
  );
}

function CursoCard({ curso, isAdmin, onAtualizar }) {
  const [apagando, setApagando] = useState(false);

  async function apagar() {
    if (!confirm("Apagar este curso?")) return;
    setApagando(true);
    await supabase.from("cursos").delete().eq("id", curso.id);
    onAtualizar();
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTopo}>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${curso.gratuito ? styles.gratuito : styles.pago}`}>
            {curso.gratuito ? "Gratuito" : "Pago"}
          </span>
          <span className={styles.badge}>{curso.formato}</span>
          <span className={styles.badge}>{curso.nivel}</span>
        </div>
        {curso.prazo_inscricao && (
          <span className={styles.prazo}>
            Inscrições até {new Date(curso.prazo_inscricao + "T12:00:00").toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>

      <h3 className={styles.titulo}>{curso.titulo}</h3>
      {curso.instituicao && <p className={styles.instituicao}>{curso.instituicao}</p>}
      <p className={styles.descricao}>{curso.descricao}</p>

      <div className={styles.cardRodape}>
        <div className={styles.infos}>
          <span className={styles.categoria}>{curso.categoria}</span>
          {curso.carga_horaria && <span className={styles.infoItem}>⏱ {curso.carga_horaria}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {curso.link_inscricao && (
            <a href={curso.link_inscricao} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              Inscrever-se
            </a>
          )}
          {isAdmin && (
            <button className="btn btn-sm btn-outline" style={{ color: "#c1272d", borderColor: "#c1272d" }} disabled={apagando} onClick={apagar}>
              {apagando ? "…" : "Apagar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const NIVEIS = ["Todos os níveis", "Iniciante", "Intermediário", "Avançado"];
const FORMATOS_FORM = ["Online", "Presencial", "Híbrido"];
const CATS_FORM = ["Gestão Cultural", "Produção Cultural", "Legislação", "Tecnologia", "Comunicação", "Artes", "Outro"];

function ModalCurso({ onFechar, onSalvar }) {
  const [form, setForm] = useState({
    titulo: "", descricao: "", categoria: "Gestão Cultural",
    nivel: "Todos os níveis", formato: "Online", carga_horaria: "",
    instituicao: "", link_inscricao: "", gratuito: true, prazo_inscricao: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    const payload = { ...form, prazo_inscricao: form.prazo_inscricao || null, link_inscricao: form.link_inscricao || null };
    const { error } = await supabase.from("cursos").insert(payload);
    if (error) { setErro(error.message); setSalvando(false); return; }
    onSalvar();
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Novo curso</h2>
          <button type="button" onClick={onFechar} className={styles.btnFechar}>✕</button>
        </div>
        {erro && <div className="form-error">{erro}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-field"><label>Título *</label><input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} required /></div>
          <div className="form-field"><label>Descrição *</label><textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={3} required /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-field"><label>Categoria</label>
              <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
                {CATS_FORM.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Nível</label>
              <select value={form.nivel} onChange={(e) => set("nivel", e.target.value)}>
                {NIVEIS.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Formato</label>
              <select value={form.formato} onChange={(e) => set("formato", e.target.value)}>
                {FORMATOS_FORM.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Carga horária</label><input value={form.carga_horaria} onChange={(e) => set("carga_horaria", e.target.value)} placeholder="Ex: 20h" /></div>
          </div>
          <div className="form-field"><label>Instituição</label><input value={form.instituicao} onChange={(e) => set("instituicao", e.target.value)} /></div>
          <div className="form-field"><label>Link de inscrição</label><input type="url" value={form.link_inscricao} onChange={(e) => set("link_inscricao", e.target.value)} placeholder="https://..." /></div>
          <div className="form-field"><label>Prazo de inscrição</label><input type="date" value={form.prazo_inscricao} onChange={(e) => set("prazo_inscricao", e.target.value)} /></div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.gratuito} onChange={(e) => set("gratuito", e.target.checked)} />
            Curso gratuito
          </label>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-outline" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
