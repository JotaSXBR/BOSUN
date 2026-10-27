import { redirect } from "next/navigation";
import { requireSession } from "@/modules/identity/guard.ts";
import { SetupFlow } from "./setup-flow.tsx";

export const metadata = { title: "Ativar a verificação em duas etapas · BOSUN" };

const when = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function SetupTwoFactorPage() {
  const { user } = await requireSession();
  if (user.mustChangePassword) redirect("/change-password");
  if (user.twoFactorEnabled) redirect("/");
  return (
    <main>
      <h1>Ativar a verificação em duas etapas</h1>
      {user.twoFactorResetAt && (
        <p role="status">
          Sua verificação em duas etapas foi redefinida pelo suporte em {when.format(user.twoFactorResetAt)}. Se não foi você quem pediu,
          avise a Admin do seu workspace.
        </p>
      )}
      <p>Toda conta da BOSUN usa um app autenticador (Google Authenticator, 1Password, Authy ou outro).</p>
      <SetupFlow />
    </main>
  );
}
