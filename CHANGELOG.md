# Changelog

All notable changes to `dsh-personal-directive` are documented here.

## [Unreleased]

### Changed

- Rename the translated README to `README-zh.md`. npm picks the package-page readme as the first markdown file matching its `{README,README.*}` glob, and that glob resolves to `README.zh.md` before `README.md` (measured locally with `glob@10`), so the package page has been serving the Simplified-Chinese file even though `README.md` is the source of truth. The new name sits outside the glob, so `README.md` is the only candidate from the next release on. File content is unchanged; the only other edits are the two in-repo references to the old name (`AGENTS.md`, `.github/PULL_REQUEST_TEMPLATE.md`). Side effect: the renamed file no longer matches npm-packlist's force-include pattern for `README*`, so it leaves the tarball (8 files → 7). An already-published version cannot gain a corrected readme retroactively. No version bump: this is not a release.

## [0.2.1] - 2026-09-03

### Changed

- Maintained fork at `PerryLink/dsh-personal-directive` (upstream: `liucaimao2026/dsh-personal-directive`, attribution preserved).
- Install commands point at the fork.
- Added community-engineering files (SECURITY.md, issue/PR templates, publish workflow) and a Chinese README.
- Runtime dependency `@deepseek-ai/dsh-typert-protocol` raised to the published `0.1.2-alpha.5` line; the removed `@deepseek-ai/dsh-client-runtime` client inject entry and peer dropped; `@deepseek-ai/cordis` dev pin raised to `^4.0.2`.

## [0.2.0]

### Changed

- Framework-only edition: neutral placeholder directive replaces the upstream prompt content (upstream attribution preserved).
- License field added; install docs switched to the git channel.
- Client peers declared and marked optional where the web composition provides them.
- Host-face unit tests and package hygiene (scripts, devDeps, keywords).
- CI and compat workflows.
