"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setEnviando(false);

    if (error) {
      setErro(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      return;
    }

    router.push("/perfil");
  }

  return (
    <AuthCard
      title="Entrar na sua conta"
      subtitle="Acesse para cadastrar eventos, projetos e editais."
      footer={
        <>
          Ainda não tem conta? <Link href="/registro">Criar conta</Link>
        </>
      }
    >
      {erro && <div className="form-error">{erro}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
          />
        </div>
        <div className="form-field">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link href="/recuperar-senha" style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>
          Esqueci minha senha
        </Link>
      </div>
    </AuthCard>
  );
}
