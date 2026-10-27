"use client";

import { useState } from "react";
import { useJsonForm } from "@/lib/use-json-form.ts";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const { error, pending, onSubmit } = useJsonForm(
    "/api/auth/password-reset-request",
    (form) => ({ data: { identifier: form.get("identifier") } }),
    () => setSent(true),
  );
  if (sent) return <p role="status">Se a conta existir, o pedido foi registrado. Fale com a Admin do seu workspace.</p>;
  return (
    <form method="post" onSubmit={onSubmit}>
      <label>
        Usuário ou e-mail
        <input name="identifier" autoComplete="username" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        Pedir uma senha nova
      </button>
    </form>
  );
}
