import * as vscode from 'vscode';
import { ZenViewFile } from './ZenViewFile';

export class ZenViewUtil {

    static getFileName(path: string): string {
        let returnString: string | undefined;
        returnString = path.split('\\').pop();
        if (!returnString) {
            return "";
        }
        returnString = returnString.split('/').pop();
        if (!returnString) {
            return "";
        }
        return returnString;
    }

    static convertFileToZenFile(fileUri: vscode.Uri, fileType: vscode.FileType, fileName : string | undefined = this.getFileName(fileUri.path)) {
        let collapsibleState = fileType === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        return new ZenViewFile(fileUri, collapsibleState, fileType, fileName);
    }

    static getFileType(fileUri: vscode.Uri, statSyncFunc: any): vscode.FileType {
        let fileType: vscode.FileType = vscode.FileType.Unknown;
        let fileInfo = statSyncFunc(fileUri.fsPath);
        let isDirectory: boolean = fileInfo.isDirectory();
        let isSymbolicLink: boolean = fileInfo.isSymbolicLink();
        let isFile: boolean = fileInfo.isFile();

        if (isSymbolicLink) {
            fileType = vscode.FileType.SymbolicLink;
        }
        else if (isDirectory) {
            fileType = vscode.FileType.Directory;
        }
        else if (isFile) {
            fileType = vscode.FileType.File;
        }
        return fileType;
    }
}