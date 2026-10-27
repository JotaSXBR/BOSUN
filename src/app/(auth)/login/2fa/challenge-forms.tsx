"use client";

import { useRouter } from "next/navigation";
import { CodeForm } from "@/app/code-form.tsx";

export function ChallengeForms() {
  const router = useRouter();
  const enter = () => {
    router.push("/");
    router.refresh();
  };
  return (
    <>
      <CodeForm url="/api/auth/2fa/verify" label="Código do app autenticador" button="Confirmar" autoComplete="one-time-code" onOk={enter} />
      <details>
        <summary>Usar um código de recuperação</summary>
        <CodeForm url="/api/auth/2fa/recovery" label="Código de recuperação" button="Entrar com o código" autoComplete="off" onOk={enter} />
      </details>
    </>
  );
}
