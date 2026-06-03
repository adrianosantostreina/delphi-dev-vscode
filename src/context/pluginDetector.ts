import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const PLUGIN_KEY_PREFIX = 'delphi-dev@';
const WARNING_DISMISSED_KEY = 'delphiDev.pluginWarningDismissed';
const PLUGIN_REPO_URL = 'https://github.com/adrianosantostreina/delphi-dev';

const INSTALL_COMMANDS = [
  '/plugin marketplace add adrianosantostreina/delphi-dev',
  '/plugin install delphi-dev@delphi-dev',
].join('\n');

let warningShownThisSession = false;

function getClaudeConfigDir(): string {
  const override = process.env.CLAUDE_CONFIG_DIR;
  if (override && override.trim().length > 0) {
    return override;
  }
  return path.join(os.homedir(), '.claude');
}

/**
 * Best-effort detection of the delphi-dev Claude Code plugin.
 * Reads ~/.claude/plugins/installed_plugins.json (or $CLAUDE_CONFIG_DIR) and
 * looks for any plugin key starting with "delphi-dev@". On any read/parse
 * failure it returns false so the user still gets installation guidance.
 */
export function isDelphiDevPluginInstalled(): boolean {
  try {
    const filePath = path.join(getClaudeConfigDir(), 'plugins', 'installed_plugins.json');
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as { plugins?: Record<string, unknown> };
    const plugins = data.plugins ?? {};
    return Object.keys(plugins).some((key) => key.startsWith(PLUGIN_KEY_PREFIX));
  } catch {
    return false;
  }
}

/**
 * Shows a non-blocking warning (at most once per session, or never again if the
 * user dismisses it permanently) when the delphi-dev plugin is missing. Does not
 * prevent the command from running — detection may be wrong on custom setups.
 */
export async function warnIfPluginMissing(context: vscode.ExtensionContext): Promise<void> {
  if (isDelphiDevPluginInstalled()) {
    return;
  }
  if (context.globalState.get<boolean>(WARNING_DISMISSED_KEY, false)) {
    return;
  }
  if (warningShownThisSession) {
    return;
  }
  warningShownThisSession = true;

  const action = await vscode.window.showWarningMessage(
    'The delphi-dev plugin was not found in Claude Code. Delphi Dev commands rely on it. ' +
      'Install it inside Claude Code and run the command again.',
    'Copy install commands',
    'Open plugin page',
    "Don't show again"
  );

  if (action === 'Copy install commands') {
    await vscode.env.clipboard.writeText(INSTALL_COMMANDS);
    vscode.window.showInformationMessage(
      'Install commands copied. Paste them into the Claude Code chat (one per line).'
    );
  } else if (action === 'Open plugin page') {
    await vscode.env.openExternal(vscode.Uri.parse(PLUGIN_REPO_URL));
  } else if (action === "Don't show again") {
    await context.globalState.update(WARNING_DISMISSED_KEY, true);
  }
}
