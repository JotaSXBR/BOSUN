---
type: Screen Map
title: Mapa de telas
description: Telas do MVP, navegação, componentes e estados.
tags: [bosun, design, screens, ui]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Mapa de telas

## Autenticação

- Login (usuário/e-mail + senha), com mostrar/ocultar senha e erros claros.
- Criar conta: o Admin define o e-mail; convite cria usuário/senha.
- Aceitar convite por link.
- Solicitar troca de senha (alerta interno ao Admin).
- Alerta de troca de senha (Admin define senha temporária).
- Troca obrigatória no próximo login, com explicação da senha temporária.

## Onboarding

1. Boas-vindas e criação do espaço.
2. Contexto: nome, área, fuso, idioma.
3. WhatsApp: criar sessão, nomear, QR/código, status.
4. Google: conectar, explicar escopo, escolher/criar etiqueta BOSUN; pode pular.
5. Equipe: gerar link de convite, papel e validade; pode pular.
6. Revisão e entrada na caixa, com pendências visíveis.

## Caixa de atendimento

- Layout de três colunas: sessões, lista de conversas e conversa.
- Sidebar de sessões WhatsApp com status.
- Filtros: Fila, Minhas, Aguardando, Resolvidas, Pendentes.
- Pendentes visível e desabilitado sem agente de IA.
- Busca na lista.
- Ordenação FIFO por mensagem sem resposta mais antiga.
- Conversa: histórico, composer, anexos, notas internas.
- Drawer lateral de contato/ticket.
- Ações: assumir, atribuir, mudar status, encerrar, criar follow-up.
- Indicadores: não lidas, tempo de espera, responsável.

## Contatos

- Lista com busca e filtros.
- Detalhe: métodos de contato, organização, foto, origem, sync Google.
- Ações: criar, editar, mesclar, exportar, sincronizar.
- Conflito de identidade: escolher qual registro prevalece.
- Etiqueta BOSUN removida: manter, arquivar ou excluir.

## Configurações

- Espaço: nome, contexto, fuso, idioma.
- Membros: lista, papéis, convites, remoção.
- Permissões: tabela editável por recurso e ação; quatro presets.
- WhatsApp: sessões, QR, status, desconectar.
- Google: conexão, etiqueta, última sync, revogar.
- Status de ticket: criar, renomear, reordenar, cor, resolvedor.
- Retenção: por tipo de dado.
- Auditoria: filtros por ator, ação e data.

## Relatórios (mínimo)

- Volume de conversas.
- Tempo médio de primeira resposta.
- Conversas resolvidas por período.
- Fila atual.

## Componentes principais

- App shell com sidebar e header.
- Botões primário/secundário/destrutivo.
- Campos de texto, busca, select, checkbox, switch.
- Badge de status, pill de canal, avatar de contato.
- Tabela de membros e permissões.
- Drawer/painel de contato.
- Composer de mensagem com anexo.
- Modal de confirmação.
- Toast de feedback.
- Empty state com ação.
- Banner de conexão (WhatsApp/Google).
- Indicador de sync e última atualização.

## Estados

- Loading com skeleton nas listas.
- Empty state com próxima ação.
- Erro com possibilidade de retry.
- Acesso negado explicando o papel necessário.
- Conexão perdida com banner e ação de reconectar.

## Decisões de 2026-10-23

- Wireframes do produto completo pelo golden path: Meu dia, calendário de Publicações, editor de post, ticket, canvas de fluxo, projeto e Base.

## Links

- [Princípios](principles.md)
- [Wireframes](wireframes/index.md)
