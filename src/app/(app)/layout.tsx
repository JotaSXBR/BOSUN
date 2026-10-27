import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/app/logout-button.tsx";
import { requireReadySession } from "@/modules/identity/guard.ts";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireReadySession();
  return (
    <>
      <header>
        <span>{user.name}</span>
        <Link href="/security">Segurança</Link>
        <LogoutButton />
      </header>
      {children}
    </>
  );
}
