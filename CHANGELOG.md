# Changelog

All notable changes to `dsh-personal-directive` are documented here.

## [0.2.5] - 2026-09-24

### Fixed

- **The plugin row could not activate at all on a `0.1.7-rc.1` host.** `index.js` declared its two invocation codecs as `{ mode: "strict", typeSymbol, schema }` — the 0.1.5-line two-faced form. The 0.1.7 `@deepseek-ai/dsh-typert-registry` requires the single `create()` factory face (`packages/typert/protocol/src/types.ts`: `readonly create: () => TypertSchema`; there is no `schema` member), so `validateCodec` refused the manifest at mount and the whole entry failed:

  ```text
  dsh: warning: 1 entry did not activate
  personal-directive (dsh-personal-directive): Error: typert: dsh-personal-directive#personalDirective/getState result strict codec has no create() factory
  ```

  The codec helper is now `{ mode: "strict", typeSymbol, create: () => schema }`, isomorphic with the rest of the plugin family (`dsh-ticktick/src/wire.ts`, `dsh-budget`, `dsh-draw`, `dsh-observe`, `dsh-reach`, `dsh-talk`, `dsh-autotier`). The obsolete `schema` field is **removed** rather than kept alongside: it is not a member of the host contract, nothing in the host reads it, and carrying it would have hidden the defect instead of fixing it. This repository was the only one of the nine strict-codec plugins still on the old form — measured by the maintainer across all 45 plugin repositories.
- `lib/client.js` carried the same defect one line below its own version of the helper (`{ mode: "strict", typeSymbol, schema: { parse: identity } }`). It is reached through `ctx.remote.$mount()`, which lands in the same `DescriptorStore.validate()` as the host face (`packages/api/gateway/src/client/index.ts` → `RemoteStore.register` → `descriptors.validate`), so it would have failed the same way the moment the switch mounted. Fixed identically: `create: () => ({ parse: identity })`. The returned parser stays shape-defensive on purpose — the authoritative strict validation of a result is the host's zod schema, which the Remote call runs before it replies.
- The `TYPERT` manifest is now also **exported** under the name the Typert Loader itself reads (`validateTypertManifest`, `TYPERT_HOST_EXPORT`), so the object handed to `ctx.typert.register()` is one artifact rather than a second copy that can drift from what the loader would validate.

### Added

- **A Typert codec gate, `scripts/check-typert-codec.mjs` on the `harness:check` / `check` path, plus `test/typert-mount.test.mjs` and `test/typert-codec-gate.test.mjs`.** The defect above was invisible to every gate this repository had: `node --check` only proves `index.js` parses, and the host-face spec hands `apply()` a stub Context that accepts any object. The gate is the local mirror of the host rule (`validateCodec` + the loader's `requireStrictCodec`): it constructs both faces' real artifacts — `index.js`'s exported `TYPERT` manifest, and the contribution `lib/client.js` hands to `ctx.remote.$mount` — walks every descriptor, and asserts each codec carries a `create()` **function** and no `schema` member, naming the offending invocation id on failure. `test/typert-mount.test.mjs` is the stronger half: it mounts a real `@deepseek-ai/dsh-typert-registry` (new exact `devDependency`, `0.1.7-rc.1`) on a real Cordis `Context`, registers both faces and asserts the registration does not throw, then rebuilds the rejected 0.1.5-line codec in memory (via a `module.registerHooks()` load hook, so no obsolete literal has to live in the tree) and asserts the registry refuses it — the only form that provably goes red on this defect. The detector matches `schema` as an object property, both `schema:` and the `{ …, schema }` shorthand the old literal actually used. Zero new runtime dependencies.
- `scripts/probe-typert-codec-contract.mjs` (new npm script `probe:typert-codec`) answers the other half of the question against the *installed* host rather than this repository's reading of it: it registers a `{ mode, typeSymbol, schema }` codec and a `create()` codec on both faces with the real registry and asserts the first is refused and the second accepted. Run it after a host-line bump to re-measure the assumption the gate encodes.
- The gate is driven by the real host profile as well: reproduced and then cleared with a throwaway `DSH_HOME` profile on `@deepseek-ai/dsh-base@0.1.7-rc.1` + `dsh-headless@0.1.7-rc.1`, which is the only check that could see the original failure. Both faces were measured: `ctx.typert.register()` for the host face and `ctx.typert.remotes.register()` for the client contribution, which is the path `ctx.remote.$mount()` takes.

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
