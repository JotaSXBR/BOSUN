import type { ReactNode } from "react";
import { LogoutButton } from "@/app/logout-button.tsx";
import { requireSession } from "@/modules/identity/guard.ts";

// Sessão obrigatória, mas aceita troca de senha e 2FA pendentes.
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return (
    <>
      <header>
        <LogoutButton />
      </header>
      {children}
    </>
  );
}
