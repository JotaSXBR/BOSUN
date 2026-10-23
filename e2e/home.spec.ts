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
