Part of the regional engine guide; index: ../INDEX.md

### Shims at old paths

`truncal/shared/js/*.js`, `truncal/shared/css/truncal.css`, `head-neck/shared/js/head.js` and
`lower-limb/shared/js/leg.js` are one-line re-exports, so old cached pages keep working. **Never import through
them**, and don't delete them (`static.mjs` and `deeplinks.mjs` check both).
