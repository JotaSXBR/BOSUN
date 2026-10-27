import { connection } from "next/server";
import type { ReactNode } from "react";

export const metadata = { title: "BOSUN" };

// Dinâmico em toda página: o nonce da CSP muda a cada requisição (proxy.ts).
export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
