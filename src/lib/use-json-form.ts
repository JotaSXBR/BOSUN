"use client";

import { type FormEvent, useState } from "react";
import { postJson } from "./post-json.ts";
import { useHydrated } from "./use-hydrated.ts";

/**
 * Estado de um formulário que posta JSON numa rota nossa. `build` monta o corpo a partir do form,
 * ou devolve `{ error }` para recusar no cliente (ex.: confirmação diferente).
 */
export function useJsonForm(
  url: string,
  build: (form: FormData) => { data: unknown } | { error: string },
  onOk: (body: unknown) => void,
) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const hydrated = useHydrated();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const built = build(new FormData(event.currentTarget));
    if ("error" in built) {
      setError(built.error);
      return;
    }
    setPending(true);
    setError(null);
    const result = await postJson(url, built.data);
    // Em sucesso o botão segue desligado até a navegação: um segundo envio falharia.
    if (result.ok) {
      onOk(result.body);
      return;
    }
    setPending(false);
    setError(result.error);
  }

  // Botão desligado até a hidratação; o <form> usa method="post" para o envio nativo nunca pôr a senha na URL.
  return { error, pending: pending || !hydrated, onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event) };
}
