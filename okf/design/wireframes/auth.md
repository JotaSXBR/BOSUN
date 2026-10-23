---
type: Wireframe
title: Wireframes de autenticação
description: Login, alerta de senha do Admin e troca forçada.
tags: [bosun, wireframe, auth, login, password]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Autenticação

## Login

```text
+--------------------------------------------------------------+
| BOSUN                                                        |
|                                                              |
|  Entrar                                                      |
|                                                              |
|  Usuário ou e-mail  [______________________________]          |
|  Senha              [______________________________]  [ver]    |
|                                                              |
|  [ Entrar ]                                                  |
|                                                              |
|  Preciso trocar a senha  ->  solicita ao Admin               |
+--------------------------------------------------------------+
```

**Validar:** login por usuário/e-mail; mostrar/ocultar senha; erro claro; link de solicitação.

## Admin define senha temporária

```text
+--------------------------------------------------------------+
| Admin > Alertas                                              |
+--------------------------------------------------------------+
| Solicitação de troca de senha                                |
| Usuário: joao@acme.com  Papel: Membro  Solicitado: 14:20     |
| [Definir senha temporária]  [Ignorar]                        |
+--------------------------------------------------------------+
| Ao definir, o usuário será forçado a trocar no próximo login.|
+--------------------------------------------------------------+
```

## Troca obrigatória

```text
+--------------------------------------------------------------+
| BOSUN                                                        |
| Troca de senha obrigatória                                   |
|                                                              |
| Senha temporária: ********                                   |
| Nova senha:       [____________________________]  [ver]      |
| Repetir nova:     [____________________________]             |
|                                                              |
| [Salvar nova senha]                                          |
+--------------------------------------------------------------+
```

**Validar:** alerta interno; senha temporária; troca forçada; complexidade e confirmação; explicação do motivo.

## Links

- [Autenticação](../../tech/auth.md)
- [Índice de wireframes](index.md)
