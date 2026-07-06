"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import { useRole } from "@/lib/useRole";
import { AREAS_ATUACAO, BAIRROS_ZONA_LESTE } from "@/lib/constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useRole();
  const [aba, setAba] = useState("Conteúdo");

  useEffect(() => {
    if (!roleLoading && !isAdmin) router.push("/");
  }, [roleLoading, isAdmin, router]);

  if (roleLoading) return <LoadingSpinner label="Verificando acesso…" />;
  if (!isAdmin) return null;

  const abas = ["Conteúdo", "Perfis de Artistas", "Sugestões", ...(isSuperAdmin ? ["Usuários"] : [])];

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <div>
          <h1 className="heading">Painel Admin</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            {isSuperAdmin ? "Super Admin — acesso total" : "Admin — gerenciar conteúdo"}
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        {abas.map((a) => (
          <button
            key={a}
            type="button"
            className={`${styles.tab} ${aba === a ? styles.tabAtiva : ""}`}
            onClick={() => setAba(a)}
          >
            {a}
          </button>
        ))}
      </div>

      <div className={styles.conteudo}>
        {aba === "Conteúdo"           && <TabelaConteudos />}
        {aba === "Perfis de Artistas" && <TabelaArtistas />}
        {aba === "Sugestões"          && <TabelaSugestoes />}
        {aba === "Usuários"           && isSuperAdmin && <TabelaUsuarios />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Aba: Conteúdo (eventos, editais, projetos do mapa)
// ─────────────────────────────────────────────────────────────────────
const SECOES = [
  { tabela: "eventos",       label: "Eventos",         colunas: ["titulo", "categoria", "data_evento", "bairro"] },
  { tabela: "editais",       label: "Editais",         colunas: ["titulo", "categoria", "entidade_responsavel", "prazo"] },
  { tabela: "projetos_mapa", label: "Projetos do Mapa", colunas: ["nome", "categoria", "localidade"] },
];

function TabelaConteudos() {
  const [secao, setSecao] = useState(SECOES[0]);

  return (
    <div>
      <div className={styles.subTabs}>
        {SECOES.map((s) => (
          <button
            key={s.tabela}
            type="button"
            className={`${styles.subTab} ${secao.tabela === s.tabela ? styles.subTabAtiva : ""}`}
            onClick={() => setSecao(s)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <TabelaGenerica key={secao.tabela} tabela={secao.tabela} colunas={secao.colunas} />
    </div>
  );
}

function TabelaGenerica({ tabela, colunas }) {
  const [rows, setRows] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [apagando, setApagando] = useState(null);

  useEffect(() => {
    supabase.from(tabela).select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setRows(data || []); setCarregando(false); });
  }, [tabela]);

  async function apagar(id) {
    if (!confirm("Apagar este item permanentemente?")) return;
    setApagando(id);
    await supabase.from(tabela).delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    setApagando(null);
  }

  if (carregando) return <LoadingSpinner label="Carregando…" />;
  if (rows.length === 0) return <p className="text-muted" style={{ textAlign: "center", padding: 40 }}>Nenhum item cadastrado.</p>;

  return (
    <div className={styles.tableWrap}>
      <p className={styles.total}>{rows.length} {rows.length === 1 ? "item" : "itens"}</p>
      <table className={styles.table}>
        <thead>
          <tr>
            {colunas.map((c) => <th key={c}>{c.replace(/_/g, " ")}</th>)}
            <th>ação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {colunas.map((c) => <td key={c}>{row[c] ?? "—"}</td>)}
              <td>
                <button
                  type="button"
                  className={`btn btn-sm ${styles.btnApagar}`}
                  disabled={apagando === row.id}
                  onClick={() => apagar(row.id)}
                >
                  {apagando === row.id ? "…" : "Apagar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Aba: Perfis de Artistas (admin pode editar qualquer um)
// ─────────────────────────────────────────────────────────────────────
function TabelaArtistas() {
  const [artistas, setArtistas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(null); // artista sendo editado

  useEffect(() => {
    supabase.from("artistas").select("*").order("nome_artistico")
      .then(({ data }) => { setArtistas(data || []); setCarregando(false); });
  }, []);

  function aoSalvar(atualizado) {
    setArtistas((prev) => prev.map((a) => a.id === atualizado.id ? atualizado : a));
    setEditando(null);
  }

  if (carregando) return <LoadingSpinner label="Carregando perfis…" />;
  if (artistas.length === 0) return <p className="text-muted" style={{ textAlign: "center", padding: 40 }}>Nenhum perfil cadastrado ainda.</p>;

  return (
    <>
      <div className={styles.tableWrap}>
        <p className={styles.total}>{artistas.length} perfis</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome artístico</th>
              <th>Área</th>
              <th>Região</th>
              <th>Coletivo</th>
              <th>ação</th>
            </tr>
          </thead>
          <tbody>
            {artistas.map((a) => (
              <tr key={a.id}>
                <td>{a.nome_artistico}</td>
                <td>{a.area_atuacao}</td>
                <td>{a.regiao_atuacao}</td>
                <td>{a.coletivo || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setEditando(a)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <ModalEditarArtista artista={editando} onSalvar={aoSalvar} onFechar={() => setEditando(null)} />
      )}
    </>
  );
}

function ModalEditarArtista({ artista, onSalvar, onFechar }) {
  const [form, setForm] = useState({ ...artista });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const { data, error } = await supabase
      .from("artistas")
      .update({
        nome_artistico: form.nome_artistico,
        area_atuacao: form.area_atuacao,
        coletivo: form.coletivo,
        telefone: form.telefone,
        email: form.email,
        regiao_atuacao: form.regiao_atuacao,
      })
      .eq("id", artista.id)
      .select()
      .single();

    if (error) { setErro(error.message); setSalvando(false); return; }
    onSalvar(data);
  }

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Editar perfil: {artista.nome_artistico}</h2>
          <button type="button" onClick={onFechar} className={styles.btnFechar}>✕</button>
        </div>

        {erro && <div className="form-error">{erro}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className="form-field">
            <label>Nome artístico</label>
            <input value={form.nome_artistico} onChange={(e) => setForm({ ...form, nome_artistico: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Área de atuação</label>
            <select value={form.area_atuacao} onChange={(e) => setForm({ ...form, area_atuacao: e.target.value })}>
              {AREAS_ATUACAO.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Região</label>
            <select value={form.regiao_atuacao} onChange={(e) => setForm({ ...form, regiao_atuacao: e.target.value })}>
              {BAIRROS_ZONA_LESTE.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Coletivo</label>
            <input value={form.coletivo || ""} onChange={(e) => setForm({ ...form, coletivo: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Telefone</label>
            <input value={form.telefone || ""} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div className="form-field">
            <label>E-mail de contato</label>
            <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Aba: Sugestões da comunidade
// ─────────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  nova:       { label: "Nova",        cor: "#FF7300" },
  lida:       { label: "Lida",        cor: "#888888" },
  em_analise: { label: "Em análise",  cor: "#3B82F6" },
  feita:      { label: "Feita ✓",    cor: "#22C55E" },
};

function TabelaSugestoes() {
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [atualizando, setAtualizando] = useState(null);
  const [expandida, setExpandida] = useState(null);

  useEffect(() => {
    supabase
      .from("sugestoes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setSugestoes(data || []); setCarregando(false); });
  }, []);

  async function trocarStatus(id, novoStatus) {
    setAtualizando(id);
    await supabase.from("sugestoes").update({ status: novoStatus }).eq("id", id);
    setSugestoes((prev) => prev.map((s) => s.id === id ? { ...s, status: novoStatus } : s));
    setAtualizando(null);
  }

  async function apagar(id) {
    if (!confirm("Apagar esta sugestão permanentemente?")) return;
    setAtualizando(id);
    await supabase.from("sugestoes").delete().eq("id", id);
    setSugestoes((prev) => prev.filter((s) => s.id !== id));
    setAtualizando(null);
  }

  const lista = filtro === "todas"
    ? sugestoes
    : sugestoes.filter((s) => s.status === filtro);

  const contadores = {
    todas: sugestoes.length,
    nova: sugestoes.filter((s) => s.status === "nova").length,
    lida: sugestoes.filter((s) => s.status === "lida").length,
    em_analise: sugestoes.filter((s) => s.status === "em_analise").length,
    feita: sugestoes.filter((s) => s.status === "feita").length,
  };

  if (carregando) return <LoadingSpinner label="Carregando sugestões…" />;

  return (
    <div>
      {/* Filtros */}
      <div className={styles.subTabs} style={{ marginBottom: 24 }}>
        {[
          { key: "todas",      label: `Todas (${contadores.todas})` },
          { key: "nova",       label: `Novas (${contadores.nova})` },
          { key: "em_analise", label: `Em análise (${contadores.em_analise})` },
          { key: "lida",       label: `Lidas (${contadores.lida})` },
          { key: "feita",      label: `Feitas (${contadores.feita})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`${styles.subTab} ${filtro === key ? styles.subTabAtiva : ""}`}
            onClick={() => setFiltro(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <p className="text-muted" style={{ textAlign: "center", padding: 40 }}>
          Nenhuma sugestão {filtro !== "todas" ? `com status "${STATUS_LABEL[filtro]?.label}"` : "recebida"} ainda.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {lista.map((s) => {
          const st = STATUS_LABEL[s.status] || STATUS_LABEL.nova;
          const aberta = expandida === s.id;
          return (
            <div key={s.id} className={styles.sugestaoCard}>
              <div className={styles.sugestaoHeader} onClick={() => setExpandida(aberta ? null : s.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span
                    className={styles.statusPill}
                    style={{ background: st.cor + "22", color: st.cor, border: `1px solid ${st.cor}55` }}
                  >
                    {st.label}
                  </span>
                  <span className={styles.sugestaoCategoria}>{s.categoria}</span>
                  <span className={styles.sugestaoTitulo}>{s.titulo}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span className={styles.sugestaoData}>
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{aberta ? "▲" : "▼"}</span>
                </div>
              </div>

              {aberta && (
                <div className={styles.sugestaoBody}>
                  <p className={styles.sugestaoDescricao}>{s.descricao}</p>

                  {(s.nome || s.email) && (
                    <p className={styles.sugestaoAutor}>
                      Enviado por: {s.nome || "Anônimo"}{s.email ? ` — ${s.email}` : ""}
                    </p>
                  )}
                  {!s.nome && !s.email && (
                    <p className={styles.sugestaoAutor}>Enviado anonimamente</p>
                  )}

                  <div className={styles.sugestaoAcoes}>
                    <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>Marcar como:</span>
                    {Object.entries(STATUS_LABEL).map(([key, info]) => (
                      <button
                        key={key}
                        type="button"
                        className="btn btn-sm btn-outline"
                        disabled={s.status === key || atualizando === s.id}
                        style={s.status === key ? { opacity: 0.4 } : {}}
                        onClick={() => trocarStatus(s.id, key)}
                      >
                        {atualizando === s.id ? "…" : info.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`btn btn-sm ${styles.btnApagar}`}
                      disabled={atualizando === s.id}
                      onClick={() => apagar(s.id)}
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Aba: Usuários (só super_admin)
// ─────────────────────────────────────────────────────────────────────
const ROLE_LABEL = { user: "Usuário", admin: "Admin", super_admin: "Super Admin" };

function TabelaUsuarios() {
  const { user: me } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(null);

  async function carregar() {
    const { data } = await supabase.rpc("get_users_for_admin");
    setUsuarios(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function trocarRole(uid, novoRole) {
    setSalvando(`role-${uid}`);
    await supabase.from("perfis").update({ role: novoRole }).eq("id", uid);
    setUsuarios((prev) => prev.map((u) => u.id === uid ? { ...u, role: novoRole } : u));
    setSalvando(null);
  }

  async function toggleBan(uid, banidoAtual) {
    const acao = banidoAtual ? "desbanir" : "banir";
    if (!confirm(`Tem certeza que quer ${acao} este usuário?`)) return;
    setSalvando(`ban-${uid}`);
    await supabase.from("perfis").update({ banido: !banidoAtual }).eq("id", uid);
    setUsuarios((prev) => prev.map((u) => u.id === uid ? { ...u, banido: !banidoAtual } : u));
    setSalvando(null);
  }

  async function deletarUsuario(uid, email) {
    if (!confirm(`ATENÇÃO: Isso vai deletar a conta de "${email}" e todo o conteúdo dela permanentemente. Confirma?`)) return;
    setSalvando(`del-${uid}`);
    const { error } = await supabase.rpc("delete_user", { target_id: uid });
    if (error) { alert("Erro: " + error.message); setSalvando(null); return; }
    setUsuarios((prev) => prev.filter((u) => u.id !== uid));
    setSalvando(null);
  }

  if (carregando) return <LoadingSpinner label="Carregando usuários…" />;

  return (
    <div className={styles.tableWrap}>
      <p className={styles.total}>{usuarios.length} usuários</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>e-mail</th>
            <th>nível</th>
            <th>status</th>
            <th>desde</th>
            <th>ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const ehEu = u.id === me?.id;
            const ehSuperAdmin = u.role === "super_admin";
            return (
              <tr key={u.id} className={`${ehEu ? styles.rowMe : ""} ${u.banido ? styles.rowBanido : ""}`}>
                <td>
                  {u.email}
                  {ehEu && <span className={styles.badge}>Você</span>}
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td>
                  {u.banido
                    ? <span className={styles.badgeBanido}>Banido</span>
                    : <span className={styles.badgeAtivo}>Ativo</span>}
                </td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                <td>
                  {!ehEu && !ehSuperAdmin && (
                    <div className={styles.acoes}>
                      {/* Promover / Remover Admin */}
                      <button
                        type="button"
                        className={`btn btn-sm ${u.role === "admin" ? "btn-outline" : "btn-primary"}`}
                        disabled={!!salvando}
                        onClick={() => trocarRole(u.id, u.role === "admin" ? "user" : "admin")}
                      >
                        {salvando === `role-${u.id}` ? "…" : u.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                      </button>

                      {/* Banir / Desbanir */}
                      <button
                        type="button"
                        className={`btn btn-sm ${u.banido ? "btn-outline" : styles.btnBanir}`}
                        disabled={!!salvando}
                        onClick={() => toggleBan(u.id, u.banido)}
                      >
                        {salvando === `ban-${u.id}` ? "…" : u.banido ? "Desbanir" : "Banir"}
                      </button>

                      {/* Deletar */}
                      <button
                        type="button"
                        className={`btn btn-sm ${styles.btnApagar}`}
                        disabled={!!salvando}
                        onClick={() => deletarUsuario(u.id, u.email)}
                      >
                        {salvando === `del-${u.id}` ? "…" : "Deletar"}
                      </button>
                    </div>
                  )}
                  {ehSuperAdmin && !ehEu && (
                    <span className="text-muted" style={{ fontSize: "0.8rem" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
