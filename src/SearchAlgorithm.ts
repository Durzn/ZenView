import { BaseFilter, SearchFilter } from "./SearchFilters";
import * as vscode from 'vscode';

export interface SearchResult {
    text: string;
    range: vscode.Range;
    line?: string;
}

export class SearchAlgorithm {
    public search(text: string, key: string, filters: SearchFilter[]): SearchResult[] {
        if (key === '') {
            return [];
        }

        if (filters.length > 0) {
            return this.searchWithFilters(text, key, filters);
        } else {
            return this.searchWithoutFilters(text, key);
        }
    }

    private searchWithoutFilters(text: string, key: string): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const matches = [...line.matchAll(new RegExp(this.escapeRegExp(key), "gi"))];

            for (const match of matches) {
                if (match.index !== undefined) {
                    const startPos = new vscode.Position(lineIndex, match.index);
                    const endPos = new vscode.Position(lineIndex, match.index + match[0].length);
                    const range = new vscode.Range(startPos, endPos);

                    results.push({
                        text: match[0],
                        range: range,
                        line: line
                    });
                }
            }
        }

        return results;
    }

    private searchWithFilters(text: string, key: string, filters: SearchFilter[]): SearchResult[] {
        let results: SearchResult[] = new BaseFilter().filterText(text, key);

        for (const filter of filters) {
            results = filter.filterResults(results, key);
        }

        return results;
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}