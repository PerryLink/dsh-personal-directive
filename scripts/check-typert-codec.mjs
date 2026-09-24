#!/usr/bin/env node
/**
 * Typert codec gate: every codec this package declares must carry `create()`.
 *
 * `node --check` proves `index.js` parses. `test/index.test.mjs` hands `apply()`
 * a stub Context. Neither can see the defect this gate exists for: a strict
 * codec declared as `{ mode, typeSymbol, schema }` is a valid object right up
 * until the host's `validateCodec` refuses it at mount, and then the whole
 * plugin row fails to activate with
 *
 *     typert: dsh-personal-directive#personalDirective/getState result strict
 *     codec has no create() factory
 *
 * This gate is the local mirror of that host rule, applied to both faces:
 * `scripts/lib/typert-codec.mjs` re-implements `validateCodec` +
 * `requireStrictCodec`, and here it runs over the real manifest object
 * (`index.js`'s exported `TYPERT` — the name the Typert Loader itself reads) and
 * over the real client contribution (the object `lib/client.js`'s `apply` hands
 * to `ctx.remote.$mount`).
 *
 * `test/typert-mount.test.mjs` additionally proves the same thing against a real
 * `@deepseek-ai/dsh-typert-registry` on a real Cordis `Context`, and proves this
 * gate can still go red. This script is the cheap check that runs first.
 *
 * Usage: node scripts/check-typert-codec.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { evaluateClientBundle } from './lib/module-rewrite.mjs'
import { SourceShapeError, extractClientEntry, extractCodecHelpers } from './lib/module-source.mjs'
import { assertStrictCodecs } from './lib/typert-codec.mjs'

const HOST_PATH = fileURLToPath(new URL('../index.js', import.meta.url))
const CLIENT_PATH = fileURLToPath(new URL('../lib/client.js', import.meta.url))

/**
 * Run the whole check.
 *
 * Synchronous by design, so a caller cannot forget to await it: the host module
 * is imported once by {@link main} and passed in, and the client bundle is
 * evaluated with `new Function`.
 *
 * `hostSource` / `clientSource` exist so a negative control can drive the gate
 * with rebuilt text (see `scripts/lib/legacy-codec.mjs`) without writing a
 * variant file anywhere.
 * @param options - `{ hostModule, hostPath, clientPath, hostSource, clientSource }`;
 *   `hostModule` is the namespace object of `index.js`, i.e. what
 *   `import('../index.js')` resolves to, and is required because `TYPERT` is the
 *   artifact under test. The two `*Source` fields default to reading the paths.
 * @returns `{ host: string[], client: string[], notes: string[] }` — the codec
 *   subjects verified on each face, in declaration order.
 * @throws {SourceShapeError} naming every offending subject, or the missing
 *   contract that would otherwise leave a face unchecked.
 */
export function checkTypertCodecs({
  hostModule,
  hostPath = HOST_PATH,
  clientPath = CLIENT_PATH,
  hostSource = readFileSync(hostPath, 'utf8'),
  clientSource = readFileSync(clientPath, 'utf8'),
} = {}) {
  if (hostModule === undefined) {
    throw new SourceShapeError(
      'checkTypertCodecs needs the imported host module, so it can verify the exported TYPERT',
    )
  }
  const notes = []

  // Both codec helpers are located by exact anchor, and their shape is asserted
  // from the helper text. A helper that moved or was renamed cannot make this
  // gate pass quietly: an unfound helper is an error, not a skip. Every problem
  // on both faces is collected before the throw, so one run reports the whole
  // picture instead of the first line of it.
  const helpers = extractCodecHelpers({ hostSource, clientSource })
  const problems = [
    ...codecHelperProblems(helpers.host, 'index.js'),
    ...codecHelperProblems(helpers.client, 'lib/client.js'),
  ]

  const entry = extractClientEntry(clientSource)
  notes.push(`the client bundle factory parameter is ${JSON.stringify(entry.factoryParameter)}`)

  let host
  let client
  try {
    host = assertStrictCodecs(hostManifest(hostModule, hostPath), 'host')
  } catch (error) {
    if (!(error instanceof SourceShapeError)) throw error
    problems.push(error.message)
  }
  try {
    client = assertStrictCodecs(clientContribution(clientPath, clientSource, entry), 'client')
  } catch (error) {
    if (!(error instanceof SourceShapeError)) throw error
    problems.push(error.message)
  }
  if (problems.length > 0) throw new SourceShapeError(problems.join('\n'))

  return { host, client, notes }
}

/**
 * Read the host manifest the plugin actually registers.
 * @param module - the imported `index.js` namespace.
 * @param hostPath - file name for the failure message.
 * @returns the exported `TYPERT` contribution.
 * @throws {SourceShapeError} when the export is absent, which would leave the
 *   host face unchecked.
 */
function hostManifest(module, hostPath) {
  if (module.TYPERT === undefined) {
    throw new SourceShapeError(
      `${hostPath}: no \`TYPERT\` export — the Typert Loader reads that exact name, and ` +
        'this gate mirrors `validateCodec` against the manifest it hands over',
    )
  }
  return module.TYPERT
}

/**
 * Reach the client contribution the way the host does: through a stub `$mount`.
 * @throws {SourceShapeError} when the bundle exports no `apply`, or `apply`
 *   never mounts a contribution.
 */
function clientContribution(clientPath, clientSource, entry) {
  const exports = evaluateClientBundle(clientSource, entry)
  if (typeof exports.apply !== 'function') {
    throw new SourceShapeError(`${clientPath}: the bundle exports no apply(), so no $mount runs`)
  }
  let mounted
  const ctx = {
    effect: () => () => {},
    get: () => undefined,
    locale: { register: () => () => {}, bind: () => (key) => key },
    slots: { inject: () => () => {}, register: () => () => {} },
    remote: {
      $mount(contribution) {
        mounted = contribution
        return Promise.resolve(() => {})
      },
    },
  }
  exports.apply(ctx)
  if (mounted === undefined) {
    throw new SourceShapeError(
      `${clientPath}: apply() never called ctx.remote.$mount(), so the descriptors it ` +
        'registers cannot be checked',
    )
  }
  return mounted
}

/**
 * Collect every way one codec helper violates the contract.
 *
 * The member checks run against the object literal the helper returns, not the
 * whole helper: the helper's own JSDoc mentions `schema`, and the rejected
 * 0.1.5-line helper takes a parameter of that name, so a whole-text search
 * reports the conforming code as broken. Within the literal, `schema` is
 * matched as a property — `schema: <value>` or the shorthand `{ ..., schema }` —
 * because the shorthand is how the rejected literal was actually written.
 * @param helper - exact helper source text.
 * @param label - file name for the message.
 * @returns one message per violation, empty when the helper conforms.
 */
function codecHelperProblems(helper, label) {
  const literal = returnedObjectLiteral(helper)
  const problems = []
  if (!/\bcreate\s*:/.test(literal)) problems.push('declares no `create` member')
  // `schema` as an object property: `schema: value`, `schema,` or the trailing
  // `schema }`. Anchored on the preceding `{` or `,` so a value that merely
  // reads a variable named `schema` (`create: () => schema`) is not a hit.
  if (/[{,]\s*schema\s*(?=[,}])/.test(literal)) {
    problems.push(
      'declares a `schema` member — not part of the host TypertCodec strict form ' +
        '(0.1.7 keeps only create(); decode/encode are optional)',
    )
  }
  if (!/mode\s*:\s*["']strict["']/.test(literal)) problems.push('does not declare mode: "strict"')
  if (!/\btypeSymbol\b/.test(literal)) problems.push('does not declare typeSymbol')
  if (problems.length === 0) return []
  return [
    `${label}: the codec helper ${problems.join('; ')}. The host refuses such a codec at ` +
      'mount ("strict codec has no create() factory") and the plugin row never activates.',
  ]
}

/**
 * Isolate the object literal a codec helper returns.
 *
 * The search starts after `return`, because the helper's JSDoc contains inline
 * `{ ... }` of its own and the first brace in the text is inside that comment.
 * @param helper - exact helper source text.
 * @returns the literal's text, or the whole helper when no literal is found
 *   (the member checks then run on the full text and still fail).
 */
function returnedObjectLiteral(helper) {
  const from = helper.indexOf('return')
  const start = helper.indexOf('{', from === -1 ? 0 : from)
  if (start === -1) return helper
  let depth = 0
  for (let index = start; index < helper.length; index += 1) {
    const character = helper[index]
    if (character === '{') depth += 1
    else if (character === '}') {
      depth -= 1
      if (depth === 0) return helper.slice(start, index + 1)
    }
  }
  return helper
}

async function main() {
  const hostModule = await import(new URL('../index.js', import.meta.url).href)
  const result = checkTypertCodecs({ hostModule })
  console.log('[typert-codec] OK')
  console.log(`  host   (index.js TYPERT): ${result.host.length} codec(s)`)
  for (const subject of result.host) console.log(`    - ${subject}`)
  console.log(`  client (lib/client.js $mount): ${result.client.length} codec(s)`)
  for (const subject of result.client) console.log(`    - ${subject}`)
  for (const note of result.notes) console.log(`  note: ${note}`)
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    const detail = error instanceof SourceShapeError
      ? error.message
      : `${error.name}: ${error.message}`
    console.error(`\n[typert-codec] FAILED\n  - ${detail}\n`)
    if (!(error instanceof SourceShapeError)) console.error(error.stack)
    process.exitCode = 1
  })
}
