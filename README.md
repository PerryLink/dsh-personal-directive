# dsh-personal-directive

> ⚠️ 此项目已从 DSH 生态撤除，不再参与任何目录收录（2026-09-13）。
> ⚠️ This project has been withdrawn from the DSH ecosystem and no longer participates in any catalog listing (2026-09-13).

- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add dsh-personal-directive` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).

DeepSeek Harness 的「无限一代」二次开发**框架版**：保留原版仓库的插件形态（系统提示词注入 + 工具 + 顶部运行时开关），但**不随包发布原版提示词内容**——改用中性占位指令，用户可自行替换为自己的个人指令。

> 本项目是基于原项目的个人二次开发版本，不是原作者的官方发布版本。

## 项目来源

原版项目：

- GitHub：https://github.com/Minglink/dsh-infinite-gen-1
- 项目名称：dsh-infinite-gen-1 / 无限一代（Infinite Generation One）
- 原作者：Minglink

本框架版保留原版的插件结构（提示词段注入、`personal_directive_profile` 工具、Web 顶部开关），在此基础上增加 Web 顶部可视化控制，并将提示词内容替换为中性占位指令（见「归属和许可证说明」）。

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

## Local development and checks

```powershell
cd <this repository>
pnpm install --ignore-workspace
pnpm run harness:check
pnpm test
```

Beyond the syntax check, `harness:check` runs the **host contract check** (`scripts/check-client-contract.mjs`). It takes every symbol `lib/client.js` destructures out of the host's `@deepseek-ai/dsh-client-ui-primitives`, and verifies each one against the host's own type surface (`lib/types/**/*.d.ts`) **and** its runtime exports (`lib/index.js`); it also checks that the `variant` values passed to `Button` still belong to the host's `ButtonVariant` union. **A symbol the host dropped is reported by name with a non-zero exit**, so this class of silent non-mounting regression can no longer slip past `node --check` — which only proves the file parses, while `React.createElement(undefined)` does not throw until React renders it.

The check locates a host checkout automatically (a `deepseek-harness` sibling of this repository, an ancestor directory, or a known drive root), or you can point it explicitly:

```powershell
node scripts/check-client-contract.mjs --host D:/deepseek-harness
$env:DSH_HOST_ROOT = "D:/deepseek-harness"; pnpm run check:client-contract
```

If it reports that no host checkout could be found, set `DSH_HOST_ROOT` to your DeepSeek Harness checkout.

`harness:check` also runs the **Typert codec check** (`scripts/check-typert-codec.mjs`). A Typert invocation codec is `{ mode: 'strict', typeSymbol, create }`; on the 0.1.5 line it was `{ mode, typeSymbol, schema }` instead, and the 0.1.7 host refuses the old form at mount — `validateCodec` throws `typert: <id> result strict codec has no create() factory`, the plugin row does not activate, and nothing else in this repository can see it: the old literal is a perfectly valid object, so `node --check` passes and a stub Context accepts it. The check is the local mirror of that host rule. It builds both faces' real artifacts — `index.js`'s exported `TYPERT` manifest and the contribution `lib/client.js` hands to `ctx.remote.$mount` — walks every descriptor, and asserts each codec carries a `create()` **function** and no `schema` member, naming the offending invocation id. `test/typert-mount.test.mjs` goes further and registers both faces with a real `@deepseek-ai/dsh-typert-registry` on a real Cordis `Context`, then rebuilds the rejected 0.1.5-line codec in memory and asserts the registry refuses it — so the gate is proven able to fail.

```powershell
node scripts/check-typert-codec.mjs
```

`scripts/probe-typert-codec-contract.mjs` answers the other half of the question against the *installed* host rather than this repository's reading of it: it registers a `{ mode, typeSymbol, schema }` codec and a `create()` codec on both faces with the real registry, and asserts the first is refused and the second accepted. Run it after a host-line bump to re-measure the assumption the gate encodes.

```powershell
pnpm run probe:typert-codec
```

Checking the Web profile's bundle composition:

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

感谢原项目作者 Minglink 提供 `dsh-infinite-gen-1` 的原始实现和提示词方案。本仓库仅在其基础上增加个人目录管理、Harness Web 顶部运行时开关和相关集成代码。
