import { EXAMPLE_QUEUE, getQueue } from "@/lib/queue.ts";

// Só para desenvolvimento: prova que o web enfileira e o worker processa. Falha fechado fora de dev.
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }
  const boss = await getQueue("sender");
  const id = await boss.send(EXAMPLE_QUEUE, { from: "web" });
  return Response.json({ id });
}
