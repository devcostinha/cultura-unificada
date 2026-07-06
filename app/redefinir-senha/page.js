"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // O Supabase processa o token vindo do link de e-mail (parâmetro na
    // URL) automaticamente e dispara o evento PASSWORD_RECOVERY com uma
    // sessão temporária — é o que nos autoriza a trocar a senha aqui.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPronto(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setEnviando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setSucesso("Senha atualizada! Redirecionando para o login…");
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <AuthCard
      title="Definir nova senha"
      subtitle="Escolha uma nova senha para sua conta."
      footer={
        <>
          <Link href="/login">Voltar para o login</Link>
        </>
      }
    >
      {!pronto && !sucesso && (
        <>
          <LoadingSpinner label="Validando link de recuperação…" />
          <p className="text-muted" style={{ fontSize: "0.85rem", textAlign: "center" }}>
            Se nada acontecer, abra o link de redefinição diretamente do
            e-mail que você recebeu.
          </p>
        </>
      )}

      {pronto && !sucesso && (
        <form onSubmit={handleSubmit}>
          {erro && <div className="form-error">{erro}</div>}
          <div className="form-field">
            <label htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              required
              minLength={6}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>
            <input
              id="confirmarSenha"
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}

      {sucesso && <div className="form-success">{sucesso}</div>}
    </AuthCard>
  );
}
