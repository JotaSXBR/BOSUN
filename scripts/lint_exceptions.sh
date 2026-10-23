#!/usr/bin/env bash
# Exceções do oxlint: cada uma exige "-- motivo" e o total não passa do teto.
# O teto só sobe com aprovação no pull request (padrão de qualidade).
set -euo pipefail
max="${LINT_EXCEPTIONS_MAX:-0}"
# Mesmo escopo do oxlint: o repositório todo, menos dependências, saídas e código gerado.
hits="$(grep -rnE \
  --include='*.ts' --include='*.tsx' --include='*.mts' --include='*.cts' \
  --include='*.js' --include='*.jsx' --include='*.mjs' --include='*.cjs' \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage --exclude-dir=.git \
  --exclude-dir=generated --exclude-dir=migrations --exclude-dir=okf --exclude-dir=archive \
  '(//|/\*)[[:space:]]*(oxlint|eslint)-disable' . || true)"
total=0; bad=0
while IFS= read -r line; do
  [ -n "$line" ] || continue
  total=$((total + 1))
  # O motivo vem depois da diretiva: " -- texto".
  if ! sed -E 's/.*(oxlint|eslint)-disable//' <<<"$line" | grep -qE '[[:space:]]--[[:space:]]+[^[:space:]*/]'; then
    echo "sem motivo: $line"; bad=1
  fi
done <<<"$hits"
echo "exceções: $total (teto $max)"
[ "$total" -le "$max" ] || { echo "acima do teto; suba LINT_EXCEPTIONS_MAX no ci.yml com aprovação no PR"; bad=1; }
exit $bad
