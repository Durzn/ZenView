import { SearchResult } from "./SearchAlgorithm";
import * as vscode from 'vscode';

export interface SearchFilter {
    filterText(text: string, key: string): SearchResult[];
    filterResults(results: SearchResult[], key: string): SearchResult[];
}

export class BaseFilter implements SearchFilter {
    public filterText(text: string, key: string): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = text.split('\n');

        if (key === "") {
            return [];
        }

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const matches = [...line.matchAll(new RegExp(this.escapeRegExp(key), "gi"))];

            for (const match of matches) {
                if (match.index !== undefined) {
                    const startPos = new vscode.Position(lineIndex, match.index);
                    const endPos = new vscode.Position(lineIndex, match.index + match[0].length);
                    const range = new vscode.Range(startPos, endPos);

                    results.push({
                        finding: match[0],
                        range: range,
                        line: line
                    });
                }
            }
        }

        return results;
    }

    public filterResults(results: SearchResult[], key: string): SearchResult[] {
        return results;
    }

    protected escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export class WholeWordFilter implements SearchFilter {
    public filterText(text: string, key: string): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = text.split('\n');
        const regExp = new RegExp(`(?<!\\w)${this.escapeRegExp(key)}(?!\\w)`, 'gi');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const matches = [...line.matchAll(regExp)];

            for (const match of matches) {
                if (match.index !== undefined) {
                    const startPos = new vscode.Position(lineIndex, match.index);
                    const endPos = new vscode.Position(lineIndex, match.index + match[0].length);
                    const range = new vscode.Range(startPos, endPos);

                    results.push({
                        finding: match[0],
                        range: range,
                        line: line
                    });
                }
            }
        }

        return results;
    }

    public filterResults(results: SearchResult[], key: string): SearchResult[] {
        const filteredResults: SearchResult[] = [];
        const regExp = new RegExp(`(?<!\\w)${this.escapeRegExp(key)}(?!\\w)`, 'gi');

        for (const result of results) {
            if (!result.line) {
                continue;
            }
            const matches = [...result.line.matchAll(regExp)];

            for (const match of matches) {
                if (match.index !== undefined) {
                    // Calculate the absolute position within the original text
                    const originalStartLine = result.range.start.line;
                    const originalStartChar = result.range.start.character;

                    // For simplicity, assuming the match is on the same line
                    const newStartPos = new vscode.Position(originalStartLine, originalStartChar + match.index);
                    const newEndPos = new vscode.Position(originalStartLine, originalStartChar + match.index + match[0].length);
                    const newRange = new vscode.Range(newStartPos, newEndPos);

                    filteredResults.push({
                        finding: match[0],
                        range: newRange,
                        line: result.line
                    });
                }
            }
        }

        console.log("Filtered results", filteredResults);
        return filteredResults;
    }

    protected escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export class MatchCaseFilter implements SearchFilter {
    public filterText(text: string, key: string): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = text.split('\n');
        const regExp = new RegExp(this.escapeRegExp(key), 'g');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const matches = [...line.matchAll(regExp)];

            for (const match of matches) {
                if (match.index !== undefined) {
                    const startPos = new vscode.Position(lineIndex, match.index);
                    const endPos = new vscode.Position(lineIndex, match.index + match[0].length);
                    const range = new vscode.Range(startPos, endPos);

                    results.push({
                        finding: match[0],
                        range: range,
                        line: line
                    });
                }
            }
        }

        return results;
    }

    public filterResults(results: SearchResult[], key: string): SearchResult[] {
        const filteredResults: SearchResult[] = [];
        const regExp = new RegExp(this.escapeRegExp(key), 'g');

        for (const result of results) {
            const matches = [...result.finding.matchAll(regExp)];

            for (const match of matches) {
                if (match.index !== undefined) {
                    // Calculate the absolute position within the original text
                    const originalStartLine = result.range.start.line;
                    const originalStartChar = result.range.start.character;

                    // For simplicity, assuming the match is on the same line
                    const newStartPos = new vscode.Position(originalStartLine, originalStartChar + match.index);
                    const newEndPos = new vscode.Position(originalStartLine, originalStartChar + match.index + match[0].length);
                    const newRange = new vscode.Range(newStartPos, newEndPos);

                    filteredResults.push({
                        finding: match[0],
                        range: newRange,
                        line: result.line
                    });
                }
            }
        }

        return filteredResults;
    }

    protected escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export class RegexFilter implements SearchFilter {
    public filterText(text: string, key: string): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = text.split('\n');

        try {
            const regExp = new RegExp(key, 'gi');

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const matches = [...line.matchAll(regExp)];

                for (const match of matches) {
                    if (match.index !== undefined) {
                        const startPos = new vscode.Position(lineIndex, match.index);
                        const endPos = new vscode.Position(lineIndex, match.index + match[0].length);
                        const range = new vscode.Range(startPos, endPos);

                        results.push({
                            finding: match[0],
                            range: range,
                            line: line
                        });
                    }
                }
            }
        } catch (error) {
            // Invalid regex, return empty results
            console.error('Invalid regex pattern:', key, error);
        }

        return results;
    }

    public filterResults(results: SearchResult[], key: string): SearchResult[] {
        const filteredResults: SearchResult[] = [];

        try {
            const regExp = new RegExp(key, 'gi');

            for (const result of results) {
                const matches = [...result.finding.matchAll(regExp)];

                for (const match of matches) {
                    if (match.index !== undefined) {
                        // Calculate the absolute position within the original text
                        const originalStartLine = result.range.start.line;
                        const originalStartChar = result.range.start.character;

                        // For simplicity, assuming the match is on the same line
                        const newStartPos = new vscode.Position(originalStartLine, originalStartChar + match.index);
                        const newEndPos = new vscode.Position(originalStartLine, originalStartChar + match.index + match[0].length);
                        const newRange = new vscode.Range(newStartPos, newEndPos);

                        filteredResults.push({
                            finding: match[0],
                            range: newRange,
                            line: result.line
                        });
                    }
                }
            }
        } catch (error) {
            // Invalid regex, return empty results
            console.error('Invalid regex pattern:', key, error);
        }

        return filteredResults;
    }
}