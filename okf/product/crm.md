---
type: Product Spec
title: Contatos, empresas e negócios
description: CRM leve com pessoa, empresa simples e negócio em pipeline padrão.
tags: [bosun, product, crm, contacts, companies, deals]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Contatos, empresas e negócios

## Contato

- Pessoa relacionada a tarefas, projetos, atendimentos e conversas.
- Identidade principal por **telefone E.164**; e-mail e `resourceName` são fallbacks.
- Compatível com Google People API, restrito à etiqueta **BOSUN**.
- Campos: nome, e-mail, telefone, foto e empresa.
- Histórico de conversas, tickets, tarefas, notas e negócios.

## Empresa

- Entidade **simples**: nome, domínio, telefone, endereço e contatos vinculados.
- Não tem hierarquia de matriz/filial nesta versão.
- Pode agrupar contatos, negócios e atendimentos.

## Negócio

- Pipeline **simples**: estágios, valor, contato/empresa e responsável.
- Estágios padrão de mercado: **Novo, Qualificado, Proposta, Ganho, Perdido**.
- Sem probabilidade, previsão ponderada ou atividades de CRM completo nesta versão.
- Pode ser vinculado a atendimentos, tarefas e projetos.

## Regras

- Um contato pode ter mais de um negócio.
- A empresa é opcional; o contato pode existir sozinho.
- A exclusão de contato ou empresa exige confirmação e preserva o mínimo legal.
- A sincronização com Google continua restrita à etiqueta BOSUN; a BOSUN é a fonte da verdade depois da importação.

## Em aberto

- ~~Um contato pode pertencer a mais de uma empresa?~~ — não: uma empresa atual, histórico guardado, troca sugerida por sinais observados ([ADR-106](../decisions/adr-106-contacts-crm.md)).
- Histórico e linha do tempo do negócio.
- Estágios personalizáveis pelo Admin.
- Duplicidade e fusão de contatos e empresas.
- Permissões por papel para empresa e negócio.
- Retenção de dados de CRM.

## Decisões de 2026-10-23

- Mudança de estágio, valor ou dono vira evento auditado; Ganho e Perdido pedem motivo.
- **Membro vê os negócios do seu time**; Admin e Manager veem todos.

## Links

- [Atendimento multicanal](service.md)
- [Contatos e Google (MVP)](contacts-google.md)
- [ADR-106 — CRM leve](../decisions/adr-106-contacts-crm.md)
