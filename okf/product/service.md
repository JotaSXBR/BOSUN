---
type: Product Spec
title: Atendimento multicanal
description: Canais, ticket, atribuição manual, SLA por canal, e-mail IMAP, métricas e colaboração interna.
tags: [bosun, product, service, channels, tickets, sla, csat]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Atendimento multicanal

O atendimento é o módulo estruturante da BOSUN. O MVP fixou WhatsApp via WAHA/GOWS, inbox de três colunas, status padrão, fila FIFO que apenas ordena e atribuição manual. O produto completo amplia canais e operação sem reconstruir o núcleo.

## Áreas

O produto tem duas áreas: **Social** e **Atendimento**. A separação, o ticket único e os estados de dono estão em [Social e atendimento](social.md).

### Atendimento

- **WhatsApp** — canal do MVP, via WAHA/GOWS.
- **Chat do site** — conversa em tempo real no site do workspace, com **nome, e-mail e telefone exigidos antes da primeira mensagem**; não existe conversa anônima. Ver [ADR-106](../decisions/adr-106-contacts-crm.md).
- **Telegram** — mensagens diretas e grupos.
- **E-mail** — caixa IMAP/SMTP compartilhada; ticket só depois da primeira resposta. Tem UI própria, com assunto, thread, destinatários, CC/CCO e anexos.

### Social

- **Instagram**, **Facebook**, **TikTok** e **Kwai** — comentários, stories, menções e DMs. O TikTok e o Kwai entram quando houver API oficial viável.

Cada canal tem adaptador próprio. Inbox, ticket, contato, contexto, tarefas e copiloto são independentes do canal. Um novo canal não reconstrói o produto.

## E-mail por IMAP/SMTP

- O workspace conecta **uma caixa compartilhada** via IMAP/SMTP; o modelo prevê N caixas, a primeira versão entrega uma.
- O Admin/Manager conecta e desconecta; membros com permissão de atendimento leem e respondem.
- **Não usa a API do Gmail e não fornece endereço BOSUN** na primeira versão. O endereço visível é o da caixa do workspace.
- Entrada por IMAP (polling ou IDLE), saída por SMTP; a conversa é amarrada por `Message-ID`, `In-Reply-To` e `References`.
- Anexos vão para o RustFS e contam na cota do workspace.
- O e-mail chega à caixa; o ticket nasce **depois da primeira resposta** ou por promoção manual.
- Spam e entrega dependem do provedor da caixa; a BOSUN complementa com checagem de cabeçalhos e deduplicação.
- E-mail é canal de Atendimento, depois do WhatsApp; não faz parte do MVP.

## Ticket

- A conversa e o ticket são **uma única entidade**, compartilhada entre Social e Atendimento; `area` deriva do canal.
- O ticket é **por conversa de canal**: a mesma pessoa pode ter vários tickets abertos, cada um com dono, status, SLA, CSAT e histórico próprios. Uma conversa aberta por thread, nunca por contato. Ver [ADR-107](../decisions/adr-107-service-social.md).
- A pessoa é reunida numa **linha do tempo** na ficha do contato; o ticket avisa quando há outra conversa aberta com ela.
- A **fusão de tickets é exceção manual** e auditada; a divisão fica de fora por ora.
- Início por nova conversa ou mensagem recebida.
- Estados de dono: **automação → agente → aguardando humano → humano → encerrado**.
- Status padrão: **Novo, Em andamento, Aguardando, Resolvido**; o Admin pode criar, renomear e reordenar status.
- Cada status tem nome, cor, ordem e indica se conta como resolvido.
- Conversa pode virar tarefa, evento, projeto, follow-up ou documento.
- O ticket preserva canal, área, contato, histórico, anexos, pendências e decisões.
- Promoção de Social para Atendimento mantém o mesmo ticket e muda a política de SLA/CSAT.

## Distribuição

- A atribuição é **manual**, como no MVP.
- A fila continua **apenas ordenando** pela mensagem sem resposta mais antiga.
- O Admin pode restringir a visibilidade de uma sessão por papel.
- **Pendentes** segue reservado aos agentes de IA; no MVP fica visível e desabilitado.

## Colaboração interna

- **Notas internas** privadas dentro do ticket.
- **Menções** a colegas.
- A nota não é enviada ao cliente.

## SLA

- Metas de **primeira resposta** e **resolução** por canal, válidas na área de Atendimento.
- O SLA conta **apenas o horário comercial**; fora do horário, o relógio pausa.
- A área Social **não tem SLA nem CSAT antes do handoff**; a partir da promoção para Atendimento, valem as metas do canal.
- Violações ficam visíveis para o Manager.
- Se ninguém assumir dentro do SLA, o sistema apenas notifica; não redistribui nem escala automaticamente.

## Métricas

- Tempo de primeira resposta.
- Tempo de resolução.
- Volume por canal.
- SLA e violações.
- CSAT.
- Carga por atendente.

Métricas de audiência, funil e venda ficam no **dashboard social**, descrito em [Social e atendimento](social.md).

O **CSAT é ativável ou desativável** nas configurações. Quando desativado, restam apenas as métricas internas; quando ativado, o cliente recebe uma pesquisa e dá uma **nota**. A escala e o gatilho ainda serão definidos.

## Riscos de canal

- TikTok, Kwai e Facebook podem não oferecer API oficial de mensagens diretas estável; o adaptador pode depender de provedor intermediário ou ficar fora de fase.
- WhatsApp via WAHA/GOWS não é API oficial da Meta e envolve risco de bloqueio do número.
- Cada canal exige revisão própria de termos, privacidade e retenção.

## Em aberto

- Ordem e fase de entrada de cada canal.
- Viabilidade técnica e termos de TikTok, Kwai e Facebook.
- Múltiplas contas por canal.
- E-mail: provedores IMAP, OAuth para Gmail/Outlook, lixeira e expurgo, limites de anexo, loops de auto-resposta e sincronização da pasta Sent.
- Regra de SLA por prioridade, não só por canal.
- Feriados e exceções de horário comercial.
- Escala e gatilho do CSAT.
- Fusão de tickets — tratada como exceção manual no [ADR-107](../decisions/adr-107-service-social.md); a divisão fica de fora por ora; duplicidade de contatos é tratada pelo [ADR-106](../decisions/adr-106-contacts-crm.md).
- Limites e permissões dos agentes de IA.
- Regra de SLA por prioridade dentro da área de Atendimento.
- Quais filas sociais existem e qual time assume cada uma.

## Decisões de 2026-10-23

- **CSAT 1 a 5** com comentário opcional, enviado uma vez ao encerrar, aceito por 24 h; desligável por canal.
- **SLA:** calendário de feriados por workspace, já com os nacionais do Brasil; o relógio **pausa em "aguardando cliente"**. SLA por prioridade fica para depois.
- **E-mail sempre por IMAP/SMTP, sem OAuth**, para qualquer provedor (Gmail com senha de app). IMAP IDLE; antilaço por `Auto-Submitted`/`X-Autoreply`; gravar em Enviados por `APPEND` quando o servidor não grava. **Risco:** Microsoft 365 e Outlook.com não aceitam mais senha em IMAP; essas caixas ficam sem suporte enquanto a regra valer.

## Links

- [Social e atendimento](social.md)
- [Automações e fluxos](automations.md)
- [Integrações externas](integrations.md)
- [Contatos, empresas e negócios](crm.md)
- [Caixa de atendimento e WhatsApp (MVP)](inbox-whatsapp.md)
- [Papéis e permissões](roles-permissions.md)
- [ADR-107 — Atendimento multicanal](../decisions/adr-107-service-social.md)
- [ADR-107 — E-mail IMAP e cota de armazenamento](../decisions/adr-107-service-social.md)
- [ADR-107 — Social e atendimento em um ticket único](../decisions/adr-107-service-social.md)
