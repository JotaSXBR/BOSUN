# BOSUN

Central de operação do infoprodutor: o post nasce, o comentário vira conversa, a conversa vira venda e a venda vira trabalho entregue, no mesmo fio. Web-first, multiusuário, uma VPS dedicada por cliente.

## Status

- Produto cortado ao **piloto** com uma founder de infoprodutos: [golden path](okf/product/pilot.md).
- Documentação no formato OKF v0.2, com o [Perfil OKF BOSUN](okf/okf-profile.md). Tudo em draft até a aprovação.
- Ainda não há código de produto.

## Comece aqui

- [AGENTS.md](AGENTS.md) - Instruções para quem trabalha no projeto, humano ou agente de IA.
- [okf/index.md](okf/index.md) - Entrada do bundle.
- [okf/memory/current-state.md](okf/memory/current-state.md) - Estado atual e próximo passo.

## Estrutura

```text
okf/
  okf-profile.md  regra de escrita do bundle
  product/        conceitos do piloto e later.md (adiados)
  decisions/      um ADR por domínio
  tech/           arquitetura, dados, auth, integrações, testes e deploy
  design/         princípios, mapa de telas e wireframes
  plan/           plano em fatias
  memory/         estado atual
scripts/          validador do bundle e self-test
archive/          histórico; não é estado atual
```

## Validar a documentação

```bash
./scripts/validate.sh ./okf
```
