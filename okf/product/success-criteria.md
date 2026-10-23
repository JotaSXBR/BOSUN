---
type: Success Criteria
title: Critérios de sucesso do produto completo
description: Golden path, ciclo real de lançamento + 30 dias e evidências de que a BOSUN substitui as ferramentas paralelas.
tags: [bosun, success, acceptance, golden-path, pilot, completeness]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Critérios de sucesso do produto completo

O sucesso não é ter todos os módulos; é a piloto conseguir operar o negócio inteiro na BOSUN, sem re-digitar dados e sem voltar às ferramentas paralelas. O produto é completo quando o **golden path** e o **ciclo real** passam.

> “Lançamento”, aqui, é o lançamento de um produto ou campanha **da piloto**, não o lançamento comercial da BOSUN.

## Golden path

Uma campanha real, em um workspace, atravessa:

1. **Preparação** — a piloto cria ou usa o workspace, cria o **time de Publicações** e convida quem publica, conecta WhatsApp, Instagram, Facebook, TikTok, YouTube, Threads e Kwai e confirma as permissões.
2. **Publicações** — cria a **campanha/lançamento**, escreve o post, adapta texto e mídia por plataforma, aprova e agenda.
3. **Publicação** — os posts saem por API ou em modo assistido; cada destino tem status; o analytics começa a coletar.
4. **Social** — um comentário, story ou menção dispara a automação; há resposta pública e DM; o contato é criado ou atualizado; a deduplicação funciona.
5. **Handoff** — um dos seis gatilhos promove a conversa para Atendimento; o SLA começa; uma pessoa assume e responde.
6. **CRM e venda** — o contato vira empresa/negócio quando há intenção real; a venda é confirmada por webhook e atribuída ao post/fluxo.
7. **Trabalho** — a entrega ou o follow-up vira tarefa, entra em um projeto, ocupa o calendário e aparece no Meu dia.
8. **Inteligência** — a Base sustenta a resposta do Copiloto ou do agente; a fonte é citada; a ação é auditada; o Observer sugere uma melhoria.
9. **Visão** — os dashboards de Publicações, Social, Atendimento e CRM mostram o mesmo fio, sem re-digitação.
10. **Repetição** — a piloto repete o ciclo por 30 dias sem abrir as ferramentas paralelas para as funções cobertas.

Cada passo precisa deixar **evidência**: registro, status, timestamp, auditoria ou métrica. Um passo “funcionando” sem evidência não conta.

## Ciclo real

**Um lançamento real + 30 dias corridos de uso contínuo**, com a piloto e, se houver, o time.

- O lançamento prova o funil: post → comentário/DM → automação → atendimento → venda atribuída.
- Os 30 dias provam a rotina: tarefas, projetos, agenda, notas, documentos, hábitos, objetivos, CRM e canais.
- O ciclo só termina quando a piloto declara que **não precisou de ferramenta paralela** para as funções cobertas.

### Evidência do ciclo

- Checklist semanal das ferramentas que ela **não** abriu para as funções cobertas.
- Dados completos no BOSUN: toda conversa tem contato; toda venda tem atribuição; toda tarefa tem dono; todo post tem status.
- Nenhuma re-digitação entre módulos.
- Nenhuma mensagem perdida e nenhum post duplicado.
- A piloto confirma que manteria a BOSUN se o piloto acabasse.

## Critérios de completo

### Integração

- Os fluxos entre módulos funcionam **sem re-digitação**.
- Todo vínculo é **explícito e auditável**: conversa → negócio, nota → tarefa, post → fluxo, venda → campanha.
- Nada vira tarefa, negócio ou item compartilhado **por padrão**.
- Cada módulo funciona sozinho; a integração é uma passagem de trabalho, não uma dependência estrutural.

### Cobertura

- Todas as capacidades do [mapa](roadmap.md) atingem o critério “completo quando”.
- As seis plataformas de Publicações publicam por API ou em modo assistido.
- O **time de Publicações** e a **campanha** são criados e usados no golden path; post e campanha pertencem ao time, e a venda é atribuída à campanha.
- Os canais de Atendimento (WhatsApp, e-mail, chat e Telegram) criam, atendem e encerram ticket.
- O sistema pessoal cobre captura, notas, documentos, tarefas, projetos, agenda, Meu dia, hábitos e objetivos.

### Confiabilidade

- Nenhuma mensagem perdida; nenhum post duplicado.
- Falha de publicação é visível, isolada por destino e reprocessável.
- Backup testado com restauração; atualização não perde dados.
- Fila e jobs são idempotentes.

### Segurança e privacidade

- Autorização sempre no servidor; nenhuma permissão vem do cliente.
- Dados pessoais e do workspace separados; Admin/Manager não veem a vida pessoal de outro membro.
- Ações sensíveis auditadas; exportação e exclusão funcionam.
- Agentes não herdam permissões e não executam ação externa sem aprovação e escopo.

### Operabilidade

- Um segundo workspace é criado na mesma instalação sem código sob medida.
- Instalação, backup, restauração, atualização e exportação têm runbook repetível.
- Monitoramento e alertas cobrem fila, canais, publicação e jobs.

### Adoção

- A piloto completa o ciclo real.
- Ela não volta para as ferramentas paralelas nas funções cobertas.
- Ela recomendaria a BOSUN a outro infoprodutor.
- O time, quando existir, usa os mesmos fluxos sem treinamento longo.

## O que não conta como sucesso

- Checklist de funcionalidades sem o golden path.
- Demonstração com dados falsos.
- Número de módulos ou de telas.
- Receita, número de clientes ou lançamento comercial — isso é sucesso comercial, não critério do produto.
- Uma IA que “impressiona” sem fonte, escopo ou auditoria.

## Em aberto

- Metas numéricas de tempo de resposta, conversão e adoção.
- Como medir “sem ferramenta paralela” sem vigilância indevida.
- Baseline da piloto para comparar antes/depois.
- Quem assina o aceite do ciclo além da piloto.

## Links

- [Mapa de capacidades](roadmap.md)
- [Anti-goals e fronteiras](anti-goals.md)
- [Escopo do MVP](mvp-scope.md)
- [Piloto, planos e contrato](plans.md)
- [ADR-101 — Produto completo e critérios de sucesso](../decisions/adr-101-product-structure.md)
