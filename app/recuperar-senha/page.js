"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setEnviando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setEnviando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setSucesso("Se esse e-mail estiver cadastrado, enviamos um link para redefinir sua senha.");
  }

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição."
      footer={
        <>
          Lembrou a senha? <Link href="/login">Voltar para o login</Link>
        </>
      }
    >
      {erro && <div className="form-error">{erro}</div>}
      {sucesso && <div className="form-success">{sucesso}</div>}

      {!sucesso && (
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
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar link de recuperação"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
