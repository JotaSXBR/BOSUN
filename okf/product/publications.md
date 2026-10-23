---
type: Product Spec
title: Publicações e planejamento editorial
description: Área de planejamento, publicação e análise de posts em seis plataformas, com automação e venda atribuída.
tags: [bosun, publications, social, scheduling, composer, calendar, analytics, instagram, tiktok, youtube]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Publicações e planejamento editorial

**Publicações** é a terceira área do produto, ao lado de **Social** e **Atendimento**. Ela cuida do ciclo do post; Social cuida da conversa pública e da DM; Atendimento cuida do ticket e do SLA. A separação evita que o calendário editorial e a caixa de conversa disputem o mesmo espaço.

## Fronteira com Social e Atendimento

- **Publicações**: ideia, rascunho, revisão, aprovação, agendamento, publicação, análise e reciclagem.
- **Social**: comentário, story, menção, DM, automação de aquisição, funil e venda atribuída.
- **Atendimento**: WhatsApp, e-mail, chat, Telegram, ticket, SLA, CSAT e histórico.
- O post é a **origem**; a conversa gerada por ele continua em Social; o handoff continua em Atendimento.
- O post pode apontar para um **fluxo** e um **checkout**; a venda confirmada é atribuída ao post/fluxo/campanha.

## Time e visibilidade

- Todo post e toda campanha pertencem a um **time de Publicações**. Um workspace pode ter um ou mais times; um membro pode participar de mais de um.
- O time define quem vê, edita, aprova e recebe notificação. Admin/Manager criam e gerenciam times; o Admin não cria papéis.
- **Membro** vê e edita posts/campanhas do seu time; **Manager/Admin** veem todos; **Viewer** lê o que o time vê.
- O post não é compartilhado automaticamente com outros times; quando precisar, o Admin/Manager move ou cria um novo post. “Tudo compartilhado” continua fora.
- Se o autor sair do time, o post continua com o time; Admin/Manager reatribuem.
- **Workspace solo:** o Admin é membro do time padrão de Publicações; não precisa configurar um time para publicar.

## Campanha

Campanha é uma **entidade leve**, não um projeto e não um módulo separado. Ela agrupa o lançamento e amarra post → fluxo → venda.

- Campos: nome, objetivo, período, status (`planejada`, `ativa`, `encerrada`), time, posts, fluxos, oferta/checkout e dashboard.
- Um post **pode** pertencer a **uma** campanha; uma campanha tem **vários** posts.
- A campanha pode referenciar um projeto de Trabalho, mas **não cria tarefas automaticamente**. O vínculo é explícito.
- A venda é atribuída ao **post**, ao **fluxo** e à **campanha**; o checkout pode ser por campanha ou por post × fluxo.
- Arquivar a campanha não apaga posts, vendas ou auditoria.

## Plataformas

| Plataforma | Publicação | Formatos iniciais | Observações |
|---|---|---|---|
| **Instagram** | API oficial quando aprovada; assistido como fallback | feed, carrossel, reel, story | Conta comercial; app review; limites da Meta. |
| **Facebook** | API oficial; assistido | feed, reel, story | Página vinculada; mesma família da Meta. |
| **TikTok** | API oficial quando viável; assistido | vídeo, foto | Aprovação/auditoria da API; pode exigir app review. |
| **YouTube** | API oficial | Shorts, vídeo | OAuth; limites de upload. |
| **Threads** | API oficial | texto, imagem, vídeo | API da Meta; limites próprios. |
| **Kwai** | Assistido até haver API viável | vídeo | Não prometer publicação automática. |

- **API + assistido** é a regra: onde há API oficial, publica sozinho; onde não há, agenda lembrete, prepara texto/mídia, abre a plataforma e marca como publicado.
- O status por destino é explícito: `published`, `assisted_pending`, `failed` ou `partial`.
- **Não há automação de navegador** para contornar ausência de API.

## Conexão e OAuth

- O app OAuth é **único da BOSUN** por plataforma; o cliente autoriza o app e os **tokens ficam criptografados na instalação dedicada**, não no banco da BOSUN.
- O app da BOSUN concentra o app review, os escopos e os redirect URIs; cada instalação usa o próprio domínio.
- Admin/Manager conecta e desconecta contas; Membro e Viewer só veem o status.
- Token expirado ou revogado gera notificação; a publicação daquele destino falha isolada.
- O modo assistido não depende de OAuth para existir, mas o analytics depende da API/conta conectada.

## Ciclo do post

1. **Ideia/rascunho.**
2. **Revisão.**
3. **Aprovado** (se a aprovação estiver ligada).
4. **Agendado.**
5. **Publicando.**
6. **Publicado**, **parcial** ou **falhou**.
7. **Arquivado.**

- A aprovação é **opcional por workspace e por canal**; quando ligada, Admin/Manager aprova. **Canal**, aqui, é a conta conectada (plataforma + conta), não o formato.
- O autor que for Admin/Manager pode aprovar o próprio post; um Membro nunca aprova o próprio post.
- A aprovação vale para a **versão do post**: editar texto, mídia, destinos ou horário volta o post para `pending` e registra a versão anterior.
- Se o horário chega com aprovação pendente ou rejeitada, o post **segura e notifica**; não publica nem pula sozinho.
- Membro cria e edita rascunhos do time; publica se a aprovação estiver desligada; com aprovação ligada, submete.
- Toda mudança de estado é auditada.
- Conteúdo já publicado é **imutável na BOSUN**; correções são feitas na plataforma ou em um novo post, e o registro local guarda a versão publicada.

## Compositor

- **Texto base + variantes por plataforma**, com limite de caracteres ao vivo.
- Mídia, alt text, hashtags, CTA, link e primeiro comentário.
- **Threads** quando a plataforma suportar; auto-split com revisão.
- Prévia por plataforma e por formato.
- A mídia vem da **biblioteca de Documentos**; a publicação referencia o arquivo, não duplica.
- O compositor **não é um editor de imagem/vídeo**; o arquivo entra pronto e a plataforma aplica o que exigir.
- **IA**: o Copiloto adapta texto, ganchos, variantes e hashtags; não gera imagem nem vídeo. Toda sugestão é revisável.

## Calendário, fila e reciclagem

- Calendário semanal e mensal, com arrastar para reagendar.
- Todo post tem um **horário explícito**; “próximo slot” é um atalho que preenche o horário, não um segundo agendador.
- Fila por conta conectada, com slots recorrentes e fuso do workspace; conflito avisa, não bloqueia.
- **Melhores horários** sugeridos a partir do analytics; a sugestão não publica sozinha.
- **Reciclagem**: cada repetição é uma **nova ocorrência** (novo ID e analytics), ligada à mesma família de post; a automação não reenvia a mesma DM ao mesmo contato por padrão.
- Reciclar conteúdo idêntico ao já aprovado não exige nova aprovação; se texto ou mídia mudarem, volta a aprovar.
- A reciclagem respeita intervalo, máximo de repetições e exclusão de duplicados.

## Publicação e falhas

- Cada destino publica de forma independente; uma falha não derruba os outros.
- Retry manual e automático limitado; token expirado gera notificação e pede reconexão.
- **Idempotência** por post + destino + horário para evitar duplicata.
- Publicação assistida tem checklist e botão **“marcar como publicado”**; o horário real é registrado.
- Apagar um post publicado depende da API da plataforma; quando não for possível, a BOSUN **não apaga o registro**: marca como tombstone, remove da agenda e mantém a atribuição de venda e a auditoria. O usuário é avisado.

## Mídia e histórico

- A mídia vem da biblioteca de Documentos, mas o post **fixa a versão** usada no agendamento; editar o arquivo original não muda um post já agendado.
- Substituir a mídia de um post é uma ação explícita e volta a aprovação.
- Arquivar ou excluir um arquivo em uso por post agendado/publicado é bloqueado; o usuário precisa substituir ou remover o vínculo.
- Um post do time não pode usar um arquivo **privado** de um membro sem que ele compartilhe/copie para a biblioteca do time.
- Posts publicados são **tombstones** auditáveis: mesmo que a plataforma não permita apagar, o registro local, a atribuição e a auditoria permanecem.
- O tombstone carrega o **ponteiro do pacote de encerramento**: onde a mídia foi arquivada, quando, por quem e com qual checksum. Depois do expurgo, o post continua abrindo, com a mídia marcada como **arquivada externamente** e a ação de restaurar ([ADR-104](../decisions/adr-104-content-knowledge-search.md)).

## Analytics

- Por post e por plataforma: alcance/impressões, curtidas, comentários, compartilhamentos, salvamentos, cliques e seguidores.
- Melhores horários e comparação entre posts.
- Exportação.
- A cobertura depende do que cada API entrega; o dado indisponível é mostrado como indisponível, não estimado.
- O dashboard de **Publicações** mede conteúdo; o de **Social** mede audiência/funil/venda; o de **Atendimento** mede SLA/CSAT. Eles não se substituem.

## Post → automação → venda

- O post pode ser vinculado a **um ou mais fluxos** de Social; quando mais de um casa, vence o de maior prioridade e o vínculo fica registrado.
- Na primeira versão, o vínculo é só com posts de **Publicações**; posts orgânicos/importados ficam para depois.
- O fluxo usa o post como gatilho de comentário/story/menção e mantém a deduplicação por contato + **família de post** + palavra; a reciclagem não re-dispara por padrão.
- O **link de checkout** é por campanha ou por post × fluxo; a venda é confirmada por webhook (Kiwify ou genérico) e atribuída ao post, ao fluxo e à campanha.
- Sem webhook, não há venda confirmada; clique não é venda.
- A campanha é o contexto de atribuição; post e fluxo mantêm o vínculo auditável.

## Permissões

- **Admin**: configura o time, contas, campanhas, aprova, publica, recicla, audita e exporta.
- **Manager**: gerencia o time, conecta contas, cria/edita campanhas, aprova, publica e vê analytics.
- **Membro**: vê e edita posts/campanhas do seu time; publica se a aprovação estiver desligada; não aprova (a menos que também seja Admin/Manager).
- **Viewer**: lê o que o time vê.
- O autor que for Admin/Manager pode aprovar o próprio post; um Membro nunca aprova o próprio post.
- A matriz completa está em [Papéis e permissões](roles-permissions.md).

## Notificações e auditoria

- Aprovação pendente, publicação concluída, falha, token expirado e fila vazia.
- Auditoria: conectar/desconectar conta, aprovar/rejeitar, agendar, publicar, falhar, reciclar e excluir.
- O histórico mostra quem fez, quando, em qual conta e com qual versão do texto/mídia.

## Em aberto

- ~~Múltiplas contas por rede~~ — decidido: várias contas por rede, cada uma é um canal ([ADR-108](../decisions/adr-108-publications.md)).
- Modelo do post vai para entrevista; composição do time, campos da campanha, aprovação com comentários, métricas, UTM e API/MCP ficam como capacidade futura.
- Viabilidade de publicação no TikTok e no Kwai; suporte a stories por plataforma.
- Limites de vídeo, processamento e duração.
- Composição e gestão do time de Publicações; um ou mais times por workspace.
- Modelo do post: entidade própria ou tipo de Item; família e ocorrência reciclada.
- Campos e status da campanha; post em mais de uma campanha.
- Normalização de métricas entre plataformas e origem do “melhor horário”.
- Intervalo, máximo e evergreen da reciclagem.
- Aprovação com comentários/pedido de alteração.
- Visibilidade de rascunhos para Viewer: o time vê; o Viewer vê rascunhos ou só aprovados/publicados?
- API/MCP externo para publicações.
- Fuso/DST e fila por conta.
- App review, escopos e redirect URIs por plataforma; o que o app da BOSUN acessa.
- Link tracking/UTM e conciliação com a Kiwify.

## Decisões de 2026-10-23

- **Post é entidade própria**, fora do Item: `Post` (família) → `PostVariant` (texto e mídia por conta) → `PostOccurrence` (cada publicação, com ID e analytics). Reciclar cria nova ocorrência; rascunho pode nascer de uma Nota, por vínculo.
- **TikTok começa em modo assistido**; sem auditoria a API só publica como privado e para até 5 usuários/24 h. A auditoria do app BOSUN é tarefa de lançamento.
- **Kwai só em modo assistido** (não há API pública de publicação); sai da Automação Social até existir API.
- **Broker de OAuth central** (ex.: `auth.bosun.app`) com a única redirect URI; repassa só o código à instalação por `state` assinado; o token nunca passa pelo broker. **No piloto** (uma cliente, founder de infoprodutos) o app pode apontar direto para o domínio dela; o broker entra antes da segunda instalação.
- **Mínimo para o design:** várias contas por rede, calendário, aprovação simples (aprovar/recusar com comentário), campanha (nome, período, status, posts) e **UTM automático** nos links. Normalização de métricas, melhor horário, API/MCP externo e vários times ficam como capacidade futura.

## Links

- [Social e atendimento](social.md)
- [Automações e fluxos](automations.md)
- [Documentos e Base](content-model.md)
- [Papéis e permissões](roles-permissions.md)
- [ADR-108 — Área de Publicações](../decisions/adr-108-publications.md)
- [ADR-109 — Automação social e atribuição de venda](../decisions/adr-109-automation-ai.md)
