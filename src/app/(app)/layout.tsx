import type { ReactNode } from "react";
import { requireSession } from "@/modules/identity/guard.ts";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireSession();
  return (
    <>
      <header>
        <span>{user.name}</span>
        <form action="/api/auth/logout" method="post">
          <button type="submit">Sair</button>
        </form>
      </header>
      {children}
    </>
  );
}
