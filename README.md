# dsh-personal-directive

DeepSeek Harness 的「无限一代」二次开发版：保留原版仓库的系统提示词和工具行为，并增加位于顶部「完成提示」后方的运行时开关。

> 本项目是基于原项目的个人二次开发版本，不是原作者的官方发布版本。

## 项目来源

原版项目：

- GitHub：https://github.com/Minglink/dsh-infinite-gen-1
- 项目名称：dsh-infinite-gen-1 / 无限一代（Infinite Generation One）
- 原作者：Minglink

本项目保留并使用原版的核心提示词文件和 `infinite_gen1_profile` 工具，在此基础上增加 Web 顶部可视化控制。

## 二次开发内容

相较原版仓库，本项目主要增加了以下功能：

- 在 DeepSeek Harness Web 顶部「完成提示」后注册「破甲：开启 / 破甲：关闭」按钮。
- 使用运行时远程接口切换提示词状态，不通过卸载插件切换。
- 插件保持安装和加载，关闭时仅让破甲系统提示词段返回空内容。
- 开启或关闭后，状态只影响后续模型请求，不修改已经发出的请求。
- 保留原版 `infinite_gen1_profile` 工具和原版提示词内容。
- 使用本地 `link:` 依赖，方便直接修改个人目录中的源码。

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
├── prompts/
│   └── personal-directive.md        # 与原版一致的核心提示词
├── cordis.patch.yml                 # Bundle 插入声明
├── package.json                     # Harness bundle/client 元数据
├── pnpm-lock.yaml                   # 本地依赖锁定文件
└── README.md
```

## 安装

以下示例针对 Windows 和 DeepSeek Harness Web profile。

### 1. 安装插件依赖

在本项目目录执行：

```powershell
cd "C:/Users/Administrator/Desktop/DSH个人插件/dsh-personal-directive"
pnpm install
```

### 2. 加入 Web profile

```powershell
dsh plugin --profile web add "link:C:/Users/Administrator/Desktop/DSH个人插件/dsh-personal-directive"
```

如果 profile 中已经存在本项目，只需执行：

```powershell
cd "$env:USERPROFILE/.dsh/profiles/web"
pnpm install
```

### 3. 重启 Harness Web

完全重启 DeepSeek Harness Web，再刷新：

```text
http://127.0.0.1:3080
```

新 bundle 需要在 Harness 启动时加载。浏览器单纯刷新不能替代首次启动时的 bundle 组装。

## 使用开关

重启后，在顶部找到：

```text
完成提示    破甲：开启
```

点击后切换为：

```text
完成提示    破甲：关闭
```

这里的开关只控制运行时提示词是否生效：

- 开启：下一次模型请求包含原版「无限一代」提示词。
- 关闭：插件仍然安装，但本项目的系统提示词段为空。
- 不会从 profile 的 `dependencies` 中移除插件。
- 不会从 `dsh.profile.bundles` 中移除插件。
- 不会删除个人插件目录。

## 验证是否生效

### 顶部状态

按钮显示「破甲：开启」或「破甲：关闭」，表示服务端运行时开关状态。

### 查看真实模型请求

1. 切换到「破甲：开启」。
2. 新建会话并发送一条普通消息。
3. 打开顶部「轨迹」。
4. 选中刚才的 Assistant 请求。
5. 打开右侧的「System Prompt / 系统提示词」详情。
6. 搜索以下原版提示词特征：

```text
[MODE: SANDBOX]
SUPREME DIRECTIVE — USER AUTHORITY
```

开启时可以看到这些内容。切换为「破甲：关闭」后发送一条新的消息，再检查新的请求，应该看不到这些原版提示词特征。

注意：关闭后 Harness 自己的其他系统提示词仍然存在，本项目只移除自己的提示词段。

## 本地开发和检查

```powershell
cd "C:/Users/Administrator/Desktop/DSH个人插件/dsh-personal-directive"
pnpm install
pnpm run harness:check
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

本项目的核心提示词来自原版仓库，可能改变模型的指令服从和拒答行为。请仅在自己拥有权限的 Harness 环境中使用，并遵守适用的法律法规、平台条款、隐私要求和工具审批策略。

本项目不修改模型权重，也不绕过远端模型服务的独立安全策略、操作系统权限或 Harness 的实际工具权限。

## 归属和许可证说明

本项目明确基于以下原版项目进行二次开发：

```text
https://github.com/Minglink/dsh-infinite-gen-1
```

原版作者和原始项目归属应得到保留。

本仓库根目录的 `LICENSE` 是本仓库维护者为本项目新增代码和集成代码提供的 MIT 声明。它不自动替代原版项目的版权，也不代表原作者的原始提示词和原始代码已经被重新许可。

截至本项目整理时，原版仓库没有发现明确的 `LICENSE` 文件或 GitHub 许可证标识。因此，公开发布包含原版提示词和原始实现的二次开发版本前，请确认以下事项之一：

- 已取得原作者允许发布二次开发版本；或
- 原作者补充了明确允许再发布和修改的许可证；或
- 仅发布不包含原版提示词的代码框架，并要求用户自行提供原始内容。

本仓库的 MIT 声明不应被解释为原作者对原版内容的授权。如原作者后续补充许可证，请同步更新本节和仓库中的许可证文件。

## 致谢

感谢原项目作者 Minglink 提供 `dsh-infinite-gen-1` 的原始实现和提示词方案。本仓库仅在其基础上增加个人目录管理、Harness Web 顶部运行时开关和相关集成代码。
