# Security Policy

## Reporting a vulnerability

Please report vulnerabilities privately through the GitHub Security tab (Security → Report a vulnerability), not in public issues.

Before you report:

- Remove tokens, API keys, request headers, and any personal data from your report.
- Include the affected version, a minimal reproduction, and the expected vs actual behavior.

## Response

- The maintainer acknowledges reports within 7 days and aims to fix confirmed vulnerabilities in the next patch release.
- Fixes ship with a CHANGELOG entry; reporters are credited by name unless they ask otherwise.

## Scope

This plugin injects a personal directive paragraph into the harness system prompt and registers a runtime toggle. It reads no credentials, makes no network calls, and writes nothing outside the plugin's own install directory. The neutral placeholder shipped in the package contains no upstream prompt content.
