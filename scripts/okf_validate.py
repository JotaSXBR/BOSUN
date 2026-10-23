#!/usr/bin/env python3
"""Validador do perfil OKF BOSUN (okf/okf-profile.md). Só biblioteca padrão.

Uso: okf_validate.py <raiz-do-bundle> [--graph]
Sai com 1 se houver erro; avisos não mudam o código de saída.
"""
import datetime
import os
import re
import sys

REQUIRED = ("type", "title", "description", "status")
STATUSES = {"draft", "stable", "deprecated"}
DEFAULT_VOCAB = {"depende_de", "produz", "consome", "aciona",
                 "governado_por", "parte_de", "detalha", "substitui"}
RELATIONS_H = "## Relações"
LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)\s]+)\)")
REL_RE = re.compile(r"^\s*[-*]\s+([a-z_]+):\s*(.+)$")
INDEX_ITEM_RE = re.compile(r"^\s*[-*]\s+\[[^\]]+\]\([^)]+\)\s*(?:-|—|–|:)\s*\S")
LOG_H_RE = re.compile(r"^## (\d{4}-\d{2}-\d{2})\s*$")
KEY_RE = re.compile(r"^([A-Za-z_][\w-]*):(?:\s+(.*))?$")


class Report:
    def __init__(self):
        self.errors, self.warnings = [], []

    def err(self, code, path, line, msg):
        self.errors.append(f"ERRO {code} {path}:{line}: {msg}")

    def warn(self, code, path, line, msg):
        self.warnings.append(f"AVISO {code} {path}:{line}: {msg}")


# ---------- YAML mínimo (o subconjunto que o perfil permite) ----------

def _split_flow(s):
    parts, depth, cur, quote = [], 0, "", None
    for ch in s:
        if quote:
            cur += ch
            if ch == quote:
                quote = None
        elif ch in "\"'":
            quote = ch
            cur += ch
        elif ch in "[{":
            depth += 1
            cur += ch
        elif ch in "]}":
            depth -= 1
            cur += ch
        elif ch == "," and depth == 0:
            parts.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if quote or depth:
        raise ValueError("lista/mapa inline mal fechado")
    if cur.strip():
        parts.append(cur.strip())
    return parts


def _scalar(v):
    v = v.strip()
    if v.startswith("["):
        if not v.endswith("]"):
            raise ValueError(f"lista inline mal fechada: {v}")
        return [_scalar(p) for p in _split_flow(v[1:-1])]
    if v.startswith("{"):
        if not v.endswith("}"):
            raise ValueError(f"mapa inline mal fechado: {v}")
        out = {}
        for p in _split_flow(v[1:-1]):
            k, sep, val = p.partition(":")
            if not sep or not k.strip():
                raise ValueError(f"par inválido no mapa: {p}")
            out[k.strip()] = _scalar(val)
        return out
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        return v[1:-1]
    if v and v[0] in "\"'":
        raise ValueError(f"aspas não fechadas: {v}")
    return v


def parse_yaml(lines):
    """Mapa de topo com escalares, listas/mapas inline e blocos de 1 nível."""
    data, key = {}, None
    for i, raw in enumerate(lines):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw[0] in " \t":
            if key is None or not (data[key] is None or isinstance(data[key], (list, dict))):
                raise ValueError(f"indentação inesperada na linha {i + 2}")
            s = raw.strip()
            if s.startswith("- "):
                if data[key] is None:
                    data[key] = []
                if not isinstance(data[key], list):
                    raise ValueError(f"mistura de lista e mapa na linha {i + 2}")
                m = KEY_RE.match(s[2:].strip())
                if m and not s[2:].lstrip().startswith(("[", "{", "\"", "'")):
                    data[key].append({m.group(1): _scalar(m.group(2) or "")})
                else:
                    data[key].append(_scalar(s[2:]))
            else:
                m = KEY_RE.match(s)
                if not m:
                    raise ValueError(f"linha inválida {i + 2}: {s}")
                if isinstance(data[key], list) and data[key] and isinstance(data[key][-1], dict):
                    data[key][-1][m.group(1)] = _scalar(m.group(2) or "")  # continuação de item-mapa
                    continue
                if data[key] is None:
                    data[key] = {}
                if not isinstance(data[key], dict):
                    raise ValueError(f"mistura de lista e mapa na linha {i + 2}")
                data[key][m.group(1)] = _scalar(m.group(2) or "")
            continue
        m = KEY_RE.match(raw.rstrip())
        if not m:
            raise ValueError(f"linha inválida {i + 2}: {raw.strip()}")
        key = m.group(1)
        if key in data:
            raise ValueError(f"chave repetida: {key}")
        data[key] = _scalar(m.group(2)) if m.group(2) else None
    return data


def split_frontmatter(text):
    """(dict|None, corpo, linha onde o corpo começa, erro|None)."""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return None, text, 1, None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            try:
                fm = parse_yaml(lines[1:i])
            except ValueError as e:
                return None, "\n".join(lines[i + 1:]), i + 2, str(e)
            return fm, "\n".join(lines[i + 1:]), i + 2, None
    return None, text, 1, "frontmatter sem '---' de fechamento"


# ---------- utilidades ----------

def body_lines(body, start):
    """Linhas fora de blocos de código, com número real e código inline removido."""
    fence = False
    for n, line in enumerate(body.split("\n"), start):
        if line.lstrip().startswith(("```", "~~~")):
            fence = not fence
            continue
        if not fence:
            yield n, re.sub(r"`[^`]*`", "", line)


def resolve(root, src_rel, target):
    """Caminho relativo à raiz do bundle, ou None se não for link interno."""
    if re.match(r"^[a-z][a-z0-9+.-]*:", target, re.I) or target.startswith("#"):
        return None
    target = target.split("#", 1)[0]
    if not target:
        return None
    if target.startswith("/"):
        path = os.path.normpath(target.lstrip("/"))
    else:
        path = os.path.normpath(os.path.join(os.path.dirname(src_rel), target))
    return path.replace(os.sep, "/")


def load_vocab(root):
    p = os.path.join(root, "okf-profile.md")
    if not os.path.exists(p):
        return set(DEFAULT_VOCAB)
    vocab, inside = set(), False
    with open(p, encoding="utf-8") as f:
        for line in f:
            if line.startswith("## "):
                inside = line.strip().lower().startswith("## vocabulário")
                continue
            m = re.match(r"^\s*[-*]\s+`([a-z_]+)`", line)
            if inside and m:
                vocab.add(m.group(1))
    return vocab or set(DEFAULT_VOCAB)


def as_date(v):
    try:
        return datetime.date.fromisoformat(str(v)[:10])
    except ValueError:
        return None


# ---------- validação ----------

def validate(root, today=None):
    today = today or datetime.date.today()
    rep = Report()
    vocab = load_vocab(root)
    files = []
    for d, dirs, names in os.walk(root):
        dirs[:] = sorted(x for x in dirs if not x.startswith("."))
        for n in sorted(names):
            if n.endswith(".md"):
                files.append(os.path.relpath(os.path.join(d, n), root).replace(os.sep, "/"))
    fileset = set(files)
    nodes, edges, indexed = {}, [], set()
    titles, domains = {}, {}

    for rel in files:
        with open(os.path.join(root, rel), encoding="utf-8-sig") as f:
            text = f.read().replace("\r\n", "\n")
        fm, body, start, fm_err = split_frontmatter(text)
        name = os.path.basename(rel)
        lines = list(body_lines(body, start))

        # links internos (todas as linhas)
        for n, line in lines:
            for _, target in LINK_RE.findall(line):
                path = resolve(root, rel, target)
                if path is None:
                    continue
                if path.startswith("../") or path == "..":
                    rep.err("E006", rel, n, f"link sai do bundle: {target}")
                elif path not in fileset and not os.path.exists(os.path.join(root, path)):
                    rep.err("E006", rel, n, f"link quebrado: {target}")
                elif name == "index.md":
                    indexed.add(path)

        if name == "index.md":
            if fm_err:
                rep.err("E004", rel, 1, f"frontmatter inválido em index.md: {fm_err}")
            elif fm is not None and (rel != "index.md" or set(fm) != {"okf_version"}):
                rep.err("E004", rel, 1, "index.md não tem frontmatter (só o raiz, com okf_version e nada mais)")
            for n, line in lines:
                if LINK_RE.search(line) and re.match(r"^\s*[-*]\s+\[", line) and not INDEX_ITEM_RE.match(line):
                    rep.err("E004", rel, n, "item de índice sem descrição curta após o link")
            continue

        if name == "log.md":
            if fm is not None or fm_err:
                rep.err("E005", rel, 1, "log.md não tem frontmatter")
            prev = None
            for n, line in lines:
                if line.startswith("## "):
                    m = LOG_H_RE.match(line)
                    if not m or not as_date(m.group(1)):
                        rep.err("E005", rel, n, f"heading de log fora do formato ## YYYY-MM-DD: {line.strip()}")
                        continue
                    if prev and m.group(1) >= prev:
                        rep.err("E005", rel, n, "entradas fora de ordem (mais recente primeiro, sem repetir data)")
                    prev = m.group(1)
            continue

        # concept
        if fm_err or fm is None:
            rep.err("E001", rel, 1, fm_err or "frontmatter ausente")
            continue
        for k in REQUIRED:
            if not isinstance(fm.get(k), str) or not fm[k].strip():
                rep.err("E002", rel, 1, f"campo obrigatório ausente ou vazio: {k}")
        status = fm.get("status")
        if isinstance(status, str) and status and status not in STATUSES:
            rep.err("E003", rel, 1, f"status fora da lista: {status}")
        if "okf_version" in fm:
            rep.err("E001", rel, 1, "okf_version só no index.md raiz")
        desc = fm.get("description")
        if isinstance(desc, str) and len(desc) > 160:
            rep.warn("W004", rel, 1, f"description com {len(desc)} caracteres (> 160)")
        stale = fm.get("stale_after")
        if stale is not None:
            d = as_date(stale)
            if not d:
                rep.err("E001", rel, 1, f"stale_after não é data ISO: {stale}")
            elif d < today:
                rep.warn("W002", rel, 1, f"stale_after vencido em {stale}")
        if "verified" in fm:
            v = fm["verified"]
            if not (isinstance(v, dict) and v.get("by") and v.get("at")):
                rep.warn("W003", rel, 1, "verified sem by/at")
        title = fm.get("title")
        if isinstance(title, str) and title.strip():
            key = title.strip().lower()
            if key in titles:
                rep.err("E010", rel, 1, f"título duplicado com {titles[key]}: {title}")
            else:
                titles[key] = rel
        if fm.get("type") == "ADR":
            dom = fm.get("domain")
            if not isinstance(dom, str) or not dom.strip():
                rep.err("E002", rel, 1, "ADR sem campo domain")
            elif dom.strip().lower() in domains:
                rep.err("E011", rel, 1, f"segundo ADR para o domínio '{dom}' (o outro: {domains[dom.strip().lower()]})")
            else:
                domains[dom.strip().lower()] = rel
        nodes[rel] = {"type": fm.get("type"), "title": title}

        # relações
        in_rel, rel_line, out = False, None, 0
        for n, line in lines:
            if line.startswith("## "):
                in_rel = line.strip() == RELATIONS_H
                if in_rel:
                    rel_line = n
                continue
            if not in_rel or not line.strip():
                continue
            m = REL_RE.match(line)
            links = LINK_RE.findall(m.group(2)) if m else []
            if not m or not links:
                rep.err("E009", rel, n, f"linha de relação fora do formato '- verbo: [Texto](link)': {line.strip()}")
                continue
            verb = m.group(1)
            if verb not in vocab:
                rep.err("E009", rel, n, f"verbo fora do vocabulário: {verb}")
                continue
            for _, target in links:
                path = resolve(root, rel, target)
                if path and path in fileset:
                    edges.append((rel, verb, path))
                    out += 1
        if rel_line is None:
            rep.err("E008", rel, len(text.split("\n")), "concept sem seção '## Relações'")
        elif out == 0:
            rep.err("E008", rel, rel_line, "seção Relações sem relação de saída válida")

    for rel in files:
        if rel != "index.md" and rel not in indexed:
            rep.err("E007", rel, 1, "arquivo não aparece em nenhum index.md")
    incoming = {dst for _, _, dst in edges}
    for rel in nodes:
        if rel not in incoming:
            rep.warn("W001", rel, 1, "nó sem relação de entrada")
    return rep, nodes, edges


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 1:
        print("uso: okf_validate.py <raiz-do-bundle> [--graph]", file=sys.stderr)
        return 2
    root = args[0]
    if not os.path.isdir(root):
        print(f"bundle não encontrado: {root}", file=sys.stderr)
        return 2
    today = os.environ.get("OKF_TODAY")
    rep, nodes, edges = validate(root, as_date(today) if today else None)
    if "--graph" in argv:
        print(f"# nós ({len(nodes)})")
        for rel, n in sorted(nodes.items()):
            print(f"{rel} [{n['type']}] {n['title']}")
        print(f"# arestas ({len(edges)})")
        for src, verb, dst in sorted(edges):
            print(f"{src} --{verb}--> {dst}")
        return 1 if rep.errors else 0
    for line in rep.errors + rep.warnings:
        print(line)
    print(f"resumo: {len(rep.errors)} erro(s), {len(rep.warnings)} aviso(s), {len(nodes)} nó(s), {len(edges)} aresta(s)")
    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
