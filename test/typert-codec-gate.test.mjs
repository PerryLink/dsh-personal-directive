/**
 * Gate-for-the-gate: `scripts/check-typert-codec.mjs` must fail on the exact
 * defect it was written for.
 *
 * The structural checks and the real-registry mount live in
 * `test/typert-mount.test.mjs`. What this file adds is the proof that the gate
 * is not vacuous: it rebuilds the rejected 0.1.5-line codec in each face and
 * asserts the gate refuses it, naming the invocation id. A gate that can only
 * pass is not a gate.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { checkTypertCodecs } from '../scripts/check-typert-codec.mjs'
import { extractCodecHelpers } from '../scripts/lib/module-source.mjs'
import { withLegacyClientCodec, withLegacyHostCodec } from '../scripts/lib/legacy-codec.mjs'
import { importRewritten } from '../scripts/lib/module-rewrite.mjs'
import { codecProblem } from '../scripts/lib/typert-codec.mjs'

const HOST_PATH = fileURLToPath(new URL('../index.js', import.meta.url))
const CLIENT_PATH = fileURLToPath(new URL('../lib/client.js', import.meta.url))

/** The host module, imported once, as `main()` in the gate does. */
const hostModule = await import('../index.js')

/** Read both sources plus the exact text of both codec helpers. */
function readSources() {
  const hostSource = readFileSync(HOST_PATH, 'utf8')
  const clientSource = readFileSync(CLIENT_PATH, 'utf8')
  return { hostSource, clientSource, helpers: extractCodecHelpers({ hostSource, clientSource }) }
}

test('the gate passes on the shipped sources and reports every codec', () => {
  const result = checkTypertCodecs({ hostModule })
  assert.deepEqual(result.host, [
    'dsh-personal-directive#personalDirective/getState result',
    'dsh-personal-directive#personalDirective/setEnabled result',
    'dsh-personal-directive#personalDirective/setEnabled parameter request',
  ])
  assert.deepEqual(result.client, result.host)
})

test('the gate refuses a host face whose codec lost create()', () => {
  const { hostSource, clientSource, helpers } = readSources()
  assert.throws(
    () => checkTypertCodecs({
      hostModule,
      hostSource: withLegacyHostCodec(hostSource, helpers.host),
      clientSource,
    }),
    (error) => {
      assert.match(error.message, /index\.js: the codec helper/)
      assert.match(error.message, /declares no `create` member/)
      assert.match(error.message, /declares a `schema` member/)
      return true
    },
  )
})

test('the gate refuses a client face whose codec lost create()', () => {
  const { hostSource, clientSource, helpers } = readSources()
  assert.throws(
    () => checkTypertCodecs({
      hostModule,
      hostSource,
      clientSource: withLegacyClientCodec(clientSource, helpers.client),
    }),
    (error) => {
      assert.match(error.message, /lib\/client\.js: the codec helper/)
      assert.match(error.message, /declares no `create` member/)
      return true
    },
  )
})

test('the gate refuses a host manifest whose codec reached it anyway', async () => {
  // Belt and braces for the helper-text assertions above: even if a codec were
  // built somewhere else, the manifest walk must still name the invocation id.
  const { helpers } = readSources()
  const legacy = await importRewritten(
    HOST_PATH,
    (source) => withLegacyHostCodec(source, helpers.host),
    'legacy-host-manifest',
  )
  assert.throws(
    () => checkTypertCodecs({ hostModule: legacy, clientPath: CLIENT_PATH }),
    (error) => {
      assert.match(error.message, /dsh-personal-directive#personalDirective\/getState result/)
      assert.match(error.message, /strict codec has no create\(\) factory/)
      return true
    },
  )
})

test('codecProblem mirrors the host rule field by field', () => {
  const schema = { parse: (value) => value }
  assert.equal(codecProblem({ mode: 'strict', typeSymbol: 'x#Y', create: () => schema }), undefined)
  assert.equal(codecProblem({ mode: 'src-json' }), undefined)
  assert.equal(
    codecProblem({ mode: 'strict', typeSymbol: 'x#Y', create: () => schema, decode: () => 1 }),
    undefined,
  )
  assert.match(
    codecProblem({ mode: 'strict', typeSymbol: 'x#Y', schema }),
    /no create\(\) factory/,
  )
  assert.match(
    codecProblem({ mode: 'strict', typeSymbol: 'x#Y', create: () => schema, schema }),
    /carries a `schema` field/,
  )
  assert.match(codecProblem({ mode: 'strict', typeSymbol: '', create: () => schema }), /typeSymbol/)
  assert.match(codecProblem({ mode: 'strict', typeSymbol: 'x#Y' }), /no create\(\) factory/)
  assert.match(
    codecProblem({ mode: 'strict', typeSymbol: 'x#Y', create: () => schema, decode: 'no' }),
    /decode must be a function/,
  )
  assert.match(codecProblem(null), /expected a codec object/)
  assert.match(codecProblem({ mode: 'stream' }), /mode is "stream"/)
})
