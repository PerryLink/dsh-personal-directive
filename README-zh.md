# dsh-personal-directive

> Release stamp: `0.2.9` (2026-10-04).

> ⚠️ 此项目已从 DSH 生态撤除，不再参与任何目录收录（2026-09-13）。

- **1024 商店渠道**：先 `npm i -g dsh1024`，再 `dsh1024 plugin --profile web add dsh-personal-directive`（计入 [deepseek1024.com](https://deepseek1024.com) 安装排行）。

DeepSeek Harness 的「无限一代」二次开发**框架版**：保留原版仓库的插件形态（系统提示词注入 + 工具 + 顶部运行时开关），但**不随包发布原版提示词内容**——改用中性占位指令，用户可自行替换为自己的个人指令。

> 本项目是基于原项目的个人二次开发版本，不是原作者的官方发布版本。

## 安装

### 从 GitHub 安装

推荐直接从 GitHub 安装：

```powershell
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

如果 `dsh` 没有加入 PATH，可以使用 DSH 安装目录中的命令：

```powershell
& "D:/deepseek-harness/node_modules/.bin/dsh.cmd" plugin --profile web add github:PerryLink/dsh-personal-directive
```

安装成功后，DSH 会自动：

1. 将插件加入 `~/.dsh/profiles/web/package.json` 的 dependencies。
2. 将 `dsh-personal-directive` 加入 `dsh.profile.bundles`。
3. 应用插件自带的 `cordis.patch.yml`。
4. 安装插件的服务端和 Web 客户端依赖。

然后完全重启 `dsh web`，再刷新页面：

```text
http://127.0.0.1:3080
```

### 本地安装备选（git / pack）

适合开发、修改源码或从本地备份恢复。git 安装会一并安装依赖：

```powershell
dsh plugin --profile <p> add github:PerryLink/dsh-personal-directive
```

将 `<p>` 替换为目标 profile 名（如 `web`）。

也可以先打包再从本地 tarball 安装：

```powershell
npm pack
dsh plugin --profile <p> add ./dsh-personal-directive-0.2.0.tgz
```

打包安装同样会安装依赖。修改源码后需重新打包并重装，并重启 `dsh web` 才能加载新的 Host 或 Web 客户端代码。

### 从本地 link 切换到 GitHub 版本

如果 profile 中已经存在同名本地 link，先移除旧依赖：

```powershell
dsh plugin --profile web remove dsh-personal-directive
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

### 更新

从 GitHub 安装后更新到最新版本：

```powershell
dsh plugin --profile web update dsh-personal-directive
```

更新后完全重启 `dsh web`。

### 卸载

卸载只会移除插件，不会删除用户其他 bundle：

```powershell
dsh plugin --profile web remove dsh-personal-directive
```

本项目顶部的「指令：开启 / 指令：关闭」是运行时开关，不等同于上述卸载命令。

## 兼容性

| 方面 | 状态 |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-alpha.1`（钉在 `0.2.1-alpha.1` 线：devDependencies 中的 `@deepseek-ai/dsh-typert-registry` 与 dependencies 中的 `@deepseek-ai/dsh-typert-protocol` 均在该线；由 `pnpm run harness:check` 与 `pnpm test` 门禁把关；peer 区间亦接纳 `>=0.2.1-0 <0.3.0`） |

## 项目来源

原版项目：

- GitHub：https://github.com/Minglink/dsh-infinite-gen-1
- 项目名称：dsh-infinite-gen-1 / 无限一代（Infinite Generation One）
- 原作者：Minglink

本框架版保留原版的插件结构（提示词段注入、`personal_directive_profile` 工具、Web 顶部开关），在此基础上增加 Web 顶部可视化控制，并将提示词内容替换为中性占位指令（见「归属和许可证说明」）。本仓库是 [liucaimao2026/dsh-personal-directive](https://github.com/liucaimao2026/dsh-personal-directive) 的维护性 fork，上游归属完整保留。

## 二次开发内容

相较原版仓库，本项目主要增加了以下功能：

- 在 DeepSeek Harness Web 顶部「完成提示」后注册「指令：开启 / 指令：关闭」按钮。
- 使用运行时远程接口切换提示词状态，不通过卸载插件切换。
- 插件保持安装和加载，关闭时仅让个人指令系统提示词段返回空内容。
- 开启或关闭后，状态只影响后续模型请求，不修改已经发出的请求。
- 保留原版 `personal_directive_profile` 工具形态（原版名为 `infinite_gen1_profile`）。
- 依赖来自 npm registry（本地开发可直接修改源码后重新打包安装）。

开关位置由 DSH UI 槽位控制：

```text
conversation.session.header.actions
```

本项目使用顺序 `1010`，用于排在现有「完成提示」按钮之后。

## 目录结构

```text
dsh-personal-directive/
├── index.js                         # Harness 服务端插件入口和运行时开关
├── lib/
│   └── client.js                    # 顶部可视化开关
├── scripts/
│   ├── check-client-contract.mjs    # 宿主契约检查（符号存在性门禁）
│   ├── check-typert-codec.mjs       # Typert codec 门禁（create() 单面）
│   ├── probe-typert-codec-contract.mjs  # 对已装宿主实测 codec 契约
│   └── lib/                         # 门禁共用的解析/取源/改写 helper
├── prompts/
│   └── personal-directive.md        # 中性占位指令（可替换为自己的内容）
├── cordis.patch.yml                 # Bundle 插入声明
├── package.json                     # Harness bundle/client 元数据
├── pnpm-lock.yaml                   # 本地依赖锁定文件
└── README.md
```

## 环境要求

- 已安装 DeepSeek Harness，且 `dsh web` 可以正常启动。
- `dsh plugin` 命令可用。
- `pnpm` 已加入 PATH。
- 当前安装教程面向 `web` profile。

## 使用开关

重启后，在顶部找到：

```text
完成提示    指令：开启
```

点击后切换为：

```text
完成提示    指令：关闭
```

这里的开关只控制运行时提示词是否生效：

- 开启：下一次模型请求包含 `prompts/personal-directive.md` 中的个人指令。
- 关闭：插件仍然安装，但本项目的系统提示词段为空。
- 不会从 profile 的 `dependencies` 中移除插件。
- 不会从 `dsh.profile.bundles` 中移除插件。
- 不会删除个人插件目录。

## 验证是否生效

### 顶部状态

按钮显示「指令：开启」或「指令：关闭」，表示服务端运行时开关状态。

### 查看真实模型请求

1. 切换到「指令：开启」。
2. 新建会话并发送一条普通消息。
3. 打开顶部「轨迹」。
4. 选中刚才的 Assistant 请求。
5. 打开右侧的「System Prompt / 系统提示词」详情。
6. 搜索以下占位指令特征：

```text
# Personal Directive
```

开启时可以看到这些内容。切换为「指令：关闭」后发送一条新的消息，再检查新的请求，应该看不到这些特征。

注意：关闭后 Harness 自己的其他系统提示词仍然存在，本项目只移除自己的提示词段。

## 本地开发和检查

```powershell
cd <本仓库目录>
pnpm install --ignore-workspace
pnpm run harness:check
pnpm test
```

除语法检查外，`harness:check` 还会运行**宿主契约检查**（`scripts/check-client-contract.mjs`）：它取 `lib/client.js` 从 `@deepseek-ai/dsh-client-ui-primitives` 解构出的每个符号，逐个对照宿主的类型面（`lib/types/**/*.d.ts`）**与**运行时导出（`lib/index.js`）；同时也校验传给 `Button` 的 `variant` 取值仍属于宿主的 `ButtonVariant` 联合类型。**宿主删掉的符号会被点名报错并以非零码退出**，因此这类「静默不挂载」的缺陷不会再从 `node --check` 底下溜过去——语法检查只证明文件能解析，而 `React.createElement(undefined)` 要等 React 真正渲染时才抛错。

检查会自行定位宿主 checkout（本仓库旁的 `deepseek-harness`、某个祖先目录，或常见盘符根），也可显式指定：

```powershell
node scripts/check-client-contract.mjs --host D:/deepseek-harness
$env:DSH_HOST_ROOT = "D:/deepseek-harness"; pnpm run check:client-contract
```

若它报告找不到宿主 checkout，把 `DSH_HOST_ROOT` 指向你的 DeepSeek Harness 目录即可。

`harness:check` 还会运行 **Typert codec 门禁**（`scripts/check-typert-codec.mjs`）。Typert 调用 codec 的形态是 `{ mode: 'strict', typeSymbol, create }`；0.1.5 线写的是 `{ mode, typeSymbol, schema }`，而 0.1.7 宿主在挂载时直接拒收旧形态——`validateCodec` 抛 `typert: <id> result strict codec has no create() factory`，插件行不激活，而本仓其他任何检查都看不见它：旧字面量是完全合法的对象，`node --check` 过、stub Context 也照收。这个门禁就是那条宿主规则的本地镜像：它构造两面各自的真实产物——`index.js` 导出的 `TYPERT` manifest，以及 `lib/client.js` 交给 `ctx.remote.$mount` 的 contribution——遍历每个 descriptor，断言每个 codec 都带 `create()` **函数**且不含 `schema` 成员，并点名出错的 invocation id。`test/typert-mount.test.mjs` 更进一步：把两面注册进真实 `@deepseek-ai/dsh-typert-registry` + 真实 Cordis `Context`，再在内存里重建被拒的 0.1.5 线 codec，断言该注册器确实拒收——以此证明门禁**能红**。

```powershell
node scripts/check-typert-codec.mjs
```

`scripts/probe-typert-codec-contract.mjs` 回答另一半问题，而且是对**已安装的宿主**实测、而不是对本仓理解的复述：它把 `{ mode, typeSymbol, schema }` 与 `create()` 两种 codec 分别注册到两面的真实注册器上，断言前者被拒、后者被接受。宿主线升级后跑一次，即可重新测量门禁所依赖的前提。

```powershell
pnpm run probe:typert-codec
```

检查 Web profile 的 bundle 组合：

```powershell
dsh --profile web --dump-config
```

输出中应该包含：

```text
id: personal-directive
name: dsh-personal-directive
```

## 安全和使用范围

本框架版**不包含原版提示词内容**：随包发布的是中性占位指令（`prompts/personal-directive.md`），运行时行为与任何"系统提示词段注入"插件相同，仅影响你自己提供的指令文本。

本项目不修改模型权重，也不绕过远端模型服务的独立安全策略、操作系统权限或 Harness 的实际工具权限。

## 归属和许可证说明

本项目明确基于以下原版项目进行二次开发：

```text
https://github.com/Minglink/dsh-infinite-gen-1
```

原版作者和原始项目归属应得到保留。

本仓库根目录的 `LICENSE` 是本仓库维护者为本项目新增代码和集成代码提供的 MIT 声明。它不自动替代原版项目的版权，也不代表原作者的原始提示词和原始代码已经被重新许可。

截至本项目整理时，原版仓库没有发现明确的 `LICENSE` 文件或 GitHub 许可证标识。因此，本框架版采用原版 README 指引中的第三种许可路径：**仅发布不包含原版提示词的代码框架**——`prompts/personal-directive.md` 已替换为中性占位指令，用户可自行提供自己的指令内容（原版路径见上述 GitHub 链接，请自行核对原版许可状态）。

本仓库的 MIT 声明不应被解释为原作者对原版内容的授权。如原作者后续补充许可证，请同步更新本节和仓库中的许可证文件。

## 致谢

感谢原项目作者 Minglink 提供 `dsh-infinite-gen-1` 的原始实现和提示词方案，感谢 liucaimao2026 的框架实现。本仓库仅在其基础上增加个人目录管理、Harness Web 顶部运行时开关和相关集成代码。

## PerryLink DSH Plugin Family

本项目是 [PerryLink](https://github.com/PerryLink) 维护的 DeepSeek Harness 插件家族成员：**87 个活跃维护**，名册共 **95** 个，其中 **5 个已冻结**、**3 个已退役**。完整名单默认折叠，避免每个 README 的首屏被长表淹没；点击展开可查看每一行，原因见「状态」列。

<details>
<summary>展开全部 95 个插件</summary>

| 插件 | 一句话 | 状态 |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 已退役 — 见仓库 README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 已冻结 — 见仓库 README |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 已冻结 — 见仓库 README |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 已冻结 — 见仓库 README |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 已冻结 — 见仓库 README |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 已冻结 — 见仓库 README |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 已退役 — 见仓库 README |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 已退役 — 见仓库 README |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>
