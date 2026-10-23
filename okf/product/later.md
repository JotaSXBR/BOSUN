---
type: Backlog
title: Para depois
description: O que foi adiado no corte do piloto, uma linha por item, sem detalhe; entra só por decisão nova no ADR do domínio.
tags: [bosun, backlog, adiado]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Para depois

Adiado em 2026-10-23. Para voltar, o item ganha decisão no ADR do domínio e um conceito próprio.

## Fundação e acesso

- Área pessoal e workspace pessoal por membro.
- Matriz de permissões granular, exceções por membro, times por módulo e papel Manager.
- Segundo fator (TOTP), passkey, chave de recuperação, trava de inatividade, reautenticação por ação e lista de dispositivos.
- Templates de workspace.
- Convidados externos.

## Canais e atendimento

- E-mail IMAP/SMTP como canal.
- Telegram.
- TikTok (comentários e DM).
- SLA por canal, horário comercial e feriados.
- CSAT.
- Métricas de atendente (primeira resposta, resolução, carga).
- Menções em notas internas, divisão e fusão de tickets.
- Restringir sessões de WhatsApp por papel.

## Automação e IA

- Canvas de fluxos, blocos de espera e condição, verificação de seguidor e limites configuráveis.
- Templates de fluxo: boas-vindas, recuperação, agendamento, confirmação e lembrete, pós-venda, reativação.
- Agentes de IA (SDR, Suporte, Agendador, Recuperação, Onboarding de aluno, Cobrança, Assistente) e autonomia por ferramenta.
- Copiloto (sugerir resposta, escrever, propor estrutura).
- Base de Conhecimento com RAG e busca semântica.
- BYOK multi-provedor e controle de custo de IA.
- Resumos inteligentes.

## Publicações

- Threads, Kwai e TikTok em Publicações.
- Aprovação de post e time de Publicações.
- Reciclagem, fila com slots e melhor horário.
- Analytics de alcance e engajamento.
- Broker central de OAuth (antes da segunda instalação).
- Webhook de venda genérico (outros checkouts além da Kiwify).

## Trabalho e conteúdo

- Notas e captura.
- Subtarefas, dependências, recorrência e estimativa de tarefa.
- Seções, marcos e linha do tempo de projeto.
- Gravar eventos no Google Agenda (duas vias), recorrência e time blocking.
- Empresa no CRM e estágios editáveis.

## Operação e comercial

- Offline, PWA e apps (Capacitor).
- Notificação por e-mail.
- Servir o bundle `okf/` por MCP como memória dos agentes (avaliar a segurança do servidor antes).
- Canal beta de release e heartbeat para o operador.
- Retenção configurável por tipo de dado.
- Modelo comercial: instalação + mensalidade, Asaas, NFS-e e contrato (antes do primeiro cliente pagante).

## Relations

- governed_by: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
