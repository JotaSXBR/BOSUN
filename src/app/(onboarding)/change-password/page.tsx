import { requireSession } from "@/modules/identity/guard.ts";
import { ChangePasswordForm } from "./change-password-form.tsx";

export const metadata = { title: "Trocar a senha · BOSUN" };

export default async function ChangePasswordPage() {
  const { user } = await requireSession();
  return (
    <main>
      <h1>Trocar a senha</h1>
      {user.mustChangePassword && <p>Antes de continuar, troque a senha temporária por uma sua.</p>}
      <ChangePasswordForm />
    </main>
  );
}
