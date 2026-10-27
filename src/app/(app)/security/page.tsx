import { requireReadySession } from "@/modules/identity/guard.ts";
import { listSessions } from "@/modules/identity/session.ts";
import { RecoveryCodesPanel } from "./recovery-codes-panel.tsx";

export const metadata = { title: "Segurança · BOSUN" };

const when = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function SecurityPage() {
  const { user, session } = await requireReadySession();
  const sessions = await listSessions(user.id);
  return (
    <main>
      <h1>Segurança</h1>
      <h2>Sessões abertas</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Dispositivo</th>
            <th scope="col">IP</th>
            <th scope="col">Entrou em</th>
            <th scope="col">Visto por último</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>
                {s.userAgent ?? "Desconhecido"}
                {s.id === session.id && " (esta sessão)"}
              </td>
              <td>{s.ipAddress ?? "—"}</td>
              <td>{when.format(s.createdAt)}</td>
              <td>{when.format(s.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action="/api/account/sessions/revoke-others" method="post">
        <button type="submit" disabled={sessions.length < 2}>
          Encerrar as outras sessões
        </button>
      </form>
      <form action="/api/auth/logout-all" method="post">
        <button type="submit">Sair de todos os dispositivos</button>
      </form>
      <h2>Códigos de recuperação</h2>
      <RecoveryCodesPanel />
    </main>
  );
}
