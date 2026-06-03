# Delphi Dev for Claude Code

VS Code extension that integrates the [delphi-dev](https://github.com/adrianosantostreina/delphi-dev) Claude Code plugin with Visual Studio Code.

Transform Claude Code into a **senior Delphi expert** with code review, technical audit, TDD, SPEC generation, and coding standards enforcement — all accessible from the VS Code UI.

## Requirements

This extension is a **front-end** for the delphi-dev Claude Code plugin. It needs **two** things to work:

1. **Claude Code VS Code Extension** — [install from the marketplace](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code). This is installed automatically as a dependency when you install Delphi Dev.
2. **delphi-dev plugin inside Claude Code** — this is a *Claude Code plugin*, **not** a VS Code extension, so it is **not** installed automatically. Install it once by running these two commands in the Claude Code chat:

   ```text
   /plugin marketplace add adrianosantostreina/delphi-dev
   /plugin install delphi-dev@delphi-dev
   ```

   Source: [github.com/adrianosantostreina/delphi-dev](https://github.com/adrianosantostreina/delphi-dev)

> **Without the delphi-dev plugin**, the snippets and editor defaults still work, but the sidebar/context-menu commands (Write, Review, Audit, Spec, TDD, New Project) will open Claude Code with a command it does not recognize. The extension shows a reminder with the install commands the first time this happens.

## Features

### Sidebar Commands

Access all delphi-dev commands from the activity bar:

| Command | Description |
|---------|-------------|
| **Write Code** | Create new Delphi code with all standards applied |
| **Review Code** | Quick code review detecting style violations |
| **Audit Project** | Generate a complete technical audit report |
| **Generate Spec** | Auto-generate SPEC document from source code |
| **Generate Tests (TDD)** | Generate DUnitX test suite |
| **New Project** | Scaffold a new Delphi project with standard structure |

### Context Menu

Right-click any Delphi file (`.pas`, `.dpr`, `.dfm`, `.dpk`, `.inc`, `.fmx`) in the editor or explorer to access Review, Audit, and TDD commands.

### Status Bar

A "Delphi Dev" indicator appears in the status bar when a Delphi project is detected in the workspace.

### Auto .claudeignore

When a Delphi project is detected, the extension offers to create a `.claudeignore` file that excludes binaries, compiled files, and IDE configuration — optimizing Claude Code's token usage.

### Delphi Code Snippets

12 code snippets following delphi-dev coding standards:

| Prefix | Description |
|--------|-------------|
| `dclass` | Class with strict private, constructor, destructor |
| `dintf` | Interface with GUID |
| `dservice` | Service class with constructor injection |
| `drepo` | Repository class skeleton |
| `dtry` | Try..finally block for resource management |
| `dconst` | Constant with `C_` prefix |
| `dprop` | Property with F field and A parameter |
| `dmethod` | Method with A-prefixed params, L-prefixed locals |
| `denum` | Enumerated type with mnemonic prefix |
| `dunit` | Complete unit file skeleton |
| `dtest` | DUnitX test fixture skeleton |
| `dform` | Form unit skeleton |

### Editor Defaults

Automatically configures Pascal/ObjectPascal files with:
- 2-space indentation (spaces, not tabs)
- 120-character ruler
- Word wrap off

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `delphiDev.autoCreateClaudeignore` | `true` | Offer to create .claudeignore for Delphi projects |
| `delphiDev.showStatusBar` | `true` | Show status bar indicator |
| `delphiDev.language` | `pt-BR` | Language for prompts sent to Claude Code |

## How It Works

The extension acts as a **graphical front-end** for the delphi-dev Claude Code plugin. When you click a command, it opens Claude Code with the appropriate slash command (e.g., `/review @file.pas`) pre-filled. The delphi-dev plugin handles all the AI-powered analysis.

## Author

**Adriano Santos** — [adrianosantospro@gmail.com](mailto:adrianosantospro@gmail.com)

## License

MIT
