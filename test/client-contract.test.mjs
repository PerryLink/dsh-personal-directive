import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkClientContract } from '../scripts/check-client-contract.mjs'
import {
  HostSurfaceError,
  loadHostPropUnions,
  loadHostPackageSurface,
  parseClientRequires,
  parseDeclaredExports,
  parseLiteralPropValues,
  parseRuntimeExports,
  parseStringUnion,
  PROP_CONTRACTS,
  repoRoot,
  resolveHostRoot,
} from '../scripts/lib/host-surface.mjs'

const UI_PRIMITIVES = '@deepseek-ai/dsh-client-ui-primitives'

/** Build a throwaway tree holding only what the checker reads, plus a client entry. */
function makeClientFixture(clientSource) {
  const root = mkdtempSync(join(tmpdir(), 'dsh-personal-directive-contract-'))
  mkdirSync(join(root, 'lib'), { recursive: true })
  writeFileSync(join(root, 'lib', 'client.js'), clientSource, 'utf8')
  return root
}

/** Write a temp file and run one of the path-based parser helpers over it. */
function withTempFile(name, content) {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-personal-directive-parse-'))
  const path = join(dir, name)
  writeFileSync(path, content, 'utf8')
  return path
}

const goodClient = readFileSync(join(repoRoot(), 'lib', 'client.js'), 'utf8')

/** Run `fn` and return the HostSurfaceError it must throw (node's assert.throws returns nothing). */
function captureContractError(fn) {
  let caught
  try {
    fn()
  } catch (error) {
    caught = error
  }
  assert.ok(caught !== undefined, 'expected the check to fail, but it passed')
  assert.ok(
    caught instanceof HostSurfaceError,
    `expected a HostSurfaceError, got ${caught.name}: ${caught.message}`,
  )
  return caught
}

test('the shipped client entry satisfies the host contract', () => {
  const result = checkClientContract()
  assert.equal(result.checked, 4)
  assert.equal(result.packages.length, 1)
  assert.equal(result.packages[0].name, UI_PRIMITIVES)
  assert.ok(result.packages[0].declared > 100, 'the parsed type surface looks too small')
  assert.ok(result.packages[0].runtime > 100, 'the parsed runtime surface looks too small')
})

test('a symbol the host removed fails the check, by name', () => {
  const stale = goodClient.replace('IconCheckOutlineRegular', 'IconCheckOutline16')
  assert.notEqual(stale, goodClient, 'fixture did not change the entry')
  const root = makeClientFixture(stale)

  const error = captureContractError(() => checkClientContract({ root }))
  assert.match(error.message, /IconCheckOutline16/)
  assert.match(error.message, /neither declared nor exported/)
})

test('every missing symbol is named, not just the first', () => {
  let stale = goodClient
  for (const symbol of ['IconCheckOutlineRegular', 'IconCloseOutlineRegular', 'IconLoadingOutlineRegular']) {
    stale = stale.replace(symbol, `${symbol.replace(/Regular$/u, '')}16`)
  }
  const root = makeClientFixture(stale)

  const error = captureContractError(() => checkClientContract({ root }))
  for (const symbol of ['IconCheckOutline16', 'IconCloseOutline16', 'IconLoadingOutline16']) {
    assert.match(error.message, new RegExp(symbol), `missing from the report: ${symbol}`)
  }
  assert.match(error.message, /3 host-contract mismatches/)
})

test('a prop value outside the host union fails the check, naming the union', () => {
  const stale = goodClient.replace('"primary" : "outline"', '"primary" : "secondary"')
  assert.notEqual(stale, goodClient, 'fixture did not change the entry')
  const root = makeClientFixture(stale)

  const error = captureContractError(() => checkClientContract({ root }))
  assert.match(error.message, /variant: "secondary"/)
  assert.match(error.message, /ButtonVariant/)
  assert.match(error.message, /"outline"/)
})

test('a symbol declared in the types but absent at runtime still fails', () => {
  const fakePackage = {
    name: UI_PRIMITIVES,
    version: '0.1.7-rc.test',
    exports: { '.': { types: './lib/types/index.d.ts', default: './lib/index.js' } },
  }
  const types = 'export declare const KeptSymbol: () => void;\n'
  const runtime = 'export { OtherSymbol };\n'

  const dir = mkdtempSync(join(tmpdir(), 'dsh-personal-directive-surface-'))
  const packageDir = join(dir, 'node_modules', UI_PRIMITIVES)
  mkdirSync(join(packageDir, 'lib', 'types'), { recursive: true })
  writeFileSync(join(packageDir, 'package.json'), JSON.stringify(fakePackage), 'utf8')
  writeFileSync(join(packageDir, 'lib', 'types', 'index.d.ts'), types, 'utf8')
  writeFileSync(join(packageDir, 'lib', 'index.js'), runtime, 'utf8')

  const surface = loadHostPackageSurface(dir, UI_PRIMITIVES)
  assert.ok(surface.declared.has('KeptSymbol'))
  assert.equal(surface.declared.has('OtherSymbol'), false)
  assert.ok(surface.runtime.has('OtherSymbol'))
  assert.equal(surface.runtime.has('KeptSymbol'), false)

  const root = makeClientFixture('const { KeptSymbol } = require("' + UI_PRIMITIVES + '");\n')
  const error = captureContractError(() => checkClientContract({ root, host: dir }))
  assert.match(error.message, /KeptSymbol/)
  assert.match(error.message, /missing from the runtime exports/)
})

test('the check refuses to pass vacuously on an entry with no host requires', () => {
  const root = makeClientFixture('window.__ModuleLoader__.load({ id: "x" });\n')
  const error = captureContractError(() => checkClientContract({ root }))
  assert.match(error.message, /vacuous/)
})

test('the check refuses to pass vacuously when no host checkout is resolvable', () => {
  const error = captureContractError(() =>
    checkClientContract({ host: join(tmpdir(), 'dsh-personal-directive-definitely-absent') }),
  )
  assert.match(error.message, /cannot locate|no workspace package/u)
})

test('parseClientRequires reads the destructured require list', () => {
  const source = [
    'window.__ModuleLoader__.load({',
    '  factory: (require) => {',
    '    const React = require("react");',
    '    const {',
    '      Button,',
    '      IconCheckOutlineRegular,',
    '    } = require("@deepseek-ai/dsh-client-ui-primitives");',
    '  },',
    '});',
  ].join('\n')

  const requires = parseClientRequires(source)
  assert.deepEqual(requires.get(UI_PRIMITIVES), ['Button', 'IconCheckOutlineRegular'])
  assert.deepEqual(requires.get('react'), undefined)
})

test('parseLiteralPropValues reads both arms of a conditional prop', () => {
  const source = 'h(Button, { variant: state.enabled ? "primary" : "outline" }, label);'
  const values = parseLiteralPropValues(source, PROP_CONTRACTS)
  assert.deepEqual([...values.get('Button.variant')], [['primary', 1], ['outline', 1]])
})

test('parseLiteralPropValues ignores a prop mentioned only in prose', () => {
  const source = 'const note = "Button variant: \'secondary\'";'
  const values = parseLiteralPropValues(source, PROP_CONTRACTS)
  assert.equal(values.has('Button.variant'), false)
})

test('parseDeclaredExports follows `export *` re-exports transitively', () => {
  const entry = withTempFile('index.d.ts', "export declare const Direct: 1;\nexport * from './icons/index.tsx';\n")
  const icons = join(entry, '..', 'icons')
  mkdirSync(icons, { recursive: true })
  writeFileSync(join(icons, 'index.d.ts'), 'export declare const Nested: 2;\n', 'utf8')

  const names = parseDeclaredExports(entry)
  assert.ok(names.has('Direct'))
  assert.ok(names.has('Nested'))
})

test('parseDeclaredExports fails loudly when a re-export target is gone', () => {
  const entry = withTempFile('index.d.ts', "export * from './missing.tsx';\n")
  assert.throws(() => parseDeclaredExports(entry), HostSurfaceError)
})

test('parseRuntimeExports fails loudly when no export list is present', () => {
  const path = withTempFile('index.js', 'const internal = 1;\n')
  assert.throws(() => parseRuntimeExports(path), HostSurfaceError)
})

test('parseStringUnion reads a type alias and an optional member', () => {
  const alias = "export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'toolbar';\n"
  assert.deepEqual(parseStringUnion(alias, 'ButtonVariant', 'variant'), [
    'primary',
    'ghost',
    'outline',
    'toolbar',
  ])

  const member = 'export declare function Button(p: {\n    size?: \'md\' | \'sm\';\n}): void;\n'
  assert.deepEqual(parseStringUnion(member, 'NoSuchAlias', 'size'), ['md', 'sm'])
  assert.equal(parseStringUnion(member, 'NoSuchAlias', 'absent'), null)
})

test('the host prop unions the client depends on are readable', () => {
  const unions = loadHostPropUnions()
  const variants = unions.get('Button.variant')
  assert.ok(Array.isArray(variants), 'Button.variant union not found on the host')
  assert.ok(variants.includes('outline'), 'the off-state variant must exist on the host')
  assert.equal(variants.includes('secondary'), false)
})

test('the host surface parser stays honest: every declared value is exported at runtime', () => {
  const surface = loadHostPackageSurface(resolveHostRoot().root, UI_PRIMITIVES)
  const declaredOnly = [...surface.declared].filter((name) => !surface.runtime.has(name))
  // Tolerated only if the parser itself is misreading: zero here means the two
  // independent parse paths agree, so neither one can be silently degrading.
  assert.deepEqual(declaredOnly, [])
  assert.ok(surface.declared.size > 100, 'the parsed surface looks too small to be real')
})
