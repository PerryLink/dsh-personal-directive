/**
 * The rejected 0.1.5-line codec shapes, rebuilt from a file's own helper text.
 *
 * These are negative controls, not production code: each rebuilds the codec
 * literal the host refuses (`validateCodec` -> "strict codec has no create()
 * factory"), so a gate can prove it still catches the defect. They live in one
 * place because two suites assert against them, and a control that drifts from
 * the defect it models stops being a control.
 *
 * The rebuild is textual and applied to the repository's own helper, so the
 * obsolete shape is never carried in `index.js` or `lib/client.js`.
 */

import { strict as assert } from 'node:assert'
import { revertCodecHelper } from './module-source.mjs'

/** The 0.1.5-line host helper: `schema`, no `create()`. */
const LEGACY_HOST_HELPER = [
  'function codec(typeSymbol, schema) {',
  '  return { mode: "strict", typeSymbol, schema };',
  '}',
].join('\n')

/** The 0.1.5-line client helper: `schema`, no `create()`. */
const LEGACY_CLIENT_HELPER = [
  'const wireCodec = (typeSymbol) => ({',
  '      mode: "strict",',
  '      typeSymbol,',
  '      schema: { parse: identity },',
  '    });',
].join('\n')

/**
 * Rebuild `index.js` with the pre-`create()` host codec.
 * @param hostSource - `index.js` text.
 * @param helper - its codec helper text, from `extractCodecHelpers`.
 * @returns the source with the legacy codec helper.
 */
export function withLegacyHostCodec(hostSource, helper) {
  return assertChanged(revertCodecHelper(hostSource, helper, LEGACY_HOST_HELPER), hostSource, 'index.js')
}

/**
 * Rebuild `lib/client.js` with the pre-`create()` client codec.
 * @param clientSource - `lib/client.js` text.
 * @param helper - its codec helper text, from `extractCodecHelpers`.
 * @returns the source with the legacy codec helper.
 */
export function withLegacyClientCodec(clientSource, helper) {
  return assertChanged(
    revertCodecHelper(clientSource, helper, LEGACY_CLIENT_HELPER),
    clientSource,
    'lib/client.js',
  )
}

/** A control that changed nothing would assert nothing, so refuse it. */
function assertChanged(rewritten, original, label) {
  assert.notEqual(rewritten, original, `${label}: the legacy-codec control changed nothing`)
  return rewritten
}
