import * as vscode from 'vscode';
import { ZenViewTreeDataProvider } from './ZenViewViewProvider/ZenViewTreeDataProvider';
import { zenViewGlobals } from './ZenViewGlobals';
import { ConfigHandler, FilePathType, ZenRegex } from './ConfigHandler';
import { zenViewUtil } from './Util/ZenViewUtil';
import { ZenViewFile } from './ZenViewFile';
import * as Path from 'path';
import { ZenFileSystemHandler } from './ZenFileSystemHandler';
import { ZenViewQuickPickItem } from './ZenViewQuickPickItem';
import { SearchResult } from './SearchAlgorithm';
import { readFile, writeFile, stat, mkdir, rename } from 'fs';
import { ZenViewSearchResultsProvider } from './ZenViewViewProvider/ZenViewSearchResultsProvider';
import { ZenViewSearchWebviewProvider } from './ZenViewViewProvider/ZenViewSearchWebviewProvider';
const fs = require('fs');

const zenViewProvider = new ZenViewTreeDataProvider();
const searchResultsProvider = new ZenViewSearchResultsProvider();

export function activate(context: vscode.ExtensionContext) {
  let rootPath: vscode.Uri | undefined = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined;
  if (!rootPath) {
    /* The extension does not work without a workspace. */
    return;
  }

  const searchWebviewProvider = new ZenViewSearchWebviewProvider(context.extensionUri, searchResultsProvider);

  vscode.window.registerTreeDataProvider('zenview-explorer', zenViewProvider);
  vscode.window.registerTreeDataProvider('zenview-search-results', searchResultsProvider);
  vscode.window.registerWebviewViewProvider('zenview-search-panel', searchWebviewProvider);

  registerFunctions(rootPath);

  vscode.workspace.onDidChangeConfiguration(() => {
    onConfigChange();
  });
}

function onConfigChange() {
  zenViewGlobals.onConfigChange();
  zenViewProvider.refresh();
}

async function registerFunctions(rootPath: vscode.Uri) {

  vscode.commands.registerCommand('zenView.applyRegex', async () => {
    let regexps: ZenRegex[] = ConfigHandler.getConfiguredRegExps();
    let files: ZenViewFile[] = [];

    if (regexps.length > 0) {
      for await (const file of ZenFileSystemHandler.getFilesRecursive(rootPath)) {
        files.push(file);
      }
    }

    for (let regexp of regexps) {
      let filteredFiles = files.filter((file: ZenViewFile) => {
        return regexp.regex.exec(file.fileUri);
      });
      if (ConfigHandler.isRegExpWarningEnabled()) {
        const selection = await vscode.window
          .showInformationMessage('RegExp: ' + regexp + ' Adding ' + filteredFiles.length + ' files to the configuration. Does this seem correct?', ...['Yes', 'No']);
        if (selection === 'Yes') {
          for (let file of filteredFiles) {
            ConfigHandler.addZenPath(zenViewUtil.getRelativePath(file.fileUri), FilePathType.relative);
          }
        };
      }
      else {
        for (let file of filteredFiles) {
          ConfigHandler.addZenPath(zenViewUtil.getRelativePath(file.fileUri), FilePathType.relative);
        }
      }
    }
  });

  vscode.commands.registerCommand('zenView.open', (fileUri: string) => {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(zenViewUtil.getAbsolutePath(fileUri)));
  });

  vscode.commands.registerCommand('zenView.addRelativePath', async (fileUri: vscode.Uri) => {
    await ConfigHandler.addZenPath(zenViewUtil.getRelativePath(fileUri.fsPath), FilePathType.relative);
    onConfigChange();
  });

  vscode.commands.registerCommand('zenView.addAbsolutePath', async (fileUri: vscode.Uri) => {
    await ConfigHandler.addZenPath(zenViewUtil.getAbsolutePath(fileUri.fsPath), FilePathType.absolute);
    onConfigChange();
  });

  vscode.commands.registerCommand('zenView.addDirectory', async (root: ZenViewFile) => {
    let newDirName: string | undefined = await vscode.window.showInputBox();
    if (!newDirName) { return; };
    let newUri = Path.join(root.fileUri, newDirName);
    mkdir(newUri, () => {
      zenViewProvider.refresh();
    });
  });

  vscode.commands.registerCommand('zenView.addFile', async (root: ZenViewFile) => {
    let newDirName: string | undefined = await vscode.window.showInputBox();
    if (!newDirName) { return; };
    let newUri: vscode.Uri = vscode.Uri.file(Path.join(root.fileUri, newDirName));
    stat(newUri.fsPath, (err) => {
      if (err) {
        /* File does not exist, create new file */
        writeFile(newUri.fsPath, new Uint8Array(), () => {
          zenViewProvider.refresh();
        });
      }
    });
  });

  /* Unfortunately the normal context menu items cannot be applied, see https://github.com/Microsoft/vscode/issues/48932 */
  /* Renaming/Hotkeys in general do not work, see https://github.com/microsoft/vscode/issues/130880 */
  vscode.commands.registerCommand('zenView.rename', async (file: ZenViewFile) => {
    let fileUri = file.fileUri.replace(/\\/g, '/');
    let dirPath = fileUri.substring(0, fileUri.lastIndexOf('/')) + "/";
    let newName: string | undefined = await vscode.window.showInputBox({ value: zenViewUtil.getFileName(file.fileUri) });
    if (!newName) { return; };
    let newUri: vscode.Uri = vscode.Uri.file(Path.join(dirPath, newName));

    zenViewProvider.onFileRename(vscode.Uri.file(fileUri), newUri); /* Needs to be done manually, vscode will not throw a file rename event. */

    rename(fileUri, newUri.fsPath, () => {
      zenViewProvider.refresh();
    });

  });

  vscode.commands.registerCommand('zenView.delete', async (file: ZenViewFile) => {
    zenViewProvider.onFileDelete(vscode.Uri.file(file.fileUri)); /* Needs to be done manually, vscode will not throw a file deletion event. */

    fs.rm(file.fileUri, { recursive: true, useTrash: true }, () => {
      zenViewProvider.refresh();
    });
  });

  vscode.commands.registerCommand('zenView.removeFromConfig', async (file: ZenViewFile) => {
    await ConfigHandler.removeZenPath(zenViewGlobals.rootPath!.fsPath, zenViewUtil.getAbsolutePath(file.fileUri));
    onConfigChange();
  });

  vscode.commands.registerCommand('zenView.pickFile', async () => {
    let allFiles = await zenViewUtil.getAllZenFiles();
    allFiles = Array.from(new Set(allFiles)); /* Remove duplicates */
    allFiles = allFiles.filter(item => item.fileType === vscode.FileType.File);
    let items: ZenViewQuickPickItem[] = zenViewUtil.convertZenViewFilesToQuickPickItems(allFiles);
    let itemChosen: ZenViewQuickPickItem | undefined = await vscode.window.showQuickPick(items);
    if (itemChosen) {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.file(zenViewUtil.getAbsolutePath(itemChosen.path)));
    }
  });

  // Command to open a specific search result
  vscode.commands.registerCommand('zenView.openSearchResult', async (filePath: string, searchResult: SearchResult) => {
    const uri = vscode.Uri.file(zenViewUtil.getAbsolutePath(filePath));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Navigate to the specific line and character
    const position = new vscode.Position(searchResult.range.start.line, searchResult.range.start.character);
    const range = new vscode.Range(position, new vscode.Position(searchResult.range.end.line, searchResult.range.end.character));

    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  });

  // Command to clear search results
  vscode.commands.registerCommand('zenView.clearSearchResults', () => {
    searchResultsProvider.clearResults();
  });
}