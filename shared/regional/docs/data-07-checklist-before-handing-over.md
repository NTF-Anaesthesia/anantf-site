Part of the regional data guide; index: ../INDEX.md

## 7. Checklist before handing over
- `python3 -m http.server` from the repo root; open `/truncal/<page>/`.
- Playwright at 390 and 1440 px: no console errors, `document.documentElement.scrollWidth <= innerWidth`,
  click every `#<id>-step-*` and look at the screenshots in both views; check labels don't collide at 390 px.
- Anatomy: layer order superficial → deep; `orient` words match the needle direction text.
