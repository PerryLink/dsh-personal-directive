/**
 * Load a repository file with its source rewritten in memory.
 *
 * The point is to run the *real* deliverable against the *real* host registry
 * while rebuilding a historical defect, so the gate can prove it still catches
 * that defect. Rewriting the module source through a `module.registerHooks()`
 * load hook keeps the repository's own files untouched: nothing is copied to a
 * temporary path, and no obsolete literal has to be kept in the source tree
 * just to be tested.
 */

import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'
import { SourceShapeError } from './module-source.mjs'

let variants = 0

/**
 * Import one file with its text passed through `rewrite`.
 *
 * Each call imports a distinct URL (`?variant=<n>`), because a module is cached
 * by URL: re-importing the same specifier would hand back the first variant and
 * a negative control would silently assert against the fixed source instead of
 * the rebuilt defect.
 * @param path - absolute path of the module to import.
 * @param rewrite - `(source, path) => string`, applied to that file only.
 * @param label - name for the variant URL, used only to make failures readable.
 * @returns the module namespace object.
 * @throws {SourceShapeError} when the file is missing or `rewrite` changed
 *   nothing, which would make the control assert nothing.
 */
export async function importRewritten(path, rewrite, label = 'variant') {
  const url = `${pathToFileURL(path).href}?${label}=${variants += 1}`
  const original = readFileSync(path, 'utf8')
  const rewritten = rewrite(original, path)
  if (rewritten === original) {
    throw new SourceShapeError(
      `${path}: the rewrite changed nothing, so this control would test the unmodified ` +
        'source and could not fail — refusing to run it',
    )
  }
  const hooks = registerHooks({
    load(specifier, context, nextLoad) {
      if (specifier === url) return { format: 'module', source: rewritten, shortCircuit: true }
      return nextLoad(specifier, context)
    },
  })
  try {
    return await import(url)
  } finally {
    hooks.deregister()
  }
}

/**
 * Evaluate the client bundle's loader factory and return its exports.
 *
 * `lib/client.js` is not a module: it registers itself with
 * `window.__ModuleLoader__.load({ id, factory })`, and only the factory's return
 * value carries `apply` / `inject`. The host packages the bundle `require`s are
 * supplied as stubs, because this gate verifies the *Remote contribution* — a
 * module-level literal — and never renders a component. A missing stub throws
 * rather than yielding `undefined`, so a future bundle that touches a host API
 * during module evaluation fails here loudly instead of passing by accident.
 * @param source - `lib/client.js` text.
 * @param entry - `{ id, factoryParameter }` from `extractClientEntry`.
 * @returns the evaluated `module.exports`.
 * @throws {SourceShapeError} when the bundle never calls the loader, or when
 *   module evaluation reaches for a host export this gate does not model.
 */
export function evaluateClientBundle(source, entry) {
  let loaded
  // The bundle destructures its React and ui-primitives imports at module
  // scope, so a `require` that returned nothing would fail for an unrelated
  // reason. Every requested export resolves to a recording stub instead, and
  // calling one during evaluation is what fails: the contribution is a literal
  // built before any component runs, so nothing should be invoked here.
  const hostStub = (specifier) => new Proxy({}, {
    get(_target, property) {
      if (typeof property !== 'string') return undefined
      return (...args) => {
        throw new SourceShapeError(
          `lib/client.js: module evaluation called ${specifier}.${property}(${args.length} arg(s)) ` +
            '— the Remote contribution must stay a literal, so this gate has no runtime to offer',
        )
      }
    },
  })
  const window = {
    __ModuleLoader__: {
      load(spec) {
        if (loaded !== undefined) throw new SourceShapeError('lib/client.js called load() twice')
        loaded = spec
      },
    },
  }
  // eslint-disable-next-line no-new-func -- the bundle's own banner, not user input.
  const evaluate = new Function('window', `${source}\nreturn undefined;`)
  evaluate(window)
  if (loaded === undefined) {
    throw new SourceShapeError(
      'lib/client.js: the bundle never called window.__ModuleLoader__.load()',
    )
  }
  if (loaded.id !== entry.id) {
    throw new SourceShapeError(
      `lib/client.js: load() id ${JSON.stringify(loaded.id)} != ${JSON.stringify(entry.id)}`,
    )
  }
  if (typeof loaded.factory !== 'function') {
    throw new SourceShapeError('lib/client.js: the loader call declares no factory function')
  }
  const exports = loaded.factory(hostStub)
  if (typeof exports !== 'object' || exports === null) {
    throw new SourceShapeError(
      `lib/client.js: the factory returned ${typeof exports}, not the module exports object`,
    )
  }
  return exports
}
