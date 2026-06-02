# Guia de publicação no VS Code Marketplace

Guia passo a passo para publicar a extensão **delphi-dev-vscode** no Visual Studio Marketplace oficial da Microsoft.

> **Nota:** o Marketplace da Microsoft não tem processo manual de "aprovação" como a App Store. A publicação é automatizada — o sistema faz varredura de malware/vírus, valida o manifesto e a extensão fica online em poucos minutos. Revisões humanas só ocorrem se o conteúdo for denunciado.

---

## Pré-requisitos

- Conta Microsoft (qualquer conta @outlook.com, @live.com, @hotmail.com ou corporativa)
- Acesso ao [Azure DevOps](https://dev.azure.com/) (gratuito)
- [Node.js](https://nodejs.org/) instalado (já é requisito do projeto)
- `vsce` (VS Code Extension Manager) — pode ser usado via `npx`, sem instalação global

---

## Passo 1 — Criar organização no Azure DevOps

1. Acesse https://dev.azure.com/ e faça login com sua conta Microsoft
2. Crie uma nova organização (nome livre, ex: `adrianosantos`)
3. A organização é apenas um container para gerar o **Personal Access Token** — você não precisa criar projetos dentro dela

---

## Passo 2 — Gerar Personal Access Token (PAT)

1. No Azure DevOps, clique no ícone do seu usuário (canto superior direito) → **Personal Access Tokens**
2. Clique em **New Token** e preencha:
   - **Name:** `vsce-publish` (ou qualquer nome descritivo)
   - **Organization:** **All accessible organizations** ⚠️ (não escolha uma organização específica — isso quebra o login)
   - **Expiration:** até 1 ano (máximo)
   - **Scopes:** clique em **Show all scopes** na parte inferior → role até **Marketplace** → marque **Manage**
3. Clique em **Create** e **copie o token imediatamente** — ele só aparece uma única vez. Se perder, você terá que gerar outro.

Guarde o token em local seguro (gerenciador de senhas).

---

## Passo 3 — Criar Publisher no Marketplace

1. Acesse https://marketplace.visualstudio.com/manage
2. Clique em **Create publisher**
3. Preencha:
   - **ID:** **deve bater exatamente** com o campo `"publisher": "adrianosantos"` em [package.json](../package.json)
   - **Display name:** nome público que aparecerá nas extensões (ex: `Adriano Santos`)
   - **Email de contato**
4. Salve. O Publisher fica disponível imediatamente.

> Se o ID `adrianosantos` já estiver em uso por outra pessoa, você precisará mudar o campo `publisher` no `package.json` e o ID do publisher para algo único.

---

## Passo 4 — Login e publicação via vsce

Na raiz do projeto:

```bash
cd "d:/2.2 GitHub Adriano Santos/delphi-dev-vscode"

# login (cole o PAT quando pedir)
npx vsce login adrianosantos

# publicar
npx vsce publish
```

Ou publicar um `.vsix` já gerado (recomendado para ter controle sobre o que é enviado):

```bash
npx vsce publish --packagePath delphi-dev-vscode-0.1.0.vsix
```

### Incrementos automáticos de versão

`vsce` atualiza o `package.json` e publica em um comando:

```bash
npx vsce publish patch    # 0.1.0 → 0.1.1
npx vsce publish minor    # 0.1.0 → 0.2.0
npx vsce publish major    # 0.1.0 → 1.0.0
```

---

## Passo 5 — Checklist pré-publicação do package.json

Antes de rodar `vsce publish`, revise:

| Campo | Status | Observação |
|---|---|---|
| `publisher` | ⚠️ revisar | Deve ser idêntico ao ID criado no marketplace (`adrianosantos`) |
| `repository.url` | ⚠️ revisar | Deve apontar para um repositório **público** no GitHub |
| `LICENSE` | ✅ | MIT já presente |
| `icon` | ⚠️ revisar | Mínimo **128x128 PNG** em `media/delphi-dev-icon.png` |
| `README.md` | ✅ | É a vitrine da extensão — confira links |
| `CHANGELOG.md` | ✅ | Aparece na aba "Changelog" da página pública |
| `extensionDependencies` | ✅ | `["anthropic.claude-code"]` — VS Code instala automaticamente |
| `keywords` | ✅ | Ajuda na busca do marketplace |
| `categories` | ✅ | Programming Languages, Linters, Snippets, Other |

### Campos opcionais recomendados

Adicionar ao `package.json` melhora a apresentação:

```json
{
  "galleryBanner": {
    "color": "#cc2d2d",
    "theme": "dark"
  },
  "bugs": {
    "url": "https://github.com/AdrianosantosTreina/delphi-dev-vscode/issues"
  },
  "homepage": "https://github.com/AdrianosantosTreina/delphi-dev-vscode#readme"
}
```

---

## Passo 6 — Pós-publicação

- **URL pública:** `https://marketplace.visualstudio.com/items?itemName=adrianosantos.delphi-dev-vscode`
- **Propagação:** ~5 a 10 minutos até a extensão aparecer nas buscas
- **Instalação pelos usuários:** `ext install adrianosantos.delphi-dev-vscode` ou via UI do VS Code
- **Dashboard do publisher:** https://marketplace.visualstudio.com/manage — mostra downloads, ratings, trends e erros de uso

### Despublicar ou esconder

```bash
npx vsce unpublish adrianosantos.delphi-dev-vscode        # remove permanentemente
npx vsce unpublish adrianosantos.delphi-dev-vscode@0.1.0  # remove uma versão específica
```

---

## Armadilhas comuns

| Problema | Causa | Solução |
|---|---|---|
| `401 Unauthorized` ao publicar | `publisher` no `package.json` ≠ ID no marketplace | Alinhar os dois valores |
| `403 Forbidden` no login | PAT sem scope `All accessible organizations` | Gerar novo PAT com scope correto |
| `.vsix` gigante (>1MB) | `.vscodeignore` deixa passar `node_modules`/`src/` | Revisar [.vscodeignore](../.vscodeignore) |
| Ícone não aparece | PNG menor que 128x128 | Usar 128x128 ou 256x256 |
| Links quebrados na página | URLs relativas no `README.md` | Usar URLs absolutas do GitHub no README |

> **Tamanho atual do `.vsix`:** ~18KB — saudável. Mantendo o `.vscodeignore` como está, não há risco de inflar o pacote.

---

## Comandos rápidos de referência

```bash
# gerar pacote local (para testar antes de publicar)
npx vsce package

# validar o manifesto sem publicar
npx vsce ls

# login (uma vez por máquina, por publisher)
npx vsce login adrianosantos

# publicar versão atual
npx vsce publish

# publicar incrementando versão
npx vsce publish patch

# publicar .vsix específico
npx vsce publish --packagePath delphi-dev-vscode-0.1.0.vsix

# ver extensões publicadas pelo publisher
npx vsce show adrianosantos.delphi-dev-vscode
```

---

## Referências oficiais

- [Publishing Extensions — VS Code Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce README](https://github.com/microsoft/vscode-vsce)
- [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)

---

**Versão de referência:** `delphi-dev-vscode` v0.1.0
**Data do guia:** 2026-04-13
