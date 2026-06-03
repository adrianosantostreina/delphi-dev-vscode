import * as vscode from 'vscode';
import { sendToClaudeCode } from './claudeCodeBridge';
import { getActiveFileContext } from '../utils/fileUtils';
import { warnIfPluginMissing } from '../context/pluginDetector';
import { COMMANDS } from '../constants';

function buildFileRef(filePath: string, lineRange?: string): string {
  if (lineRange) {
    return `@${filePath}:${lineRange}`;
  }
  return `@${filePath}`;
}

async function executeWrite(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  await sendToClaudeCode('/write');
}

async function executeAudit(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  await sendToClaudeCode('/audit');
}

async function executeReview(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  const ctx = getActiveFileContext();
  if (ctx) {
    const ref = buildFileRef(ctx.filePath, ctx.lineRange);
    await sendToClaudeCode(`/review ${ref}`);
  } else {
    await sendToClaudeCode('/review');
  }
}

async function executeSpec(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  await sendToClaudeCode('/spec');
}

async function executeTdd(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  const ctx = getActiveFileContext();
  if (ctx) {
    await sendToClaudeCode(`/tdd ${buildFileRef(ctx.filePath)}`);
  } else {
    await sendToClaudeCode('/tdd');
  }
}

async function executeNewProject(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  await sendToClaudeCode('/new-project');
}

async function executeAbout(context: vscode.ExtensionContext): Promise<void> {
  void warnIfPluginMissing(context);
  await sendToClaudeCode('/about');
}

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.WRITE, () => executeWrite(context)),
    vscode.commands.registerCommand(COMMANDS.AUDIT, () => executeAudit(context)),
    vscode.commands.registerCommand(COMMANDS.REVIEW, () => executeReview(context)),
    vscode.commands.registerCommand(COMMANDS.SPEC, () => executeSpec(context)),
    vscode.commands.registerCommand(COMMANDS.TDD, () => executeTdd(context)),
    vscode.commands.registerCommand(COMMANDS.NEW_PROJECT, () => executeNewProject(context)),
    vscode.commands.registerCommand(COMMANDS.ABOUT, () => executeAbout(context)),
  );
}
