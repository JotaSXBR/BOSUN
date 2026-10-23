---
type: User Flow
title: Onboarding
description: Wizard de quatro telas, trilhas de ativação escolhidas por intenção e primeiros passos depois do wizard.
tags: [bosun, onboarding, wizard, activation, checklist, flow]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Onboarding

O onboarding tem duas partes com papéis diferentes: o **wizard**, curto e igual para todo mundo, e as **trilhas de ativação**, que se adaptam ao que a instalação veio fazer. Ver [ADR-103](../decisions/adr-103-onboarding.md).

## Wizard — quatro telas

1. **Contexto** — nome do espaço, área de atuação, fuso horário, idioma.
2. **Chave de recuperação** — exibida uma única vez, com confirmação de que foi guardada. Ver [ADR-102](../decisions/adr-102-identity-access.md).
3. **Intenções** — múltipla escolha: atender clientes, publicar conteúdo, tocar projetos, guardar conhecimento. "Só explorar" é exclusivo e limpa as outras.
4. **Convite** — link com papel e validade. Pode pular.

O wizard **não conecta nada**: nem WhatsApp, nem Google, nem rede social. Cada conexão é uma etapa que pode falhar no meio — QR que expira, OAuth que abre janela, conta que não está à mão — e uma falha dessas deixa o onboarding incompleto.

## Trilhas de ativação

Cada intenção marcada vira uma **trilha**, e cada trilha tem três coisas:

- um **checklist** de até quatro itens, cada um com o motivo junto ("conecte o WhatsApp para receber a primeira mensagem");
- um **evento de ativação**, observado e não declarado;
- um estado: pendente, ativa com itens abertos, ou **ativada** com data.

| Trilha | Evento de ativação |
|---|---|
| Atender clientes | Primeira mensagem real recebida na caixa |
| Publicar conteúdo | Primeiro post publicado |
| Tocar projetos | Primeiro projeto com tarefas atribuídas a alguém |
| Guardar conhecimento | Primeiro documento na Base de Conhecimento |

As trilhas podem coexistir. Uma instalação pode ativar uma, duas ou as quatro, em qualquer ordem e em qualquer momento — nada é trancado, e nenhuma permissão muda por causa da escolha.

## A intenção roteia, não tranca

- Define a **área inicial** depois do login: Inbox, Publicações, Meu dia ou Base.
- Define o **preset de permissões** de partida, ajustável.
- Define a **ordem do checklist**.
- **Não** esconde módulo. Todos os módulos existem e ficam acessíveis desde o primeiro login.

## Depois do wizard

O wizard termina e o workspace **não abre num painel vazio**: abre no primeiro item aberto da trilha principal — para atendimento, isso é a tela de pareamento do WhatsApp. A conexão saiu do wizard, não saiu do caminho.

O checklist fica visível na área inicial, com barra de progresso e no máximo quatro itens, até a trilha ser ativada. Depois disso, recolhe para **Primeiros passos** nas configurações, com contador — não desaparece, porque o que ficou pendente continua pendente.

## Quem edita

- O Admin cria as trilhas no onboarding; **Admin e Manager** podem acrescentar, reativar ou desligar trilhas depois, em Primeiros passos.
- Acrescentar uma trilha depois acrescenta itens ao checklist; **não** desfaz nem reinicia o que já foi feito.
- Desligar uma trilha esconde a orientação e remove a preferência de área inicial; **nunca** apaga conteúdo, conexão ou dado.
- Toda alteração é auditada.

## Estado final

Ao concluir o wizard, o espaço tem:

- Espaço criado; o primeiro usuário é **Admin**.
- Chave de recuperação entregue.
- Trilhas escolhidas, com checklist montado.
- Link de convite disponível.
- Permissões definidas por preset, ajustáveis.
- Compliance registrada (finalidade e base legal).

## Primeiro acesso do convidado

Quem entra por convite **não passa pelo wizard**. No primeiro login, depois de definir a senha no aceite, faz um **setup curto e único**: nome de exibição e foto (pré-preenchidos pelo convite), preferências de notificação, opt-in da área pessoal e uma frase de contexto com papel e time. Nada do que o convite já sabe é perguntado de novo.

A entrada é **derivada, não escolhida**: trilha principal do workspace + papel e time definem a área inicial (Inbox filtrado pela fila, Publicações do time, ou Meu dia). O setup é retomável e reexecutável em **Perfil**, e usa a mesma tela de perfil do Admin. Ver [ADR-103](../decisions/adr-103-onboarding.md).

**Tutorial de uso antes do painel** é desejável e está **adiado**; quando entrar, será curto, sobre dados reais, pulável e nunca antes da primeira tarefa real.

## O que o onboarding não faz

- **Sem dados de exemplo.** Conversa falsa no Inbox polui contato, métrica e auditoria, e pode ser confundida com atendimento real. O estado vazio traz ação e modelo, não ficção.
- **Sem tour de recursos.** A pesquisa é consistente: tour de features não ativa ninguém; o caminho até a primeira ação, sim.

## Critérios de aceite

- O wizard tem quatro telas e não pede nenhuma conexão.
- A chave de recuperação é exibida uma vez e o Admin confirma que a guardou.
- Cada intenção marcada gera uma trilha com checklist e evento de ativação.
- Terminar o wizard leva ao primeiro item aberto da trilha principal, não a um painel vazio.
- É possível gerar um link de convite com papel e validade.
- O convidado define senha, confirma perfil e preferências, e entra na área do seu papel e time sem ver o wizard.
- Desligar e religar uma trilha não apaga nada.
- A ativação é registrada quando o evento acontece, mesmo que ninguém tenha passado pelo checklist.

## Ligações

- [ADR-103 — Onboarding adaptativo por trilhas](../decisions/adr-103-onboarding.md)
- [ADR-103 — Onboarding em quatro etapas](../decisions/adr-103-onboarding.md)
- [ADR-102 — Recuperação de conta e segundo fator](../decisions/adr-102-identity-access.md)
- [Papéis e permissões](roles-permissions.md)
- [Wireframe de onboarding](../design/wireframes/onboarding.md)
