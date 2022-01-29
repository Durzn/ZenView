import * as vscode from 'vscode';
import { ZenViewProvider } from './ZenViewProvider';
import { zenViewGlobals } from './ZenViewGlobals';
import { ConfigHandler, FilePathType } from './ConfigHandler';
import { zenViewUtil } from './ZenViewUtil';

const zenViewProvider = new ZenViewProvider();

export function activate(context: vscode.ExtensionContext) {
  let rootPath: vscode.Uri | undefined = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined;
  if (!rootPath) {
    /* The extension does not work without a workspace. */
    return;
  }
  vscode.window.registerTreeDataProvider('zenView', zenViewProvider);
  vscode.commands.registerCommand('zenView.open', (fileUri) => {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(zenViewUtil.getAbsolutePath(fileUri)));
  });
  vscode.commands.registerCommand('zenView.addRelativePath', (fileUri: vscode.Uri) => {
    ConfigHandler.addZenPath(rootPath!, zenViewUtil.getRelativePath(fileUri.fsPath));
    onConfigChange();
  });
  vscode.commands.registerCommand('zenView.addAbsolutePath', (fileUri: vscode.Uri) => {
    ConfigHandler.addZenPath(rootPath!, zenViewUtil.getAbsolutePath(fileUri.fsPath));
    onConfigChange();
  });
  vscode.workspace.onDidChangeConfiguration(() => {
    onConfigChange();
  });
}

function onConfigChange() {
  zenViewGlobals.onConfigChange();
  zenViewProvider.refresh();
}