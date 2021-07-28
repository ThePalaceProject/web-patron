## CHANGELOG

### UNRELEASED CHANGES
- Fix "Cannot find module 'sharp'" error on installation.
- Update logo/text in mobile app callouts.
- Implement indirect bearer token borrowing (adds support for Johns Hopkins, Biblioboard, ProQuest, and other distributors).
- Add new github action to sync a branch with NYPL.
- Fix foreign-language books not appearing in search results.
- Add support for Biblioteca, Axis360, and DPLA Exchange audiobooks.
- Add support for no-password login.
- Docker images are now tagged with the major.minor version number (e.g. `2.3`), the major.minor.bugfix version number (e.g. `2.3.1`), the short commit id (e.g. `sha-c5cda3a`), and `production` or `qa`.
- Sync from NYPL-Simplified/circulation-patron-web:
  - Add: Set up e2e testing on vercel deploys via cypress
- Fork project from NYPL-Simplified/circulation-patron-web 4.4.1
