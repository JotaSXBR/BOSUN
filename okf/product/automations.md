---
type: Product Spec
title: Automações e fluxos
description: Fluxos determinísticos de atendimento, relação com agentes e limites de execução.
tags: [bosun, automations, flows, service, manychat, instagram]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Automações e fluxos

A BOSUN tem **dois motores de atendimento**: automações determinísticas e agentes de IA. Este documento cobre o primeiro. O segundo está em [Copiloto, Observer e agentes de IA](copilot-ai.md).

## O que é uma automação

Automação é um **fluxo determinístico**: um gatilho leva a condições, mensagens, botões, esperas e ações, até a entrega ou o handoff. O fluxo não decide em texto livre e não usa IA para escolher o próximo passo; ele segue o desenho publicado.

Um fluxo pode **iniciar** a conversa. O agente, não: ele só reage a uma mensagem humana que não pertence ao fluxo.

## Exemplo de referência

Funil de isca digital observado no atendimento de infoprodutores:

1. Pessoa comenta em uma publicação.
2. Automação envia DM com um botão de confirmação.
3. Verifica se a pessoa segue o perfil; se não, pede para seguir e oferece um botão de retorno.
4. Entrega o material prometido no comentário.
5. Apresenta a oferta seguinte.

Esse é o modelo mental de “comentário → DM → seguidor → entrega → oferta”. Outros templates virão do mesmo repertório: boas-vindas, recuperação de interesse, agendamento, confirmação, pós-venda e reativação.

## Blocos

- **Gatilho**: comentário, mensagem recebida, palavra-chave, clique em botão, evento de contato ou horário.
- **Condição**: canal, etiqueta, seguidor, etapa do contato, horário comercial, resposta anterior.
- **Mensagem**: texto, mídia, link e botões.
- **Espera**: intervalo ou janela de resposta.
- **Ação**: etiquetar, mover etapa, criar tarefa, notificar, entregar link.
- **Handoff**: pausar o fluxo e chamar uma pessoa ou um agente.
- **Fim**: encerrar com status e registro.

## Gatilhos sociais e matching

- O primeiro ciclo cobre **Instagram** (comentário em post, reels e carrossel; resposta de story; menção) e **Facebook** (comentário e Messenger). TikTok e Kwai entram quando houver API oficial viável.
- A palavra-chave é reconhecida **sem diferenciar maiúsculas, minúsculas ou acentos**, por conteúdo: “QUERO”, “quero” e “Quero!” disparam o mesmo fluxo.
- **Deduplicação**: mesmo contato + mesmo post + mesma palavra-chave executa **uma vez, para sempre**. Um post novo permite um novo disparo; o mesmo post não repete.
- O comentário recebe uma resposta pública curta e uma **DM privada**, dentro da janela permitida pela Meta.
- A automação **não inicia DM fria**: só responde a comentário, story, menção ou mensagem recebida.
- O mesmo contato pode entrar em fluxos diferentes em posts diferentes; a deduplicação é por post, não por contato.

## Templates iniciais

1. **Comentário → DM → entrega** — o funil de isca digital.
2. **Boas-vindas** — primeira resposta, apresentação e próximo passo.
3. **Recuperação de interesse** — retoma quem parou ou demonstrou interesse.
4. **Agendamento** — oferece horários e confirma.
5. **Confirmação e lembrete** — reduz no-show.
6. **Pós-venda** — entrega, onboarding e próxima oferta.
7. **Reativação** — retoma contatos frios com novidade ou oferta.

## Construtor e publicação

- O fluxo começa de uma **receita pronta** e é editado no **canvas**; não é preciso montar do zero.
- Cada workspace pode ter até **30 fluxos ativos**. Fluxos arquivados não contam.
- O fluxo é **publicado** com versão numerada; mudanças exigem nova publicação. É possível clonar, pausar, arquivar e voltar a uma versão anterior.
- **Admin e Manager** criam e publicam; Membro e Viewer não publicam.
- A biblioteca de templates é compartilhada; cada workspace mantém as próprias versões.

## Atribuição de venda

- Cada fluxo e cada post gera um **link único e rastreável** para o checkout.
- A venda é confirmada por **webhook da Kiwify**; um **webhook genérico** cobre outros checkouts.
- A BOSUN registra contato, produto, valor, data e o fluxo/post de origem.
- O dashboard social usa a venda confirmada como conversão principal; clique e conclusão de fluxo são métricas intermediárias.
- Sem webhook, não há venda confirmada; a BOSUN não infere compra por clique.

## Relação com agentes

- **Fluxo primeiro**: se a mensagem pertence a um fluxo ativo, ele conduz.
- **Agente como fallback**: se a mensagem é humana e não pertence ao fluxo, o agente assume, se estiver habilitado.
- **Pessoa como última instância**: se o agente não tem escopo, confiança ou autorização, a conversa vai para a caixa humana.
- **Saída do script**: quando a pessoa responde algo como “achei caro” ou “quero falar com você”, o fluxo pausa e a conversa vira atendimento humano ou agente.
- **Observer**: observa os dois motores e sugere melhorias; não altera fluxos sozinho.

## Publicação e segurança

- O fluxo é **publicado** com uma versão numerada; mudanças exigem nova publicação.
- Publicar é a aprovação explícita para o fluxo enviar mensagens dentro do desenho.
- Execuções são **idempotentes** e registradas: entrada, bloco, resultado e erro.
- É possível pausar, arquivar e voltar para uma versão anterior.
- O fluxo respeita as regras do canal: janela de 24 horas, templates HSM, opt-in e limites de envio.
- Conteúdo de mensagem é dado não confiável; ele não altera o fluxo nem executa ferramentas.
- No Instagram e no Messenger, a BOSUN **não inicia conversa**; só responde a comentário, story, menção ou mensagem. A janela é de 7 dias e o token expira a cada 60 dias.
- A verificação de seguidor é **best effort**: usa a API oficial quando disponível e, se não houver, pede para seguir e entrega com registro.

## Em aberto

- Viabilidade de comentários, DM e verificação de seguidor no TikTok e no Kwai.
- Observabilidade de conversão por bloco e por canal.
- Como o Observer sugere mudanças de fluxo sem virar um editor automático.
- Limite de blocos por fluxo e de mensagens por janela de canal.
- Regra de prioridade quando dois fluxos disputam o mesmo gatilho.

## Decisões de 2026-10-23

- **Um evento dispara no máximo um fluxo.** Ganha o mais específico (post + palavra-chave → palavra-chave → resposta padrão); empate segue a ordem manual do Admin. Limite de 50 blocos por fluxo; a tela avisa disputa de gatilho.
- **Falso positivo da promoção:** humano devolve o ticket ao Social com motivo; o SLA aberto é cancelado e o caso entra numa métrica de falso positivo por gatilho.
- **Kwai sai da Automação Social** até existir API; TikTok depende da auditoria.

## Links

- [Social e atendimento](social.md)
- [Copiloto, Observer e agentes de IA](copilot-ai.md)
- [Atendimento multicanal](service.md)
- [Integrações externas](integrations.md)
- [ADR-109 — Automação, Observer e agentes de execução](../decisions/adr-109-automation-ai.md)
- [ADR-109 — Automação social e atribuição de venda](../decisions/adr-109-automation-ai.md)
