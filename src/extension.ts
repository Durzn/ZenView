import * as vscode from 'vscode';
import { ZenViewProvider } from './ZenViewProvider';
import { zenViewGlobals } from './ZenViewGlobals';
import { ConfigHandler, FilePathType } from './ConfigHandler';

const zenViewProvider = new ZenViewProvider();

export function activate(context: vscode.ExtensionContext) {
  let rootPath: vscode.Uri | undefined = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined;
  if (!rootPath) {
    /* The extension does not work without a workspace. */
    return;
  }
  vscode.window.registerTreeDataProvider('zenView', zenViewProvider);
  vscode.commands.registerCommand('zenView.open', (fileUri) => {
    vscode.commands.executeCommand('vscode.open', fileUri);
  });
  vscode.commands.registerCommand('zenView.addRelativePath', (fileUri: vscode.Uri) => {
    ConfigHandler.addZenPath(rootPath!, fileUri, FilePathType.relative);
    onConfigChange();
  });
  vscode.commands.registerCommand('zenView.addAbsolutePath', (fileUri: vscode.Uri) => {
    ConfigHandler.addZenPath(rootPath!, fileUri, FilePathType.absolute);
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