# Changelog

All notable changes to `dsh-personal-directive` are documented here.

## [0.2.2] - 2026-09-10

### Changed

- **The four `@deepseek-ai/dsh-*` peer ranges are re-pinned to the canonical OR form** (`>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`) and this release is what finally ships that fix to the registry. Why it matters: the range published with 0.2.1, `>=0.1.1-rc.2 <0.2.0`, does **not** admit the current host line under node-semver's prerelease rule — a prerelease version only satisfies a comparator set when some comparator in that set carries a prerelease with the same `[major, minor, patch]` tuple, and the only prerelease in the old range is `0.1.1-rc.2`. Measured: `semver 0.1.5-rc.1 -r ">=0.1.1-rc.2 <0.2.0"` prints nothing (rejected, which is exactly what `npm view dsh-personal-directive@0.2.1 peerDependencies` shows on the registry), while the same command against the OR form prints `0.1.5-rc.1` (accepted). Anyone running the current host therefore could not install this package without `--legacy-peer-deps`. The fix itself has been on GitHub since `0294671`; it had never reached npm, because `publish.yml` only runs on `v*` tags. No runtime code changed.
- Rename the translated README to `README-zh.md`. npm picks the package-page readme as the first markdown file matching its `{README,README.*}` glob, and that glob resolves to `README.zh.md` before `README.md` (measured locally with `glob@10`), so the package page had been serving the Simplified-Chinese file even though `README.md` is the source of truth. The new name sits outside the glob, so `README.md` is the only candidate from this release on. File content is unchanged; the only other edits are the two in-repo references to the old name (`AGENTS.md`, `.github/PULL_REQUEST_TEMPLATE.md`). Side effect: the renamed file no longer matches npm-packlist's force-include pattern for `README*`, so it leaves the tarball (8 files → 7, and `README.zh.md` at 8,315 B was the largest entry). An already-published version cannot gain a corrected readme retroactively, so 0.2.2 is the first version whose npm page serves the English source.

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
