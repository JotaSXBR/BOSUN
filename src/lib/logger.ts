/** Único ponto de saída de log. Nunca passe conteúdo de mensagem, token ou dado pessoal. */
type Level = "info" | "error";

// Só nome e mensagem: stack e propriedades de erro de banco ou HTTP podem levar host, SQL ou payload.
function describe(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : "erro não identificado";
}

function write(level: Level, scope: string, message: string, error?: unknown): void {
  const line = error === undefined ? `[${scope}] ${message}` : `[${scope}] ${message} (${describe(error)})`;
  // Único lugar autorizado a escrever no console (no-console não pega acesso por índice).
  console[level](line);
}

export const logger = {
  info: (scope: string, message: string) => write("info", scope, message),
  error: (scope: string, message: string, error?: unknown) => write("error", scope, message, error),
};
