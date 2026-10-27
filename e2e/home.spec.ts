import { expect, test } from "@playwright/test";
import { cspViolations } from "./csp.ts";

test("sem sessão, a página inicial leva ao login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page).toHaveTitle("Entrar · BOSUN");
  await expect(page.getByRole("heading", { level: 1, name: "Entrar na BOSUN" })).toBeVisible();
});

test("login errado mostra a mensagem genérica", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
  // Endereço novo a cada execução: o throttle da conta persiste no banco e bloquearia na sexta rodada.
  await page.getByLabel("Usuário ou e-mail").fill(`ninguem-${Date.now()}@example.com`);
  await page.getByLabel("Senha").fill("senha errada bem longa");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Usuário ou senha inválidos");
});

test("a rota de dev não existe", async ({ request }) => {
  const res = await request.post("/api/dev/example-job");
  expect(res.status()).toBe(404);
});

test("as respostas trazem os cabeçalhos de segurança e não anunciam o framework", async ({ request }) => {
  const res = await request.get("/login");
  const headers = res.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("rotas nativas do Better Auth não existem (sem catch-all)", async ({ request }) => {
  const paths = ["/api/auth/sign-up/email", "/api/auth/sign-in/email", "/api/auth/change-password", "/api/auth/get-session"];
  const statuses = await Promise.all(paths.map(async (path) => [path, (await request.post(path, { data: {} })).status()]));
  expect(statuses).toEqual(paths.map((path) => [path, 404]));
});

test("esqueci a senha registra o pedido com a mesma resposta para qualquer conta", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Esqueci a senha" }).click();
  // Digitar antes da hidratação perde o texto; o botão liga quando o React assume.
  await expect(page.getByRole("button", { name: "Pedir uma senha nova" })).toBeEnabled();
  await page.getByLabel("Usuário ou e-mail").fill("ninguem@test.local");
  await page.getByRole("button", { name: "Pedir uma senha nova" }).click();
  await expect(page.getByRole("status")).toHaveText(/Se a conta existir, o pedido foi registrado/);
});

test.describe("sem JavaScript (antes da hidratação)", () => {
  test.use({ javaScriptEnabled: false });

  // Regressão: o envio nativo por GET punha a senha na URL. Os formulários usam POST e o botão só liga com o React.
  for (const [path, button] of [
    ["/login", "Entrar"],
    ["/login/forgot", "Pedir uma senha nova"],
    ["/login/2fa", "Confirmar"],
  ] as const) {
    test(`${path}: formulário POST e botão desligado`, async ({ page }) => {
      await page.goto(path);
      const form = page.locator("form").filter({ has: page.getByRole("button", { name: button }) });
      await expect(form).toHaveAttribute("method", "post");
      await expect(page.getByRole("button", { name: button })).toBeDisabled();
    });
  }
});

test("CSP com nonce: cabeçalho de produção, scripts rodam e nenhuma violação no console", async ({ page }) => {
  const violations = cspViolations(page);
  const res = await page.goto("/login");
  const csp = res?.headers()["content-security-policy"] ?? "";
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(csp).not.toMatch(/unsafe-/);
  // Botão liga = o React hidratou sob a CSP (um erro na política deixaria todos os formulários mortos).
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
  const api = await page.request.get("/api/nada");
  expect(api.headers()["content-security-policy"]).toBe("default-src 'none'; frame-ancestors 'none'");
  const prefetch = await page.request.get("/login", { headers: { "next-router-prefetch": "1", purpose: "prefetch" } });
  expect(prefetch.headers()["content-security-policy"]).toMatch(/nonce-/);
  const other = await page.request.get("/login");
  expect(other.headers()["content-security-policy"]).not.toBe(csp);
  expect(violations).toEqual([]);
});
