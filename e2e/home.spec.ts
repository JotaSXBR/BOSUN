import { expect, test } from "@playwright/test";

test("sem sessão, a página inicial leva ao login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page).toHaveTitle("Entrar · BOSUN");
  await expect(page.getByRole("heading", { level: 1, name: "Entrar na BOSUN" })).toBeVisible();
});

test("login errado mostra a mensagem genérica", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Usuário ou e-mail").fill("ninguem@example.com");
  await page.getByLabel("Senha").fill("senha errada bem longa");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Usuário ou senha inválidos");
});

test("a rota de dev fica fechada no build de produção", async ({ request }) => {
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
