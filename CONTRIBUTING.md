# Flujo de trabajo con Git

## Ramas

| Rama | Propósito |
| ---- | ----------- |
| `main` | Código estable integrado |
| `feat/project-structure` | Estructura del proyecto, endpoints vacíos, Docker DB |
| `feat/validators` | Validadores de dominio, CUIT y fecha + tests unitarios |
| `chore/git-workflow` | Documentación de flujo Git y decisiones |

## Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(api): ...` — funcionalidad nueva
- `fix(tests): ...` — corrección de tests
- `chore(docs): ...` — documentación o tooling
- `test(validators): ...` — solo tests

## Pull Requests

Cada PR debe incluir:

1. **Qué** se hizo
2. **Por qué** (regla de negocio o requisito del challenge)
3. **Cómo** se probó (`npm run test`, curls, etc.)
4. **Trade-offs** (alternativas descartadas)

Mínimo 2 PRs hacia `main` antes de entregar.

## Comandos útiles

```bash
git fetch origin
git checkout feat/validators
git pull origin feat/validators
```
