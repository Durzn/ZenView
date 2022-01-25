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

    static listFoldersFirst() {
        const config = this.getConfiguration();
        let foldersTop: boolean | undefined = config.get("foldersTop");
        if(foldersTop === undefined) {
            foldersTop = true;
        }
        return foldersTop;    
    }

    static addZenPath(rootPath: vscode.Uri, absolutePath: vscode.Uri, filePathType: FilePathType): boolean {
        const config = this.getConfiguration();
        let fileExists = fs.existsSync(absolutePath.fsPath);
        if(fileExists) {
            /* vscode.Uri.file() works fine for absolute paths, does NOT work for relative paths (see https://github.com/microsoft/vscode/issues/34449).
            Cannot be used here. */
            let pathString: string = absolutePath.fsPath;
            if(filePathType === FilePathType.relative) {
                pathString = "./" + path.relative(rootPath.fsPath, absolutePath.fsPath);
            }
            let currentPaths: any = config.get("zenPaths");
            if(currentPaths === undefined) {
                currentPaths = [{}];
            }
            if(currentPaths.filter((e: any) => e.path === pathString).length <= 0)
            {
                let fileName = ZenViewUtil.getFileName(pathString);
                let jsonObj = {"name": fileName, "path": pathString};
                currentPaths.push(jsonObj);
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
        let zenTuples: any = config.get("zenPaths");
        let zenFiles: ZenViewFile[] = [];
        if (zenTuples === undefined) {
            zenTuples = [[rootPath.fsPath, rootPath.fsPath]];
        }

        for(let zenTuple of zenTuples) {
            if(zenTuple.hasOwnProperty("name") && zenTuple.hasOwnProperty("path")) {
                let absPath = path.resolve(rootPath.fsPath, zenTuple.path);
                let fileExists = fs.existsSync(absPath);
                if (fileExists) {
                    let fileType: vscode.FileType = ZenViewUtil.getFileType(vscode.Uri.file(absPath), ConfigHandler.getUsedStatFunction());
                    zenFiles.push(ZenViewUtil.convertFileToZenFile(vscode.Uri.file(absPath), fileType, zenTuple.name));
                }
            }
        }
        /* If no given path is valid, make sure at least the root path is active! */
        if (zenFiles.length === 0) {
            zenFiles = [ZenViewUtil.convertFileToZenFile(rootPath, vscode.FileType.Directory)];
        }
        return zenFiles;
    }
}