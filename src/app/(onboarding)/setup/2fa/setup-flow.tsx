"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeForm } from "@/app/code-form.tsx";
import { useJsonForm } from "@/lib/use-json-form.ts";

interface Enrollment {
  secret: string;
  uri: string;
  recoveryCodes: string[];
}

function isEnrollment(body: unknown): body is Enrollment {
  return typeof body === "object" && body !== null && "secret" in body && "uri" in body && "recoveryCodes" in body;
}

function PasswordStep({ onDone }: { onDone: (e: Enrollment) => void }) {
  const { error, pending, onSubmit } = useJsonForm(
    "/api/auth/2fa/enable",
    (form) => ({ data: { password: form.get("password") } }),
    (body) => {
      if (isEnrollment(body)) onDone(body);
    },
  );
  return (
    <form onSubmit={onSubmit}>
      <label>
        Sua senha
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        Continuar
      </button>
    </form>
  );
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  const router = useRouter();
  return (
    <section aria-labelledby="codes-title">
      <h2 id="codes-title">Guarde os códigos de recuperação</h2>
      <p>Cada código entra uma vez, se você perder o celular. Eles não aparecem de novo nesta tela.</p>
      <ul aria-label="Códigos de recuperação">
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          router.push("/");
          router.refresh();
        }}
      >
        Já guardei, continuar
      </button>
    </section>
  );
}

/** Senha → segredo + primeiro código → códigos de recuperação (mostrados uma vez). */
export function SetupFlow() {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  if (!enrollment) return <PasswordStep onDone={setEnrollment} />;
  if (confirmed) return <RecoveryCodes codes={enrollment.recoveryCodes} />;
  return (
    <section aria-labelledby="secret-title">
      <h2 id="secret-title">Adicione a conta no app</h2>
      <p>No app autenticador, escolha inserir a chave manualmente e digite:</p>
      <p>
        <code aria-label="Chave secreta">{enrollment.secret}</code>
      </p>
      <p>Ou copie o endereço de configuração:</p>
      <p>
        <code aria-label="Endereço de configuração">{enrollment.uri}</code>
      </p>
      <CodeForm url="/api/auth/2fa/verify" label="Código de 6 dígitos" button="Ativar" autoComplete="one-time-code" onOk={() => setConfirmed(true)} />
    </section>
  );
}
