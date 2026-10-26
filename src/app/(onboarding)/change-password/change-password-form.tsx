"use client";

import { useRouter } from "next/navigation";
import { useJsonForm } from "@/lib/use-json-form.ts";

export function ChangePasswordForm() {
  const router = useRouter();
  const { error, pending, onSubmit } = useJsonForm(
    "/api/account/password",
    (form) =>
      form.get("next") === form.get("confirm")
        ? { data: { current: form.get("current"), next: form.get("next") } }
        : { error: "A confirmação não bate com a senha nova." },
    () => {
      router.push("/");
      router.refresh();
    },
  );

  return (
    <form onSubmit={onSubmit}>
      <label>
        Senha atual
        <input name="current" type="password" autoComplete="current-password" required />
      </label>
      <label>
        Senha nova (12 caracteres ou mais)
        <input name="next" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
      </label>
      <label>
        Confirme a senha nova
        <input name="confirm" type="password" autoComplete="new-password" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        Trocar a senha
      </button>
    </form>
  );
}
