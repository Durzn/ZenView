import { ZenViewFile } from './ZenViewFile';

interface ZenViewFileSorter {
    sort(files: ZenViewFile[]): ZenViewFile[];
}

export class ZenViewFileSorterFolderFirst implements ZenViewFileSorter {
    public sort(files: ZenViewFile[]): ZenViewFile[] {
        return files.sort((a, b) => {
            if (a.contextValue === "directory" && b.contextValue === "directory") {
                return 0; /* Equal */
            }
            else if (a.contextValue === "directory") {
                return -1;
            }
            return 1;
        });
    }
}