import * as vscode from 'vscode';

export enum FileContextValue {
  file = "file",
  directory = "directory",
  root = "root",
  symlink = "symbolicLink"
};

export class ZenViewFile extends vscode.TreeItem {
    constructor(
      public readonly fileUri: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly fileType: vscode.FileType,
      public readonly fileName: string,
      public readonly resourceUri: vscode.Uri,
      public readonly fileContext: FileContextValue | undefined,
      public readonly command: vscode.TreeItem["command"] | undefined,
      public readonly iconPath: vscode.ThemeIcon | undefined,
      public readonly isRoot: boolean
    ) {
      super(fileName, collapsibleState);
      this.fileType = fileType;
      this.resourceUri = resourceUri;
      if(fileContext) {
        this.contextValue = fileContext;
      }
      if(isRoot) {
        this.contextValue += " isRoot";
      }
      this.command = command;
      this.iconPath = iconPath;
    }
  }