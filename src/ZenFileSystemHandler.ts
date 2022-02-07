
import * as vscode from 'vscode';
import { zenViewUtil } from './ZenViewUtil';
import { ZenViewFile } from './ZenViewFile';
import { ConfigHandler } from './ConfigHandler';
const { readdir } = require('fs').promises;
const { resolve } = require('path');


export class ZenFileSystemHandler {

  public static async* getFiles(dir: vscode.Uri): AsyncGenerator<ZenViewFile> {
    const dirents = await readdir(dir.fsPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir.fsPath, dirent.name);
      let resUri = vscode.Uri.file(res);
      let fileType = zenViewUtil.getFileType(resUri, ConfigHandler.getUsedStatFunction());
      yield zenViewUtil.convertFileToZenFile(resUri.fsPath, fileType);
    }
  }

  public static async* getFilesRecursive(root: vscode.Uri): AsyncGenerator<ZenViewFile> {
    const dirents = await readdir(root.fsPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(root.fsPath, dirent.name);
      let resUri = vscode.Uri.file(res);
      let fileType = zenViewUtil.getFileType(resUri, ConfigHandler.getUsedStatFunction());
      if (dirent.isDirectory()) {
        yield* ZenFileSystemHandler.getFilesRecursive(resUri);
      }
      yield zenViewUtil.convertFileToZenFile(resUri.fsPath, fileType);
    }
  }

}