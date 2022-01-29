import * as vscode from 'vscode';
import { ZenViewFile } from './ZenViewFile';
import { zenViewGlobals } from './ZenViewGlobals';
import { zenViewUtil } from './ZenViewUtil';
const { resolve } = require('path');
const { readdir } = require('fs').promises;
import { ConfigHandler } from './ConfigHandler';
import { ZenViewAlphabeticalSorter, ZenViewFileSorterFolderFirst } from './ZenViewSorter';

export class ZenViewProvider implements vscode.TreeDataProvider<ZenViewFile> {

  public readonly rootPath: string;

  constructor(
  ) {
    this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";

    vscode.workspace.onDidCreateFiles((e) => {
      this.refresh();
    });

    vscode.workspace.onDidRenameFiles((e) => {
      let configuredFiles = ConfigHandler.getZenPaths(this.rootPath);
      for (let file of e.files) {
        if (configuredFiles.find((zenFile: ZenViewFile) => {
          let zenFilePath = zenViewUtil.getAbsolutePath(zenFile.fileUri);
          let filePath = zenViewUtil.getAbsolutePath(file.oldUri.fsPath);
          return zenFilePath === filePath; 
        })) {
          let absoluteOldPath = zenViewUtil.getAbsolutePath(file.oldUri.fsPath);
          let absoluteNewPath = zenViewUtil.getAbsolutePath(file.newUri.fsPath);
          ConfigHandler.replaceZenPath(this.rootPath, absoluteOldPath, absoluteNewPath).then((result) => {
            if (!result) {
              let relativeOldPath = zenViewUtil.getRelativePath(file.oldUri.fsPath);
              let relativeNewPath = zenViewUtil.getRelativePath(file.newUri.fsPath);
              ConfigHandler.replaceZenPath(this.rootPath, relativeOldPath, relativeNewPath).then((result) => {
                if (!result) {
                  console.log("Error while handling file rename event.");
                }
              });
            }
          });
        }
      }
      this.refresh();
    });

    vscode.workspace.onDidDeleteFiles((e) => {
      for (let file of e.files) {

      }
      this.refresh();
    });
  }

  getTreeItem(element: ZenViewFile): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ZenViewFile): Promise<ZenViewFile[]> {
    if (!vscode.workspace) {
      vscode.window.showInformationMessage('This extension only works within workspaces.');
      return Promise.resolve([]);
    }

    if (element) {
      let zenViewFiles: ZenViewFile[] = [];
      for await (const file of this.getFiles(vscode.Uri.file(element.fileUri))) {
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

  private async* getFiles(dir: vscode.Uri): AsyncGenerator<ZenViewFile> {
    const dirents = await readdir(dir.fsPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir.fsPath, dirent.name);
      let resUri = vscode.Uri.file(res);
      let fileType = zenViewUtil.getFileType(resUri, ConfigHandler.getUsedStatFunction());
      if (dirent.isDirectory()) {
        yield zenViewUtil.convertFileToZenFile(resUri.fsPath, fileType);
      } else {
        yield zenViewUtil.convertFileToZenFile(resUri.fsPath, fileType);
      }
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<ZenViewFile | undefined | null | void> = new vscode.EventEmitter<ZenViewFile | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ZenViewFile | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    zenViewGlobals.onConfigChange();
    this._onDidChangeTreeData.fire();
  }

}