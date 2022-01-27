import { ZenViewFile, FileContextValue } from './ZenViewFile';

interface ZenViewFileSorter {
    sort(files: ZenViewFile[]): ZenViewFile[];
}

export class ZenViewAlphabeticalSorter implements ZenViewFileSorter {
    public sort(zenFiles: ZenViewFile[]): ZenViewFile[] {
        return zenFiles.sort((a, b) => {
            return a.fileName.localeCompare(b.fileName);
        });
    }
}

export class ZenViewFileSorterFolderFirst implements ZenViewFileSorter {
    public sort(zenFiles: ZenViewFile[]): ZenViewFile[] {
        let sortedFiles: ZenViewFile[] = [];
        let files: ZenViewFile[] = zenFiles.filter((elem: ZenViewFile) => {
            return elem.contextValue === FileContextValue.file;
        });
        let directories: ZenViewFile[] = zenFiles.filter((elem: ZenViewFile) => {
            return elem.contextValue === FileContextValue.directory;
        });
        for (let directory of directories) {
            sortedFiles.push(directory);
        }
        for (let file of files) {
            sortedFiles.push(file);
        }
        return sortedFiles;
    }
}