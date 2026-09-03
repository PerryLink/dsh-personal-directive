import { readFileSync } from "node:fs";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { z } from "zod";

const PACKAGE_NAME = "dsh-personal-directive";
const PROMPT_TEXT = readFileSync(
  new URL("./prompts/personal-directive.md", import.meta.url),
  "utf8",
);

const objectOutput = {
  schema: { type: "object", additionalProperties: true },
  render: (_args, value) => [{ type: "text", text: JSON.stringify(value) }],
};

const stateSchema = z.object({ enabled: z.boolean() });
const setEnabledRequestSchema = z.object({ enabled: z.boolean() });
const setEnabledResultSchema = z.object({ enabled: z.boolean() });

function codec(typeSymbol, schema) {
  return { mode: "strict", typeSymbol, schema };
}

function jsonParameter(name, typeSymbol, schema) {
  return {
    name,
    wire: name,
    source: "json",
    codec: codec(typeSymbol, schema),
  };
}

const MANIFEST = {
  package: PACKAGE_NAME,
  face: "host",
  schemas: [],
  invocations: [
    {
      id: PACKAGE_NAME + "#personalDirective/getState",
      service: "personalDirective",
      namespace: "personalDirective",
      method: "getState",
      invocation: { kind: "direct" },
      parameters: [],
      result: codec(PACKAGE_NAME + "#PersonalDirectiveState", stateSchema),
    },
    {
      id: PACKAGE_NAME + "#personalDirective/setEnabled",
      service: "personalDirective",
      namespace: "personalDirective",
      method: "setEnabled",
      invocation: { kind: "direct" },
      parameters: [jsonParameter("request", PACKAGE_NAME + "#SetEnabledRequest", setEnabledRequestSchema)],
      result: codec(PACKAGE_NAME + "#SetEnabledResult", setEnabledResultSchema),
    },
  ],
  model: { services: [], events: [], objects: [] },
};

class PersonalDirectiveGateway extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, "personalDirective");
    this.enabled = true;
  }

  getState() {
    return { enabled: this.enabled };
  }

  setEnabled(request) {
    this.enabled = request.enabled === true;
    this.ctx.emit("system-prompt/change");
    return { enabled: this.enabled };
  }
}

export const name = PACKAGE_NAME;
export const inject = ["tools", "systemPrompt", "typert"];

export function apply(ctx) {
  const gateway = new PersonalDirectiveGateway(ctx);
  const profileTool = {
    name: "personal_directive_profile",
    description:
      "Return the bundled personal directive system prompt with its enable state.",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    output: objectOutput,
    execute() {
      return {
        name: "personal-directive",
        displayName: "Personal Directive",
        version: "0.2.1",
        enabled: gateway.enabled,
        prompt: gateway.enabled ? PROMPT_TEXT : "",
      };
    },
  };

  ctx.effect(() => ctx.systemPrompt.section({
    name: "personal-directive:system-prompt",
    order: 100,
    text: () => gateway.enabled ? PROMPT_TEXT : "",
  }), "personal-directive: prompt section");
  ctx.effect(() => ctx.tools.register(profileTool), "personal-directive: profile tool");
  ctx.effect(() => ctx.typert.register(MANIFEST), "personal-directive: remote manifest");
}
