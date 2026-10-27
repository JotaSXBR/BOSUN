"use client";

import { type FormEvent, useState } from "react";
import { CodesList } from "@/app/codes-list.tsx";
import { postJson } from "@/lib/post-json.ts";

function codesOf(body: unknown): string[] {
  return typeof body === "object" && body !== null && "codes" in body && Array.isArray(body.codes) ? body.codes.map(String) : [];
}

/**
 * Mostra os códigos que ainda valem. Com sessão de mais de 10 min a rota responde SESSION_NOT_FRESH:
 * a tela pede senha e código (step-up, que troca a sessão) e repete o pedido.
 */
export function RecoveryCodesPanel() {
  const [codes, setCodes] = useState<string[] | null>(null);
  const [stepUp, setStepUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function show() {
    const result = await postJson("/api/account/recovery-codes", {});
    if (result.ok) return setCodes(codesOf(result.body));
    if (result.code === "SESSION_NOT_FRESH") return setStepUp(true);
    setError(result.error);
  }

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    await action();
    setPending(false);
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await postJson("/api/auth/step-up", { password: form.get("password"), code: form.get("code") });
    if (!result.ok) return setError(result.error);
    setStepUp(false);
    await show();
  }

  if (codes) return <CodesList codes={codes} />;
  return (
    <>
      {stepUp ? (
        <form onSubmit={(e) => void run(() => confirm(e))}>
          <p>Por segurança, confirme a senha e um código do app (ou de recuperação).</p>
          <label>
            Senha
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <label>
            Código
            <input name="code" autoComplete="one-time-code" spellCheck={false} required />
          </label>
          <button type="submit" disabled={pending}>
            Confirmar
          </button>
        </form>
      ) : (
        <button type="button" disabled={pending} onClick={() => void run(show)}>
          Ver os códigos que ainda valem
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </>
  );
}
