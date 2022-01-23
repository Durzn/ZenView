import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const { resolve } = require('path');
const { readdir } = require('fs').promises;

let comfortPaths: Array<vscode.Uri> = [];
//let comfortPaths: Array<vscode.Uri> = [vscode.Uri.file('F:/Sync/TestProject/Cfg5'), vscode.Uri.file('F:/Sync/TestProject/Implementation')];

export function activate(context: vscode.ExtensionContext) {
  let rootPath: vscode.Uri | undefined = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined;
  if (!rootPath) {
    vscode.window.showInformationMessage('This extension only works within workspaces.');
    return;
  }
  if (comfortPaths.length === 0) {
    comfortPaths = [rootPath];
  }
  const comfortViewProvider = new ComfortViewProvider(rootPath);
  vscode.window.registerTreeDataProvider('comfortView', comfortViewProvider);
}

export class ComfortViewProvider implements vscode.TreeDataProvider<ComfortViewFile> {
  constructor(private workspaceRoot: vscode.Uri) { }

  getTreeItem(element: ComfortViewFile): vscode.TreeItem {
    return element;
  }

  resolveTreeItem(item: vscode.TreeItem, element: ComfortViewFile, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
    item.label = element.label;
    return item;
  }

  async getChildren(element?: ComfortViewFile): Promise<ComfortViewFile[]> {
    if (!vscode.workspace) {
      vscode.window.showInformationMessage('This extension only works within workspaces.');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve([]);
    }
    else { /* root */
      let comfortViewFiles: ComfortViewFile[] = [];
      for (let comfortPath of comfortPaths) {
        comfortViewFiles.push(this.convertFileToComfortFile(comfortPath, FileType.directory));
        for await (const file of this.getFiles(comfortPath)) {
          comfortViewFiles.push(file);
        }
      }
      return comfortViewFiles;
    }
  }

  private async* getFiles(dir: vscode.Uri): AsyncGenerator<ComfortViewFile> {
    const dirents = await readdir(dir.fsPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir.fsPath, dirent.name);
      if (dirent.isDirectory()) {
        yield* this.getFiles(vscode.Uri.file(res));
        yield this.convertFileToComfortFile(vscode.Uri.file(res), FileType.directory);
      } else {
        yield this.convertFileToComfortFile(vscode.Uri.file(res), FileType.file);
      }
    }
  }

  private convertFileToComfortFile(file: vscode.Uri, fileType: FileType) {
    let collapsibleState = fileType === FileType.directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
    return new ComfortViewFile(file, collapsibleState, fileType);
  }
}

const ext = vscode.extensions.getExtension("vscode.vscode-theme-seti");
console.log(ext!.packageJSON.contributes.iconThemes[0].id); // 'vs-seti'
const themePath = path.join(ext!.extensionPath, ext!.packageJSON.contributes.iconThemes[0].path);

class ComfortViewFile extends vscode.TreeItem {
  constructor(
    public readonly fileUri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly fileType: FileType
  ) {
    super(fileUri.path.toString(), collapsibleState);
    this.fileType = fileType;
  }
}

enum FileType {
  file,
  directory
};