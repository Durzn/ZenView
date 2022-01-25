import * as vscode from 'vscode';
import * as fs from 'fs';
import { ZenViewUtil } from './ZenViewUtil';
import { ZenViewFile } from './ZenViewFile';
import * as path from 'path';

export enum FilePathType {
    absolute,
    relative
};

export class ConfigHandler {

    private static getConfiguration() {
        return vscode.workspace.getConfiguration("zenView", null);
    }

    static addZenPath(rootPath: vscode.Uri, absolutePath: vscode.Uri, filePathType: FilePathType): boolean {
        const config = this.getConfiguration();
        let fileExists = fs.existsSync(absolutePath.fsPath);
        if(fileExists) {
            /* vscode.Uri.file() works fine for absolute paths, does NOT work for relative paths (see https://github.com/microsoft/vscode/issues/34449).
            Cannot be used here. */
            let fileString: string = absolutePath.fsPath;
            if(filePathType === FilePathType.relative) {
                fileString = "./" + path.relative(rootPath.fsPath, absolutePath.fsPath);
            }
            let currentPaths: string[] | undefined = config.get("zenPaths");
            if(currentPaths === undefined) {
                currentPaths = [];
            }
            if(!currentPaths.includes(fileString))
            {
                currentPaths.push(fileString);
                config.update("zenPaths", currentPaths);
                return true;
            }
        }
        return false;
    }

    static getUsedStatFunction() {
        const config = this.getConfiguration();
        let resolveSymlinks: boolean | undefined = config.get("resolveSymlinks");
        if(resolveSymlinks === undefined) {
            resolveSymlinks = true;
        }
        if(resolveSymlinks) {
            return fs.statSync;
        }
        return fs.lstatSync;
    }

    static getZenPaths(rootPath: vscode.Uri): ZenViewFile[] {
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
                let fileType: vscode.FileType = ZenViewUtil.getFileType(vscode.Uri.file(absPath), ConfigHandler.getUsedStatFunction());
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
}