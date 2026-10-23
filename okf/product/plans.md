---
type: Commercial Model
title: Planos, hospedagem e cobrança
description: Instalação de R$ 3.000 mais R$ 500/mês, suporte incluso, contrato sem fidelidade e BYOK.
tags: [bosun, pricing, billing, hosting, byok, license, vps, contract, sla]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Planos, hospedagem e cobrança

> **2026-10-23:** comercial e jurídico (tributação, NFS-e, revisão do contrato, canal de suporte) estão **fora do foco atual** e não bloqueiam o design.

A BOSUN é o primeiro produto da empresa do desenvolvedor. A assinatura existe para manter e evoluir o produto, hospedar cada cliente e operar backup. Não é uma revenda de IA.

## Modelo

- **Uma instalação por cliente**: cada cliente tem a própria VPS e o próprio banco. Não existe uma BOSUN multiempresa compartilhando dados entre clientes.
- **Ambiente é a unidade de cobrança**: a conta agrupa os workspaces daquele cliente.
- **Workspace é o contexto de um produto/negócio**: um cliente pode ter vários workspaces na mesma instalação.
- **Tabela oficial**: **R$ 3.000 de instalação + R$ 500 por mês**. Sem degraus de funcionalidade, sem limite de IA, sem cobrança por mensagem, conversa ou assento.
- **Instalação cobre**: VPS, BOSUN, domínio/SSL, backup, workspace configurado, canais conectados, **um fluxo publicado**, **um agente configurado em dry-run**, até **12 horas** de configuração e treinamento, e go-live em até **15 dias úteis**.
- **Mensalidade cobre**: licença de uso, hospedagem gerenciada, backup gerenciado, atualizações, monitoramento e até **3 horas mensais de suporte**. O excedente é cobrado a **R$ 200 por hora**.
- **BYOK**: as chaves de API de IA são do cliente. O consumo é cobrado diretamente pelo provedor dele.
- **Custos externos** de canais, e-mail, telefonia e provedores de terceiros ficam com o cliente.
- **Armazenamento** é o custo variável visível: quando cresce além da VPS, a infraestrutura sobe. O upgrade é cobrado pelo **custo real + 20% de administração** e a mensalidade acompanha. É um upgrade transparente, não um plano novo com menos recursos.
- **Piloto**: a primeira usuária não paga por tempo indeterminado. O operador absorve VPS, domínio, backup e provedores externos enquanto ela for piloto.

## Instalação

- **Escopo**: infraestrutura, canais, um fluxo publicado e um agente configurado em dry-run. A ativação do agente segue o gate de prontidão; a instalação não liga o agente sozinha.
- **Prazo**: até 15 dias úteis, contados a partir do recebimento dos acessos e do conteúdo necessário.
- **Horas inclusas**: 12 horas de configuração e treinamento. O excedente segue a hora de suporte.
- **Pagamento**: 50% na aprovação e 50% no go-live.
- **O que não inclui**: migração de dados de outra ferramenta, produção de conteúdo, campanhas, desenvolvimento sob medida e canais fora do escopo. Esses itens são orçados à parte.
- **Go-live**: a instalação termina com o fluxo publicado, o agente em dry-run, os canais conectados e uma sessão de treinamento.

## Suporte e SLA

- **Horas inclusas**: 3 horas por mês. Não há acúmulo automático; o excedente é faturado a R$ 200/h.
- **O que conta como suporte**: incidente, dúvida de uso, pequeno ajuste em configuração existente e treinamento.
- **O que não conta**: novo fluxo, novo canal, nova integração, desenvolvimento sob medida e produção de conteúdo. Isso é projeto, com orçamento próprio.
- **Janela**: segunda a sexta, 9h–18h, horário de Brasília. Fins de semana e feriados ficam fora, salvo incidente crítico.
- **Incidente crítico**: primeira resposta em até **4 horas úteis**. Crítico é sistema fora, WhatsApp desconectado, perda de acesso ou risco de perda de dados.
- **Chamado não crítico**: primeira resposta em até **1 dia útil**.
- **Backup**: diário, com retenção de 30 dias e teste mensal de restauração. Restauração em até **8 horas úteis**.
- **Canal de suporte**: a definir; WhatsApp e e-mail são os candidatos naturais.

## Contrato e saída

- **Sem fidelidade**: contrato mensal, com aviso prévio de **30 dias**.
- **Durante o aviso**: o cliente mantém **acesso normal** até o fim do prazo.
- **Exportação final**: pacote completo em CSV/JSON por entidade, arquivos originais, fluxos, agentes, prompts e base de conhecimento em JSON. Senhas, tokens, chaves e sessões ficam fora.
- **Relatório de encerramento**: mostra o que existia, o volume e o que deixa de ser usado. É cortesia, não substitui a exportação.
- **Exclusão**: imediatamente após a exportação final, no fim do aviso de 30 dias. Os backups expiram no ciclo de 30 dias.
- **Certificado de exclusão**: documento simples com data, escopo, responsável e destino dos backups.
- **LGPD**: a BOSUN é **operadora**; o workspace é **controlador**. O contrato inclui as instruções de tratamento e o dever de devolver e excluir.

## Pagamento

- **Provedor**: **Asaas**, com Pix, boleto e cartão.
- **Instalação**: 50% na aprovação e 50% no go-live.
- **Mensalidade**: primeira cobrança no go-live; depois, mensal na mesma data.
- **Nota fiscal**: a definir com o contador; o Asaas emite NFS-e quando o município estiver integrado.
- **Impostos**: dependem do regime tributário; o valor final será fechado com o contador.
- **Reajuste**: anual pelo **IPCA**.
- **Inadimplência**: aviso, suspensão em **10 dias** e cancelamento em **30 dias**.

## O que fica de fora da assinatura

- Consumo de modelos de IA (BYOK).
- Tarifas de WhatsApp, Instagram, e-mail, SMS, telefonia e outros provedores.
- Serviços extras de consultoria, migração ou desenvolvimento sob medida, salvo acordo.
- Uso abusivo ou incompatível com os termos.

## Por que não seguir o formato de planos prontos

O formato de tiers com funcionalidades bloqueadas, limite de IA e cobrança por assento cria degraus artificiais e obriga o cliente a escolher um plano antes de entender o próprio uso. A BOSUN prefere uma assinatura simples, com todas as funcionalidades e a infraestrutura dimensionada para a instalação.

## Em aberto

- Regime tributário, NFS-e e revisão jurídica do contrato.
- Canal oficial de suporte.
- Provedor da VPS, domínio e destino do backup.
- Política de upgrade e downgrade de VPS além do custo + 20%.
- Reajuste em caso de IPCA negativo.
- Pacote de horas extra: venda avulsa ou banco acumulável.
- Quem opera a VPS em caso de incidente e qual é o runbook.

## Decisões de 2026-10-23

- Comercial e jurídico fora do foco, com prazo: **NFS-e e contrato prontos antes do primeiro cliente pagante**.

## Links

- [Ambiente, workspaces e áreas](product-model.md)
- [Copiloto, Observer e agentes de IA](copilot-ai.md)
- [Social e atendimento](social.md)
- [Arquitetura](../tech/architecture.md)
- [Deploy e operação](../tech/deploy.md)
- [ADR-101 — Instalação dedicada por cliente](../decisions/adr-101-product-structure.md)
- [ADR-113 — Modelo comercial com BYOK](../decisions/adr-113-commercial.md)
- [ADR-113 — Preço, suporte e contrato da instalação dedicada](../decisions/adr-113-commercial.md)
