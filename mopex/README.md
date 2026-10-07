# MOPEX / Junior Resident guide

The page decrypts `handbook.enc.json` in the browser. No password or readable handbook is committed. It includes internal posting arrangements, so it is protected and excluded from indexing. Personal and vendor phone numbers and source photographs were omitted.

To update it, keep the private JSON outside this repository. Use `{ "chapters": [{ "id": "unique-id", "title": "Chapter title", "html": "Trusted, reviewed chapter HTML" }] }`. Review clinical changes and retain source links and the review date. Do not insert untrusted HTML.

Run `node tools/encrypt-mopex.mjs /absolute/path/guide-content.unlocked.json` from the repository. Supply the department password through standard input using a private local workflow. Do not put it in a command argument, log or committed file. Commit only the encrypted result. Check correct and incorrect passwords, mobile navigation, search and tables before merging.

The guide is a teaching adaptation of the NTFGH MO Handbook (4th edition, 2026), not a newly approved hospital protocol. Current departmental protocols remain authoritative in Teams. Roster arrangements, PACU eligibility, stock concentrations and device workflows require department confirmation.

Shared-password encryption protects against casual access but is not individual staff authentication. Do not add patient information or highly sensitive material. Locking or closing the page clears the rendered guide; it cannot revoke copies made by an authorised reader.
