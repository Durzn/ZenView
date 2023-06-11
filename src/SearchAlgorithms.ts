import * as vscode from 'vscode';

export interface SearchAlgorithm {
    search(text: string, key: string): number[];
}

export class RegexpSearch implements SearchAlgorithm {
    public search(text: string, key: string): number[] {
        let indices: number[] = [];
        let matches = [...text.matchAll(new RegExp(key, "gm"))];
        matches = matches.filter(match => match.index !== undefined);
        indices = matches.map(match => match.index!);
        return indices;
    }
}