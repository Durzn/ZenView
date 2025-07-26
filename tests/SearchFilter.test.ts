import { SearchResult } from "../src/SearchAlgorithm";
import { BaseFilter, MatchCaseFilter, WholeWordFilter } from "../src/SearchFilters";
import * as vscode from 'vscode';

test('BaseFilterText', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    const expectedRange = new vscode.Range(new vscode.Position(0, 22), new vscode.Position(0, 24));
    expect(filter.filterText(testString, key)).toEqual([new SearchResult(testString, 0)]);
});

test('BaseSearchResults', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let results = [new SearchResult(testString, 0)];
    const expectedRange = new vscode.Range(new vscode.Position(0, 22), new vscode.Position(0, 24));
    expect(filter.SearchResults(results, key)).toEqual([new SearchResult(testString, 0)]);
});


test('WholeWordFilterText', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    const expectedRange = new vscode.Range(new vscode.Position(0, 22), new vscode.Position(0, 24));
    expect(filter.filterText(testString, key)).toEqual({ text: key, range: expectedRange } as SearchResult);
});

test('WholeWordFilterTextMultipleFindings', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test case in a test file";
    let key = "in";
    const expectedRange1 = new vscode.Range(new vscode.Position(0, 22), new vscode.Position(0, 24));
    const expectedRange2 = new vscode.Range(new vscode.Position(0, 37), new vscode.Position(0, 39));
    expect(filter.filterText(testString, key)).toEqual([{ text: key, range: expectedRange1 }, { text: key, range: expectedRange2 }] as SearchResult[]);
});

test('WholeWordSearchResults', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let results = [new SearchResult(testString, 0)];
    expect(filter.SearchResults(results, key)).toEqual([new SearchResult(key, 22)]);
});

test('MatchCaseFilterTextLowerCase', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test string in a test case in a test file";
    let key = "in";
    expect(filter.filterText(testString, key)).toEqual([new SearchResult(key, 18), new SearchResult(key, 22), new SearchResult(key, 37)]);
});

test('MatchCaseFilterTextUpperCase', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test string In a test case in a test file";
    let key = "In";
    expect(filter.filterText(testString, key)).toEqual([new SearchResult(key, 22)]);
});

test('MatchCaseSearchResults', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test strIng In a test file";
    let key = "In";
    let results = [new SearchResult(testString, 0)];
    expect(filter.SearchResults(results, key)).toEqual([new SearchResult(key, 18), new SearchResult(key, 22)]);
});