import * as vscode from 'vscode';
import { ZenViewFile } from './ZenViewFile';
import { zenViewGlobals } from './ZenViewGlobals';
import { ZenViewUtil } from './ZenViewUtil';
const { resolve } = require('path');
const { readdir } = require('fs').promises;

export class ZenViewProvider implements vscode.TreeDataProvider<ZenViewFile> {

    constructor() {
  
      vscode.workspace.onDidCreateFiles(() => {
        this.refresh();
      });
  
      vscode.workspace.onDidRenameFiles(() => {
        this.refresh();
      });
  
      vscode.workspace.onDidDeleteFiles(() => {
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
        for await (const file of this.getFiles(element.fileUri)) {
          zenViewFiles.push(file);
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
        let fileType = ZenViewUtil.getFileType(resUri);
        if (dirent.isDirectory()) {
          yield ZenViewUtil.convertFileToZenFile(resUri, fileType);
        } else {
          yield ZenViewUtil.convertFileToZenFile(resUri, fileType);
        }
      }
    }
  
    private _onDidChangeTreeData: vscode.EventEmitter<ZenViewFile | undefined | null | void> = new vscode.EventEmitter<ZenViewFile | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ZenViewFile | undefined | null | void> = this._onDidChangeTreeData.event;
  
    refresh(): void {
      this._onDidChangeTreeData.fire();
    }	

  }