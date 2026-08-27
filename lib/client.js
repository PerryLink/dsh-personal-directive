window.__ModuleLoader__.load({
  id: "dsh-personal-directive",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");
    const {
      Button,
      IconCheckOutline16,
      IconCloseOutline16,
      IconLoadingOutline16,
    } = require("@deepseek-ai/dsh-client-ui-primitives");
    const h = React.createElement;
    const { useEffect, useState } = React;
    const PACKAGE_NAME = "dsh-personal-directive";
    const NS = "personalDirective";

    const zh = {
      enabled: "指令：开启",
      disabled: "指令：关闭",
      switching: "切换中…",
      title: "切换个人指令提示词",
      failed: "指令开关连接失败",
    };
    const en = {
      enabled: "Directive: On",
      disabled: "Directive: Off",
      switching: "Switching…",
      title: "Toggle personal directive",
      failed: "Directive toggle connection failed",
    };

    const identity = (value) => value;
    const wireCodec = (typeSymbol) => ({
      mode: "strict",
      typeSymbol,
      schema: { parse: identity },
    });
    const jsonParameter = (name, typeSymbol) => ({
      name,
      wire: name,
      source: "json",
      codec: wireCodec(typeSymbol),
    });
    const CONTRIBUTION = {
      package: PACKAGE_NAME,
      descriptors: [
        {
          id: PACKAGE_NAME + "#personalDirective/getState",
          service: "personalDirective",
          namespace: "personalDirective",
          method: "getState",
          invocation: { kind: "direct" },
          parameters: [],
          result: wireCodec(PACKAGE_NAME + "#PersonalDirectiveState"),
        },
        {
          id: PACKAGE_NAME + "#personalDirective/setEnabled",
          service: "personalDirective",
          namespace: "personalDirective",
          method: "setEnabled",
          invocation: { kind: "direct" },
          parameters: [jsonParameter("request", PACKAGE_NAME + "#SetEnabledRequest")],
          result: wireCodec(PACKAGE_NAME + "#SetEnabledResult"),
        },
      ],
    };

    function PromptToggle({ api, t }) {
      const [state, setState] = useState({ enabled: true, ready: false, busy: false, error: "" });

      useEffect(() => {
        let active = true;
        api.getState()
          .then((value) => {
            if (active) setState({ enabled: value.enabled === true, ready: true, busy: false, error: "" });
          })
          .catch((error) => {
            if (active) setState({ enabled: true, ready: true, busy: false, error: error instanceof Error ? error.message : String(error) });
          });
        return () => { active = false; };
      }, [api]);

      const toggle = async () => {
        if (!state.ready || state.busy) return;
        const enabled = !state.enabled;
        setState((current) => ({ ...current, busy: true, error: "" }));
        try {
          const value = await api.setEnabled({ enabled });
          setState({ enabled: value.enabled === true, ready: true, busy: false, error: "" });
        } catch (error) {
          setState((current) => ({ ...current, busy: false, error: error instanceof Error ? error.message : String(error) }));
        }
      };

      const label = state.busy ? t("switching") : state.enabled ? t("enabled") : t("disabled");
      const icon = state.busy
        ? h(IconLoadingOutline16, { size: 14 })
        : state.enabled
          ? h(IconCheckOutline16, { size: 14 })
          : h(IconCloseOutline16, { size: 14 });
      return h(Button, {
        type: "button",
        size: "sm",
        variant: state.enabled ? "primary" : "secondary",
        icon,
        disabled: !state.ready || state.busy,
        "aria-pressed": state.enabled,
        title: state.error || t("title"),
        onClick: toggle,
      }, label);
    }

    const inject = ["slots", "locale", "remote"];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "personal-directive: dictionaries");
      const mount = ctx.remote.$mount(CONTRIBUTION);
      const remoteCall = async (method, request) => {
        await mount;
        const remote = ctx.get("remote.personalDirective");
        if (remote === undefined) throw new Error("personalDirective remote unavailable");
        const result = request === undefined ? await remote[method]() : await remote[method](request);
        if (!result.ok) throw new Error(result.error?.message || method + " failed");
        return result.value;
      };
      const api = {
        getState: () => remoteCall("getState"),
        setEnabled: (request) => remoteCall("setEnabled", request),
      };
      const t = ctx.locale.bind(NS);
      ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
        name: "conversation.session.header.actions",
        id: "personal-directive-toggle",
        order: 1010,
        locale: NS,
        inject: () => ({ api, t }),
      }, PromptToggle));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
