import { ConfigHandler } from "./ConfigHandler";
import * as vscode from 'vscode';
import { ZenViewFile } from "./ZenViewFile";

export class ZenViewGlobals {
    public rootPath: vscode.Uri | undefined;
    public zenPaths! : ZenViewFile[];

    constructor() {    
        this.rootPath = vscode.workspace.workspaceFolders![0].uri;
        this.onConfigChange();
    }

    public onConfigChange() {
        this.zenPaths = ConfigHandler.getZenPaths(this.rootPath!);
    }
}

var zenViewGlobals: ZenViewGlobals = new ZenViewGlobals();

export { zenViewGlobals };