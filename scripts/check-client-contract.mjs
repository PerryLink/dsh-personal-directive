#!/usr/bin/env node
/**
 * Host-contract check for the hand-maintained client bundle.
 *
 * `node --check` only proves `lib/client.js` parses. It cannot see that the names
 * destructured out of the host's ui-primitives are still exported, and a name the
 * host dropped does not throw until React renders it: `React.createElement(undefined)`
 * yields `Element type is invalid` and the whole mounted control disappears. This
 * check reads the host's own `lib/types/*.d.ts` (and its runtime `lib/*.js`) and
 * fails, naming each offending symbol, before that reaches a browser.
 *
 * Usage: node scripts/check-client-contract.mjs [--host <checkout>]
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CLIENT_ENTRY,
  HOST_PACKAGES,
  HostSurfaceError,
  PROP_CONTRACTS,
  loadHostPackageSurface,
  loadHostPropUnions,
  parseClientRequires,
  parseLiteralPropValues,
  repoRoot,
  resolveHostRoot,
} from './lib/host-surface.mjs'

/** Read the `--host <path>` argument, ignoring anything else. */
function hostArgument(argv) {
  const index = argv.indexOf('--host')
  if (index === -1) return undefined
  const value = argv[index + 1]
  if (value === undefined || value.startsWith('--')) {
    throw new HostSurfaceError('--host needs a path, e.g. --host D:/deepseek-harness')
  }
  return value
}

/**
 * Run the whole check.
 * @returns {{hostRoot: string, hostOrigin: string, hostVersion: string, packages: Array,
 *   checked: number, propValues: number, notes: string[]}}
 * @throws {HostSurfaceError} naming each symbol, prop value, or broken prerequisite.
 */
export function checkClientContract({ root, host, entry = CLIENT_ENTRY } = {}) {
  const repo = root ?? repoRoot()
  const entryPath = join(repo, entry)
  if (!existsSync(entryPath) || !statSync(entryPath).isFile()) {
    throw new HostSurfaceError(`cannot find the client entry at ${entryPath}`)
  }
  const entrySource = readFileSync(entryPath, 'utf8')

  const requires = parseClientRequires(entrySource)
  const notes = []

  for (const specifier of requires.keys()) {
    if (!specifier.startsWith('@deepseek-ai/')) continue
    if (!HOST_PACKAGES.includes(specifier)) {
      notes.push(
        `skipped \`${specifier}\`: it is not in HOST_PACKAGES, so this check has no ` +
          'type surface to verify it against',
      )
    }
  }

  const resolved = resolveHostRoot(host)
  const surfaces = HOST_PACKAGES.map((name) => loadHostPackageSurface(resolved.root, name))
  const unions = loadHostPropUnions(resolved.root)

  const problems = []
  let checked = 0

  for (const surface of surfaces) {
    const wanted = requires.get(surface.name)
    if (wanted === undefined) continue
    for (const symbol of wanted) {
      checked += 1
      const declared = surface.declared.has(symbol)
      const exported = surface.runtime.has(symbol)
      if (declared && exported) continue
      const why = !declared && !exported
        ? 'is neither declared nor exported'
        : !declared
          ? 'is exported at runtime but has no type declaration'
          : 'is declared in the types but missing from the runtime exports'
      problems.push(
        `\`${symbol}\` required by ${entry} ${why} by ${surface.name}@${surface.version}`,
      )
    }
  }

  const literals = parseLiteralPropValues(entrySource, PROP_CONTRACTS)
  let propValues = 0
  for (const contract of PROP_CONTRACTS) {
    const key = `${contract.owner}.${contract.prop}`
    const used = literals.get(key)
    const allowed = unions.get(key)
    if (used === undefined || allowed === undefined) continue
    for (const [value, count] of used) {
      propValues += count
      if (allowed.includes(value)) continue
      problems.push(
        `\`${contract.prop}: "${value}"\` on <${contract.owner}> (${count}x in ${entry}) is not a ` +
          `${contract.typeName}: the host accepts ${allowed.map((v) => `"${v}"`).join(' | ')}`,
      )
    }
  }

  if (problems.length > 0) {
    throw new HostSurfaceError(
      `${problems.length} host-contract mismatch${problems.length === 1 ? '' : 'es'}:\n` +
        problems.map((problem) => `  - ${problem}`).join('\n'),
    )
  }

  return {
    hostRoot: resolved.root,
    hostOrigin: resolved.origin,
    hostVersion: surfaces.map((surface) => `${surface.name}@${surface.version}`).join(', '),
    packages: surfaces.map((surface) => ({
      name: surface.name,
      version: surface.version,
      declared: surface.declared.size,
      runtime: surface.runtime.size,
      dtsEntry: relative(resolved.root, surface.dtsEntry).split('\\').join('/'),
      runtimeEntry: relative(resolved.root, surface.runtimeEntry).split('\\').join('/'),
    })),
    checked,
    propValues,
    notes,
  }
}

function main() {
  let host
  try {
    host = hostArgument(process.argv.slice(2))
  } catch (error) {
    console.error(`\n[client-contract] FAILED\n  - ${error.message}\n`)
    process.exitCode = 1
    return
  }

  try {
    const result = checkClientContract({ host })
    console.log(`[client-contract] OK (${CLIENT_ENTRY})`)
    console.log(`  host: ${result.hostRoot} (${result.hostOrigin})`)
    for (const pkg of result.packages) {
      console.log(`  ${pkg.name}@${pkg.version}: ${pkg.declared} declared / ${pkg.runtime} runtime`)
      console.log(`    types:   ${pkg.dtsEntry}`)
      console.log(`    runtime: ${pkg.runtimeEntry}`)
    }
    console.log(`  verified ${result.checked} required symbol(s), ${result.propValues} prop value(s)`)
    for (const note of result.notes) console.log(`  note: ${note}`)
  } catch (error) {
    const detail = error instanceof HostSurfaceError
      ? error.message
      : `${error.name}: ${error.message}`
    console.error(`\n[client-contract] FAILED\n  - ${detail}\n`)
    if (!(error instanceof HostSurfaceError)) console.error(error.stack)
    process.exitCode = 1
  }
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) main()
