"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setError("");
      alert("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      setIsRegister(false);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-stone-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-teal-800">
            Consultório
          </Link>
          <p className="mt-2 text-sm text-stone-600">Área restrita da psicóloga</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRegister ? "Criar Conta" : "Entrar"}</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                id="name"
                label="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}
            <Input
              id="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : isRegister ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-stone-600">
            {isRegister ? "Já tem conta?" : "Primeiro acesso?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-teal-700 hover:underline"
            >
              {isRegister ? "Fazer login" : "Criar conta"}
            </button>
          </p>
        </Card>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-stone-500 hover:text-teal-700">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
