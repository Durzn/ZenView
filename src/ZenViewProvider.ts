import * as vscode from 'vscode';
import { ZenViewFile } from './ZenViewFile';
import { zenViewGlobals } from './ZenViewGlobals';
import { zenViewUtil } from './ZenViewUtil';
import { ConfigHandler } from './ConfigHandler';
import { ZenViewAlphabeticalSorter, ZenViewFileSorterFolderFirst } from './ZenViewSorter';
import { ZenFileSystemHandler } from './ZenFileSystemHandler';
export class ZenViewProvider implements vscode.TreeDataProvider<ZenViewFile> {

  public readonly rootPath: string;

  constructor(
  ) {
    this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";

    vscode.workspace.onDidCreateFiles((e) => {
      this.refresh();
    });

    vscode.workspace.onDidRenameFiles((e) => {
      this.onRenameEvent(e);
      this.refresh();
    });

    vscode.workspace.onDidDeleteFiles((e) => {
      this.onDeleteEvent(e);
      this.refresh();
    });
  }

  getTreeItem(element: ZenViewFile): vscode.TreeItem {
    return element;
  }

  public onFileRename(oldUri: vscode.Uri, newUri: vscode.Uri): void {
    let configuredFiles = ConfigHandler.getZenPaths(this.rootPath);
    if (configuredFiles.find((zenFile: ZenViewFile) => {
      let zenFilePath = zenViewUtil.getAbsolutePath(zenFile.fileUri);
      let filePath = zenViewUtil.getAbsolutePath(oldUri.fsPath);
      return zenFilePath === filePath;
    })) {
      let absoluteOldPath = zenViewUtil.getAbsolutePath(oldUri.fsPath);
      let absoluteNewPath = zenViewUtil.getAbsolutePath(newUri.fsPath);
      ConfigHandler.replaceZenPath(this.rootPath, absoluteOldPath, absoluteNewPath).then((result) => {
        if (!result) {
          let relativeOldPath = zenViewUtil.getRelativePath(oldUri.fsPath);
          let relativeNewPath = zenViewUtil.getRelativePath(newUri.fsPath);
          ConfigHandler.replaceZenPath(this.rootPath, relativeOldPath, relativeNewPath).then((result) => {
            if (!result) {
              console.log("Error while handling file rename event.");
            }
          });
        }
      });
    }
  }

  public onFileDelete(fileUri: vscode.Uri): void {
    let configuredFiles = ConfigHandler.getZenPaths(this.rootPath);
    if (configuredFiles.find((zenFile: ZenViewFile) => {
      let filePath = zenViewUtil.getAbsolutePath(fileUri.fsPath);
      let zenFilePath = zenViewUtil.getAbsolutePath(zenFile.fileUri);
      return zenFilePath === filePath;
    })) {
      let absolutePath = zenViewUtil.getAbsolutePath(fileUri.fsPath);
      ConfigHandler.removeZenPath(this.rootPath, absolutePath).then((result) => {
        if (!result) {
          let relativePath = zenViewUtil.getRelativePath(fileUri.fsPath);
          ConfigHandler.removeZenPath(this.rootPath, relativePath).then((result) => {
            if (!result) {
              console.log("Error while handling file delete event.");
            }
          });
        }
      });
    }
  }

  public onRenameEvent(e: vscode.FileRenameEvent) {
    for (let file of e.files) {
      this.onFileRename(file.oldUri, file.newUri);
    }
  }

  public onDeleteEvent(e: vscode.FileDeleteEvent) {
    for (let file of e.files) {
      this.onFileDelete(file);
    }
  }

  async getChildren(element?: ZenViewFile): Promise<ZenViewFile[]> {
    if (!vscode.workspace) {
      vscode.window.showInformationMessage('This extension only works within workspaces.');
      return Promise.resolve([]);
    }

    if (element) {
      let zenViewFiles: ZenViewFile[] = [];
      for await (const file of ZenFileSystemHandler.getFiles(vscode.Uri.file(element.fileUri))) {
        zenViewFiles.push(file);
      }
      let alphabeticalSorter = new ZenViewAlphabeticalSorter();
      zenViewFiles = alphabeticalSorter.sort(zenViewFiles);
      if (ConfigHandler.listFoldersFirst()) {
        let letfolderFirstSorter = new ZenViewFileSorterFolderFirst();
        zenViewFiles = letfolderFirstSorter.sort(zenViewFiles);
      }
      return zenViewFiles;
    }
    else { /* root */
      return zenViewGlobals.zenPaths;
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<ZenViewFile | undefined | null | void> = new vscode.EventEmitter<ZenViewFile | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ZenViewFile | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    zenViewGlobals.onConfigChange();
    this._onDidChangeTreeData.fire();
  }

}