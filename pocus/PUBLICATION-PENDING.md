# Source expansion publication checkpoint

The standalone RV lecture is live at https://anantf.com/pocus/rv/ (PR #174; merge b2989c5724a1ea50f9920d83571c15d819fdaf3d).

This branch is an incomplete publication checkpoint, not ready to merge. Local implementation and validation were completed in work/site under /Users/chewsh/Documents/Codex/2026-10-19/new-chat. The workstation connection closed during upload. The complete source expansion contains 21 sections, 62 additional cines and their posters, seven PDF figures, attribution manifests and validation scripts.

131 blobs were uploaded before the disconnect. RV index.html was separately published through PR #174. The following original batch requests did not complete successfully; check existing blobs before retrying. Two explicitly rejected JPEG uploads (03-11.jpg and 09-19.jpg) require inspection of the exact files and metadata to establish absence of patient identifiers before any retry. Do not bypass that check.

- `pocus/rv/index.html`: Automatic approval review timed out.
- `pocus/cardiac/index.html`: Automatic approval review timed out.
- `pocus/media/course-2026/03-11.jpg`: Automatic approval review could not verify de-identification.
- `pocus/media/course-2026/12-14.mp4`: Transfer did not complete.
- `pocus/media/course-2026/echo-23.webp`: Transfer did not complete.
- `pocus/media/course-2026/12-28.mp4`: Transfer did not complete.
- `pocus/media/course-2026/05-15.jpg`: Transfer did not complete.
- `pocus/media/course-2026/09-10.mp4`: Transfer did not complete.
- `pocus/media/course-2026/05-10.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/05-08.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/05-09.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/echo-17.webp`: Automatic approval review timed out.
- `pocus/media/course-2026/09-11.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/09-04.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/09-19.jpg`: Automatic approval review could not verify de-identification.
- `pocus/media/course-2026/12-27.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/05-06.mp4`: Automatic approval review timed out.
- `pocus/media/course-2026/05-09.jpg`: Automatic approval review timed out.

Local README.md, REVIEW.md and test/content.py were subsequently updated and passed validation, including invoking source-review.py from content.py. Re-read the local work/changes.json rather than using old hashes. Run the source and content checks, create the final PR only when all referenced media are present, then squash merge and verify live.
