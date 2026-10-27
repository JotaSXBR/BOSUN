import type { Page } from "@playwright/test";

/** Junta as violações de CSP que o navegador escreve no console da página (a lista fica viva). */
export function cspViolations(page: Page): string[] {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (/Content Security Policy|CSP/i.test(msg.text())) violations.push(msg.text());
  });
  return violations;
}
