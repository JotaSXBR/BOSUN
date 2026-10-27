import { requireReadySession } from "@/modules/identity/guard.ts";

export default async function Home() {
  await requireReadySession();
  return (
    <main>
      <h1>BOSUN</h1>
    </main>
  );
}
