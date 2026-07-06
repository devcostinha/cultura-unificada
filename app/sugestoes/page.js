"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./page.module.css";

const CATEGORIAS = [
  "Funcionalidade nova",
  "Melhoria no app",
  "Bug / problema",
  "Design / visual",
  "Nome do app",
  "Outro",
];

export default function SugestoesPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    categoria: "Funcionalidade nova",
    titulo: "",
    descricao: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descricao.trim()) {
      setErro("Preencha o título e a descrição.");
      return;
    }
    setEnviando(true);
    setErro("");

    const payload = {
      categoria: form.categoria,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      nome: form.nome.trim() || null,
      email: form.email.trim() || null,
      user_id: user?.id ?? null,
      status: "nova",
    };

    const { error } = await supabase.from("sugestoes").insert(payload);

    if (error) {
      setErro("Erro ao enviar: " + error.message);
      setEnviando(false);
      return;
    }

    setEnviado(true);
    setEnviando(false);
  }

  if (enviado) {
    return (
      <div className={`container ${styles.wrap}`}>
        <div className={styles.sucesso}>
          <div className={styles.sucessoIcon}>✓</div>
          <h2>Sugestão enviada!</h2>
          <p>Valeu por contribuir com o Cultura Unificada. Toda sugestão é lida com atenção.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEnviado(false);
              setForm({ nome: "", email: "", categoria: "Funcionalidade nova", titulo: "", descricao: "" });
            }}
          >
            Enviar outra sugestão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <div>
          <h1 className="heading">Sugestões</h1>
          <p className="text-muted">
            Tem uma ideia pra melhorar o app? Fala aí — cada sugestão chega direto pra quem cuida do projeto.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Formulário */}
        <div className={styles.formCard}>
          {erro && <div className="form-error" style={{ marginBottom: 16 }}>{erro}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className="form-field">
                <label>Seu nome <span className={styles.opcional}>(opcional)</span></label>
                <input
                  type="text"
                  placeholder="Como quer ser chamado?"
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>E-mail <span className={styles.opcional}>(opcional)</span></label>
                <input
                  type="email"
                  placeholder="Para retornarmos se necessário"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Categoria</label>
              <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Título da sugestão *</label>
              <input
                type="text"
                placeholder="Resumo da sua ideia em uma linha"
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="form-field">
              <label>Descrição *</label>
              <textarea
                placeholder="Explica melhor sua ideia. Quanto mais detalhes, mais fácil de entender e implementar."
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                rows={5}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={enviando} style={{ width: "100%" }}>
              {enviando ? "Enviando…" : "Enviar sugestão"}
            </button>
          </form>
        </div>

        {/* Info lateral */}
        <div className={styles.info}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>💡</div>
            <h3>O que você pode sugerir?</h3>
            <ul>
              <li>Novas funcionalidades para o app</li>
              <li>Melhorias no que já existe</li>
              <li>Bugs ou coisas que não funcionam</li>
              <li>Mudanças no visual ou nome</li>
              <li>Qualquer ideia que venha à mente</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🔒</div>
            <h3>Anônimo é válido</h3>
            <p>Nome e e-mail são opcionais. Pode enviar sem se identificar — a sugestão vale do mesmo jeito.</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>👀</div>
            <h3>Quem vai ler?</h3>
            <p>Cada sugestão chega direto no painel dos administradores do projeto. Tudo é lido.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
