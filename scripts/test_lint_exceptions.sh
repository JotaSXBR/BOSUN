#!/usr/bin/env bash
# Self-test do lint_exceptions.sh. Uso: ./scripts/test_lint_exceptions.sh
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
fail=0
check() { # nome, código esperado, teto, conteúdo, arquivo (padrão src/a.ts)
  rm -rf "${tmp:?}"/*; f="$tmp/${5:-src/a.ts}"; mkdir -p "$(dirname "$f")"; printf '%b\n' "$4" > "$f"
  (cd "$tmp" && LINT_EXCEPTIONS_MAX="$3" bash "$here/lint_exceptions.sh" >/dev/null 2>&1); got=$?
  if [ "$got" = "$2" ]; then echo "ok   $1"; else echo "FAIL $1 (esperado $2, veio $got)"; fail=1; fi
}
check "sem exceção passa"                  0 0 'const a = 1;'
check "com motivo dentro do teto"          0 1 '// oxlint-disable-next-line no-console -- log de boot'
check "sem motivo reprova"                 1 5 '// oxlint-disable-next-line no-console'
check "motivo vazio reprova"               1 5 '// oxlint-disable-next-line no-console -- '
check "acima do teto reprova"              1 0 '// oxlint-disable-next-line no-console -- log de boot'
check "bloco sem motivo reprova"           1 5 '/* oxlint-disable no-console */'
check "bloco com motivo vazio reprova"     1 5 '/* oxlint-disable x -- */'
check "eslint-disable conta também"        1 5 '// eslint-disable-next-line no-console'
check "soma as exceções contra o teto"     1 1 '// oxlint-disable-next-line a -- x\n// oxlint-disable-next-line b -- y'
check "-- de código não vale como motivo"  1 5 'i--; // oxlint-disable-line no-console'
check "arquivo na raiz conta"              1 5 '// oxlint-disable-next-line x' vitest.config.ts
check "tsx conta"                          1 5 '// oxlint-disable-next-line x' src/a.tsx
check "cjs conta"                          1 5 '// oxlint-disable-next-line x' a.cjs
check "texto fora de comentário não conta" 0 0 'const s = "use oxlint-disable com cuidado";'
check "código gerado não conta"            0 0 '/* eslint-disable */' src/generated/client.ts
exit $fail
