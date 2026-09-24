/**
 * Source-shape helpers for the two hand-maintained deliverable files.
 *
 * `index.js` (host face) and `lib/client.js` (client face) both declare their
 * codecs through a module-private helper, and neither is a build artifact: the
 * shipped text is the authored text. A gate that only imports `index.js` cannot
 * reach `lib/client.js` at all (it is a `window.__ModuleLoader__` bundle), so
 * these helpers read the helpers back out of the source. That is what lets a
 * gate rebuild the *rejected* 0.1.5-line codec shape from the repository's own
 * text instead of keeping a second copy of the old literal around.
 */

import { readFileSync } from 'node:fs'

/** A source the gate could not read back the way the contract requires. */
export class SourceShapeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SourceShapeError'
  }
}

/**
 * Read the two codec helpers out of their deliverable files.
 *
 * Each helper is located by an exact anchor rather than by a loose pattern: a
 * helper that moved, was renamed, or was replaced must fail this gate loudly
 * instead of quietly yielding nothing to check.
 * @returns `{ host: string, client: string }` — exact helper source text.
 * @throws {SourceShapeError} naming the file whose helper is missing.
 */
export function extractCodecHelpers({ hostSource, clientSource }) {
  return {
    host: extractHelper(
      hostSource,
      /function codec\([^)]*\)\s*\{[\s\S]*?\n\}/,
      'index.js',
      'a `function codec(typeSymbol, schema) { ... }` helper',
    ),
    client: extractHelper(
      clientSource,
      /const wireCodec = \([^)]*\)\s*=>\s*\(\{[\s\S]*?\n {4}\}\);/,
      'lib/client.js',
      'a `const wireCodec = (typeSymbol) => ({ ... });` helper',
    ),
  }
}

function extractHelper(source, pattern, label, description) {
  const match = pattern.exec(source)
  if (match === null) {
    throw new SourceShapeError(
      `${label}: no ${description} — this gate mirrors the host Typert codec ` +
        'contract and refuses to guess what replaced it',
    )
  }
  return match[0]
}

/**
 * Replace one codec helper with the rejected 0.1.5-line shape.
 *
 * The 0.1.5 line declared a `schema` field and no `create()` factory. Rebuilding
 * that exact text is how the gate proves it still catches the defect the host's
 * `validateCodec` refuses — without the repository carrying the obsolete shape.
 * @param source - file text containing `helper`.
 * @param helper - exact helper text from {@link extractCodecHelpers}.
 * @param body - the rejected body, as the lines between the helper's braces.
 * @returns the source with that helper reverted to the 0.1.5-line shape.
 * @throws {SourceShapeError} when `helper` is not present verbatim.
 */
export function revertCodecHelper(source, helper, body) {
  if (!source.includes(helper)) {
    throw new SourceShapeError(
      'the codec helper text is not present verbatim in the source it came from',
    )
  }
  return source.replace(helper, body)
}

/**
 * Read the client bundle's loader banner, so a gate can evaluate the factory.
 *
 * `lib/client.js` opens with
 * `window.__ModuleLoader__.load({ id, factory: (require) => { ... } })`; the
 * factory is the only way to reach the contribution, and its parameter name is
 * read from the source rather than assumed.
 * @param source - `lib/client.js` text.
 * @returns `{ id, factoryParameter }`.
 * @throws {SourceShapeError} when the banner or factory is not found.
 */
export function extractClientEntry(source) {
  const id = /__ModuleLoader__\.load\(\{\s*id:\s*"([^"]+)"/.exec(source)
  if (id === null) {
    throw new SourceShapeError(
      'lib/client.js: no `window.__ModuleLoader__.load({ id: "..." })` banner — ' +
        'the client bundle entry shape changed',
    )
  }
  const factory = /factory:\s*\(([^)]*)\)\s*=>\s*\{/.exec(source)
  if (factory === null) {
    throw new SourceShapeError(
      `lib/client.js: the ${id[1]} loader call declares no \`factory: (...) => {}\``,
    )
  }
  const parameter = factory[1].trim()
  if (parameter.length === 0) {
    throw new SourceShapeError(
      `lib/client.js: the ${id[1]} factory takes no parameter, so its contribution is unreachable`,
    )
  }
  return { id: id[1], factoryParameter: parameter }
}

/** Read a UTF-8 file for a gate. */
export function readSource(path) {
  return readFileSync(path, 'utf8')
}
