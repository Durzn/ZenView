import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let comfortPaths: Array<vscode.Uri> = [];

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

  getChildren(element?: ComfortViewFile): Thenable<ComfortViewFile[]> {
    if (!vscode.workspace) {
      vscode.window.showInformationMessage('This extension only works within workspaces.');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve([]);
    }
    else {
      for (let comfortPath of comfortPaths) {
        let files: Promise<ComfortViewFile[]> = this.getComfortViewFilesRecursively(comfortPath);
        return files;
      }
    }
    return Promise.resolve([]);
  }

  private getComfortViewFilesRecursively(startUri: vscode.Uri): Promise<ComfortViewFile[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(startUri.fsPath, (err, files) => err === null ? resolve(this.convertFilesToComfortFiles(files)) : reject(err));
    });
  }

  private convertFilesToComfortFiles(files: string[]) {
    let comfortViewFiles: ComfortViewFile[] = [];
    for (let file of files) {
      comfortViewFiles.push(new ComfortViewFile(vscode.Uri.file(file), vscode.TreeItemCollapsibleState.None));
    }
    return comfortViewFiles;
  }
}

const ext = vscode.extensions.getExtension("vscode.vscode-theme-seti");
console.log(ext!.packageJSON.contributes.iconThemes[0].id); // 'vs-seti'
const themePath = path.join(ext!.extensionPath, ext!.packageJSON.contributes.iconThemes[0].path);

class ComfortViewFile extends vscode.TreeItem {
  constructor(
    public readonly fileUri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(fileUri.path.toString(), collapsibleState);
  }

  iconPath = {
    light: themePath,
    dark: themePath
  };
}