"use client";

import { useRouter } from "next/navigation";
import { useJsonForm } from "@/lib/use-json-form.ts";

export function LoginForm() {
  const router = useRouter();
  const { error, pending, onSubmit } = useJsonForm(
    "/api/auth/login",
    (form) => ({ data: { identifier: form.get("identifier"), password: form.get("password") } }),
    (body) => {
      const challenge = typeof body === "object" && body !== null && "twoFactorRedirect" in body && body.twoFactorRedirect === true;
      router.push(challenge ? "/login/2fa" : "/");
      router.refresh();
    },
  );

  return (
    <form method="post" onSubmit={onSubmit}>
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
