import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { apply } from '../index.js'

/** Minimal Cordis Context stub covering exactly what index.js consumes. */
function makeCtx() {
  const state = {
    sections: [],
    tools: [],
    manifests: [],
    events: [],
    services: new Map(),
  }
  const reflect = {
    provide(name, value) {
      state.services.set(name, value)
    },
  }
  const ctx = {
    reflect,
    effect(fn) {
      fn()
      return () => {}
    },
    emit(name, payload) {
      state.events.push([name, payload])
    },
    get() {
      return undefined
    },
    systemPrompt: {
      section(spec) {
        state.sections.push(spec)
        return () => {}
      },
    },
    tools: {
      register(def) {
        state.tools.push(def)
        return () => {}
      },
    },
    typert: {
      register(manifest) {
        state.manifests.push(manifest)
        return () => {}
      },
    },
    _state: state,
  }
  return ctx
}

test('ships a neutral placeholder directive, not upstream prompt content', () => {
  const prompt = readFileSync(new URL('../prompts/personal-directive.md', import.meta.url), 'utf8')
  assert.ok(prompt.length > 0)
  assert.match(prompt, /^# Personal Directive/)
  // Framework edition: none of the upstream jailbreak-style markers may ship.
  assert.doesNotMatch(prompt, /MODE:\s*(UNRESTRICTED\s*)?SANDBOX/i)
  assert.doesNotMatch(prompt, /SUPREME DIRECTIVE/i)
  assert.doesNotMatch(prompt, /REFUSAL HARDENING/i)
  assert.doesNotMatch(prompt, /破甲/i)
})

test('apply registers the prompt section, the profile tool, and the remote manifest', () => {
  const ctx = makeCtx()
  apply(ctx)
  const { sections, tools, manifests, services } = ctx._state

  assert.equal(sections.length, 1)
  assert.equal(sections[0].name, 'personal-directive:system-prompt')
  assert.equal(sections[0].order, 100)
  assert.equal(typeof sections[0].text, 'function')

  assert.equal(tools.length, 1)
  assert.equal(tools[0].name, 'personal_directive_profile')
  assert.equal(tools[0].parameters.type, 'object')

  assert.equal(manifests.length, 1)
  assert.equal(manifests[0].package, 'dsh-personal-directive')
  assert.equal(services.has('personalDirective'), true)
})

test('the section text and tool payload follow the enable switch', () => {
  const ctx = makeCtx()
  apply(ctx)
  const { sections, tools, services } = ctx._state
  const gateway = services.get('personalDirective')

  assert.deepEqual(gateway.getState(), { enabled: true })
  assert.ok(sections[0].text().length > 0)

  const payload = tools[0].execute()
  assert.equal(payload.name, 'personal-directive')
  assert.equal(payload.enabled, true)
  assert.ok(payload.prompt.length > 0)
  assert.doesNotMatch(payload.prompt, /破甲|REFUSAL/i)

  gateway.setEnabled({ enabled: false })
  assert.deepEqual(gateway.getState(), { enabled: false })
  assert.equal(sections[0].text(), '')
  assert.equal(tools[0].execute().prompt, '')
  assert.equal(tools[0].execute().enabled, false)
})

test('setEnabled emits system-prompt/change so the host refreshes the section', () => {
  const ctx = makeCtx()
  apply(ctx)
  const { events, services } = ctx._state
  services.get('personalDirective').setEnabled({ enabled: false })
  assert.ok(events.some(([name]) => name === 'system-prompt/change'))
})

test('setEnabled ignores non-boolean request values', () => {
  const ctx = makeCtx()
  apply(ctx)
  const gateway = ctx._state.services.get('personalDirective')
  gateway.setEnabled({ enabled: 'yes' })
  assert.deepEqual(gateway.getState(), { enabled: false })
})
