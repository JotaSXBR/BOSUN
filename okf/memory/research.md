---
type: Research Notes
title: Pesquisa
description: OKF, WAHA/GOWS, Google People API, LGPD e desenvolvimento com IA.
tags: [bosun, research, okf, waha, google, lgpd]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
stale_after: 2027-01-31
sources:
  - resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
    title: OKF specification
  - resource: https://waha.devlike.pro/docs/engines/gows/
    title: WAHA — GOWS engine
  - resource: https://waha.devlike.pro/docs/how-to/receive-messages/
    title: WAHA — Receive messages
  - resource: https://waha.devlike.pro/docs/how-to/send-messages/
    title: WAHA — Send messages
  - resource: https://developers.google.com/people/v1/contacts
    title: Google People API — Contacts
  - resource: https://developers.google.com/people/api/rest/v1/people/createContact
    title: Google People API — createContact
  - resource: https://developers.google.com/people/api/rest/v1/people/batchUpdateContacts
    title: Google People API — batchUpdateContacts
  - resource: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
    title: Lei Geral de Proteção de Dados (LGPD)
  - resource: https://opencode.ai/v2/docs/instructions/
    title: OpenCode — AGENTS.md
  - resource: https://www.wesalescrm.com/
    title: WeSales CRM
  - resource: https://www.selliq.io/pt-BR
    title: Selliq — Sales Intelligence com IA Multi-Agente
  - resource: https://github.com/fazer-ai/agents
    title: fazer.ai agents
---

# Pesquisa

## OKF v0.2 — 2026-10-21

- **Open Knowledge Format** do Google: diretório de arquivos Markdown com frontmatter YAML.
- `type` é obrigatório; `title`, `description`, `tags`, `status`, `generated`, `verified`, `sources` e `stale_after` são recomendados.
- `index.md` fornece divulgação progressiva; conceitos devem ser atômicos e ligados por links.
- Sem schema registry ou tooling obrigatório; legível por humanos e agentes.
- Revisão completa de `https://okf.ia.br/` em 2026-10-21: 12 páginas e skill oficial lidos integralmente.
- Conformidade tem três regras; `index.md` e `log.md` são reservados. `index.md` não tem frontmatter, exceto `okf_version: "0.2"` na raiz.
- `index.md` é um mapa com uma linha por item e descrição curta; `log.md` usa `## YYYY-MM-DD`, mais recente primeiro.
- v0.2 recomenda `sources`, `generated`, `verified` e `stale_after`; a ausência desses campos não quebra conformidade.
- Fonte: <https://okf.ia.br/spec/>, <https://okf.ia.br/guia-rapido/>, <https://okf.ia.br/skill/>
- Fonte da spec: <https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md>

## WAHA/GOWS — 2026-10-21

- WAHA é uma aplicação Node.js que expõe API REST e webhooks sobre engines de WhatsApp.
- GOWS comunica direto por WebSocket com o WhatsApp Web, sem navegador; é a nova geração e substituto do NOWEB.
- Execução: `docker run -v ... -e "WHATSAPP_DEFAULT_ENGINE=GOWS" devlikeapro/waha`.
- Endpoints principais: sessões (`/api/sessions`), envio (`/api/sendText`, mídia), status e QR.
- Recebimento por webhook com evento `message`; configurar URL por sessão.
- GOWS não suporta `GET /api/messages` nem `forwardMessage`; usar webhooks e endpoints suportados.
- `chatId` no formato `123@c.us`; `@s.whatsapp.net` aparece em `_data` e deve ser convertido.
- Fontes: <https://waha.devlike.pro/docs/engines/gows/>, <https://waha.devlike.pro/docs/how-to/receive-messages/>, <https://waha.devlike.pro/docs/how-to/send-messages/>

## Google People API — 2026-10-21

- Escopo de leitura e escrita: `https://www.googleapis.com/auth/contacts`.
- Escopo somente leitura: `https://www.googleapis.com/auth/contacts.readonly`.
- "Other Contacts" usa `https://www.googleapis.com/auth/contacts.other.readonly` e é somente leitura.
- Sync incremental: `people.connections.list` com `requestSyncToken` e `syncToken`; token expirado força sync completo.
- Atualizações/exclusões exigem `etag`; mutações do mesmo usuário devem ser sequenciais; batch de até 200 contatos.
- Escritas podem ter atraso de propagação de minutos; sync incremental não serve para read-after-write.
- O escopo `contacts` é sensível e pode exigir verificação OAuth do Google antes de produção.
- Fontes: <https://developers.google.com/people/v1/contacts>, <https://developers.google.com/people/api/rest/v1/people/createContact>, <https://developers.google.com/people/api/rest/v1/people/batchUpdateContacts>

## Agentes, automação e comercial — 2026-10-22

- **WeSales**: CRM all-in-one com planos de R$ 147, R$ 197 e R$ 297/mês, usuários ilimitados, 15+ automações, Instagram (comentários e Direct), agentes de IA e checkout self-serve. É CRM-first e sales-led; o formato de tiers foi rejeitado.
- **Selliq**: o **Modo Monitoramento** começa com a IA desligada; a plataforma observa o time real, mede tempo de resposta, agenda, follow-up e score do time/lead, e só ativa o agente quando o cliente confia. Usa multi-agente com revisores. Cobra por volume de conversa (R$ 597/1.497/3.997) e é sales-led.
- **fazer.ai agents**: plataforma self-hosted com prompt + ferramentas + servidores MCP + skills; **dry-run por padrão** nas escritas, aprovação, playground, auditoria, modelo por agente, cofre e custo por uso. Serve de referência para a camada de configuração dos agentes.
- **Implicação para a BOSUN**: Observer como modo sombra e sugestão; agentes de execução separados; automação determinística + agentes reativos; BYOK; assinatura simples por instalação.
- O usuário tem outras fontes open source e pagas, além de um projeto anterior pausado com documentação; incorporar na reconciliação técnica.
- Fontes: <https://www.wesalescrm.com/>, <https://www.selliq.io/pt-BR>, <https://github.com/fazer-ai/agents>

## LGPD — 2026-10-21

- BOSUN operadora; workspace controlador.
- Foco em base legal, finalidade, direitos, retenção, minimização, segurança e suboperadores.
- Revisão jurídica necessária; o produto fornece controles, não presume conformidade.
- Transferência internacional precisa ser verificada para Google, Cloudflare e Resend.

## AI-driven development — 2026-10-21

- **Spec-Driven Development:** constituição → especificação → clarificação → plano → tarefas → implementação → validação.
- **Context engineering:** tarefa, código, equipe e temporal; registrar arquitetura, convenções, ADRs e restrições.
- **EPIC:** requisitos expressivos, precisos, interpretáveis e compartimentados; MUST/SHOULD e critérios verificáveis.
- **Regra de ouro:** usar o mínimo de rigor que remove ambiguidade; spec-first no início, spec-anchored em sistemas longevos.
- Uma pessoa + IA tende a se beneficiar de stack full-stack TypeScript.
- Fontes: Microsoft SDD (2026), GitHub Spec Kit, arXiv EPIC, Context Engineering.

## OpenCode AGENTS.md — 2026-10-21

- OpenCode V2 reconhece **apenas `AGENTS.md`**; não usa `CLAUDE.md` como fallback.
- O arquivo da raiz é carregado automaticamente; arquivos aninhados são descobertos conforme a exploração.
- Use para comandos, arquitetura, convenções e verificação.
- Fonte: <https://opencode.ai/v2/docs/instructions/>

## Links

- [Estado atual](current-state.md)
- [Log de decisões](decision-log.md)
