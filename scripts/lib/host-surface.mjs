/**
 * Parse side of the host-contract check: read the host's public type surface for
 * the packages this repo's hand-maintained `lib/client.js` requires, and read the
 * require lists out of that file. No dependencies beyond `node:*`.
 *
 * The host ships `.d.ts` files, so parsing them is the cheapest dependency-free
 * way to answer "does this symbol exist"; the sibling runtime `lib/*.js` is
 * parsed too, so a name that is declared but never exported at runtime still
 * fails instead of silently evaluating to `undefined` in the browser.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** The host packages `lib/client.js` requires and this check has a surface for. */
export const HOST_PACKAGES = ['@deepseek-ai/dsh-client-ui-primitives']

/** The client-facing half of this package: the file whose requires are the contract. */
export const CLIENT_ENTRY = 'lib/client.js'

/** Host checkouts probed in order when no explicit host root is given. */
export const HOST_ROOT_FALLBACKS = [
  'C:/deepseek-harness',
  'D:/deepseek-harness',
  'E:/deepseek-harness',
]

/** Thrown for every configuration or parse problem; the CLI turns it into a loud failure. */
export class HostSurfaceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'HostSurfaceError'
  }
}

const readText = (path) => {
  try {
    return readFileSync(path, 'utf8')
  } catch (error) {
    throw new HostSurfaceError(`cannot read ${path}: ${error.message}`)
  }
}

const assertFile = (path, what) => {
  if (!existsSync(path) || !statSync(path).isFile()) {
    throw new HostSurfaceError(`cannot find ${what} at ${path}`)
  }
  return path
}

/**
 * Drain one balanced `{ ... }` block starting at `text[start] === '{'`.
 * @returns the block body, or null when the braces never balance.
 */
function balancedBlock(text, start) {
  let depth = 0
  for (let index = start; index < text.length; index += 1) {
    const ch = text[index]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start + 1, index)
    }
  }
  return null
}

/** Every string-literal union in a declaration text, as `[memberNames, sourceLine]`. */
function stringLiteralUnions(text) {
  const unions = []
  for (const line of text.split('\n')) {
    const members = [...line.matchAll(/'([^']*)'/g)].map((match) => match[1])
    if (members.length >= 2) unions.push([[...new Set(members)], line])
  }
  return unions
}

/**
 * Collect the member names of a string-literal union: a `type X = 'a' | 'b'` alias
 * when the name is declared, otherwise the union on the `memberName` line.
 * @returns null when the union cannot be located, so the caller skips rather than guesses.
 */
export function parseStringUnion(text, typeName, memberName) {
  const unions = stringLiteralUnions(text)
  const alias = new RegExp(`\\btype\\s+${typeName}\\s*=`)
  for (const [members, line] of unions) {
    if (alias.test(line)) return members
  }
  if (memberName !== undefined) {
    const member = new RegExp(`\\b${memberName}\\s*[?]?\\s*:`)
    for (const [members, line] of unions) {
      if (member.test(line)) return members
    }
  }
  return null
}

/**
 * Extract the *value* names a `.d.ts` declares: `export declare const|let|var|function|class`,
 * `export { A, B }` lists, plus `export * from './x'` followed transitively.
 * Type-only declarations (`export type X`, `export interface X`, `export declare type X`)
 * are excluded: they carry no runtime value, so comparing them against the runtime
 * export list would report a mismatch on every one of them.
 */
export function parseDeclaredExports(dtsPath) {
  const text = readText(assertFile(dtsPath, 'declaration file'))
  const names = new Set()
  for (const match of text.matchAll(
    /\bexport\s+(?:declare\s+)?(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    names.add(match[2])
  }
  for (const match of text.matchAll(/\bexport\s*\{([^}]*)\}/g)) {
    for (const entry of match[1].split(',')) {
      const source = entry.replace(/\s+as\s+[\w$]+$/u, '').trim()
      if (source !== '' && !/^type\s/u.test(source)) names.add(source)
    }
  }
  for (const match of text.matchAll(/\bexport\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
    const specifier = match[1]
    const candidates = [
      join(dirname(dtsPath), specifier),
      join(dirname(dtsPath), `${specifier}.d.ts`),
      join(dirname(dtsPath), specifier.replace(/\.tsx?$/u, '.d.ts')),
      join(dirname(dtsPath), specifier.replace(/\.js$/u, '.d.ts')),
    ]
    const target = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile())
    if (target === undefined) {
      throw new HostSurfaceError(
        `cannot follow re-export \`${specifier}\` from ${dtsPath}; the host layout changed`,
      )
    }
    for (const name of parseDeclaredExports(target)) names.add(name)
  }
  if (names.size === 0) {
    throw new HostSurfaceError(
      `found no declared exports in ${dtsPath}; this check would pass vacuously`,
    )
  }
  return names
}

const EXPORT_LIST = /^\s*export\s*\{([^}]*)\}/gm

/** Extract the names a runtime esm file exports, from its `export { ... }` lists. */
export function parseRuntimeExports(jsPath) {
  const text = readText(assertFile(jsPath, 'runtime module'))
  const names = new Set()
  let sawList = false
  for (const match of text.matchAll(EXPORT_LIST)) {
    sawList = true
    for (const entry of match[1].split(',')) {
      const cleaned = entry.replace(/\s+as\s+[\w$]+$/u, '').trim()
      if (cleaned !== '') names.add(cleaned)
    }
  }
  if (!sawList) {
    throw new HostSurfaceError(
      `no \`export { ... }\` list found in ${jsPath}; cannot derive the runtime surface`,
    )
  }
  return names
}

/**
 * Resolve a package subpath through its `exports` map, e.g. '.' -> {types, default}.
 * @returns {{types?: string, default?: string}} host-relative paths.
 */
function resolveExportTargets(packageDir, subpath) {
  const manifest = JSON.parse(readText(assertFile(join(packageDir, 'package.json'), 'package.json')))
  const entry = manifest.exports?.[subpath]
  if (entry === undefined) {
    if (subpath !== '.') throw new HostSurfaceError(`${manifest.name} has no \`./${subpath}\` export`)
    return { types: manifest.types, default: manifest.main }
  }
  if (typeof entry === 'string') return { default: entry }
  return { types: entry.types, default: entry.default }
}

/**
 * Locate a host package directory: an installed copy under `node_modules` first,
 * then the workspace's own `packages/**` tree (matched by the manifest `name`,
 * since a workspace directory is not named after the package).
 */
function resolvePackageDir(hostRoot, packageName) {
  const installed = join(hostRoot, 'node_modules', packageName)
  if (existsSync(join(installed, 'package.json'))) return installed

  const packagesRoot = join(hostRoot, 'packages')
  if (existsSync(packagesRoot)) {
    const queue = [packagesRoot]
    while (queue.length > 0) {
      const current = queue.shift()
      const manifestPath = join(current, 'package.json')
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(readText(manifestPath))
        if (manifest.name === packageName) return current
        continue
      }
      if (!isDirectory(current)) continue
      for (const entry of readdirSync(current)) {
        if (entry.startsWith('.') || entry === 'node_modules') continue
        queue.push(join(current, entry))
      }
    }
    throw new HostSurfaceError(
      `no workspace package named ${packageName} under ${packagesRoot} (searched by manifest name)`,
    )
  }
  throw new HostSurfaceError(
    `cannot locate ${packageName} under ${hostRoot} (looked in node_modules/ and packages/)`,
  )
}

function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory()
}

/**
 * Read one host package's public surface.
 * @returns {{packageDir: string, name: string, version: string, declared: Set<string>,
 *   runtime: Set<string>, dtsEntry: string, runtimeEntry: string}}
 */
export function loadHostPackageSurface(hostRoot, packageName) {
  const packageDir = resolvePackageDir(hostRoot, packageName)
  const manifest = JSON.parse(readText(join(packageDir, 'package.json')))
  const targets = resolveExportTargets(packageDir, '.')
  if (targets.types === undefined || targets.default === undefined) {
    throw new HostSurfaceError(
      `${packageName} declares neither \`types\` nor \`main\`; cannot derive its surface`,
    )
  }
  const dtsEntry = assertFile(resolve(packageDir, targets.types), `${packageName} type entry`)
  const runtimeEntry = assertFile(resolve(packageDir, targets.default), `${packageName} runtime entry`)
  return {
    packageDir,
    name: packageName,
    version: manifest.version,
    declared: parseDeclaredExports(dtsEntry),
    runtime: parseRuntimeExports(runtimeEntry),
    dtsEntry,
    runtimeEntry,
  }
}

/** A string-literal union this repo passes as a prop value, checked against the host. */
export const PROP_CONTRACTS = [
  {
    package: '@deepseek-ai/dsh-client-ui-primitives',
    prop: 'variant',
    owner: 'Button',
    typeName: 'ButtonVariant',
    dts: 'lib/types/Button.d.ts',
  },
]

/**
 * Read every prop union this repo pins, so a removed/renamed variant cannot pass
 * silently the way a removed icon name did.
 *
 * A host that ships the component but not its own declaration file is skipped
 * rather than failed: within the supported peer range the file is always
 * published, so its absence means a partial or synthetic surface, not a host
 * that disagrees with this repo. The real checkout must never take this path.
 *
 * @param hostRoot - host checkout; resolved from the environment when omitted.
 * @returns Map keyed by `${owner}.${prop}`.
 */
export function loadHostPropUnions(hostRoot) {
  const root = hostRoot ?? resolveHostRoot().root
  const unions = new Map()
  for (const contract of PROP_CONTRACTS) {
    const packageDir = resolvePackageDir(root, contract.package)
    const dtsPath = join(packageDir, contract.dts)
    if (!existsSync(dtsPath)) continue
    const members = parseStringUnion(readText(dtsPath), contract.typeName, contract.prop)
    if (members === null) {
      throw new HostSurfaceError(
        `cannot read \`${contract.typeName}\` from ${dtsPath}; ` +
          'the host renamed or restructured it, so this check would be vacuous',
      )
    }
    unions.set(`${contract.owner}.${contract.prop}`, members)
  }
  return unions
}

/**
 * Pick the host checkout to verify against: explicit path, `DSH_HOST_ROOT`, a
 * sibling of this repo, then the known local checkouts.
 * @returns {{root: string, origin: string}}
 */
export function resolveHostRoot(explicit) {
  if (explicit !== undefined && explicit !== '') {
    return { root: resolve(explicit), origin: 'argument' }
  }
  const fromEnv = process.env.DSH_HOST_ROOT
  if (fromEnv !== undefined && fromEnv !== '') {
    return { root: resolve(fromEnv), origin: 'DSH_HOST_ROOT' }
  }
  const sibling = resolve(repoRoot(), '..', '..', 'deepseek-harness')
  if (existsSync(join(sibling, 'packages'))) return { root: sibling, origin: 'repo sibling' }
  const walkUp = findAncestor('deepseek-harness')
  if (walkUp !== null) return { root: walkUp, origin: 'ancestor directory' }
  for (const fallback of HOST_ROOT_FALLBACKS) {
    if (existsSync(join(fallback, 'packages'))) return { root: fallback, origin: 'known checkout' }
  }
  throw new HostSurfaceError(
    'cannot find a DeepSeek Harness checkout. Pass --host <path> or set DSH_HOST_ROOT.',
  )
}

/** This repository's root, derived from this file's own location (`scripts/lib/`). */
export function repoRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
}

function findAncestor(name) {
  let current = repoRoot()
  for (;;) {
    const candidate = join(current, name)
    if (existsSync(join(candidate, 'packages'))) return candidate
    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
}

/**
 * Read the destructured `require()` names out of client source text.
 * Handles the shape this repo hand-maintains: a module-loader factory with
 * `const { A, B } = require('spec')`.
 * @param text - the client module's source, not a path; read the file at the call site.
 * @returns Map of package specifier to sorted unique names.
 */
export function parseClientRequires(text) {
  const requires = new Map()
  const destructured = /\bconst\s*\{([^}]*)\}\s*=\s*require\(\s*["']([^"']+)["']\s*\)/g
  for (const match of text.matchAll(destructured)) {
    const specifier = match[2]
    const names = match[1]
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== '')
    if (names.length === 0) {
      throw new HostSurfaceError(`destructured require of \`${specifier}\` binds no names`)
    }
    for (const name of names) {
      if (!/^[A-Za-z_$][\w$]*$/u.test(name)) {
        throw new HostSurfaceError(
          `cannot parse \`${name}\` in the require of \`${specifier}\`; ` +
            'this check only understands plain destructured names',
        )
      }
    }
    requires.set(specifier, [...new Set([...(requires.get(specifier) ?? []), ...names])].sort())
  }
  if (requires.size === 0) {
    throw new HostSurfaceError(
      'found no `const { ... } = require("...")` in the client source; the check would be vacuous',
    )
  }
  return requires
}

/**
 * Find the prop-object blocks this repo passes to one component, covering the
 * call shapes a `React.createElement` alias produces: `Button({...})`,
 * `h(Button, {...})`, and `h(Button, {...}, ...)`. Between the component name
 * and the props object only whitespace and commas may appear, so a mention in
 * prose or an unrelated argument cannot be mistaken for props.
 */
export function findPropBlocks(text, owner) {
  const blocks = []
  for (const match of text.matchAll(new RegExp(`\\b${owner}\\b`, 'g'))) {
    let cursor = match.index + owner.length
    while (cursor < text.length && (/\s/u.test(text[cursor]) || text[cursor] === ',')) cursor += 1
    if (text[cursor] !== '{') continue
    const block = balancedBlock(text, cursor)
    if (block !== null) blocks.push(block)
  }
  return blocks
}

/**
 * Read the string-literal values this repo passes for one prop inside one props
 * block. A conditional value (`variant: ok ? 'primary' : 'secondary'`) yields
 * both arms, so a dropped variant cannot hide behind a ternary.
 */
function literalsForProp(block, prop) {
  const key = new RegExp(`\\b${prop}\\s*:\\s*`).exec(block)
  if (key === null) return []
  let cursor = key.index + key[0].length
  const values = []
  let depth = 0
  for (; cursor < block.length; cursor += 1) {
    const ch = block[cursor]
    if (ch === '(' || ch === '[' || ch === '{') depth += 1
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (depth === 0) break
      depth -= 1
    } else if (depth === 0 && (ch === ',' || ch === '\n' || ch === '\r')) break
    else if (ch === '"' || ch === "'") {
      const end = block.indexOf(ch, cursor + 1)
      if (end === -1) break
      values.push(block.slice(cursor + 1, end))
      cursor = end
    }
  }
  return values
}

/**
 * Read every string-literal value this repo passes for a known prop, from calls
 * shaped `<Owner>(..., { prop: 'value' })`.
 * @param text - the client module's source, not a path.
 * @returns Map keyed by `${owner}.${prop}` to a Map of value -> occurrence count.
 */
export function parseLiteralPropValues(text, contracts) {
  const values = new Map()
  for (const contract of contracts) {
    const found = new Map()
    for (const block of findPropBlocks(text, contract.owner)) {
      for (const value of literalsForProp(block, contract.prop)) {
        found.set(value, (found.get(value) ?? 0) + 1)
      }
    }
    if (found.size > 0) values.set(`${contract.owner}.${contract.prop}`, found)
  }
  return values
}
