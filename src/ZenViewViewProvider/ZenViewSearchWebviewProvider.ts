import * as vscode from 'vscode';
import { MatchCaseFilter, RegexFilter, SearchFilter, WholeWordFilter } from '../SearchFilters';
import { SearchAlgorithm } from '../SearchAlgorithm';
import { zenViewUtil } from '../Util/ZenViewUtil';
import { readFile } from 'fs';
import { SearchResultItem, ZenViewSearchResultsProvider } from './ZenViewSearchResultsProvider';

export class ZenViewSearchWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'zenview-search-panel';
    private _view?: vscode.WebviewView;
    private searchResultsProvider: ZenViewSearchResultsProvider;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        searchResultsProvider: ZenViewSearchResultsProvider
    ) {
        this.searchResultsProvider = searchResultsProvider;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._extensionUri);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'search':
                    await this.performSearch(data.query, data.options);
                    break;
                case 'clear':
                    this.searchResultsProvider.clearResults();
                    break;
            }
        });
    }

    private async performSearch(searchTerm: string, options: any) {
        if (!searchTerm.trim()) {
            this.searchResultsProvider.clearResults();
            return;
        }

        let filters: SearchFilter[] = [];
        if (options.wholeWord) filters.push(new WholeWordFilter());
        if (options.caseSensitive) filters.push(new MatchCaseFilter());
        if (options.regex) filters.push(new RegexFilter());

        let files = await zenViewUtil.getAllZenFiles();
        let allSearchResults: SearchResultItem[] = [];

        const searchPromises = files.map(file => {
            return new Promise<void>((resolve) => {
                readFile(file.fileUri, (err, text) => {
                    if (err) {
                        resolve();
                        return;
                    }

                    let searchAlgorithm = new SearchAlgorithm();
                    let searchResults = searchAlgorithm.search(text.toString(), searchTerm, filters);

                    if (searchResults.length > 0) {
                        allSearchResults.push({
                            filePath: file.fileUri,
                            results: searchResults
                        });
                    }

                    resolve();
                });
            });
        });

        await Promise.all(searchPromises);

        // Update the tree view with results
        this.searchResultsProvider.updateSearchResults(allSearchResults, searchTerm);

        // Send results count back to webview
        const totalMatches = allSearchResults.reduce((sum, item) => sum + item.results.length, 0);
        this._view?.webview.postMessage({
            type: 'searchComplete',
            totalMatches,
            fileCount: allSearchResults.length
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {


        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));


        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZenView Search</title>
	<link href="${codiconsUri}" rel="stylesheet" />
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 10px;
            margin: 0;
        }
        
        .search-container {
            margin-bottom: 15px;
        }
        
        .search-input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 3px;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        .search-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            border-color: var(--vscode-focusBorder);
        }
        
        .search-options {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        
        .option-button {
            padding: 4px 8px;
            border: 1px solid var(--vscode-button-border);
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .option-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .option-button.active {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .search-actions {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        
        .action-button {
            padding: 6px 12px;
            border: 1px solid var(--vscode-button-border);
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
        }
        
        .action-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .action-button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .action-button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .search-status {
            margin-top: 10px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            text-align: center;
        }
        
        .icon {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin-right: 4px;
        }
    </style>
</head>
<body>
    <div class="search-container">
        <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="Search in files..."
            autocomplete="off"
        />
        
        <div class="search-options">
            <button class="option-button" id="wholeWordBtn" title="Match Whole Word">
				<div class="icon"><i class="codicon codicon-whole-word"></i></div>
            </button>
            <button class="option-button" id="caseSensitiveBtn" title="Match Case">
				<div class="icon"><i class="codicon codicon-case-sensitive"></i></div>
            </button>
            <button class="option-button" id="regexBtn" title="Use Regular Expression">
				<div class="icon"><i class="codicon codicon-regex"></i></div>
            </button>
        </div>
        
        <div class="search-actions">
            <button class="action-button" id="searchBtn">Search</button>
            <button class="action-button secondary" id="clearBtn">Clear</button>
        </div>
        
        <div class="search-status" id="searchStatus"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        const searchInput = document.getElementById('searchInput');
        const wholeWordBtn = document.getElementById('wholeWordBtn');
        const caseSensitiveBtn = document.getElementById('caseSensitiveBtn');
        const regexBtn = document.getElementById('regexBtn');
        const searchBtn = document.getElementById('searchBtn');
        const clearBtn = document.getElementById('clearBtn');
        const searchStatus = document.getElementById('searchStatus');
        
        let searchTimeout;
        let searchOptions = {
            wholeWord: false,
            caseSensitive: false,
            regex: false
        };
        
        // Toggle option buttons
        function toggleOption(button, option) {
            searchOptions[option] = !searchOptions[option];
            button.classList.toggle('active', searchOptions[option]);
        }
        
        wholeWordBtn.addEventListener('click', () => {toggleOption(wholeWordBtn, 'wholeWord'); performSearch();});
        caseSensitiveBtn.addEventListener('click', () => {toggleOption(caseSensitiveBtn, 'caseSensitive'); performSearch();});
        regexBtn.addEventListener('click', () => {toggleOption(regexBtn, 'regex'); performSearch();});
        
        // Search functionality
        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                searchStatus.textContent = 'Searching...';
                vscode.postMessage({
                    type: 'search',
                    query: query,
                    options: searchOptions
                });
            } else {
                vscode.postMessage({ type: 'clear' });
                searchStatus.textContent = '';
            }
        }
        
        // Real-time search with debouncing
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 300);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                performSearch();
            }
        });
        
        searchBtn.addEventListener('click', performSearch);
        
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            vscode.postMessage({ type: 'clear' });
            searchStatus.textContent = '';
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'searchComplete':
                    if (message.totalMatches === 0) {
                        searchStatus.textContent = 'No results found';
                    } else {
                        searchStatus.textContent = \`\${message.totalMatches} matches in \${message.fileCount} files\`;
                    }
                    break;
            }
        });
        
        // Focus on the search input when the view is shown
        searchInput.focus();
    </script>
</body>
</html>`;
    }
}