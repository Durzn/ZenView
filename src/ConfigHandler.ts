import * as vscode from 'vscode';
import * as fs from 'fs';
import { ZenViewUtil } from './ZenViewUtil';
import { ZenViewFile } from './ZenViewFile';
import * as path from 'path';

const config = vscode.workspace.getConfiguration();
const iconTheme = config.workbench.iconTheme;

export class ConfigHandler {

    private getConfiguration() {
        return vscode.workspace.getConfiguration("zenView", null);
    }

    constructor() { }

    public getZenPaths(rootPath: vscode.Uri): ZenViewFile[] {
        const config = this.getConfiguration();
        let zenStrings: string[] | undefined = config.get("zenPaths");
        let zenPaths: ZenViewFile[] = [];
        if (zenStrings === undefined) {
            zenStrings = [rootPath.fsPath];
        }

        /* Check validity of configured paths */
        for (let i = 0; i < zenStrings.length; i++) {
            let absPath = path.resolve(rootPath.fsPath, zenStrings[i]);
            let fileExists = fs.existsSync(absPath);
            if (fileExists) {
                let fileType: vscode.FileType = ZenViewUtil.getFileType(vscode.Uri.file(absPath));
                zenPaths.push(ZenViewUtil.convertFileToZenFile(vscode.Uri.file(absPath), fileType));
            }
            else {
                zenStrings.splice(i, 1);
            }
        }
        /* If no given path is valid, make sure at least the root path is active! */
        if (zenStrings.length === 0) {
            zenPaths = [ZenViewUtil.convertFileToZenFile(rootPath, vscode.FileType.Directory)];
        }
        return zenPaths;
    }

    public getThemePath(): vscode.Uri {
        return config.workbench.iconTheme;
    }
}