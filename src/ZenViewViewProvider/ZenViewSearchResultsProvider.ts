import * as vscode from 'vscode';
import { SearchResult } from '../SearchAlgorithm';
import * as path from 'path';

export interface SearchResultItem {
    filePath: string;
    results: SearchResult[];
}

export class ZenViewSearchResultsTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly filePath?: string,
        public readonly searchResult?: SearchResult,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        if (this.searchResult) {
            // This is a search result item
            this.tooltip = `Line ${this.searchResult.range.start.line + 1}: ${this.searchResult.text}`;
            this.contextValue = 'searchResult';
            this.iconPath = new vscode.ThemeIcon('symbol-text');

            // Command to navigate to the specific line and character
            this.command = {
                command: 'zenView.openSearchResult',
                title: 'Open Search Result',
                arguments: [this.filePath, this.searchResult]
            };
        } else if (this.filePath) {
            // This is a file item
            this.tooltip = this.filePath;
            this.contextValue = 'searchResultFile';
            this.iconPath = vscode.ThemeIcon.File;
            this.resourceUri = vscode.Uri.file(this.filePath);
        } else {
            // This is the root item
            this.contextValue = 'searchResults';
            this.iconPath = new vscode.ThemeIcon('search');
        }
    }
}

export class ZenViewSearchResultsProvider implements vscode.TreeDataProvider<ZenViewSearchResultsTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ZenViewSearchResultsTreeItem | undefined | null | void> = new vscode.EventEmitter<ZenViewSearchResultsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ZenViewSearchResultsTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private searchResults: SearchResultItem[] = [];
    private searchTerm: string = '';

    constructor() { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    updateSearchResults(results: SearchResultItem[], searchTerm: string): void {
        this.searchResults = results;
        this.searchTerm = searchTerm;
        this.refresh();
    }

    clearResults(): void {
        this.searchResults = [];
        this.searchTerm = '';
        this.refresh();
    }

    getTreeItem(element: ZenViewSearchResultsTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ZenViewSearchResultsTreeItem): Thenable<ZenViewSearchResultsTreeItem[]> {
        if (!element) {
            // Root level - show summary or files
            if (this.searchResults.length === 0) {
                return Promise.resolve([
                    new ZenViewSearchResultsTreeItem(
                        'No search results',
                        vscode.TreeItemCollapsibleState.None
                    )
                ]);
            }

            const totalMatches = this.searchResults.reduce((sum, item) => sum + item.results.length, 0);
            const items: ZenViewSearchResultsTreeItem[] = [];

            // Add summary item
            items.push(new ZenViewSearchResultsTreeItem(
                `${totalMatches} matches in ${this.searchResults.length} files for "${this.searchTerm}"`,
                vscode.TreeItemCollapsibleState.None
            ));

            // Add file items
            this.searchResults.forEach(resultItem => {
                const fileName = path.basename(resultItem.filePath);
                const fileItem = new ZenViewSearchResultsTreeItem(
                    `${fileName} (${resultItem.results.length})`,
                    vscode.TreeItemCollapsibleState.Expanded,
                    resultItem.filePath
                );
                items.push(fileItem);
            });

            return Promise.resolve(items);
        }

        // File level - show search results for this file
        if (element.filePath && !element.searchResult) {
            const fileResults = this.searchResults.find(item => item.filePath === element.filePath);
            if (fileResults) {
                const resultItems = fileResults.results.map(result => {
                    const lineNumber = result.range.start.line + 1;
                    const preview = result.text.trim();
                    const label = `Line ${lineNumber}: ${preview}`;

                    return new ZenViewSearchResultsTreeItem(
                        label,
                        vscode.TreeItemCollapsibleState.None,
                        element.filePath,
                        result
                    );
                });
                return Promise.resolve(resultItems);
            }
        }

        return Promise.resolve([]);
    }

    getParent(element: ZenViewSearchResultsTreeItem): vscode.ProviderResult<ZenViewSearchResultsTreeItem> {
        // Implementation for parent retrieval if needed
        return null;
    }
}