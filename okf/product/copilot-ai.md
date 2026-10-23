---
type: Product Spec
title: Copiloto, Observer e agentes de IA
description: Papéis dos agentes, modo sombra do Observer, autonomia, prontidão e auditoria.
tags: [bosun, copilot, ai, agents, observer, automations, guardrails]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Copiloto, Observer e agentes de IA

A BOSUN usa IA com **controle humano explícito**, mas com papéis diferentes. O **Copiloto** ajuda a pessoa a fazer; o **Observer** aprende e sugere configurações; os **agentes de execução** fazem ações concretas depois de configurados e habilitados. A **automação** determinística é um motor separado, descrito em [Automações e fluxos](automations.md).

## Princípios

- **Agente** é reservado para IA; não é papel humano. O papel humano é Membro; Atendente é função.
- Nenhum agente herda automaticamente as permissões de quem o criou.
- Toda ação é limitada por escopo, aprovada quando externa ou destrutiva e registrada em auditoria.
- Conteúdo de mensagens é dado não confiável; prompt injection não pode virar execução de ferramenta.
- O acesso segue as permissões do usuário e o escopo do agente; conteúdo pessoal de outro membro nunca entra.
- Toda sugestão cita a fonte ou o contexto usado.

## Observer — só sugere

O Observer é um agente de **observação e sugestão**, sem ações concretas dentro da BOSUN.

### O que observa

- Respostas reais dela no WhatsApp, DM e e-mail.
- Tom, vocabulário, objeções, promessas, garantias, preços e perguntas frequentes.
- O que funcionou e o que gerou dúvida, reclamação ou silêncio.
- O uso do BOSUN: etapas repetidas, tarefas manuais, fluxos interrompidos e lacunas de configuração.

### O que entrega

- Sugestões revisáveis em um dashboard: ajuste de prompt dos agentes, artigo na Base de Conhecimento, regra de atendimento, template de fluxo, etapa do BOSUN.
- Um retrato de prontidão: cobertura da base, qualidade das respostas, pontos cegos e confiança para ligar um agente.
- Explicação e exemplo de antes/depois para cada sugestão.

### O que nunca faz

- Não envia mensagem, não altera prompt, não publica fluxo, não cria ou exclui dados.
- Não aplica a própria sugestão. Quem aplica é ela, no dashboard, ou um agente de execução habilitado.
- Não aprende com uma resposta ruim sem marcar o caso e pedir confirmação.

## Copiloto — escreve com confirmação

O Copiloto é a ajuda dentro do trabalho: resume conversas, documentos, projetos e períodos; identifica pendências, prazos e próximos passos; sugere tarefas a partir de notas, conversas e atendimentos; sugere respostas; organiza itens; prepara rascunhos.

### Limites

- Não envia mensagens, e-mails ou respostas sem aprovação explícita.
- Não cria, altera ou exclui dados sem confirmação quando a ação for destrutiva ou externa.
- O usuário pode desativar ou ajustar sugestões proativas.
- O acesso é limitado por escopo: conversa, projeto, documento, período ou seleção manual.
- Toda ação do Copiloto é auditada.

## Agentes de execução

Agentes de execução são identidades de serviço configuradas pelo Admin, com nome, objetivo, ferramentas permitidas, base de conhecimento e escopo de dados.

### Comportamento

- São **reativos**: respondem quando uma pessoa manda uma mensagem humana que não pertence a uma automação.
- Não iniciam conversa; quem inicia é a automação ou a pessoa.
- Podem assumir um atendimento, consultar a base, preparar uma resposta, executar uma ação permitida e devolver ao humano.
- Ações externas ou destrutivas exigem aprovação humana explícita.
- Cada agente declara o canal, o horário, o escopo e o nível de autonomia.

### Configuração

- **Skills** e **receitas** prontas para a usuária não técnica; o editor avançado fica para quem quiser.
- Ferramentas nativas, ferramentas HTTP e servidores MCP, com allowlist e credenciais no cofre.
- **Dry-run por padrão** nas ferramentas de escrita; a execução real exige habilitação.
- Playground para testar antes de publicar.
- Versão do prompt e da configuração; rollback disponível.

### Catálogo inicial

| Agente | Templates | Função | Ações livres |
|---|---|---|---|
| **SDR / pré-venda** | Empresa, Produto, Curso | Qualifica interesse, apresenta oferta e agenda. | Responder, etiquetar, mover etapa, agendar e enviar checkout da oferta publicada. |
| **Suporte / pós-venda** | Empresa, Produto, Curso | Resolve dúvidas de acesso, conteúdo e garantia. | Responder, etiquetar, abrir ticket, enviar artigo e escalar. |
| **Agendador** | Empresa, Produto, Curso | Consulta horários, propõe, confirma e remarca. | Responder, etiquetar, consultar disponibilidade, propor, confirmar e remarcar. |
| **Recuperação de carrinho** | Produto, Curso | Retoma quem demonstrou interesse e não concluiu. | Responder, etiquetar, mover etapa e enviar checkout da oferta publicada. |
| **Onboarding de aluno** | Curso | Recebe o aluno, entrega materiais e acompanha os primeiros passos. | Responder, etiquetar, enviar material, criar tarefa e acompanhar. |
| **Cobrança** | Empresa, Produto, Curso | Lembra vencimento, orienta pagamento e registra. | Responder, etiquetar, lembrar, enviar link e registrar pagamento. |
| **Assistente interno** | Pessoal, Empresa, Produto, Curso | Ajuda a equipe a encontrar informação e preparar respostas. | Consultar, rascunhar e criar tarefa; não envia mensagem externa. |

O template **Pessoal** começa apenas com o Assistente interno. O Admin pode habilitar outros agentes depois; o catálogo é ponto de partida, não uma restrição rígida.

### Matriz de autonomia

A autonomia tem três níveis:

- **Livre** — responder, consultar a base, etiquetar, criar nota ou tarefa, mover etapa, agendar, enviar material e enviar checkout da oferta publicada.
- **Aprovação** — desconto ou condição comercial, reembolso, cancelamento, exclusão ou edição de dados, link de pagamento fora da oferta publicada e alteração de contrato.
- **Proibido** — alterar preço publicado, prometer prazo ou resultado fora da política, falar em nome jurídico, acessar outro workspace e executar ferramenta sem allowlist.

O checkout livre é sempre o da **oferta publicada**; qualquer valor, desconto ou condição fora dela exige aprovação. A matriz vale por agente e por ação, e o Admin pode restringir um agente específico sem alterar os demais.

### Prontidão

O agente só é habilitado quando o conhecimento do produto/projeto está completo o suficiente para o escopo. O gate combina **scorecard e modo sombra**:

1. **Cobertura da base** — 80% das 30 perguntas mais frequentes respondidas por artigos publicados.
2. **Respostas revisadas** — 20 conversas reais revisadas e aprovadas pela dona do workspace.
3. **Objeções mapeadas** — 10 objeções com resposta aprovada.
4. **Avaliação** — 90% de acerto em 30 casos dourados, cobrindo política, preço, garantia e recusa.
5. **Modo sombra** — 7 dias ou 50 conversas, o que vier primeiro, com sugestões revisadas.
6. **Aprovação do Admin** — decisão explícita, registrada em auditoria.

O Observer reúne a evidência e mostra o retrato de prontidão; ele não liga o agente.

## Escada de autonomia

1. **Visibilidade e alerta** — mensagens pendentes no Meu dia e na caixa de atendimento; ela responde. É a primeira entrega de valor.
2. **Agentes configurados com base sólida** — começa por um SDR; respostas assistidas e ações de baixo risco.
3. **Agentes de ponta a ponta** — atendimento, qualificação, agendamento, follow-up e handoff, conforme a estrutura amadurece.

A autonomia é conquistada por configuração, evidência e confiança; não é ligada por padrão.

## Handoff

O handoff é a passagem da conversa para uma pessoa. Ele sempre ocorre quando:

1. O cliente pede explicitamente por uma pessoa.
2. O agente tem baixa confiança ou a pergunta está fora da base.
3. Há reclamação, reembolso ou tema jurídico.
4. Há negociação de preço ou desconto.
5. O agente tenta duas vezes sem avanço.
6. O atendimento está fora do horário comercial.

- A conversa vai para a **fila do time**; a atribuição continua manual.
- O resumo do handoff leva o caminho do fluxo, os dados coletados e as últimas mensagens.
- Se ninguém assumir dentro do SLA, o sistema **apenas notifica**; não redistribui nem escala automaticamente.
- Depois do handoff, valem o SLA e o CSAT da área de Atendimento.
- O humano pode devolver a conversa ao agente; a automação só recomeça por um novo gatilho.

## Aviso, LGPD e custo

- A primeira mensagem do agente informa que é um agente de IA; o texto é personalizável nas configurações do agente.
- Antes de enviar contexto ao provedor, a BOSUN **redige identificadores sensíveis**: CPF, cartão, endereço e dados bancários. Nome e telefone ficam quando forem necessários ao atendimento.
- O **Observer é opt-in por workspace e por canal**; não observa a área pessoal de outro membro nem dados fora do escopo do workspace.
- O Observer guarda o que aprendeu por **90 dias**; depois consolida em sugestão ou descarta.
- O custo de IA é **BYOK**: o cliente paga o provedor. A BOSUN mostra custo estimado **por agente e por workspace**, com alertas em 50%, 80% e 100% do orçamento; não há bloqueio automático no teto.
- O contrato com o cliente inclui o papel de **operadora** da BOSUN e as instruções de tratamento do controlador.

## Contexto por workspace

- O workspace é o contexto de **um produto ou negócio**: base de conhecimento, canais, agentes, automações, contatos e métricas.
- Produto novo = **workspace novo**; o ambiente é a conta que agrupa e cobra.
- O Observer e os agentes não misturam conhecimento de dois produtos no mesmo workspace.

## Permissões e auditoria

- O Admin configura, habilita e audita agentes; Manager vê; Membro e Viewer não configuram.
- O Observer é somente leitura sobre o trabalho e escreve apenas sugestões.
- Ações de agentes gravam entrada, ferramenta usada, resultado e custo de execução.
- O ledger de ações permite pausar, reverter e provar o que aconteceu.

## Em aberto

- Provedor de IA e modelo por agente; compatibilidade de BYOK.
- Política de revisão da base de conhecimento e de prompts.
- Como o Observer lida com resposta ruim, ambiguidade e conflito de instruções.
- Quem revisa e aprova as sugestões do Observer além do Admin.
- Catálogo de skills e ferramentas HTTP/MCP por agente.
- Limite de execuções simultâneas por instalação.

## Decisões de 2026-10-23

- **BYOK obrigatório**: chave do cliente, camada multi-provedor (Vercel AI SDK: Anthropic, OpenAI, Google, OpenRouter) e modelo por agente. Sem chave, agentes e Copiloto ficam desligados e a busca cai para palavra-chave.
- **Ferramentas internas tipadas por agente**; MCP externo só configurado pelo Admin, com lista permitida. Autonomia (livre/aprovação/proibido) vale **por ferramenta**; toda chamada é auditada.
- **Precedência fixa:** política do workspace > instrução do fluxo > artigo da Base > prompt do agente. Ambiguidade é gatilho de handoff. Resposta marcada como ruim vira caso do scorecard; o Observer só sugere.

## Links

- [Social e atendimento](social.md)
- [Automações e fluxos](automations.md)
- [Papéis e permissões](roles-permissions.md)
- [Base de Conhecimento](content-model.md)
- [Atendimento multicanal](service.md)
- [Planos, hospedagem e cobrança](plans.md)
- [ADR-109 — Agentes de IA](../decisions/adr-109-automation-ai.md)
- [ADR-102 — Atendente e Agente de IA](../decisions/adr-102-identity-access.md)
- [ADR-109 — Copiloto com confirmação](../decisions/adr-109-automation-ai.md)
- [ADR-102 — Papéis e permissões](../decisions/adr-102-identity-access.md)
- [ADR-109 — Automação, Observer e agentes de execução](../decisions/adr-109-automation-ai.md)
- [ADR-109 — Catálogo, autonomia e prontidão dos agentes](../decisions/adr-109-automation-ai.md)
