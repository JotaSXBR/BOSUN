import { PgBoss } from "pg-boss";

export const EXAMPLE_QUEUE = "example";

let boss: PgBoss | undefined;

/** Uma instância por processo; o web só envia, o worker também processa. */
export async function getQueue(): Promise<PgBoss> {
  if (boss) return boss;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");
  const instance = new PgBoss(url);
  instance.on("error", (err) => console.error("[queue]", err));
  await instance.start();
  await instance.createQueue(EXAMPLE_QUEUE);
  boss = instance;
  return instance;
}
