import * as vscode from 'vscode';

export class WholeWordMatcherButton implements vscode.QuickInputButton {
    iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    constructor() {
        this.iconPath = vscode.ThemeIcon.File;
    }
}

export class CaseMatcherButton implements vscode.QuickInputButton {
    iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    constructor() {
        this.iconPath = vscode.ThemeIcon.Folder;
    }
}

export class RegexMatcherButton implements vscode.QuickInputButton {
    iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    constructor() {
        this.iconPath = vscode.ThemeIcon.File;
    }
}