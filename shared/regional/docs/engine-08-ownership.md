Part of the regional engine guide; index: ../INDEX.md

## 8. Ownership

| Part | Owner (Claude Code session) |
|---|---|
| The regional app: engine (`shared/regional/`, `shared/us/`), `blocks/`, `lower-limb/`, `plexus/`, `shared/regional/test/` | "Lower limb blocks" session |
| `spinal/` content | spinal session |
| `brachial-plexus/` content | brachial plexus session |
| `truncal/` content | truncal session |
| `head-neck/` content | head and neck session |
| `lower-limb/anim/`, `popliteal-animation/`, `exams/` | Dr Chew Shi Hao (don't edit without his say-so) |

Content owners edit their own pages' data freely but use the shared engine. **Any change to `shared/regional/`
(modules, CSS, `LOOK`, registry, ops schema) goes through the regional app owner**, because it changes every page.
The usual site rules apply: branch and pull request, browser check, tests green, credits and `noindex` kept.

---
