---
type: Anti-goals
title: Anti-goals e fronteiras do produto
description: O que a BOSUN não deve virar e como evitar integração sem propósito.
tags: [bosun, anti-goals, boundaries, scope, integration, product]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Anti-goals e fronteiras do produto

O maior risco da BOSUN não é faltar módulo; é **integrar demais onde não deveria** e **integrar de menos onde o trabalho precisa passar**. Este documento fixa as fronteiras.

## Princípio central

**Integração por fluxo, não por acoplamento.**

- Integrar quando há uma passagem real de trabalho: post → automação → conversa → venda → tarefa → agenda.
- Não integrar quando a relação não existe: nota não vira tarefa; conversa não vira negócio; item pessoal não entra no workspace; automação não dispara em todo evento.
- O vínculo é **explícito, opcional e auditável**. Cada módulo funciona sozinho.

## Anti-goals permanentes

1. **Não é Notion/Drive.** Documentos é biblioteca de arquivos do workspace e pessoal; não é suíte de documentos, wiki pessoal ou provedor de armazenamento.
2. **Não é processador de pagamento.** A BOSUN integra Asaas, Kiwify e checkouts do cliente; não custodia dinheiro, não faz split e não trata chargeback.
3. **Não é mobile-first.** O produto é web-first; PWA e apps nativos são evolução, não a plataforma principal.
4. **Não é colaboração entre organizações.** Não há espaço compartilhado entre clientes, instalações ou empresas; cada instalação é isolada.
5. **Não é data broker/adtech.** Não há publicidade, venda de dados ou uso de conteúdo do cliente para treinar modelo de terceiro.

## Invariantes que protegem o produto

Estes pontos já foram decididos e valem como restrição, mesmo não sendo anti-goals permanentes:

- **Instalação dedicada por cliente**; não existe BOSUN multiempresa compartilhando banco.
- **CRM é opcional e leve**; conversa, contato ou mensagem não entram em pipeline por padrão.
- **Captura ≠ execução**; nota, mensagem ou ideia não viram tarefa automaticamente.
- **Automação é opt-in e escopada**; não dispara em todo evento e não substitui a decisão humana.
- **Pessoal ≠ workspace**; a vida pessoal é privada por membro e não é visível a Admin/Manager.
- **IA com escopo, aprovação e auditoria**; agente não herda permissão e não executa ação externa sem aprovação.
- **Publicações não é estúdio de design**; a IA adapta texto, não gera imagem ou vídeo.
- **Publicações é por time**; post e campanha pertencem a um time e não são compartilhados automaticamente entre times.
- **Campanha não é projeto**; ela agrupa o lançamento, não cria tarefas automaticamente.
- **Gamificação discreta**; sem pontos, ranking, ligas ou competição.
- **Sem disparo frio ou marketing em massa**; e-mail é canal de atendimento, não newsletter.
- **Sem rede social/comunidade**; a BOSUN não hospeda feed, seguidores ou comunidade.

## Fora de escopo por enquanto

- Publicação automática no TikTok e no Kwai; modo assistido até haver API viável.
- Múltiplas contas por rede no mesmo workspace.
- Offline, PWA e apps nativos.
- Resumos inteligentes.
- Convidados externos e aprovação de cliente.
- Segundo Cérebro.
- Geração de imagem/vídeo.
- Gamificação avançada (catálogo de marcos, badges, notificações).

## Sinais de falha

- A piloto precisa sair da BOSUN para completar o [golden path](success-criteria.md).
- Uma nota ou mensagem vira tarefa/negócio sem intenção.
- Dados pessoais e do workspace se misturam.
- Automação dispara sem opt-in.
- Os módulos não se conversam e exigem re-digitação.
- O produto tenta ser tudo e não é profundo em nada.

## Regra de decisão

Antes de aceitar uma integração, perguntar:

1. **Isso conecta um fluxo real?** Se não, não entra.
2. **O vínculo é explícito e opcional?** Se for automático e invisível, não entra.
3. **O módulo continua funcionando sozinho?** Se depende do outro para existir, é acoplamento.
4. **A ação é auditável?** Se não, não entra.

Se a resposta for “só cria uma dependência nova”, a integração não pertence ao produto.

## Links

- [Mapa de capacidades](roadmap.md)
- [Critérios de sucesso](success-criteria.md)
- [Visão](vision.md)
- [ADR-101 — Anti-goals e integração por fluxo](../decisions/adr-101-product-structure.md)
