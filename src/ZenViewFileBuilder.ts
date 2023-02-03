import * as vscode from 'vscode';
import { FileContextValue, ZenViewFile } from './ZenViewFile';
import { zenViewUtil } from './ZenViewUtil';


export class ZenViewFileBuilder {

    build(fileUri: string, fileType: vscode.FileType, collapsibleState: vscode.TreeItemCollapsibleState, fileName: string, isRoot: boolean = false): ZenViewFile {
        let contextValue: FileContextValue | undefined = undefined;
        let iconPath: vscode.ThemeIcon | undefined = undefined;
        let resourceUri: vscode.Uri = vscode.Uri.parse(vscode.Uri.file(zenViewUtil.getAbsolutePath(fileUri)).path);
        let command: vscode.TreeItem["command"] | undefined = undefined;
        if (fileType === vscode.FileType.File) {
            contextValue = FileContextValue.file;
            iconPath = vscode.ThemeIcon.File;
            command = {
                'title': "Open file",
                'command': "zenView.open",
                'tooltip': "Open file",
                'arguments': [fileUri]
            };
        }
        else if (fileType === vscode.FileType.Directory) {
            contextValue = FileContextValue.directory;
            iconPath = vscode.ThemeIcon.Folder;
        }
        else if (fileType === vscode.FileType.SymbolicLink) {
            contextValue = FileContextValue.symlink;
        }

        return new ZenViewFile(fileUri, collapsibleState, fileType, fileName, resourceUri, contextValue, command, iconPath, isRoot);
    }
}