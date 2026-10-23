---
type: Infrastructure Spec
title: Mídia e RustFS
description: Storage S3-compatível, buckets, URLs assinadas, backup e expurgo.
tags: [bosun, media, rustfs, s3, storage]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://rustfs.com/
    title: RustFS — S3-compatible object storage
  - resource: https://github.com/rustfs/rustfs
    title: RustFS — source repository
---

# Mídia e RustFS

## Decisão

- **RustFS** como storage S3-compatível (Apache 2.0).
- MinIO AIStor é alternativa comercial.
- MinIO Community não é recomendado para produção.
- A interface S3 permite trocar o provedor depois.

## Topologia

- RustFS roda em container próprio no VPS.
- Volume persistente para os objetos.
- A BOSUN acessa por endpoint S3 interno.
- Bucket privado; sem ACL pública.

## Objetos

- Chave sugerida: `workspace/{workspace_id}/{media_id}/{filename}`.
- Metadados em `MediaAsset`: `storage_key`, `mime_type`, `size_bytes`, `checksum`, `created_at`.
- Validar MIME e tamanho no upload.
- Calcular checksum para integridade.
- Nome original preservado apenas como metadado; a chave usa ID.

## Acesso

- URLs assinadas com TTL curto para exibição/download.
- A autorização é verificada antes de gerar a URL.
- Nunca expor credenciais S3 no cliente.
- Acesso por papel e auditoria para downloads sensíveis.

## Upload

1. Receber arquivo.
2. Validar tipo/tamanho.
3. Calcular checksum.
4. Enviar ao RustFS.
5. Gravar `MediaAsset`.
6. Associar à mensagem/contato.

## Expurgo

- Só por exclusão explícita (documento, ticket ou contato pela LGPD); nada expira sozinho no piloto.
- Remover objeto e metadado juntos.
- Se o objeto falhar, manter registro de erro e tentar novamente.
- Auditar exclusões.

## Backup

- Backup diário dos objetos do RustFS.
- Retenção de 30 dias.
- Teste de restauração mensal.
- O backup precisa cobrir PostgreSQL, volumes WAHA e RustFS.
- Definir destino externo e criptografia do backup.

## Riscos

- RustFS é jovem; validar estabilidade e restore.
- Objetos grandes podem tornar o backup lento.
- A retenção de mídia precisa ser consistente com mensagens e auditoria.

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- details: [Documento](../product/document.md)
