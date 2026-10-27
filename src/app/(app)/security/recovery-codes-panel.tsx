"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { CodesList } from "@/app/codes-list.tsx";
import { postJson } from "@/lib/post-json.ts";
import { useHydrated } from "@/lib/use-hydrated.ts";

function codesOf(body: unknown): string[] {
  return typeof body === "object" && body !== null && "codes" in body && Array.isArray(body.codes) ? body.codes.map(String) : [];
}

/**
 * Gera 10 códigos novos (os anteriores deixam de valer) com a senha. Com sessão de mais de 10 min a rota
 * responde SESSION_NOT_FRESH: a tela pede também um código, faz o step-up (troca a sessão) e repete.
 */
export function RecoveryCodesPanel() {
  const router = useRouter();
  const [codes, setCodes] = useState<string[] | null>(null);
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const hydrated = useHydrated();

  async function regenerate(password: FormDataEntryValue | null, code: FormDataEntryValue | null) {
    if (needsCode) {
      const up = await postJson("/api/auth/step-up", { password, code });
      if (!up.ok) return setError(up.error);
      setNeedsCode(false);
      router.refresh();
    }
    const result = await postJson("/api/account/recovery-codes", { password });
    if (result.ok) return setCodes(codesOf(result.body));
    if (result.code === "SESSION_NOT_FRESH") return setNeedsCode(true);
    setError(result.error);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    await regenerate(form.get("password"), form.get("code"));
    setPending(false);
  }

  if (codes) {
    return (
      <section aria-label="Códigos novos">
        <p>Guarde estes códigos. Os anteriores já não valem, e estes não aparecem de novo.</p>
        <CodesList codes={codes} />
      </section>
    );
  }
  return (
    <form method="post" onSubmit={(e) => void submit(e)}>
      <p>Gerar códigos novos invalida os que você guardou antes.</p>
      <label>
        Senha
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {needsCode && (
        <label>
          Código do app (ou de recuperação)
          <input name="code" autoComplete="one-time-code" spellCheck={false} required />
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      {needsCode && <p>Por segurança, confirme também um código.</p>}
      <button type="submit" disabled={pending || !hydrated}>
        Gerar códigos novos
      </button>
    </form>
  );
}
