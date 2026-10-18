# dsh-personal-directive

> Release stamp: `0.2.9` (2026-10-04).

> ⚠️ Este proyecto se retiró del ecosistema DSH y ya no participa en ningún listado de catálogo (2026-09-13).

- **Canal de la tienda 1024**: ejecuta `npm i -g dsh1024` una vez y luego `dsh1024 plugin --profile web add dsh-personal-directive` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

Edición **de framework** del fork de «Infinite Generation One» para DeepSeek Harness: conserva la forma de plugin del repositorio original (inyección de system prompt + herramienta + interruptor en tiempo de ejecución en la barra superior), pero **no distribuye el contenido del prompt original** — lo sustituye por una directiva de marcador de posición neutra que puedes reemplazar por tus propias instrucciones personales.

> Este proyecto es una edición personal derivada del proyecto original, no una publicación oficial del autor original.

## Instalación

### Desde GitHub

Se recomienda instalar directamente desde GitHub:

```powershell
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

Si `dsh` no está en el PATH, usa el comando del directorio de instalación de DSH:

```powershell
& "D:/deepseek-harness/node_modules/.bin/dsh.cmd" plugin --profile web add github:PerryLink/dsh-personal-directive
```

Tras una instalación correcta, DSH hará automáticamente lo siguiente:

1. Añadir el plugin a las `dependencies` de `~/.dsh/profiles/web/package.json`.
2. Añadir `dsh-personal-directive` a `dsh.profile.bundles`.
3. Aplicar el `cordis.patch.yml` que trae el plugin.
4. Instalar las dependencias del lado servidor y del cliente Web del plugin.

Después reinicia por completo `dsh web` y recarga la página:

```text
http://127.0.0.1:3080
```

### Alternativa de instalación local (git / pack)

Adecuada para desarrollo, modificación del código o restauración desde una copia local. La instalación por git también instala las dependencias:

```powershell
dsh plugin --profile <p> add github:PerryLink/dsh-personal-directive
```

Sustituye `<p>` por el nombre del perfil de destino (por ejemplo `web`).

También puedes empaquetar primero e instalar desde el tarball local:

```powershell
npm pack
dsh plugin --profile <p> add ./dsh-personal-directive-0.2.0.tgz
```

La instalación empaquetada también instala las dependencias. Tras modificar el código hay que reempaquetar, reinstalar y reiniciar `dsh web` para cargar el nuevo código del Host o del cliente Web.

### Cambiar de un enlace local a la versión de GitHub

Si el perfil ya tiene un enlace local con el mismo nombre, elimina primero la dependencia antigua:

```powershell
dsh plugin --profile web remove dsh-personal-directive
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

### Actualización

Para actualizar a la última versión tras instalar desde GitHub:

```powershell
dsh plugin --profile web update dsh-personal-directive
```

Reinicia por completo `dsh web` después de actualizar.

### Desinstalación

Desinstalar solo elimina el plugin; no borra otros bundles del usuario:

```powershell
dsh plugin --profile web remove dsh-personal-directive
```

El interruptor «Directiva: activada / Directiva: desactivada» de la parte superior es un conmutador en tiempo de ejecución y no equivale al comando de desinstalación anterior.

## Compatibilidad

| Superficie | Estado |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-alpha.1` (fijado en la línea `0.2.1-alpha.1`: `@deepseek-ai/dsh-typert-registry` en devDependencies y `@deepseek-ai/dsh-typert-protocol` en dependencies; con las puertas `pnpm run harness:check` y `pnpm test`; los rangos peer también admiten `>=0.2.1-0 <0.3.0`) |

## Origen del proyecto

Proyecto original:

- GitHub: https://github.com/Minglink/dsh-infinite-gen-1
- Nombre: dsh-infinite-gen-1 / 无限一代 (Infinite Generation One)
- Autor original: Minglink

Esta edición de framework conserva la estructura del plugin original (inyección del segmento de prompt, herramienta `personal_directive_profile`, interruptor superior en la Web) y añade un control visual en la parte superior de la Web, además de sustituir el contenido del prompt por una directiva de marcador de posición neutra (véase «Atribución y licencia»).

## Qué añade esta edición

Respecto al repositorio original, este proyecto añade principalmente:

- Registra los botones «Directiva: activada / Directiva: desactivada» en la parte superior de DeepSeek Harness Web, justo después de «completar indicación».
- Cambia el estado del prompt mediante la interfaz remota en tiempo de ejecución, no desinstalando el plugin.
- El plugin permanece instalado y cargado; al desactivarlo solo el segmento de system prompt de esta directiva personal devuelve contenido vacío.
- Activar o desactivar solo afecta a las solicitudes posteriores del modelo; no modifica las solicitudes ya enviadas.
- Conserva la forma de la herramienta original `personal_directive_profile` (en el original se llamaba `infinite_gen1_profile`).
- Las dependencias vienen del registro npm (para desarrollo local puedes modificar el código y reempaquetar/instalar).

La posición del interruptor la controla una ranura de la UI de DSH:

```text
conversation.session.header.actions
```

Este proyecto usa el orden `1010` para colocarse después del botón existente «completar indicación».

## Estructura del directorio

```text
dsh-personal-directive/
├── index.js                         # Punto de entrada del plugin del lado del servidor Harness y conmutador en tiempo de ejecución
├── lib/
│   └── client.js                    # Conmutador visual de la barra superior
├── scripts/
│   ├── check-client-contract.mjs    # Comprobación del contrato del host (puerta de existencia de símbolos)
│   ├── check-typert-codec.mjs       # Puerta del codec Typert (una sola cara: create())
│   ├── probe-typert-codec-contract.mjs  # Mide el contrato del codec contra el host instalado
│   └── lib/                         # Helpers compartidos de análisis/origen/reescritura de las puertas
├── prompts/
│   └── personal-directive.md        # Directiva de marcador de posición neutra (sustituible por tu contenido)
├── cordis.patch.yml                 # Declaración de inserción del bundle
├── package.json                     # Metadatos del bundle/cliente de Harness
├── pnpm-lock.yaml                   # Archivo de bloqueo de dependencias local
└── README.md
```

## Requisitos del entorno

- DeepSeek Harness instalado y `dsh web` arrancando correctamente.
- El comando `dsh plugin` disponible.
- `pnpm` en el PATH.
- Este tutorial de instalación está pensado para el perfil `web`.

## Uso del interruptor

Tras reiniciar, busca en la barra superior:

```text
完成提示    指令：开启
```

Al pulsarlo cambia a:

```text
完成提示    指令：关闭
```

Este interruptor solo controla si el prompt en tiempo de ejecución surte efecto:

- Activado: la siguiente solicitud del modelo incluye la directiva personal de `prompts/personal-directive.md`.
- Desactivado: el plugin sigue instalado, pero el segmento de system prompt de este proyecto queda vacío.
- No elimina el plugin de las `dependencies` del perfil.
- No elimina el plugin de `dsh.profile.bundles`.
- No borra el directorio del plugin personal.

## Verificar que surte efecto

### Estado en la barra superior

Que el botón muestre «Directiva: activada» o «Directiva: desactivada» indica el estado del conmutador en tiempo de ejecución del servidor.

### Ver la solicitud real al modelo

1. Cambia a «Directiva: activada».
2. Crea una sesión nueva y envía un mensaje normal.
3. Abre «Trayectoria» en la parte superior.
4. Selecciona la solicitud del Assistant que acabas de hacer.
5. Abre el detalle «System Prompt / 系统提示词» de la derecha.
6. Busca la siguiente característica de la directiva de marcador de posición:

```text
# Personal Directive
```

Con el interruptor activado verás ese contenido. Cambia a «Directiva: desactivada», envía un mensaje nuevo y revisa la nueva solicitud: ya no deberías ver esas características.

Nota: al desactivarlo, los demás system prompts del propio Harness siguen presentes; este proyecto solo retira su propio segmento de prompt.

## Desarrollo local y comprobaciones

```powershell
cd <this repository>
pnpm install --ignore-workspace
pnpm run harness:check
pnpm test
```

Además de la comprobación de sintaxis, `harness:check` ejecuta la **comprobación del contrato del host** (`scripts/check-client-contract.mjs`). Toma cada símbolo que `lib/client.js` desestructura de `@deepseek-ai/dsh-client-ui-primitives` del host y lo verifica contra la superficie de tipos del host (`lib/types/**/*.d.ts`) **y** sus exportaciones en tiempo de ejecución (`lib/index.js`); también comprueba que los valores de `variant` pasados a `Button` sigan perteneciendo a la unión `ButtonVariant` del host. **Un símbolo que el host haya eliminado se reporta por nombre con salida distinta de cero**, de modo que esta clase de regresión silenciosa (no montar) ya no puede pasar por `node --check` — que solo demuestra que el archivo se analiza, mientras que `React.createElement(undefined)` no lanza hasta que React lo renderiza.

La comprobación localiza automáticamente un checkout del host (un `deepseek-harness` hermano de este repositorio, un directorio ancestro o una raíz de unidad conocida), o puedes indicarlo explícitamente:

```powershell
node scripts/check-client-contract.mjs --host D:/deepseek-harness
$env:DSH_HOST_ROOT = "D:/deepseek-harness"; pnpm run check:client-contract
```

Si informa de que no encuentra ningún checkout del host, define `DSH_HOST_ROOT` con la ruta de tu checkout de DeepSeek Harness.

`harness:check` también ejecuta la **comprobación del codec Typert** (`scripts/check-typert-codec.mjs`). Un codec de invocación Typert es `{ mode: 'strict', typeSymbol, create }`; en la línea 0.1.5 era `{ mode, typeSymbol, schema }`, y el host 0.1.7 rechaza la forma antigua al montar — `validateCodec` lanza `typert: <id> result strict codec has no create() factory`, la fila del plugin no se activa y nada más en este repositorio puede verlo: el literal antiguo es un objeto perfectamente válido, así que `node --check` pasa y un Context de prueba lo acepta. Esta comprobación es el espejo local de esa regla del host. Construye los artefactos reales de ambas caras — el manifiesto `TYPERT` exportado por `index.js` y la contribución que `lib/client.js` entrega a `ctx.remote.$mount` —, recorre cada descriptor y exige que cada codec lleve una **función** `create()` y ningún miembro `schema`, nombrando el id de invocación infractor. `test/typert-mount.test.mjs` va más allá: registra ambas caras con un `@deepseek-ai/dsh-typert-registry` real sobre un `Context` real de Cordis, y luego reconstruye en memoria el codec rechazado de la línea 0.1.5 y comprueba que el registro lo rechaza — de modo que queda probado que la puerta puede fallar.

```powershell
node scripts/check-typert-codec.mjs
```

`scripts/probe-typert-codec-contract.mjs` responde a la otra mitad de la pregunta contra el host *instalado*, en lugar de contra la lectura que este repositorio hace de él: registra un codec `{ mode, typeSymbol, schema }` y un codec `create()` en ambas caras con el registro real, y comprueba que el primero se rechaza y el segundo se acepta. Ejecútalo tras subir de línea de host para volver a medir la suposición que codifica la puerta.

```powershell
pnpm run probe:typert-codec
```

Comprobar la composición del bundle del perfil Web:

```powershell
dsh --profile web --dump-config
```

La salida debería incluir:

```text
id: personal-directive
name: dsh-personal-directive
```

## Seguridad y alcance de uso

Esta edición de framework **no incluye el contenido del prompt original**: lo que se publica es una directiva de marcador de posición neutra (`prompts/personal-directive.md`); el comportamiento en tiempo de ejecución es el mismo que el de cualquier plugin de «inyección de segmento de system prompt» y solo afecta al texto de instrucciones que tú aportes.

Este proyecto no modifica los pesos del modelo ni elude las políticas de seguridad independientes del servicio remoto de modelos, los permisos del sistema operativo o los permisos reales de herramientas del Harness.

## Atribución y licencia

Este proyecto se basa explícitamente en el siguiente proyecto original:

```text
https://github.com/Minglink/dsh-infinite-gen-1
```

Debe conservarse la atribución al autor original y al proyecto original.

El `LICENSE` de la raíz de este repositorio es una declaración MIT del mantenedor de este repositorio para el código nuevo y el código de integración de este proyecto. No sustituye automáticamente los derechos de autor del proyecto original, ni implica que el prompt y el código originales del autor hayan sido relicenciados.

En el momento de preparar este proyecto no se encontró en el repositorio original ningún archivo `LICENSE` explícito ni identificación de licencia de GitHub. Por ello, esta edición de framework adopta la tercera vía de licencia indicada en el README original: **publicar solo el framework de código sin el prompt original** — `prompts/personal-directive.md` se ha sustituido por una directiva de marcador de posición neutra, y cada usuario puede aportar su propio contenido de instrucciones (la ruta original está en el enlace de GitHub anterior; verifica por tu cuenta el estado de licencia del original).

La declaración MIT de este repositorio no debe interpretarse como una autorización del autor original sobre el contenido original. Si el autor original añade una licencia más adelante, actualiza esta sección y el archivo de licencia del repositorio en consecuencia.

## Agradecimientos

Gracias al autor del proyecto original, Minglink, por aportar la implementación original y el planteamiento de prompt de `dsh-infinite-gen-1`. Este repositorio solo añade sobre esa base la gestión del directorio personal, el conmutador en tiempo de ejecución de la barra superior de Harness Web y el código de integración relacionado.

## PerryLink DSH Plugin Family

Este proyecto es uno de los **87 plugins activamente mantenidos** de DeepSeek Harness de [PerryLink](https://github.com/PerryLink). El registro familiar tiene **95** plugins — **5 congelados**, **3 retirados** — y permanece plegado abajo para que cada README conserve una primera pantalla corta. Expándelo para ver cada fila, con el motivo en la columna Estado.

<details>
<summary>Expandir los 95 plugins</summary>

| Plugin | Una línea | Estado |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>
