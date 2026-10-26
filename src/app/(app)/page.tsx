import { requireSession } from "@/modules/identity/guard.ts";

export default async function Home() {
  await requireSession();
  return (
    <main>
      <h1>BOSUN</h1>
    </main>
  );
}
