import { CancellationToken, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, Uri } from "vscode";
import * as vscode from 'vscode';
import { getNonce } from "../Util/WebViewUtil";
import ZenViewElement from "../WebView/ZenViewElement";
import ZenViewInputBox from "../WebView/ZenViewInputBox";

export class ZenViewSearchProvider implements WebviewViewProvider {
    private View?: vscode.WebviewView;
    private Elements: ZenViewElement[] = [new ZenViewInputBox(), new ZenViewInputBox()];

    constructor(
        private readonly ExtensionUri: Uri) {
    }

    resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
        this.View = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.ExtensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'search':
                    {
                        // Handle search functionality
                        this.handleSearch(data.query, data.options);
                        break;
                    }
                case 'colorSelected':
                    {
                        window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                        break;
                    }
            }
        });
    }

    private handleSearch(query: string, options: any) {
        // Implement your search logic here
        console.log('Searching for:', query, 'with options:', options);

        // Send results back to webview
        if (this.View) {
            this.View.webview.postMessage({
                type: 'searchResults',
                results: [] // Your search results here
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.ExtensionUri, 'src', 'WebView', 'main.js'));

        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.ExtensionUri, 'src', 'WebView', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.ExtensionUri, 'src', 'WebView', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.ExtensionUri, 'src', 'WebView', 'main.css'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Zen View Search</title>
			</head>
			<body>
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Search in files..." />
                    <div class="search-options">
                        <label><input type="checkbox" id="caseSensitive"> Case sensitive</label>
                        <label><input type="checkbox" id="wholeWord"> Whole word</label>
                        <label><input type="checkbox" id="regex"> Regex</label>
                    </div>
                    <button id="searchButton">Search</button>
                    <div id="searchResults"></div>
                </div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}