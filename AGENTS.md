# AGENTS.md

Standalone DeepSeek Harness plugin repository (`dsh-personal-directive`), a maintained fork of `liucaimao2026/dsh-personal-directive` (upstream attribution preserved in README and THIRD_PARTY_NOTICES).

## Repo-local decisions

- Framework-only edition: the shipped `prompts/personal-directive.md` is a neutral placeholder; the upstream prompt content is never distributed (see README 归属和许可证说明).
- License stays MIT for the framework code; it does not re-license the upstream project.
- Behavior changes update README (English source) and README.zh.md in the same commit.
- Publishing: `publish.yml` runs on `v*` tags and skips versions already on the registry; npm package ownership is a maintainer decision (the upstream package name belongs to the upstream author).
- Tests run with `pnpm test`; install smoke uses a throwaway profile under `%TEMP%` (never the real `~/.dsh`).
