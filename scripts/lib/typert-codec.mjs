/**
 * Local mirror of the host Typert codec contract.
 *
 * The defect this gate exists for is invisible to `node --check`, to a plugin
 * spec that mounts a hand-written Context stub, and to every gate this
 * repository had: `index.js` shipped a strict codec with a `schema` field and no
 * `create()` factory, which is a perfectly valid *object* until the host's
 * `validateCodec` refuses it at mount time and the whole plugin row fails to
 * activate. The host's rule, `packages/typert/registry/src/service.ts`:
 *
 * ```ts
 * function validateCodec(codec, subject) {
 *   if (codec.mode === 'src-json') return
 *   validateNonempty(`${subject} type symbol`, codec.typeSymbol)
 *   if (typeof codec.create !== 'function') {
 *     throw new Error(`typert: ${subject} strict codec has no create() factory`)
 *   }
 * }
 * ```
 *
 * and the declared contract, `packages/typert/protocol/src/types.ts`:
 *
 * ```ts
 * { readonly mode: 'strict'; readonly typeSymbol: string
 *   readonly create: () => TypertSchema
 *   readonly decode?: ...; readonly encode?: ... }
 * ```
 *
 * There is no `schema` member in either. These two functions re-implement that
 * rule over the manifest object the plugin actually registers, so the refusal
 * happens in CI rather than on a user's first activation.
 */

import { SourceShapeError } from './module-source.mjs'

/** One codec reached by the walk, with the subject the host would name it by. */
const DESCRIPTOR_CODEC_FIELDS = ['result', 'uplink']

/**
 * Walk a Typert contribution and return every codec it declares.
 *
 * Descriptors are walked structurally, `validateInvocation`-style, so each codec
 * is paired with the subject the host would report it under (`<id> result`,
 * `<id> parameter <name>`, `<id> Context`, `<id> uplink`). A gate that reported
 * a bare "a codec is wrong" would leave the reader to find it.
 * @param contribution - a `TypertContribution` (host manifest) or a
 *   `TypertRemoteContribution` (`{ package, descriptors }`, client face).
 * @param face - `'host'` or `'client'`, used to pick the container field.
 * @returns `{ subject, codec, descriptorId }[]`, in declaration order.
 * @throws {SourceShapeError} when the contribution is not shaped as declared,
 *   because a walk that silently visits nothing is the failure mode this gate
 *   is meant to eliminate.
 */
export function collectCodecs(contribution, face) {
  const descriptors = face === 'host' ? contribution?.invocations : contribution?.descriptors
  if (!Array.isArray(descriptors)) {
    throw new SourceShapeError(
      `the ${face} contribution declares no \`${face === 'host' ? 'invocations' : 'descriptors'}\` ` +
        'array — nothing to check, so the gate refuses rather than passes',
    )
  }
  const found = []
  for (const descriptor of descriptors) {
    const id = typeof descriptor?.id === 'string' ? descriptor.id : '<unnamed descriptor>'
    for (const field of DESCRIPTOR_CODEC_FIELDS) {
      if (descriptor[field] !== undefined) {
        found.push({ subject: `${id} ${field}`, codec: descriptor[field], descriptorId: id })
      }
    }
    if (descriptor.invocation?.kind === 'context' && descriptor.invocation.codec !== undefined) {
      found.push({ subject: `${id} Context`, codec: descriptor.invocation.codec, descriptorId: id })
    }
    const parameters = Array.isArray(descriptor.parameters) ? descriptor.parameters : []
    for (const parameter of parameters) {
      if (parameter?.codec !== undefined) {
        found.push({
          subject: `${id} parameter ${parameter.name}`,
          codec: parameter.codec,
          descriptorId: id,
        })
      }
    }
  }
  if (found.length === 0) {
    throw new SourceShapeError(
      `the ${face} contribution declares no codec at all — the walk found nothing to ` +
        'verify, which means it no longer mirrors the host descriptor shape',
    )
  }
  return found
}

/**
 * Check every codec in a contribution against the host contract.
 * @param contribution - as {@link collectCodecs}.
 * @param face - `'host'` or `'client'`.
 * @returns the subjects that passed, in declaration order.
 * @throws {SourceShapeError} naming each offending subject and invocation id.
 */
export function assertStrictCodecs(contribution, face) {
  const problems = []
  const passed = []
  for (const { subject, codec } of collectCodecs(contribution, face)) {
    const why = codecProblem(codec)
    if (why === undefined) passed.push(subject)
    else problems.push(`${subject}: ${why}`)
  }
  if (problems.length > 0) {
    throw new SourceShapeError(
      `${problems.length} Typert codec${problems.length === 1 ? '' : 's'} violate the ` +
        `host contract on the ${face} face (the host's validateCodec would refuse the ` +
        'plugin at mount):\n' +
        problems.map((problem) => `  - ${problem}`).join('\n'),
    )
  }
  return passed
}

/**
 * Judge one codec against the host contract.
 * @param codec - candidate codec.
 * @returns the reason it fails, or `undefined` when it conforms.
 */
export function codecProblem(codec) {
  if (typeof codec !== 'object' || codec === null) {
    return `expected a codec object, got ${codec === null ? 'null' : typeof codec}`
  }
  if (codec.mode !== 'strict') {
    // `src-json` is the one other legal mode, and it carries no codec members.
    return codec.mode === 'src-json'
      ? undefined
      : `mode is ${JSON.stringify(codec.mode)}, expected "strict" or "src-json"`
  }
  if (typeof codec.typeSymbol !== 'string' || codec.typeSymbol.length === 0) {
    return 'has no non-empty typeSymbol'
  }
  if (typeof codec.create !== 'function') {
    return 'strict codec has no create() factory'
  }
  for (const method of ['decode', 'encode']) {
    if (codec[method] !== undefined && typeof codec[method] !== 'function') {
      return `${method} must be a function when declared`
    }
  }
  if (Object.hasOwn(codec, 'schema')) {
    return (
      'carries a `schema` field, which is not a member of the host TypertCodec ' +
      'strict form (0.1.7 keeps only create(); the 0.1.5-line field is dead weight)'
    )
  }
  return undefined
}
