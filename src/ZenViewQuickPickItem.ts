import { QuickPickItem, FileType, ThemeIcon } from "vscode";
import * as vscode from 'vscode';

export class ZenViewQuickPickItem implements QuickPickItem {
    public label: string;
    public description = '';

    constructor(public fileName: string, public path: string, public fileType: FileType) {
        this.label = fileName;
        /* Actual theme icon cannot be used in QuickPickItems yet, see: https://github.com/microsoft/vscode/issues/59826 */
        this.description = "$(file)";
    }
}