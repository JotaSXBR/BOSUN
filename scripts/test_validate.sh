#!/usr/bin/env bash
# Self-test do validador: um mini-bundle válido (0 erros) e um inválido (cada regra dispara).
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
export OKF_TODAY=2026-10-23
fail=0

# ---------- bundle válido ----------
v="$tmp/valid"; mkdir -p "$v/product"
cat > "$v/index.md" <<'EOF'
---
okf_version: "0.2"
---
# Mini
- [Produto](product/index.md) - Área de produto.
- [Log](log.md) - Histórico.
EOF
cat > "$v/log.md" <<'EOF'
# Log
## 2026-10-23
- b
## 2026-10-22
- a
EOF
cat > "$v/product/index.md" <<'EOF'
# Produto
- [Contato](contact.md) - Pessoa atendida.
- [Ticket](ticket.md) — Conversa de atendimento.
EOF
cat > "$v/product/contact.md" <<'EOF'
---
type: Concept
title: Contato
description: Pessoa atendida.
status: draft
tags: [crm]
generated:
  by: "agent:claude"
  at: 2026-10-23T00:00:00Z
verified: { by: "human:ana", at: 2026-10-23T00:00:00Z }
stale_after: 2027-01-01
---
# Contato
Veja `[falso](nada.md)` e [o ticket](/product/ticket.md).
```
[dentro de código](nada.md)
```
## Relações
- produz: [Ticket](ticket.md)
EOF
cat > "$v/product/ticket.md" <<'EOF'
---
type: ADR
title: Ticket
description: Conversa de atendimento.
status: stable
domain: service
---
# Ticket
## Relações
- depende_de: [Contato](/product/contact.md)
EOF

out="$("$here/validate.sh" "$v")"; code=$?
if [ $code -ne 0 ] || ! grep -q "resumo: 0 erro(s), 0 aviso(s)" <<<"$out"; then
  echo "FALHOU: bundle válido deveria passar limpo"; echo "$out"; fail=1
else echo "ok  bundle válido: código 0, sem erro nem aviso"; fi
graph="$("$here/validate.sh" "$v" --graph)"
grep -q "product/contact.md --produz--> product/ticket.md" <<<"$graph" \
  && echo "ok  --graph imprime arestas" || { echo "FALHOU: --graph"; fail=1; }

# ---------- bundle inválido ----------
b="$tmp/bad"; cp -r "$v" "$b"
# E004: frontmatter em index de subpasta + item sem descrição
printf -- '---\ntype: x\n---\n# P\n- [Contato](contact.md)\n- [Ticket](ticket.md) - t\n- [Sem FM](nofm.md) - x\n- [Ruim](badyaml.md) - x\n- [Dup](dup.md) - x\n- [ADR2](adr2.md) - x\n- [Verbo](verb.md) - x\n- [Velho](old.md) - x\n' > "$b/product/index.md"
# E005: data fora de ordem + heading inválido
printf '# Log\n## 2026-10-01\n## 2026-10-23\n## Outubro\n' > "$b/log.md"
# E001: sem frontmatter
printf '# Sem frontmatter\n' > "$b/product/nofm.md"
# E001: YAML inválido
printf -- '---\ntype: [quebrado\ntitle: X\n---\n# X\n' > "$b/product/badyaml.md"
# E002 + E003 + E010 + E006 + E008(sem seção)
printf -- '---\ntype: Concept\ntitle: Contato\nstatus: pronto\n---\n# Dup\n[quebrado](/product/nao-existe.md)\n' > "$b/product/dup.md"
# E011 + W001 + W004
long="$(printf 'x%.0s' $(seq 1 170))"
printf -- '---\ntype: ADR\ntitle: Outro ADR\ndescription: %s\nstatus: draft\ndomain: service\n---\n# A\n## Relações\n- detalha: [Ticket](ticket.md)\n' "$long" > "$b/product/adr2.md"
# E009: verbo fora do vocabulário e linha mal formada; E008: sem saída válida
printf -- '---\ntype: Concept\ntitle: Verbo\ndescription: d.\nstatus: draft\n---\n# V\n## Relações\n- inventa: [Ticket](ticket.md)\n- solto sem link\n' > "$b/product/verb.md"
# W002 + W003 + E007 (não está no index? está) -> órfão separado abaixo
printf -- '---\ntype: Concept\ntitle: Velho\ndescription: d.\nstatus: draft\nstale_after: 2020-01-01\nverified: sim\n---\n# O\n## Relações\n- parte_de: [Contato](contact.md)\n' > "$b/product/old.md"
# E007: fora de qualquer index
printf -- '---\ntype: Concept\ntitle: Orfao\ndescription: d.\nstatus: draft\n---\n# O\n## Relações\n- parte_de: [Contato](contact.md)\n' > "$b/product/orphan.md"

out="$("$here/validate.sh" "$b")"; code=$?
[ $code -ne 0 ] && echo "ok  bundle inválido: código $code" || { echo "FALHOU: bundle inválido saiu 0"; fail=1; }
expect() { # código, arquivo, trecho
  if grep -F "$1 $2" <<<"$out" | grep -qF "$3"; then echo "ok  $1 $2 ($3)"
  else echo "FALHOU: esperado $1 em $2 contendo '$3'"; fail=1; fi
}
expect E001 product/nofm.md "frontmatter ausente"
expect E001 product/badyaml.md "mal fechad"
expect E002 product/dup.md "description"
expect E003 product/dup.md "pronto"
expect E004 product/index.md "não tem frontmatter"
expect E004 product/index.md "sem descrição"
expect E005 log.md "fora de ordem"
expect E005 log.md "Outubro"
expect E006 product/dup.md "nao-existe.md"
expect E007 product/orphan.md "nenhum index"
expect E008 product/dup.md "sem seção"
expect E008 product/verb.md "sem relação de saída"
expect E009 product/verb.md "inventa"
expect E009 product/verb.md "fora do formato"
expect E010 product/dup.md "Contato"
expect E011 product/ticket.md "service"
expect W001 product/adr2.md "entrada"
expect W002 product/old.md "vencido"
expect W003 product/old.md "by/at"
expect W004 product/adr2.md "170"

[ $fail -eq 0 ] && echo "SELF-TEST OK" || { echo "SELF-TEST FALHOU"; echo "--- saída ---"; echo "$out"; }
exit $fail
