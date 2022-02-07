import * as vscode from 'vscode';
import * as fs from 'fs';
import { zenViewUtil } from './ZenViewUtil';
import { ZenViewFile } from './ZenViewFile';

export enum FilePathType {
    absolute,
    relative
};

export class ZenRegex {
    constructor(public readonly regex: RegExp) {

    }
}

export class ConfigHandler {

    private static getConfiguration() {
        return vscode.workspace.getConfiguration("zenView", null);
    }

    static listFoldersFirst() {
        const config = this.getConfiguration();
        let foldersTop: boolean | undefined = config.get("foldersTop");
        if (foldersTop === undefined) {
            foldersTop = true;
        }
        return foldersTop;
    }

    static async replaceZenPath(rootPath: string, keyPath: string, newPath: string): Promise<boolean> {
        let config = this.getConfiguration();
        let configuredZenPaths = this.getZenPaths(rootPath);
        let jsonObjects = [];
        let fileFound: boolean = false;
        for (let zenPath of configuredZenPaths) {
            let jsonObject: { name: string, path: string } = { name: zenPath.fileName, path: zenPath.fileUri };
            if (zenPath.fileUri === keyPath) {
                let defaultName: string = zenViewUtil.getFileName(zenPath.fileUri);
                if (zenPath.fileName === defaultName) {
                    jsonObject.name = zenViewUtil.getFileName(newPath);
                }
                jsonObject.path = newPath;
                fileFound = true;
            }
            jsonObjects.push(jsonObject);
        }
        if (fileFound) {
            await config.update("zenPaths", jsonObjects);
        }
        return fileFound;
    }

    static async removeZenPath(rootPath: string, keyPath: string): Promise<boolean> {
        let config = this.getConfiguration();
        let configuredZenPaths = this.getZenPaths(rootPath);
        let jsonObjects: any[] | undefined = [];
        let fileFound: boolean = false;
        for (let zenPath of configuredZenPaths) {
            let jsonObject: { name: string, path: string } = { name: zenPath.fileName, path: zenPath.fileUri };
            if (zenPath.fileUri === keyPath) {
                fileFound = true;
                continue;
            }
            jsonObjects.push(jsonObject);
        }
        if (fileFound) {
            if (jsonObjects.length === 0) {
                jsonObjects = undefined; /* If no objects exist, parameter value must be undefined to delete it. */
            }
            await config.update("zenPaths", jsonObjects);
        }
        return fileFound;
    }

    static async addZenPath(path: string, filePathType: FilePathType): Promise<boolean> {
        const config = this.getConfiguration();
        let fileExists = fs.existsSync(zenViewUtil.getAbsolutePath(path));
        if (fileExists) {
            let currentPaths: any = config.get("zenPaths");
            if (currentPaths === undefined) {
                currentPaths = [];
            }
            let absolutePath = zenViewUtil.getAbsolutePath(path);
            let relativePath = path;
            if (filePathType === FilePathType.absolute) {
                /* Only do this action on absolute paths, otherwise the path is completely wrong. */
                relativePath = zenViewUtil.getRelativePath(path);
            }
            if (currentPaths.filter((e: any) => {
                return ((e.path === absolutePath) || e.path === relativePath);
            }).length <= 0) {
                let fileName = zenViewUtil.getFileName(path);
                let jsonObj = { "name": fileName, "path": path };
                currentPaths.push(jsonObj);
                await config.update("zenPaths", currentPaths);
                return true;
            }
        }
        return false;
    }

    static getUsedStatFunction() {
        const config = this.getConfiguration();
        let resolveSymlinks: boolean | undefined = config.get("resolveSymlinks");
        if (resolveSymlinks === undefined) {
            resolveSymlinks = true;
        }
        if (resolveSymlinks) {
            return fs.statSync;
        }
        return fs.lstatSync;
    }

    static getZenPaths(rootPath: string): ZenViewFile[] {
        const config = this.getConfiguration();
        let zenTuples: any = config.get("zenPaths");
        let zenFiles: ZenViewFile[] = [];
        if (zenTuples === undefined) {
            zenTuples = [[rootPath, rootPath]];
        }

        for (let zenTuple of zenTuples) {
            if (zenTuple.hasOwnProperty("name") && zenTuple.hasOwnProperty("path")) {
                zenFiles.push(zenViewUtil.convertFileToZenFile(zenTuple.path, vscode.FileType.Unknown, zenTuple.name));
            }
        }
        /* If no given path is valid, make sure at least the root path is active! */
        if (zenFiles.length === 0) {
            zenFiles = [zenViewUtil.convertFileToZenFile(rootPath, vscode.FileType.Directory)];
        }
        return zenFiles;
    }

    static getExistingZenPaths(rootPath: string): ZenViewFile[] {
        const config = this.getConfiguration();
        let zenTuples: any = config.get("zenPaths");
        let zenFiles: ZenViewFile[] = [];
        if (zenTuples === undefined) {
            zenTuples = [[rootPath, rootPath]];
        }

        for (let zenTuple of zenTuples) {
            if (zenTuple.hasOwnProperty("name") && zenTuple.hasOwnProperty("path")) {
                let absPath = zenViewUtil.getAbsolutePath(zenTuple.path);
                let fileExists = fs.existsSync(absPath);
                if (fileExists) {
                    let fileType: vscode.FileType = zenViewUtil.getFileType(vscode.Uri.file(absPath), ConfigHandler.getUsedStatFunction());
                    zenFiles.push(zenViewUtil.convertFileToZenFile(absPath, fileType, zenTuple.name));
                }
            }
        }
        /* If no given path is valid, make sure at least the root path is active! */
        if (zenFiles.length === 0) {
            zenFiles = [zenViewUtil.convertFileToZenFile(rootPath, vscode.FileType.Directory)];
        }
        return zenFiles;
    }

    static getConfiguredRegExps(): ZenRegex[] {
        const config = this.getConfiguration();
        let regexs: any = config.get("zenRegExps");
        let zenRegexs: ZenRegex[] = [];

        if (regexs === undefined) {
            regexs = [];
        }

        for (let regex of regexs) {
            zenRegexs.push(new ZenRegex(new RegExp(regex)));
        }
        return zenRegexs;
    }

    static isRegExpWarningEnabled(): boolean {
        const config = this.getConfiguration();
        let warningEnabled: boolean | undefined = config.get('enableRegExWarning');
        if(warningEnabled === undefined) {
            warningEnabled = true;
        }
        return warningEnabled;
    } 
}