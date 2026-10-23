# Instructions for AI assistants working on anantf.com

This repo is the NTF Anaesthesia teaching site (Airway, Regional anaesthesia, POCUS, MMed exam prep), published by GitHub Pages at https://anantf.com.
**Anything merged into `main` is public on the internet within about a minute.**

## How we work

Two maintainers: Dr Koh Wen Jun and Dr Chew Shi Hao. Both work through Claude Code; neither needs
local copies of the files.

- Make each change on a new branch and open a pull request. Don't push straight to `main`.
- After opening the pull request, merge it yourself straight away (squash merge, delete the branch),
  unless the human asks to wait for review. Merging publishes it to anantf.com within a minute or two,
  so check the page works before merging.
- Raw material (source PDFs, photos, notes) lives in the shared Google Drive folder
  "NTF Anaesthesia Site". If asked to use something from it, find it there via the Google Drive
  connector, then commit only the finished, web-ready version here.
- Don't commit files over 50 MB; link to them in Drive instead.

## What belongs here, and what doesn't

This site is for **specialised web pages and web apps** (interactive tools, animations, model viewers,
calculators, resource pages that need custom code). Other kinds of material live elsewhere, so don't
suggest adding them to this repo:

| Material | Where it goes |
|---|---|
| Official department documents (guidelines, policies, protocols) | The department's Microsoft Teams group |
| Department profile, recruitment, fellowship and residency information | The official hospital site (ntfgh.com.sg) or NUHS careers |
| Posting handbooks, rotas, internal contacts and access details | The department intranet / Teams |
| Teaching slides that colleagues should be able to update themselves | Google Drive, shared with edit access, so no one has to go through this repo |
| Specialised web pages and web apps | This repo |

If someone asks for a guideline, policy or slide deck to be put on the site, tell them where it
belongs instead. Many of the people editing here are not technical, so explain things in plain English.

## Where things are

- Folder-by-folder map: [docs/LAYOUT.md](docs/LAYOUT.md). Read it before adding a page or moving one.
- Regional anaesthesia app: moved to its own repo, `regional` (https://regional.anantf.com); the old paths here are redirect stubs (see `docs/RULES.md`).
- Design language, per-app rules, the page editor and the exams page: [docs/RULES.md](docs/RULES.md). Read the
  section for the part of the site you are changing.
- Design: `DESIGN.md` (warm paper, ink, one wine accent, square edges, light only, body 17px, nothing below 12px);
  installable apps follow `DESIGN-APP.md` and link the shared kit `https://design.anantf.com/v1/app.css`
  (NTF-Anaesthesia/ntf-design). Clinical colour codes are never recoloured.

## Rules that apply everywhere

- Drafts live behind `draft.html` (noindex); don't link them from the homepage, navigation or hubs.
- Main navigation: Airway, Regional Anaesthesia, POCUS, EEG, Exam Prep. Don't add department, recruitment or handbook pages.
- Unlisted apps (`popliteal/`, `brachial-plexus/`, `spinal/`, `truncal/`, `head-neck/`, `lower-limb/`, `upper-limb/`,
  `blocks/`, `plexus/`, `popliteal-animation/`, `babymo/`, `qbank/`, `mo/`, `ot/`, `tci/`) are not linked from the homepage and keep
  their `noindex` tags.
- Regional pages live in the `regional` repo. Old URLs and hashes must keep working there; the stubs here forward them.
- Keep the credits to Dr Chew Shi Hao and the links to https://chewshihao.com/. This guards against others removing them; Dr Chew may remove his own (the POCUS pages carry none, by his decision, Oct 2026). Dr Koh Wen Jun maintains the regional anaesthesia section, including Dr Chew's regional pages (agreed Oct 2026); his other pages still need his say-so.
- No personal email addresses or phone numbers on any page. Public contact is contact@anantf.com.
- Question changes suggested by faculty: list what would change and wait for the owner's go-ahead before merging.
  Never change or reuse a question `id`; retire with `status: archived`.
- Check a page in a browser (or local static server) for console errors before committing.

## Stamping and tests (installable apps)

Each installable app has a service worker whose file lists and `VERSION` are stamped by a tool. After changing the app
(or the shared files it lists, such as the kit URLs), run the stamp, then the tests. Details and test lists are in
[docs/RULES.md](docs/RULES.md).

| App | Stamp | Tests |
|---|---|---|
| TCI emulator (`apps/tci/` → `tci/`, not installable) | `npm run build` in `apps/tci/` (commit the rebuilt `tci/`) | `npm test`, `npm run e2e` in `apps/tci/` |

Every installable app ends its settings or start page with `App version <date> (<hash>)` and a `Not updating? Get the
latest version` button (see [docs/RULES.md](docs/RULES.md)).

## Removed content (do not restore unless explicitly requested)

- The AC guide, its redirect and editing tools; never publish readable copies of the former guide.
- The department pages (About us, Why join us, For clinical fellows), the Senior resident guide and the encrypted
  MOPEX / MO handbook (`mopex/`, `tools/encrypt-mopex.mjs`). Department and recruitment content belongs on
  ntfgh.com.sg and the handbook on the intranet.

## Owner decisions and setup

Accounts and live-service settings (Firebase, Cloudflare, DNS) are the owner's to change. Ask the owner when a task
depends on them.

## Claude Code–Codex handovers

Both assistants run in separate cloud environments. Use
[the shared handover skill](.agents/skills/claude-codex-handover/SKILL.md)
and GitHub PRs to exchange pushed code and task context.

- Review a checkpoint without changing its branch or owner; report the reviewed SHA.
- Take over only after the sender/human confirms all writers have stopped. Continue
  on your own session branch and link its PR to the original.
- Include the branch/PR, goal, completed work, test results, blockers and next steps.
- Handover tasks require explicit human approval before merge or auto-merge, even
  where a general rule allows immediate merging.
- New cloud sessions get the skill through the repository clone. Do not modify an
  active Claude branch just to install these instructions.
- Token savers: `.claude/settings.json` denies reading `vendor/` folders. Ask the owner if one is really needed.
