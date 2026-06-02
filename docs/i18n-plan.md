# Plano de Internacionalização (i18n) — delphi-dev-vscode

**Data:** 2026-04-10
**Versão-alvo:** 0.2.0
**Contexto:** [adrianosantostreina/delphi-dev#1](https://github.com/adrianosantostreina/delphi-dev/issues/1) — usuário pediu suporte a inglês no plugin `delphi-dev`. Esta extensão VSCode atua como front-end do plugin, então precisa acompanhar: permitir alternar idioma da UI **e** propagar essa escolha para os prompts enviados ao Claude Code.

---

## 1. Diagnóstico do estado atual

A config `delphiDev.language` já está **declarada** em [package.json:186-194](../package.json#L186-L194) com enum `["pt-BR", "en"]` e default `pt-BR`, mas **não é lida em lugar nenhum** do código TypeScript. Hoje a extensão:

- Está 100% em **inglês** no manifesto ([package.json](../package.json)) — titles, descriptions, welcome view.
- Está 100% em **inglês** nas strings de runtime em TS ([claudeCodeBridge.ts](../src/commands/claudeCodeBridge.ts), [claudeignore.ts](../src/features/claudeignore.ts), [statusBar.ts](../src/context/statusBar.ts), [delphiCommandsProvider.ts](../src/views/delphiCommandsProvider.ts)).
- Tem o **conteúdo do `.claudeignore`** com comentários em **português** hardcoded em [claudeignore.ts:3-65](../src/features/claudeignore.ts#L3-L65).
- **Não envia idioma** ao plugin `delphi-dev` via o URI handler em [claudeCodeBridge.ts:5-17](../src/commands/claudeCodeBridge.ts#L5-L17).

**Conclusão:** o `delphiDev.language` é hoje uma config "morta". Nada está i18n-ready.

---

## 2. Estratégia recomendada

VSCode oferece **dois mecanismos nativos** que devemos usar em conjunto:

### 2.1. `package.nls.json` — tradução do manifesto
- Arquivo `package.nls.json` na raiz = strings default (inglês, padrão de marketplace).
- Arquivo `package.nls.pt-br.json` = tradução pt-BR.
- No `package.json`, substitui strings literais por chaves `%nome.da.chave%`.
- VSCode carrega automaticamente de acordo com o idioma da **UI do próprio VSCode** (não da nossa config).

### 2.2. `vscode.l10n` — tradução de strings de runtime
- API nativa desde VSCode 1.73+ (já compatível com nosso `engines.vscode ^1.98.0`).
- Arquivos `l10n/bundle.l10n.json` (default) e `l10n/bundle.l10n.pt-br.json`.
- Uso: `vscode.l10n.t('Chave da mensagem')`.
- Declarada no `package.json` via campo `"l10n": "./l10n"`.
- **Vantagem:** API oficial, substitui `vscode-nls` (deprecado).

### 2.3. Configuração `delphiDev.language` — para quê serve então?
Papel **separado e bem definido**: escolher o idioma dos **prompts enviados ao Claude Code / plugin delphi-dev**. Não confundir com o idioma da UI da extensão.

- UI da extensão (manifesto + runtime) → segue o idioma do **VSCode** (`vscode.env.language`).
- Prompts para o plugin → seguem `delphiDev.language`.
- Default inteligente: se `delphiDev.language` não foi explicitamente alterado, herda de `vscode.env.language` (se começar com `pt` → `pt-BR`, senão → `en`).

---

## 3. Como o idioma deve ser propagado ao plugin `delphi-dev`

Hoje [claudeCodeBridge.ts:6](../src/commands/claudeCodeBridge.ts#L6) só envia o slash command puro (ex.: `/review @file.pas`). Precisamos combinar com o plugin do lado Claude Code **um contrato** para o idioma. Duas opções:

### Opção A (recomendada) — Argumento no slash command
O plugin `delphi-dev` aceita um flag/arg opcional de idioma:
```
/review @file.pas --lang=en
/audit --lang=pt-BR
```
Vantagem: explícito, auditável no histórico do Claude Code, não depende de estado externo.

### Opção B — Prefixo instrucional
A extensão prefixa o prompt com uma instrução:
```
[language: en] /review @file.pas
```
Vantagem: não precisa mudar o plugin. Desvantagem: frágil, depende do LLM interpretar.

**Decisão proposta:** Opção A, com fallback implícito (se nenhum `--lang` for enviado, o plugin usa o default dele). A extensão sempre envia `--lang=<valor>` para deixar o comportamento determinístico.

---

## 4. Escopo das mudanças (checklist de implementação)

### 4.1. Manifesto (`package.json` + `package.nls*.json`)

- [ ] Criar `package.nls.json` (default inglês) com chaves para:
  - `displayName`, `description`
  - Todos os `command.title` (8 comandos)
  - `viewsContainers.title` (`Delphi Dev`)
  - `views.name` (`Commands`)
  - `viewsWelcome.contents`
  - `configuration.title`
  - Todos os `configuration.properties.*.description`
- [ ] Criar `package.nls.pt-br.json` com as traduções.
- [ ] Substituir strings literais no [package.json](../package.json) por `%chaves%`.
- [ ] Adicionar campo `"l10n": "./l10n"` ao `package.json`.

### 4.2. Strings de runtime (`l10n/bundle.l10n.json` + `.pt-br.json`)

Identificar e mover para bundle:
- [ ] [claudeCodeBridge.ts:24](../src/commands/claudeCodeBridge.ts#L24) — `"Claude Code extension not found..."`, `"Install Claude Code"`
- [ ] [claudeignore.ts:98-107](../src/features/claudeignore.ts#L98-L107) — mensagem de detecção, `"Create"`, `"Not now"`, `".claudeignore created successfully."`
- [ ] [claudeignore.ts:118-141](../src/features/claudeignore.ts#L118-L141) — `"No workspace folder open."`, `".claudeignore already exists..."`, `"Overwrite"`, `"Cancel"`, `".claudeignore created with Delphi defaults."`
- [ ] [statusBar.ts:8-9](../src/context/statusBar.ts#L8-L9) — `"Delphi Dev"`, `"Delphi Dev for Claude Code - Click for commands"`
- [ ] [delphiCommandsProvider.ts:11-48](../src/views/delphiCommandsProvider.ts#L11-L48) — os 6 pares `label` + `description` (⚠️ idealmente usar as mesmas chaves do `package.nls` quando sobrepostos)

Substituir por `vscode.l10n.t('chave')`.

### 4.3. Conteúdo do `.claudeignore`

[claudeignore.ts:3-65](../src/features/claudeignore.ts#L3-L65) tem comentários em português hardcoded. Opções:

- **4.3.a (simples):** Criar duas constantes (`CLAUDEIGNORE_CONTENT_EN`, `CLAUDEIGNORE_CONTENT_PTBR`) e escolher baseado em `vscode.env.language`.
- **4.3.b (melhor):** Reescrever os comentários em **inglês apenas** (é um arquivo de configuração técnica, não UI). Manter uma única versão.

**Decisão proposta:** 4.3.b — simplicidade. Comentários técnicos em inglês são padrão de mercado.

### 4.4. Propagação ao plugin — `claudeCodeBridge.ts`

- [ ] Criar helper `getPromptLanguage(): 'pt-BR' | 'en'` que:
  1. Lê `delphiDev.language` via `vscode.workspace.getConfiguration`.
  2. Se não definido explicitamente → deriva de `vscode.env.language`.
- [ ] Modificar `sendToClaudeCode(prompt)` para receber/acrescentar `--lang=<valor>` automaticamente.
- [ ] Alinhar com o repo `delphi-dev` (plugin) para implementar o parsing do `--lang` nos comandos. **Esta parte é no outro repositório.**

### 4.5. Configuração do idioma dos prompts — UX

- [ ] Adicionar descrição melhor em `delphiDev.language` explicando que isto afeta **apenas os prompts enviados ao plugin**, não a UI da extensão.
- [ ] Adicionar opção `"auto"` como default (herda do VSCode). Enum passa a `["auto", "pt-BR", "en"]`.
- [ ] (Opcional) Comando `delphi-dev.selectPromptLanguage` que mostra um QuickPick pra trocar rápido sem abrir settings.

### 4.6. Snippets

- [ ] Avaliar se os `description` dos 12 snippets em [snippets/delphi.json](../snippets/delphi.json) precisam ser traduzidos. **Decisão proposta:** manter em inglês — snippet descriptions são muito curtas e ficam visíveis na lista do autocomplete. Padrão do ecossistema VSCode é inglês.

### 4.7. README

- [ ] Criar `README.pt-br.md` na raiz.
- [ ] Adicionar no topo do `README.md` um link "🇧🇷 Leia em Português" apontando para ele (e vice-versa).

---

## 5. Estrutura final esperada

```
delphi-dev-vscode/
├── package.json                 (com chaves %...%)
├── package.nls.json             (default: en)
├── package.nls.pt-br.json       (pt-BR)
├── l10n/
│   ├── bundle.l10n.json         (default: en)
│   └── bundle.l10n.pt-br.json   (pt-BR)
├── README.md                    (en)
├── README.pt-br.md              (pt-BR)
├── docs/
│   └── i18n-plan.md             (este arquivo)
└── src/
    ├── utils/
    │   └── language.ts          (NOVO — getPromptLanguage)
    └── ... (strings migradas para vscode.l10n.t)
```

---

## 6. Ordem de execução sugerida

1. **Criar `package.nls.json` + `package.nls.pt-br.json`** e parametrizar o manifesto. *Resultado visível: title/description do marketplace aparecem em pt-BR se VSCode estiver em pt-BR.*
2. **Adicionar bundle `l10n/`** e migrar strings de runtime com `vscode.l10n.t`.
3. **Reescrever comentários do `.claudeignore` em inglês** (item 4.3.b).
4. **Implementar `getPromptLanguage()`** e propagar `--lang` em [claudeCodeBridge.ts](../src/commands/claudeCodeBridge.ts). Coordenar com o repo `delphi-dev` para ele aceitar o flag.
5. **Adicionar opção `"auto"`** à config `delphiDev.language` e atualizar descrição.
6. **Criar `README.pt-br.md`** e linkar do README principal.
7. **Subir versão para 0.2.0** no [package.json](../package.json#L5) e atualizar [CHANGELOG.md](../CHANGELOG.md).

---

## 7. Verificação

Como testar end-to-end após implementar:

1. `npm run build` — compilar sem erros.
2. Rodar `F5` no VSCode para abrir o **Extension Development Host**.
3. **Cenário 1 — UI em pt-BR:** Configurar VSCode pra exibir em português (pacote `MS-CEINTL.vscode-language-pack-pt-BR`), abrir a extensão, verificar se sidebar, menus, comandos do palette e mensagens aparecem em português.
4. **Cenário 2 — UI em inglês:** VSCode em inglês, reabrir, verificar que tudo aparece em inglês.
5. **Cenário 3 — Prompts em inglês com UI em pt-BR:** VSCode em pt-BR, mas `delphiDev.language = "en"`. Clicar `Review Code`, verificar no Claude Code que o slash command chegou com `--lang=en`.
6. **Cenário 4 — Auto:** `delphiDev.language = "auto"`, UI em português → `--lang=pt-BR` no slash command. UI em inglês → `--lang=en`.

---

## 8. Dependências externas

- **Repo [adrianosantostreina/delphi-dev](https://github.com/adrianosantostreina/delphi-dev):** precisa aceitar o flag `--lang` nos slash commands E ter os templates/prompts internos traduzidos. A tradução lá vai acontecer em paralelo (conforme resposta da issue #1).
- **Alinhamento entre repos:** quando o plugin tiver suporte ao flag, liberamos a versão 0.2.0 da extensão. Antes disso, podemos entregar apenas o i18n da UI (itens 4.1, 4.2, 4.3, 4.7) numa 0.1.1 intermediária.
