import * as vscode from 'vscode';

export class ZenViewFile extends vscode.TreeItem {
    constructor(
      public readonly fileUri: vscode.Uri,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly fileType: vscode.FileType,
      public readonly fileName: string
    ) {
      super(fileName, collapsibleState);
      this.fileType = fileType;
      this.resourceUri = vscode.Uri.parse(fileUri.path);
      if(fileType === vscode.FileType.Directory) {
        this.contextValue = "directory";
        this.iconPath = vscode.ThemeIcon.Folder;
      }
      else {
        this.contextValue = "file";
        this.iconPath = vscode.ThemeIcon.File;
        this.command = {
          'title': "Open file",
          'command': "zenView.open",
          'tooltip': "Open file",
          'arguments': [this.fileUri]
        };
      }
    }
  }