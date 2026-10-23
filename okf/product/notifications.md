---
type: Product Spec
title: Notificações
description: Três níveis de interrupção, push só no primeiro, silêncio para o resto e e-mail opt-in.
tags: [bosun, product, notifications, push, email, preferences, silence]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Notificações

## Canais

- **In-app** — padrão.
- **Web push** — quando o navegador permitir; no iOS, só com o PWA instalado.
- **E-mail** — disponível, **desligado por padrão** e sem função de interrupção; serve como resumo.
- **E-mail transacional** — convites e avisos usam um provedor transacional (Resend no stack atual), separado da caixa IMAP de atendimento.

## Níveis de interrupção

Ver [ADR-110](../decisions/adr-110-notifications-gamification-apps.md).

| Nível | O que entra | Como chega |
|---|---|---|
| **Interrompe** | menção direta, atribuição ou reatribuição para você, aprovação pedida a você, avisos de conta e segurança | push + in-app |
| **Agrupa** | comentário, mudança de status, movimento do time | in-app, agrupado por hora ou item |
| **Só no Meu dia** | prazo, sugestão do Observer, arquivamento pendente, resumos | sem push |

- **Push só no nível 1.** In-app cobre 1 e 2.
- **E-mail nunca interrompe.**
- Sem push disponível, o padrão real é in-app + badge; a promessa de SLA não depende de push.

## Eventos notificáveis

- Menções e notas internas.
- Atribuição e reatribuição de conversa ou tarefa.
- Aprovação de publicação pendente.
- Prazos, atrasos e check-ins.
- Violações de SLA — **apenas dentro do horário comercial**, como o próprio relógio do SLA.
- Convites, mudanças de papel e avisos do workspace.
- Respostas em atendimentos atribuídos ao usuário.
- Aguardando arquivamento (pacote de encerramento).

## Regras

- A notificação respeita **permissões e privacidade**.
- A notificação **guarda referência, não cópia**: a permissão é resolvida no read time; se o acesso foi revogado, ela desaparece ou é redigida.
- O usuário controla canal e frequência por módulo, por workspace e por membro.
- Convites e avisos críticos do workspace não podem ser silenciados.
- **Horário de silêncio** cala os níveis 2 e 3; conta e segurança furam o silêncio.
- Nada de copy que pressione: sem contagem regressiva, culpa ou gamificação de alerta.

## Em aberto

- Resumo diário ou semanal por e-mail.
- Notificação por WhatsApp ou outros canais.
- Janela de agrupamento por padrão.
- Provedor transacional, domínio de envio e reputação.
- Resumo com conteúdo ou só contagem.

## Links

- [Meu dia](my-day.md)
- [Atendimento multicanal](service.md)
- [ADR-110 — Busca híbrida e notificações](../decisions/adr-110-notifications-gamification-apps.md)
- [ADR-110 — Níveis de interrupção](../decisions/adr-110-notifications-gamification-apps.md)
