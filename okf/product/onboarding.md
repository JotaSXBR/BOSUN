---
type: User Flow
title: Onboarding
description: Primeiro acesso do Admin com checklist fixo de conexões e aceite de convite com definição de senha.
tags: [bosun, onboarding, setup, convite]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Onboarding

## Primeiro acesso do Admin

O operador cria o primeiro Admin pela CLI com senha temporária; o primeiro login força a troca. Depois, uma tela de **setup** com checklist fixo, na ordem do golden path:

1. Nome do workspace e fuso.
2. Conectar **Instagram e Facebook** (OAuth da Meta, conta profissional com página).
3. Conectar **WhatsApp** (QR code do WAHA).
4. Conectar **YouTube** (OAuth do Google).
5. Conectar **Google Contatos** e o **Google Agenda** do próprio Admin.
6. Configurar o **webhook da Kiwify** (a tela mostra a URL e o segredo).
7. Instalar o **chat do site** (a tela mostra o snippet).
8. Convidar alguém.

Cada item mostra o estado (feito, pendente, com erro), pode ser pulado e volta a qualquer hora em Configurações. Sem trilhas, eventos de ativação nem dados de exemplo.

## Convite

- O Admin escolhe e-mail e papel; a BOSUN gera um link de uso único com validade de 7 dias.
- No aceite, a pessoa define usuário e senha e entra no Meu dia.

## Critérios de aceite

1. Um Admin novo completa o setup sem sair da BOSUN, exceto nas telas de autorização da Meta e do Google.
2. Pular um item não bloqueia os outros.
3. O convidado entra com a senha que definiu e cai no Meu dia.

## Relations

- governed_by: [ADR-101 — Produto, piloto e escopo](../decisions/adr-101-product.md)
- depends_on: [Canal](channel.md)
- triggers: [Google Contatos](google-contacts.md)
