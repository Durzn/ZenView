import * as vscode from 'vscode';
import { MatchCaseFilter, SearchFilter, WholeWordFilter } from './SearchFilters';

export interface ZenViewSearchButton extends vscode.QuickInputButton {
    isActive: boolean;
    readonly searchFilter: SearchFilter;

    toggle(): void;
}

export class WholeWordMatcherButton implements ZenViewSearchButton {
    public iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    constructor() {
        this.iconPath = vscode.ThemeIcon.File;
        this.isActive = false;
        this.searchFilter = new WholeWordFilter();
    }

    public toggle() {
        this.isActive = !this.isActive;
    }

    public readonly searchFilter: SearchFilter;
    public isActive: boolean;
}

export class CaseMatcherButton implements ZenViewSearchButton {
    public iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    constructor() {
        this.iconPath = vscode.ThemeIcon.Folder;
        this.isActive = false;
        this.searchFilter = new MatchCaseFilter();
    }

    public toggle() {
        this.isActive = !this.isActive;
    }

    public readonly searchFilter: SearchFilter;
    public isActive: boolean;
}

export class RegexMatcherButton implements ZenViewSearchButton {
    public iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    constructor() {
        this.iconPath = vscode.ThemeIcon.File;
        this.isActive = false;
        this.searchFilter = new WholeWordFilter(); /* TODO: Implement RegEx filter */
    }

    public toggle() {
        this.isActive = !this.isActive;
    }

    public readonly searchFilter: SearchFilter;
    public isActive: boolean;
}