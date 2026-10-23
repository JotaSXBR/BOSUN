import { EXAMPLE_QUEUE, getQueue } from "@/lib/queue.ts";

// Só para desenvolvimento: prova que o web enfileira e o worker processa.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  const boss = await getQueue();
  const id = await boss.send(EXAMPLE_QUEUE, { from: "web" });
  return Response.json({ id });
}
