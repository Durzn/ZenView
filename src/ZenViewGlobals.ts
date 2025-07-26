import { ConfigHandler } from "./ConfigHandler";
import * as vscode from 'vscode';
import { ZenViewFile } from "./ZenViewFile";
import { FilterResult } from "./SearchFilters";

export class ZenViewGlobals {
    public rootPath: vscode.Uri | undefined;
    public zenPaths!: ZenViewFile[];
    public searchResults: FilterResult[] = [];

    constructor() {
        this.rootPath = vscode.workspace.workspaceFolders![0].uri;
        this.onConfigChange();
    }

    public onConfigChange() {
        this.zenPaths = ConfigHandler.getExistingZenPaths(this.rootPath!.fsPath);
    }
}

var zenViewGlobals: ZenViewGlobals = new ZenViewGlobals();

export { zenViewGlobals };