# Changelog

All notable changes to `dsh-personal-directive` are documented here.

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
