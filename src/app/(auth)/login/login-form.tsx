"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier: form.get("identifier"), password: form.get("password") }),
    });
    setPending(false);
    const body: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body !== null && typeof body === "object" && "error" in body ? String(body.error) : "Não foi possível entrar.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <label>
        Usuário ou e-mail
        <input name="identifier" autoComplete="username" required />
      </label>
      <label>
        Senha
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        Entrar
      </button>
    </form>
  );
}
