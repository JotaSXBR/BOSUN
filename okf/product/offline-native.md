---
type: Product Spec
title: Offline e apps nativos
description: Escopo offline, conflito de sincronização, PWA e casca Capacitor com Android primeiro.
tags: [bosun, product, offline, pwa, capacitor, mobile, sync]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Offline e apps nativos

> **2026-10-23:** offline é **capacidade futura** e não entra no design do produto completo agora ([ADR-110](../decisions/adr-110-notifications-gamification-apps.md)).

A BOSUN é **web-first**. Offline e apps nativos são extensões do mesmo produto, não uma segunda base de código. O objetivo é capturar e consultar o essencial quando a conexão cai, sem prometer atendimento em tempo real offline.

## Offline

### O que funciona

- **Leitura em cache** do Meu dia, tarefas, notas, hábitos e agenda.
- **Captura** de notas e tarefas.
- **Conclusão** de tarefas.
- **Check-in** de hábitos.
- Rascunho local de mensagem, sem envio.

### O que não funciona

- Envio de mensagens de atendimento; o envio espera a conexão.
- Upload de anexos e mídias.
- Sincronização de canais, e-mail e calendário em tempo real.
- Atendimento ao vivo; a caixa é online-only nesta fase.
- Busca global completa; a busca offline fica limitada ao cache local.

### Conflito

- Operações offline entram em uma **fila idempotente**, com chave por operação.
- Conflito é resolvido **por campo**, com a última alteração vencendo; a BOSUN avisa e guarda histórico.
- Exclusão usa **lixeira**; se um item excluído no servidor for editado offline, a BOSUN avisa e preserva a cópia na lixeira.
- Permissões continuam valendo: o servidor rejeita operação que o usuário não pode fazer, mesmo que a UI offline permita.
- Cache é por usuário e dispositivo; logout limpa o cache local.

### Limites

- O navegador não garante background sync em todos os dispositivos; iOS é mais restrito.
- O cache tem limite de armazenamento e janela de dados; a janela exata é técnica.
- Dados offline são sensíveis: o cache segue as permissões, é limpo no logout e não deve guardar conteúdo além do necessário.
- Atendimento offline (ler conversas e enviar) fica para uma fase futura, se fizer sentido.

## Apps nativos

- **PWA instalável** é a base: web app, service worker, cache e push quando o navegador permite.
- **Casca Capacitor** para Android primeiro e iOS depois; reutiliza o web app e adiciona plugins nativos.
- A casca existe para **push, compartilhamento, câmera/arquivos, biometria, deep links e presença na loja** — não para reescrever a UI.
- **Android primeiro** cobre a maioria dos usuários no Brasil; iOS entra depois, com as limitações de PWA e de loja.
- **Desktop** usa o PWA instalável; não há app Electron/Tauri nesta fase.
- O web app continua sendo a fonte; a casca não cria regra de negócio própria.
- Atualizações do web app são imediatas; a casca é atualizada pela loja e precisa manter compatibilidade.

## Em aberto

- Janela e limite do cache offline.
- Atendimento offline: ler conversas e enviar em fila no futuro.
- Criptografia do cache local e wipe remoto.
- Momento do iOS e requisitos de loja.
- Cobrança dentro das lojas vs. fora, quando a assinatura chegar às lojas.
- Testes em dispositivos e matriz de versões.

## Links

- [Meu dia](my-day.md)
- [Tarefas e projetos](tasks-projects.md)
- [Hábitos](habits.md)
- [Integrações externas](integrations.md)
- [Arquitetura](../tech/architecture.md)
- [ADR-110 — Offline e apps nativos](../decisions/adr-110-notifications-gamification-apps.md)
