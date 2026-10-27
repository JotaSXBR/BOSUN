"use client";

import { useJsonForm } from "@/lib/use-json-form.ts";

interface Props {
  url: string;
  label: string;
  button: string;
  /** "one-time-code" para o TOTP; "off" para o código de recuperação. */
  autoComplete: string;
  onOk: () => void;
}

/** Um campo de código (TOTP ou recuperação) que posta `{ code }`. */
export function CodeForm({ url, label, button, autoComplete, onOk }: Props) {
  const { error, pending, onSubmit } = useJsonForm(url, (form) => ({ data: { code: form.get("code") } }), onOk);
  return (
    <form method="post" onSubmit={onSubmit}>
      <label>
        {label}
        <input name="code" autoComplete={autoComplete} spellCheck={false} required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {button}
      </button>
    </form>
  );
}
