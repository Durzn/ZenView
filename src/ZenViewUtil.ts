import * as vscode from 'vscode';
import { ZenViewFile } from './ZenViewFile';
import * as Path from 'path';

export class ZenViewUtil {

    private rootPath: string;

    constructor() {
        this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
    }

    public getAbsolutePath(path: string): string {
        return Path.resolve(this.rootPath, path);
    }

    public getRelativePath(path: string): string {
        return "./" + Path.relative(this.rootPath, path);
    }

    public getFileName(path: string): string {
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

    public convertFileToZenFile(fileUri: string, fileType: vscode.FileType, fileName : string | undefined = this.getFileName(fileUri)) {
        let collapsibleState = fileType === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        return new ZenViewFile(fileUri, collapsibleState, fileType, fileName);
    }

    public getFileType(fileUri: vscode.Uri, statSyncFunc: any): vscode.FileType {
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

let zenViewUtil: ZenViewUtil = new ZenViewUtil();

export {zenViewUtil};