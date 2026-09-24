#!/usr/bin/env node
/**
 * Live host-contract probe for the Typert codec rule.
 *
 * The gates in this repository (`scripts/check-typert-codec.mjs`,
 * `test/typert-mount.test.mjs`) mirror the host rule and prove the mirror
 * catches the 0.1.5-line codec. This probe answers the other half of the
 * question, and answers it against the installed host rather than against this
 * repository's reading of it: **does the installed
 * `@deepseek-ai/dsh-typert-registry` actually refuse a `{ mode, typeSymbol,
 * schema }` codec, on both faces, and does it accept the `create()` form?**
 *
 * Run it after any host-line bump. It is how the assumption encoded in the gate
 * gets re-measured instead of assumed, and it needs no harness profile:
 * `@deepseek-ai/dsh-typert-registry` and `@deepseek-ai/cordis` are already
 * devDependencies for the mount test.
 *
 * Usage: node scripts/probe-typert-codec-contract.mjs
 * Exit code: 0 when the installed host behaves as the gate assumes, 1 otherwise.
 */

import { Context } from '@deepseek-ai/cordis'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'

const PACKAGE = 'dsh-personal-directive'
const schema = { parse: (value) => value }

/** The two codec faces, side by side: what 0.1.5 wrote, and what 0.1.7 wants. */
const REJECTED = (typeSymbol) => ({ mode: 'strict', typeSymbol, schema })
const ACCEPTED = (typeSymbol) => ({ mode: 'strict', typeSymbol, create: () => schema })

/** A host-face contribution carrying one result codec. */
const hostContribution = (codec) => ({
  package: PACKAGE,
  face: 'host',
  schemas: [],
  invocations: [{
    id: `${PACKAGE}#personalDirective/getState`,
    service: 'personalDirective',
    namespace: 'personalDirective',
    method: 'getState',
    invocation: { kind: 'direct' },
    parameters: [],
    result: codec,
  }],
  model: { services: [], events: [], objects: [] },
})

/** A client-face contribution carrying the same descriptor shape. */
const clientContribution = (codec) => ({
  package: PACKAGE,
  descriptors: [{
    id: `${PACKAGE}#personalDirective/getState`,
    service: 'personalDirective',
    namespace: 'personalDirective',
    method: 'getState',
    invocation: { kind: 'direct' },
    parameters: [],
    result: codec,
  }],
})

const registry = async () => {
  const ctx = new Context()
  await ctx.plugin(TypertRegistry)
  return ctx
}

/** Register and report, never throwing. */
const attempt = (register) => {
  try {
    register()
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

const results = []
const check = (name, outcome, expected) => {
  const pass = outcome === expected
  results.push({ name, pass, detail: `${outcome} (expected ${expected})` })
}

// Face 1: the host manifest through ctx.typert.register().
const hostCtx = await registry()
check(
  'host  / 0.1.5-line codec { mode, typeSymbol, schema }',
  attempt(() => hostCtx.typert.register(hostContribution(REJECTED(`${PACKAGE}#S`)))).ok ? 'accepted' : 'refused',
  'refused',
)
check(
  'host  / 0.1.7 codec { mode, typeSymbol, create }',
  attempt(() => hostCtx.typert.register(hostContribution(ACCEPTED(`${PACKAGE}#S`)))).ok ? 'accepted' : 'refused',
  'accepted',
)

// Face 2: the client contribution through ctx.typert.remotes.register(), which is
// the path ctx.remote.$mount() takes (api-gateway -> RemoteStore.register ->
// DescriptorStore.validate). Two separate registries: the package name is
// single-owner, so a second registration of the same face would be refused for
// being a duplicate rather than for its codec.
const clientRejected = await registry()
const rejectedOutcome = attempt(() => clientRejected.typert.remotes.register(clientContribution(REJECTED(`${PACKAGE}#S`))))
check('client/ 0.1.5-line codec { mode, typeSymbol, schema }', rejectedOutcome.ok ? 'accepted' : 'refused', 'refused')

const clientAccepted = await registry()
check(
  'client/ 0.1.7 codec { mode, typeSymbol, create }',
  attempt(() => clientAccepted.typert.remotes.register(clientContribution(ACCEPTED(`${PACKAGE}#S`)))).ok ? 'accepted' : 'refused',
  'accepted',
)

for (const result of results) {
  console.log(`${result.pass ? 'ok  ' : 'FAIL'}  ${result.name.padEnd(52)} ${result.detail}`)
}
if (rejectedOutcome.ok === false) console.log(`\nrefusal text: ${rejectedOutcome.message}`)

const failed = results.filter((result) => !result.pass)
const registryVersion = (await import('@deepseek-ai/dsh-typert-registry/package.json', { with: { type: 'json' } })).default.version
console.log(`\n@deepseek-ai/dsh-typert-registry@${registryVersion}: ${results.length - failed.length}/${results.length} as assumed`)
process.exitCode = failed.length === 0 ? 0 : 1
