## CHANGELOG

### UNRELEASED CHANGES

- Add book format (ePub, PDF, Audiobook) to book details page (PP-2191)
- Change test/build GitHub workflow to build after tests. (PP-1222)
  - Once this change is merged, we will abandon this change log and use GitHub release notes instead.
- Exclude all unsupported authentication mechanisms from the login page. (PP-2188)
- Don't include not yet implemented Basic Token auth as available auth mechanisms. (PP-2188)
- Allows configuration of media support default for unmatched content types. (PP-2190)
- distributor added to book details page
- Log auth document URL when Catalog Root link missing. (PP-1209)
- Update default libraries config.
- Remove no longer needed node option: -openssl-legacy-provider.
- Fix a couple of vulnerable dependencies.
- replace reakit with ariakit
- Update nextjs to v15, react to v18
- Fix check on redirect URL to make sure it doesn't start with HTTP, instead of contain HTTP, since it was falsely matching some legitimate URLs.
- Change font to Open Sans.
- Update iOS App Store badge to link to Palace app.
- Update Google Play Store badge to link to Palace app.
- Update logo/text in mobile app callouts.
- Fix "Cannot find module 'sharp'" error on installation.
- Implement indirect bearer token borrowing (adds support for Johns Hopkins, Biblioboard, ProQuest, and other distributors).
- Add new github action to sync a branch with NYPL.
- Fix foreign-language books not appearing in search results.
- Add support for Biblioteca, Axis360, and DPLA Exchange audiobooks.
- Add support for no-password login.
- Docker images are now tagged with the major.minor version number (e.g. `2.3`), the major.minor.bugfix version number (e.g. `2.3.1`), the short commit id (e.g. `sha-c5cda3a`), and `production` or `qa`.
- Sync from NYPL-Simplified/circulation-patron-web:
  - Add: Set up e2e testing on vercel deploys via cypress
- Fork project from NYPL-Simplified/circulation-patron-web 4.4.1
