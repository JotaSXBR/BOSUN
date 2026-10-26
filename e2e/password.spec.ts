import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

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

test("primeiro login com senha temporária força a troca e depois entra", async ({ page }) => {
  const { email, tempPassword } = createAccount();
  await page.goto("/login");
  await page.getByLabel("Usuário ou e-mail").fill(email);
  await page.getByLabel("Senha").fill(tempPassword);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/change-password$/);
  await page.getByLabel("Senha atual").fill(tempPassword);
  await page.getByLabel("Senha nova (12 caracteres ou mais)").fill("cavalo correto bateria grampo");
  await page.getByLabel("Confirme a senha nova").fill("cavalo correto bateria grampo");
  await page.getByRole("button", { name: "Trocar a senha" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "BOSUN" })).toBeVisible();
});
