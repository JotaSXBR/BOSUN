"use client";

import { type FormEvent, useState } from "react";
import { postJson } from "./post-json.ts";

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
    setPending(false);
    if (result.ok) onOk(result.body);
    else setError(result.error);
  }

  return { error, pending, onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event) };
}
