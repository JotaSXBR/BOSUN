---
type: Product Spec
title: Integrações externas
description: Calendário externo por workspace, calendário pessoal interno, e-mail por IMAP/SMTP, publicação social por OAuth e cota de armazenamento.
tags: [bosun, product, integrations, calendar, email, imap, storage, publications, oauth]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Integrações externas

Integração é **adaptador**, não núcleo. Cada integração tem um dono (o workspace), um escopo de dados, uma fase e um caminho de auditoria. O domínio não depende de Google, Outlook, IMAP ou RustFS; os adaptadores isolam provedores e podem ser trocados.

## Calendário

- O workspace tem **um calendário externo compartilhado**, conectado pelo Admin ou Manager. O workspace escolhe Google ou Outlook; Google entra primeiro e Outlook depois.
- A BOSUN **lê** os eventos desse calendário. Eventos criados fora da BOSUN são **somente leitura**; para editá-los, o usuário abre o provedor.
- A BOSUN **grava apenas eventos que ela criou**, identificados por propriedade privada, `iCalUID` ou `transactionId`. Edições e exclusões feitas no provedor voltam para a BOSUN.
- O **calendário pessoal** de cada membro é interno à BOSUN, privado e **sem sync externo**. Ele não entra na disponibilidade do time e não é visível a Admin/Manager.
- **Prioridade do workspace:** eventos do workspace são compromissos e bloqueiam a disponibilidade; eventos pessoais são privados, não bloqueiam o time e, se colidirem com um compromisso do workspace, a BOSUN avisa mas não impede.
- **Conflito:** campos simples seguem a alteração mais recente; mudança de horário ou participantes gera conflito explícito para resolução manual. O histórico fica no evento.
- **Sync:** incremental (Google `syncToken`, Microsoft delta), push quando disponível, ressincronização completa em token inválido, `etag`/`changeKey` para concorrência e operações idempotentes.
- **Fora da primeira versão:** múltiplas contas por membro, dois provedores no mesmo workspace, edição de evento externo e calendário pessoal externo.

## E-mail

- O canal de e-mail usa **uma caixa IMAP/SMTP compartilhada por workspace**, conectada pelo Admin ou Manager. O modelo prevê N caixas por workspace; a primeira versão entrega uma.
- **Não usa a API do Gmail e não fornece endereço BOSUN** na primeira versão. A caixa é a que o workspace já tem; o endereço visível ao cliente é o da caixa.
- **Entrada** por IMAP (polling ou IDLE), com parsing de MIME, deduplicação por `Message-ID` e anexos no RustFS.
- **Saída** por SMTP, com `In-Reply-To` e `References` para manter a conversa, cópia enviada gravada na BOSUN e opção de anexar à pasta Sent da caixa.
- **Ticket:** o e-mail chega à caixa; o ticket nasce **depois da primeira resposta** ou quando alguém promove manualmente. A regra evita transformar spam e mensagens isoladas em fila de trabalho.
- **Entrada:** e-mail é canal de Atendimento, depois do WhatsApp; não faz parte do MVP.
- **Fora da primeira versão:** Gmail API, Outlook/Graph para e-mail, OAuth de caixa, endereço BOSUN e múltiplas caixas simultâneas.

## Publicação social

- Instagram, Facebook, TikTok, YouTube, Threads e Kwai usam **OAuth e APIs oficiais** quando disponíveis; onde não há API viável, o modo assistido prepara texto/mídia e marca como publicado.
- O app OAuth é **único da BOSUN** por plataforma; os tokens ficam criptografados na **instalação dedicada do cliente**, não no banco da BOSUN.
- O app concentra review, escopos e redirect URIs; Admin/Manager conecta e desconecta contas.
- A publicação é idempotente por post + destino + horário; falha de um destino não bloqueia os outros.
- Detalhes em [Publicações e planejamento editorial](publications.md).

## Armazenamento

- Documentos, anexos de atendimento, anexos de e-mail e mídias ficam no **RustFS**, via interface S3.
- A cota é **por workspace + limite por arquivo**. Biblioteca pessoal e anexos contam na mesma cota do workspace.
- Os números de cota e de arquivo são definidos nos planos; não ficam fixos no código.
- Arquivos acima do limite por arquivo são recusados; o tratamento de vídeos grandes fica em aberto.
- **Em aberto:** lixeira e expurgo, retenção por tipo, OCR/parsing de PDF e imagem, criptografia em repouso e backup dos objetos.

## Regras comuns

- Credenciais e tokens são criptografados e nunca aparecem em logs.
- Toda conexão, desconexão, sync e ação sensível é auditada.
- Webhooks e jobs são idempotentes; falha de integração não bloqueia o núcleo.
- O conteúdo externo é dado não confiável: não vira instrução para o copiloto nem para agentes.
- A desconexão preserva o histórico local e para o sync; reconectar exige nova autorização.

## Ordem de entrada

- **Calendário:** junto do módulo de agenda, Google primeiro e Outlook depois.
- **E-mail:** depois de WhatsApp, Instagram e chat do site; não faz parte do MVP.
- **Publicação social:** depois de Atendimento e Social; o app OAuth e o review entram na reconciliação técnica.
- **Armazenamento:** desde o MVP para mídia de WhatsApp; biblioteca de documentos na fase pessoal.
- **Planos e limites:** assinatura simples por instalação, sem tiers; cotas de armazenamento e limite por arquivo entram na reconciliação técnica. Ver [Planos, hospedagem e cobrança](plans.md).

## Decisões de 2026-10-23

- E-mail é **sempre IMAP/SMTP, sem OAuth**; ver [Atendimento](service.md#decisões-de-2026-10-23).

## Links

- [Agenda e calendário](calendar.md)
- [Atendimento multicanal](service.md)
- [Publicações e planejamento editorial](publications.md)
- [Itens, notas, documentos e conhecimento](content-model.md)
- [Papéis e permissões](roles-permissions.md)
- [ADR-105 — Calendário externo por workspace](../decisions/adr-105-work-time.md)
- [ADR-107 — E-mail IMAP e cota de armazenamento](../decisions/adr-107-service-social.md)
- [ADR-108 — Área de Publicações](../decisions/adr-108-publications.md)
