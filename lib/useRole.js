"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

/**
 * Retorna o role do usuário logado.
 * Uso: const { role, isAdmin, isSuperAdmin, loading } = useRole();
 */
export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    supabase
      .from("perfis")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role ?? "user");
        setLoading(false);
      });
  }, [user, authLoading]);

  return {
    role,
    loading: authLoading || loading,
    isAdmin: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
  };
}
