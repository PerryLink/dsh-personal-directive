# dsh-personal-directive

> Release stamp: `0.2.9` (2026-10-04).

> ⚠️ Este projeto foi retirado do ecossistema DSH e não participa mais de nenhuma listagem de catálogo (2026-09-13).

- **Canal da loja 1024**: rode `npm i -g dsh1024` uma vez e depois `dsh1024 plugin --profile web add dsh-personal-directive` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

Edição **de framework** do fork de «Infinite Generation One» para o DeepSeek Harness: mantém a forma de plugin do repositório original (injeção de system prompt + ferramenta + chave de execução no topo), mas **não distribui o conteúdo do prompt original** — substitui-o por uma diretiva de espaço reservado neutra que você pode trocar pelas suas próprias instruções pessoais.

> Este projeto é uma edição pessoal derivada do projeto original, não uma publicação oficial do autor original.

## Instalação

### A partir do GitHub

Recomenda-se instalar direto do GitHub:

```powershell
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

Se o `dsh` não estiver no PATH, use o comando do diretório de instalação do DSH:

```powershell
& "D:/deepseek-harness/node_modules/.bin/dsh.cmd" plugin --profile web add github:PerryLink/dsh-personal-directive
```

Após a instalação, o DSH fará automaticamente:

1. Adicionar o plugin às `dependencies` de `~/.dsh/profiles/web/package.json`.
2. Adicionar `dsh-personal-directive` a `dsh.profile.bundles`.
3. Aplicar o `cordis.patch.yml` que acompanha o plugin.
4. Instalar as dependências do lado servidor e do cliente Web do plugin.

Depois reinicie completamente o `dsh web` e recarregue a página:

```text
http://127.0.0.1:3080
```

### Alternativa de instalação local (git / pack)

Indicada para desenvolvimento, alteração do código ou restauração a partir de uma cópia local. A instalação por git também instala as dependências:

```powershell
dsh plugin --profile <p> add github:PerryLink/dsh-personal-directive
```

Troque `<p>` pelo nome do perfil desejado (por exemplo `web`).

Também é possível empacotar primeiro e instalar pelo tarball local:

```powershell
npm pack
dsh plugin --profile <p> add ./dsh-personal-directive-0.2.0.tgz
```

A instalação empacotada também instala as dependências. Depois de alterar o código é preciso reempacotar, reinstalar e reiniciar o `dsh web` para carregar o novo código do Host ou do cliente Web.

### Trocar de um link local para a versão do GitHub

Se o perfil já tiver um link local com o mesmo nome, remova primeiro a dependência antiga:

```powershell
dsh plugin --profile web remove dsh-personal-directive
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

### Atualização

Para atualizar para a versão mais recente depois de instalar pelo GitHub:

```powershell
dsh plugin --profile web update dsh-personal-directive
```

Reinicie completamente o `dsh web` após atualizar.

### Desinstalação

Desinstalar remove apenas o plugin; não apaga outros bundles do usuário:

```powershell
dsh plugin --profile web remove dsh-personal-directive
```

A chave «Diretiva: ativada / Diretiva: desativada» no topo é uma chave de execução e não equivale ao comando de desinstalação acima.

## Compatibilidade

| Aspeto | Estado |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-alpha.1` (fixado na linha `0.2.1-alpha.1`: `@deepseek-ai/dsh-typert-registry` em devDependencies e `@deepseek-ai/dsh-typert-protocol` em dependencies; com os portões `pnpm run harness:check` e `pnpm test`; os intervalos peer também admitem `>=0.2.1-0 <0.3.0`) |

## Origem do projeto

Projeto original:

- GitHub: https://github.com/Minglink/dsh-infinite-gen-1
- Nome: dsh-infinite-gen-1 / 无限一代 (Infinite Generation One)
- Autor original: Minglink

Esta edição de framework mantém a estrutura do plugin original (injeção do trecho de prompt, ferramenta `personal_directive_profile`, chave no topo da Web) e adiciona um controle visual no topo da Web, além de substituir o conteúdo do prompt por uma diretiva de espaço reservado neutra (veja «Atribuição e licença»).

## O que esta edição adiciona

Em relação ao repositório original, este projeto adiciona principalmente:

- Registra os botões «Diretiva: ativada / Diretiva: desativada» no topo do DeepSeek Harness Web, logo após «concluir indicação».
- Alterna o estado do prompt pela interface remota de execução, sem desinstalar o plugin.
- O plugin permanece instalado e carregado; ao desativar, apenas o trecho de system prompt desta diretiva pessoal passa a devolver conteúdo vazio.
- Ativar ou desativar afeta somente as requisições seguintes do modelo; não altera requisições já enviadas.
- Mantém a forma da ferramenta original `personal_directive_profile` (no original chamava-se `infinite_gen1_profile`).
- As dependências vêm do registro npm (para desenvolvimento local você pode alterar o código e reempacotar/instalar).

A posição da chave é controlada por um slot da UI do DSH:

```text
conversation.session.header.actions
```

Este projeto usa a ordem `1010` para ficar depois do botão existente «concluir indicação».

## Estrutura de diretórios

```text
dsh-personal-directive/
├── index.js                         # Entrada do plugin do lado servidor do Harness e chave de execução
├── lib/
│   └── client.js                    # Chave visual do topo
├── scripts/
│   ├── check-client-contract.mjs    # Verificação do contrato do host (portão de existência de símbolos)
│   ├── check-typert-codec.mjs       # Portão do codec Typert (face única: create())
│   ├── probe-typert-codec-contract.mjs  # Mede o contrato do codec no host instalado
│   └── lib/                         # Helpers compartilhados de análise/origem/reescrita dos portões
├── prompts/
│   └── personal-directive.md        # Diretiva de espaço reservado neutra (substituível pelo seu conteúdo)
├── cordis.patch.yml                 # Declaração de inserção do bundle
├── package.json                     # Metadados de bundle/cliente do Harness
├── pnpm-lock.yaml                   # Arquivo de trava de dependências local
└── README.md
```

## Requisitos de ambiente

- DeepSeek Harness instalado e `dsh web` iniciando normalmente.
- Comando `dsh plugin` disponível.
- `pnpm` no PATH.
- Este tutorial de instalação é voltado ao perfil `web`.

## Uso da chave

Após reiniciar, procure no topo:

```text
完成提示    指令：开启
```

Ao clicar, muda para:

```text
完成提示    指令：关闭
```

Esta chave controla apenas se o prompt de execução entra em vigor:

- Ativada: a próxima requisição do modelo inclui a diretiva pessoal de `prompts/personal-directive.md`.
- Desativada: o plugin continua instalado, mas o trecho de system prompt deste projeto fica vazio.
- Não remove o plugin das `dependencies` do perfil.
- Não remove o plugin de `dsh.profile.bundles`.
- Não apaga o diretório do plugin pessoal.

## Verificar se está em vigor

### Estado no topo

O botão mostrar «Diretiva: ativada» ou «Diretiva: desativada» indica o estado da chave de execução do servidor.

### Ver a requisição real ao modelo

1. Mude para «Diretiva: ativada».
2. Crie uma sessão nova e envie uma mensagem comum.
3. Abra «Trajetória» no topo.
4. Selecione a requisição do Assistant que você acabou de fazer.
5. Abra o detalhe «System Prompt / 系统提示词» à direita.
6. Procure a seguinte característica da diretiva de espaço reservado:

```text
# Personal Directive
```

Com a chave ativada você verá esse conteúdo. Mude para «Diretiva: desativada», envie uma mensagem nova e confira a nova requisição: essas características não devem mais aparecer.

Observação: ao desativar, os outros system prompts do próprio Harness continuam presentes; este projeto remove apenas o seu próprio trecho de prompt.

## Desenvolvimento local e verificações

```powershell
cd <this repository>
pnpm install --ignore-workspace
pnpm run harness:check
pnpm test
```

Além da verificação de sintaxe, o `harness:check` roda a **verificação do contrato do host** (`scripts/check-client-contract.mjs`). Ela pega cada símbolo que `lib/client.js` desestrutura de `@deepseek-ai/dsh-client-ui-primitives` do host e verifica cada um contra a superfície de tipos do host (`lib/types/**/*.d.ts`) **e** suas exportações de execução (`lib/index.js`); também confere se os valores de `variant` passados ao `Button` ainda pertencem à união `ButtonVariant` do host. **Um símbolo removido pelo host é reportado pelo nome com saída diferente de zero**, de modo que essa classe de regressão silenciosa (não montar) não passa mais pelo `node --check` — que só prova que o arquivo é analisado, enquanto `React.createElement(undefined)` não lança até o React renderizá-lo.

A verificação localiza um checkout do host automaticamente (um `deepseek-harness` irmão deste repositório, um diretório ancestral ou uma raiz de unidade conhecida), ou você pode apontá-lo explicitamente:

```powershell
node scripts/check-client-contract.mjs --host D:/deepseek-harness
$env:DSH_HOST_ROOT = "D:/deepseek-harness"; pnpm run check:client-contract
```

Se ela informar que nenhum checkout do host foi encontrado, defina `DSH_HOST_ROOT` com o caminho do seu checkout do DeepSeek Harness.

O `harness:check` também roda a **verificação do codec Typert** (`scripts/check-typert-codec.mjs`). Um codec de invocação Typert é `{ mode: 'strict', typeSymbol, create }`; na linha 0.1.5 era `{ mode, typeSymbol, schema }`, e o host 0.1.7 recusa a forma antiga na montagem — `validateCodec` lança `typert: <id> result strict codec has no create() factory`, a linha do plugin não ativa e nada mais neste repositório consegue ver isso: o literal antigo é um objeto perfeitamente válido, então `node --check` passa e um Context de teste o aceita. A verificação é o espelho local dessa regra do host. Ela constrói os artefatos reais das duas faces — o manifesto `TYPERT` exportado por `index.js` e a contribuição que `lib/client.js` entrega a `ctx.remote.$mount` —, percorre cada descritor e exige que cada codec tenha uma **função** `create()` e nenhum membro `schema`, nomeando o id de invocação infrator. O `test/typert-mount.test.mjs` vai além: registra as duas faces com um `@deepseek-ai/dsh-typert-registry` real sobre um `Context` real do Cordis, depois reconstrói em memória o codec recusado da linha 0.1.5 e confirma que o registro o recusa — assim fica provado que o portão consegue falhar.

```powershell
node scripts/check-typert-codec.mjs
```

O `scripts/probe-typert-codec-contract.mjs` responde à outra metade da pergunta contra o host *instalado*, em vez da leitura que este repositório faz dele: registra um codec `{ mode, typeSymbol, schema }` e um codec `create()` nas duas faces com o registro real, e confirma que o primeiro é recusado e o segundo aceito. Rode-o depois de subir a linha do host para remedir a suposição que o portão codifica.

```powershell
pnpm run probe:typert-codec
```

Conferir a composição do bundle do perfil Web:

```powershell
dsh --profile web --dump-config
```

A saída deve incluir:

```text
id: personal-directive
name: dsh-personal-directive
```

## Segurança e escopo de uso

Esta edição de framework **não inclui o conteúdo do prompt original**: o que é publicado é uma diretiva de espaço reservado neutra (`prompts/personal-directive.md`); o comportamento em execução é o mesmo de qualquer plugin de «injeção de trecho de system prompt» e afeta apenas o texto de instruções que você mesmo fornece.

Este projeto não altera os pesos do modelo nem contorna as políticas de segurança independentes do serviço remoto de modelos, as permissões do sistema operacional ou as permissões reais de ferramentas do Harness.

## Atribuição e licença

Este projeto baseia-se explicitamente no seguinte projeto original:

```text
https://github.com/Minglink/dsh-infinite-gen-1
```

A atribuição ao autor original e ao projeto original deve ser preservada.

O `LICENSE` na raiz deste repositório é uma declaração MIT do mantenedor deste repositório para o código novo e o código de integração deste projeto. Ele não substitui automaticamente os direitos autorais do projeto original, nem implica que o prompt e o código originais do autor tenham sido relicenciados.

No momento da preparação deste projeto não foi encontrado no repositório original nenhum arquivo `LICENSE` explícito nem identificação de licença do GitHub. Por isso, esta edição de framework adota a terceira via de licença indicada no README original: **publicar apenas o framework de código sem o prompt original** — `prompts/personal-directive.md` foi substituído por uma diretiva de espaço reservado neutra, e cada usuário pode fornecer seu próprio conteúdo de instruções (o caminho original está no link do GitHub acima; verifique por conta própria o estado de licença do original).

A declaração MIT deste repositório não deve ser interpretada como autorização do autor original sobre o conteúdo original. Se o autor original adicionar uma licença depois, atualize esta seção e o arquivo de licença do repositório em conjunto.

## Agradecimentos

Agradecemos ao autor do projeto original, Minglink, pela implementação original e pela proposta de prompt do `dsh-infinite-gen-1`. Este repositório apenas acrescenta, sobre essa base, a gestão do diretório pessoal, a chave de execução no topo do Harness Web e o código de integração relacionado.

## PerryLink DSH Plugin Family

Este projeto é um dos **87 plugins ativamente mantidos** do DeepSeek Harness da [PerryLink](https://github.com/PerryLink). O registro da família tem **95** plugins — **5 congelados**, **3 retirados** — e fica recolhido abaixo para que cada README mantenha uma primeira tela curta. Expanda para ver cada linha, com o motivo na coluna Status.

<details>
<summary>Expandir os 95 plugins</summary>

| Plugin | Uma linha | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>
