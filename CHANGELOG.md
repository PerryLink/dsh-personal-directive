# Changelog

All notable changes to `dsh-personal-directive` are documented here.

## [0.2.4] - 2026-09-24

### Fixed

- **The top-bar switch could not mount at all on any 0.1.7 host.** `lib/client.js` destructured `IconCheckOutline16` / `IconCloseOutline16` / `IconLoadingOutline16` and rendered them as `h(IconLoadingOutline16, { size: 14 })` and friends. The host's client visual unification (host commit `4937343a5e`, shipped in `0.1.7-alpha.1`) removed every "size in the name" icon export and re-exported them by stroke weight instead, so all three names resolved to `undefined`, `React.createElement(undefined, …)` threw `Element type is invalid`, and the button never mounted. Renamed to the current exports, one-for-one: `IconCheckOutlineRegular`, `IconCloseOutlineRegular`, `IconLoadingOutlineRegular` (the `Regular` weight, matching the 1px stroke the 16-suffixed glyphs drew). The `size` prop is still accepted under the new API, so `{ size: 14 }` is unchanged.
- The switch's off state passed `variant: "secondary"`, which is not in the host's `ButtonVariant` union (`'primary' | 'ghost' | 'outline' | 'toolbar'`), so `css[variant]` resolved to `undefined` and the off state silently lost its variant class. It is now `'outline'`: `outline` is the host's one secondary-weight *filled-pair* variant (transparent fill plus a `--dsw-alias-border-l3` hairline border, the pairing the host's own dialog Cancel button uses), which is what a two-state on/off control needs next to the `primary` on state. `ghost` was the other candidate but it is borderless and is merely the component default, so it would render the off state as unstyled next to a filled on state.

### Added

- **A host contract check, `scripts/check-client-contract.mjs`, on the `harness:check` / `check` path.** `node --check` only proves `lib/client.js` parses, which is exactly why the defect above shipped: a symbol the host dropped is syntactically valid and fails only when React renders it, in a browser. The new check reads the require list out of `lib/client.js`, resolves the host's `@deepseek-ai/dsh-client-ui-primitives` from its `exports` map, and verifies every required symbol against the host's own type surface (`lib/types/**/*.d.ts`, following `export *` transitively) **and** its runtime exports (`lib/index.js`), so a name that is declared but never exported at runtime also fails. It additionally pins the `variant` values passed to `Button` against the host's `ButtonVariant` union. Failures name every offending symbol and exit non-zero; the check refuses to report success vacuously (no requires, no resolvable host, or an unreadable declaration all fail loudly). Zero new dependencies; the host checkout is auto-located, overridable with `--host <path>` or `DSH_HOST_ROOT`. The unit tests cover both directions, including that the three pre-0.1.7 icon names are rejected by name.

### Changed

- Runtime dependency `@deepseek-ai/dsh-typert-protocol` raised from `0.1.7-alpha.2` to the published `0.1.7-rc.1`. The four `@deepseek-ai/dsh-*` peer ranges are unchanged: `>=0.1.7-0 <0.2.0` already admits `0.1.7-rc.1`, and widening or narrowing them is a separate concern from this fix.
- The shipped `files[]` now includes `scripts/`, so the contract check travels with the package.

## [0.2.3] - 2026-09-12

### Fixed

- Derive the status snapshot `version` from `package.json` instead of the stale literal `"0.2.1"` (the package had already moved to 0.2.2), and point the monthly Compat workflow at the `0.1.5-rc.2` host line instead of `0.1.1-rc.2` — the old pin was *below* this package's own peer floor, so the gate could not validate any supported host.

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
