import { expect, test } from "@playwright/test";

test("a página inicial abre com o título da BOSUN", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("BOSUN");
  await expect(page.getByRole("heading", { level: 1, name: "BOSUN" })).toBeVisible();
});

test("a rota de dev fica fechada no build de produção", async ({ request }) => {
  const res = await request.post("/api/dev/example-job");
  expect(res.status()).toBe(404);
});

test("as respostas trazem os cabeçalhos de segurança e não anunciam o framework", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  expect(headers["x-powered-by"]).toBeUndefined();
});
