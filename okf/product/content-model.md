---
type: Content Model
title: Itens, notas, documentos e conhecimento
description: Item como supertype, biblioteca de arquivos, Base de Conhecimento e Segundo Cérebro.
tags: [bosun, product, item, notes, documents, knowledge, rag]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Itens, notas, documentos e conhecimento

## Item

**Item é um supertype real**, com escopo fechado no [ADR-104](../decisions/adr-104-content-knowledge-search.md). Ele dá **um número único** ao que se escreve e se vincula: comentário, menção, vínculo, anexo, busca, auditoria e exportação apontam para o item, não para uma cópia do conteúdo.

- **Dentro:** Nota, Tarefa, Documento e Link (Link é favorito categorizado; [ADR-104](../decisions/adr-104-content-knowledge-search.md)).
- **Fora:** containers (projeto, campanha, workspace, time); entidades com ciclo próprio (conversa, ticket, mensagem, contato, empresa, negócio); evento (calendário e sync); artigo da Base (revisão própria). Todos se **vinculam** a itens.
- O item carrega identidade, workspace, dono, visibilidade, tipo, estado e datas; cada tipo tem um detalhe **1:1**.
- **Subtarefa é item** (tarefa com pai); **linha de checklist não é item**.
- A captura sempre cria um item; a classificação é automática e o usuário corrige.
- O guarda-chuva é interno: na interface o usuário vê Nota, Tarefa, Documento e Link.

### Estados

| Estado | Significa | Onde aparece |
|---|---|---|
| `inbox` | capturado, não processado | caixa de entrada e Meu dia |
| `processado` | virou brief, tarefa ou foi vinculado | no contexto que o usa; busca |
| `arquivado` | encerrado, fora do caminho | busca e histórico |

Arquivar é ação do usuário; processar é consequência de usar.

### Transformar e promover

- **Transformar** mantém o mesmo item e troca o tipo, com o detalhe anterior preservado para desfazer. Só é permitido quando não há filhos específicos do tipo.
- **Promover** cria a entidade da outra família ao lado (projeto, campanha, post) e registra `originou` no vínculo. A origem não é copiada nem apagada.
- Item publicado ou arquivado **congela o tipo**.

### Brief vivo

Quando uma nota é promovida a projeto, ela se torna o **brief vivo** do projeto: o projeto aponta para a nota, e editar o brief edita a mesma nota, com os comentários e links dela. A nota não é copiada nem arquivada. Apagar ou arquivar o brief enquanto o projeto existe é bloqueado; apagar o projeto devolve a nota ao `inbox`.

### Entrega

Uma **entrega** — o vídeo, a peça, o artigo — é uma **tarefa** dentro do projeto, vinculada ao rascunho de post em [Publicações](publications.md). Não é um tipo novo.

## Notas

- Nota é um **tipo de Item**, não um módulo separado.
- Aceita título, corpo editável, tags/contextos e vínculos.
- Não se mistura com a biblioteca de Documentos nem com a Base de Conhecimento.

## Links

- Um Link salvo dentro da BOSUN é uma **referência**, não um arquivo.
- Candidato a tipo de Item, com URL, título, prévia, domínio e tags.
- Decisão ainda provisória: o usuário quer confirmar o valor antes de fechar.

## Documentos

Documentos é a **biblioteca de arquivos externos**: PDFs, planilhas, documentos, Markdown, imagens, fotos, vídeos e catálogos.

- Organização por pastas, tags, contextos, projetos e atendimentos.
- Pré-visualização e busca por conteúdo quando tecnicamente viável.
- Vinculação a tarefas, projetos e contatos.
- A biblioteca é **do workspace e pessoal**: cada membro pode ter arquivos privados, e o workspace tem a biblioteca compartilhada.
- Arquivo enviado dentro de algo é **anexo**; captura direta cria um **item da biblioteca**. Anexos referenciam itens da biblioteca.
- Documentos **não mistura** arquivos com notas ou conhecimento estruturado.

## Cota e armazenamento

- Documentos, anexos e mídias ficam no **RustFS** (S3-compatível).
- A cota é **por workspace + limite por arquivo**; a biblioteca pessoal e os anexos contam na mesma cota.
- Os números de cota e de arquivo são definidos pelos planos, não pelo código.
- Arquivos acima do limite por arquivo são recusados; o tratamento de vídeos grandes fica em aberto.

## Arquivamento e expurgo

O byte é grande e o registro é pequeno: eles não precisam envelhecer juntos. Ver [ADR-104](../decisions/adr-104-content-knowledge-search.md).

- Projeto concluído gera um **pacote de encerramento** verificável: `LEIA.md`, `manifest.json` com checksums, conteúdo e registro.
- O download é **manual**, por Admin/Manager, com **prazo de 90 dias** a partir do encerramento.
- **Expurgo 24 h após o download verificado** e nunca antes dos 90 dias; sem download, não há expurgo.
- **Fica:** registro, texto publicado, metadados e checksum, destino do pacote, auditoria, aprovações e métricas. **Sai:** os bytes.
- Mídia expurgada vira **`arquivado_externo`**, com placeholder, checksum e ação de restaurar; links não quebram.
- O backup de 30 dias continua; a exclusão definitiva se completa depois dele.
- Retenção legal suspende o expurgo.

## Base de Conhecimento

- É uma **wiki interna + base de recuperação da IA**: artigos curados, com categorias e busca, usados pela equipe e pelo atendimento.
- A IA usa **RAG** com técnicas modernas; a técnica exata fica para o ADR de IA.
- Só artigos **publicados** podem ser recuperados pela IA; rascunhos e arquivados ficam fora.
- Revisão por **quatro olhos**, em dois formatos configuráveis por workspace: **pares** (dois membros do mesmo setor aprovam um ao outro) ou **somente Admin/Manager**. O artigo vence em **180 dias** e sai do RAG até ser revisto.
- A estrutura de categorias, coleções ou espaços será definida na fase da Base de Conhecimento.

## Segundo Cérebro

- Fica para uma **etapa futura**.
- A direção é conhecimento pessoal interligado, com links e backlinks.
- Não faz parte da primeira versão.

## Em aberto

- ~~Link como tipo de Item~~ — confirmado como favorito de URL externa, categorizado, privado, de projeto ou compartilhado ([ADR-104](../decisions/adr-104-content-knowledge-search.md)).
- Estrutura e regra exata de revisão da Base de Conhecimento.
- Viabilidade de busca por conteúdo em PDFs, planilhas e imagens (OCR/parsing).
- Permissões da biblioteca pessoal dentro de um workspace compartilhado.
- Números de cota e limite por arquivo; tratamento de vídeos grandes; OCR/parsing; backup dos objetos; criptografia em repouso.

## Decisões de 2026-10-23

- Base: **quatro olhos** com os dois formatos (pares do mesmo setor ou só Admin/Manager), vencimento em 180 dias.

## Links

- [Integrações externas](integrations.md)
- [Ambiente, workspaces e áreas](product-model.md)
- [ADR-104 — Item como supertype](../decisions/adr-104-content-knowledge-search.md)
- [ADR-104 — Documentos, Base de Conhecimento e notas](../decisions/adr-104-content-knowledge-search.md)
- [ADR-104 — Escopo do supertype Item](../decisions/adr-104-content-knowledge-search.md)
- [ADR-104 — Pacote de encerramento e expurgo de mídia](../decisions/adr-104-content-knowledge-search.md)
- [ADR-107 — E-mail IMAP e cota de armazenamento](../decisions/adr-107-service-social.md)
