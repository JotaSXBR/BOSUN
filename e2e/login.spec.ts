import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import { totpCode } from "../tests/totp.ts";

const PASSWORD = "cavalo correto bateria grampo";

/** Conta nova pela CLI, como o operador faz na VPS. Devolve o e-mail e a senha temporária. */
function createAccount(): { email: string; tempPassword: string } {
  const s = randomUUID().slice(0, 8);
  const email = `e2e-${s}@test.local`;
  const out = execFileSync(
    "node",
    ["--env-file-if-exists=.env.local", "scripts/bosun.ts", "admin", "create", "--username", `e2e-${s}`, "--email", email, "--name", "E2E"],
    { encoding: "utf8" },
  );
  const tempPassword = /Senha temporária \(válida por 72 h\): (\S+)/.exec(out)?.[1];
  if (!tempPassword) throw new Error("a CLI não imprimiu a senha temporária");
  return { email, tempPassword };
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  // Digitar antes da hidratação perde o texto; o botão liga quando o React assume.
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
  await page.getByLabel("Usuário ou e-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

const home = (page: Page) => expect(page.getByRole("heading", { level: 1, name: "BOSUN" })).toBeVisible();

test("primeiro acesso: senha temporária → troca → setup do 2FA → login com TOTP e com código de recuperação", async ({ page }) => {
  // CSP em toda página do caminho (login, troca, setup, home, 2FA, segurança): nenhuma violação no console.
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (/Content Security Policy|CSP/i.test(msg.text())) violations.push(msg.text());
  });
  const { email, tempPassword } = createAccount();
  await signIn(page, email, tempPassword);

  await expect(page).toHaveURL(/\/change-password$/);
  await page.getByLabel("Senha atual").fill(tempPassword);
  await page.getByLabel("Senha nova (12 caracteres ou mais)").fill(PASSWORD);
  await page.getByLabel("Confirme a senha nova").fill(PASSWORD);
  await page.getByRole("button", { name: "Trocar a senha" }).click();

  await expect(page).toHaveURL(/\/setup\/2fa$/);
  await page.getByLabel("Sua senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Continuar" }).click();
  const secret = ((await page.getByLabel("Chave secreta").textContent()) ?? "").replaceAll(" ", "");
  await page.getByLabel("Código de 6 dígitos").fill(totpCode(secret));
  await page.getByRole("button", { name: "Ativar" }).click();

  const codes = page.getByRole("list", { name: "Códigos de recuperação" }).locator("code");
  await expect(codes).toHaveCount(10);
  const recovery = (await codes.first().textContent()) ?? "";
  await page.getByRole("button", { name: "Já guardei, continuar" }).click();
  await home(page);

  // Cookie de sessão de produção: __Secure-, HttpOnly, Secure, SameSite=Lax, Path=/, só do host (sem Domain).
  const cookie = (await page.context().cookies()).find((c) => c.name.endsWith("session_token"));
  expect(cookie).toMatchObject({ name: "__Secure-bosun.session_token", httpOnly: true, secure: true, sameSite: "Lax", path: "/", domain: "localhost" });

  await signOut(page);
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL(/\/login\/2fa$/);
  // O código do setup já foi usado; o seguinte (aceito pela janela de ±30 s) é outro.
  await page.getByLabel("Código do app autenticador").fill(totpCode(secret, Date.now() + 30_000));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await home(page);

  await signOut(page);
  await signIn(page, email, PASSWORD);
  await expect(page).toHaveURL(/\/login\/2fa$/);
  await page.getByText("Usar um código de recuperação").click();
  await page.getByLabel("Código de recuperação").fill(recovery);
  await page.getByRole("button", { name: "Entrar com o código" }).click();
  await home(page);

  // Sessão recém-criada: gerar códigos novos só pede a senha (sem step-up).
  await page.getByRole("link", { name: "Segurança" }).click();
  await expect(page.getByRole("cell", { name: /\(esta sessão\)/ })).toBeVisible();
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Gerar códigos novos" }).click();
  await expect(page.getByRole("list", { name: "Códigos de recuperação" }).locator("code")).toHaveCount(10);
  await page.getByRole("button", { name: "Sair de todos os dispositivos" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(violations).toEqual([]);
});
