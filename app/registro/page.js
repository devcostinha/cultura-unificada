"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthCard from "@/components/AuthCard";

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });
    setEnviando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    if (data.session) {
      // Confirmação de e-mail desativada no projeto Supabase: já entra logado.
      router.push("/perfil");
      return;
    }

    // Confirmação de e-mail ativada: o Supabase já enviou o link de
    // confirmação para a caixa de entrada do usuário.
    setSucesso("Conta criada! Você já pode entrar na plataforma.");
  }

  // Conta criada com sucesso — mostra só a confirmação, sem o formulário
  if (sucesso) {
    return (
      <AuthCard title="✅ Quase lá!" subtitle="">
        <div className="form-success" style={{ textAlign: "center", padding: "8px 0" }}>
          {sucesso}
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: "0.9rem" }}>
          <Link href="/login" className="btn btn-primary btn-sm">
            Entrar agora
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Criar minha conta"
      subtitle="Cadastre-se para cadastrar eventos, projetos e editais."
      footer={
        <>
          Já tem conta? <Link href="/login">Entrar</Link>
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
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              id="confirmarSenha"
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? "Criando conta…" : "Criar conta"}
          </button>
        </form>
    </AuthCard>
  );
}
