import * as vscode from 'vscode';
import { zenViewUtil } from './ZenViewUtil';

export enum FileContextValue {
  file = "file",
  directory = "directory"
};

export class ZenViewFile extends vscode.TreeItem {
    constructor(
      public readonly fileUri: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly fileType: vscode.FileType,
      public readonly fileName: string
    ) {
      super(fileName, collapsibleState);
      this.fileType = fileType;
      this.resourceUri = vscode.Uri.parse(vscode.Uri.file(zenViewUtil.getAbsolutePath(fileUri)).path);
      if(fileType === vscode.FileType.Directory) {
        this.contextValue = FileContextValue.directory;
        this.iconPath = vscode.ThemeIcon.Folder;
      }
      else if(fileType === vscode.FileType.File) {
        this.contextValue = FileContextValue.file;
        this.iconPath = vscode.ThemeIcon.File;
        this.command = {
          'title': "Open file",
          'command': "zenView.open",
          'tooltip': "Open file",
          'arguments': [this.fileUri]
        };
      }
      else if(fileType === vscode.FileType.SymbolicLink) {
        this.contextValue = "symbolicLink";
      }
    }
  }