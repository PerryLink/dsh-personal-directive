/**
 * Real-mount gate for the Typert manifests.
 *
 * The other suites in this repository hand `apply()` a hand-written Context
 * stub, which is exactly why the defect this file locks down shipped: `index.js`
 * declared strict codecs with a `schema` field and no `create()` factory, a
 * stub accepts anything, and `node --check` only ever proved the file parses.
 * The host's `validateCodec` refuses such a codec at mount and the plugin row
 * never activates:
 *
 *     personal-directive (dsh-personal-directive): Error: typert:
 *     dsh-personal-directive#personalDirective/getState result strict codec has
 *     no create() factory
 *
 * So these tests register both faces' contributions with a REAL
 * `@deepseek-ai/dsh-typert-registry` mounted on a REAL Cordis `Context`, and
 * assert the registration does not throw. The two `0.1.5-line` tests rebuild the
 * rejected codec in memory and assert that same registry refuses it, which is
 * what makes this suite able to fail: a mount test that cannot go red is a test
 * of nothing.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import { extractClientEntry, extractCodecHelpers } from '../scripts/lib/module-source.mjs'
import { withLegacyClientCodec, withLegacyHostCodec } from '../scripts/lib/legacy-codec.mjs'
import { evaluateClientBundle, importRewritten } from '../scripts/lib/module-rewrite.mjs'

const HOST_PATH = fileURLToPath(new URL('../index.js', import.meta.url))
const CLIENT_PATH = fileURLToPath(new URL('../lib/client.js', import.meta.url))

/** The host's own wording, from `validateCodec`. */
const REJECTION = /strict codec has no create\(\) factory/

/** Read both deliverable sources plus the exact text of both codec helpers. */
function readSources() {
  const hostSource = readFileSync(HOST_PATH, 'utf8')
  const clientSource = readFileSync(CLIENT_PATH, 'utf8')
  return { hostSource, clientSource, helpers: extractCodecHelpers({ hostSource, clientSource }) }
}

/** Mount the real registry service on a real Cordis Context. */
async function mountRegistry() {
  const ctx = new Context()
  await ctx.plugin(TypertRegistry)
  return ctx
}

/**
 * Reach the client Remote contribution the way the host does.
 *
 * The bundle keeps `CONTRIBUTION` module-private and hands it to
 * `ctx.remote.$mount()` during `apply`, so a stub `$mount` is how a test sees
 * the very object the api-gateway would register. It is registered as-is, with
 * no serialization in between: the harness builds every client contribution
 * locally (`packages/api/remotes/src/client/index.ts` mounts its descriptors
 * directly) and validates that object, so the codecs carry live `create`
 * functions rather than anything reconstructed from a wire form.
 */
function clientContribution(exports) {
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
  assert.notEqual(mounted, undefined, 'apply() never called ctx.remote.$mount()')
  return mounted
}

test('the host manifest registers with a real Typert registry', async () => {
  const module = await import('../index.js')
  const ctx = await mountRegistry()
  assert.doesNotThrow(
    () => ctx.typert.register(module.TYPERT),
    'the host manifest must survive the host validateCodec',
  )
  assert.equal(ctx.typert.getPackage('dsh-personal-directive', 'host')?.face, 'host')
  assert.equal(ctx.typert.list().length, 0, 'this plugin declares no standalone schemas')
})

test('the client contribution registers with a real Typert registry', async () => {
  const { clientSource } = readSources()
  const exports = evaluateClientBundle(clientSource, extractClientEntry(clientSource))
  const ctx = await mountRegistry()
  assert.doesNotThrow(
    () => ctx.typert.remotes.register(clientContribution(exports)),
    'the client contribution reaches the same DescriptorStore.validate() as the host face',
  )
})

test('the registry refuses a host manifest shaped like the 0.1.5-line codec', async () => {
  const { helpers } = readSources()
  const module = await importRewritten(
    HOST_PATH,
    (source) => withLegacyHostCodec(source, helpers.host),
    'legacy-host-codec',
  )
  const ctx = await mountRegistry()
  assert.throws(
    () => ctx.typert.register(module.TYPERT),
    (error) => {
      assert.match(error.message, REJECTION)
      assert.match(
        error.message,
        /dsh-personal-directive#personalDirective\/getState result/,
        'the refusal must name the offending invocation id',
      )
      return true
    },
  )
})

test('the registry refuses a client contribution shaped like the 0.1.5-line codec', async () => {
  const { clientSource, helpers } = readSources()
  const legacy = withLegacyClientCodec(clientSource, helpers.client)
  const exports = evaluateClientBundle(legacy, extractClientEntry(legacy))
  const ctx = await mountRegistry()
  assert.throws(
    () => ctx.typert.remotes.register(clientContribution(exports)),
    (error) => {
      assert.match(error.message, REJECTION)
      // The bundle is rebuilt from lib/client.js, so the refusal names that
      // file's own two descriptors; either id proves the client face is validated.
      assert.match(error.message, /dsh-personal-directive#personalDirective\/(getState|setEnabled) result/)
      return true
    },
  )
})
