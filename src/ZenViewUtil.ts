import * as vscode from 'vscode';
import { ZenViewFile } from './ZenViewFile';
import * as fs from 'fs';

export class ZenViewUtil {

    static getFileName(fileUri: vscode.Uri): string {
        let returnString: string | undefined;
        returnString = fileUri.path.split('\\').pop();
        if (!returnString) {
            return "";
        }
        returnString = returnString.split('/').pop();
        if (!returnString) {
            return "";
        }
        return returnString;
    }

    static convertFileToZenFile(fileUri: vscode.Uri, fileType: vscode.FileType) {
        let collapsibleState = fileType === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        return new ZenViewFile(fileUri, collapsibleState, fileType, this.getFileName(fileUri));
    }

    static getFileType(fileUri: vscode.Uri) : vscode.FileType {
        let isDirectory = fs.lstatSync(fileUri.fsPath).isDirectory();
        return isDirectory ? vscode.FileType.Directory : vscode.FileType.File;
    }
}