import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "./session.ts";

const resolveSession = vi.fn<() => Promise<AuthSession | null>>();

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
// O redirect do Next lança para interromper a renderização; aqui o erro carrega o destino.
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));
vi.mock("./session.ts", () => ({ resolveSession: () => resolveSession() }));

const { requireReadySession, requireSession } = await import("./guard.ts");

function session(flags: { mustChangePassword: boolean; twoFactorEnabled: boolean }): AuthSession {
  const now = new Date();
  return {
    session: { id: "s", userId: "u", token: "t", createdAt: now, updatedAt: now, expiresAt: now },
    user: {
      id: "u",
      name: "U",
      email: "u@test.local",
      emailVerified: true,
      image: null,
      username: "u",
      createdAt: now,
      updatedAt: now,
      tempPasswordExpiresAt: null,
      credentialsVersion: 0,
      twoFactorResetAt: null,
      ...flags,
    },
  };
}

beforeEach(() => resolveSession.mockReset());

describe("requireSession", () => {
  it("sem sessão vai para o login", async () => {
    resolveSession.mockResolvedValue(null);
    await expect(requireSession()).rejects.toThrow("redirect:/login");
  });

  it("com sessão (mesmo com troca de senha ou 2FA pendente) segue", async () => {
    const s = session({ mustChangePassword: true, twoFactorEnabled: false });
    resolveSession.mockResolvedValue(s);
    await expect(requireSession()).resolves.toBe(s);
  });
});

describe("requireReadySession", () => {
  it("troca de senha pendente vai para /change-password, antes do 2FA", async () => {
    resolveSession.mockResolvedValue(session({ mustChangePassword: true, twoFactorEnabled: false }));
    await expect(requireReadySession()).rejects.toThrow("redirect:/change-password");
  });

  it("2FA desligado vai para /setup/2fa", async () => {
    resolveSession.mockResolvedValue(session({ mustChangePassword: false, twoFactorEnabled: false }));
    await expect(requireReadySession()).rejects.toThrow("redirect:/setup/2fa");
  });

  it("primeiro acesso concluído segue; sem sessão vai para o login", async () => {
    const ready = session({ mustChangePassword: false, twoFactorEnabled: true });
    resolveSession.mockResolvedValue(ready);
    await expect(requireReadySession()).resolves.toBe(ready);
    resolveSession.mockResolvedValue(null);
    await expect(requireReadySession()).rejects.toThrow("redirect:/login");
  });
});
