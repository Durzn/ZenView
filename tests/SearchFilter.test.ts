// Mock the vscode module BEFORE any imports
jest.mock('vscode', () => ({
    Position: jest.fn().mockImplementation((line: number, character: number) => ({
        line,
        character,
        isAfter: jest.fn(),
        isAfterOrEqual: jest.fn(),
        isBefore: jest.fn(),
        isBeforeOrEqual: jest.fn(),
        isEqual: jest.fn(),
        compareTo: jest.fn(),
        translate: jest.fn(),
        with: jest.fn()
    })),
    Range: jest.fn().mockImplementation((start: any, end: any) => ({
        start,
        end,
        isEmpty: jest.fn(),
        isSingleLine: jest.fn(),
        contains: jest.fn(),
        isEqual: jest.fn(),
        intersection: jest.fn(),
        union: jest.fn(),
        with: jest.fn()
    }))
}), { virtual: true });

import { BaseFilter, MatchCaseFilter, WholeWordFilter } from "../src/SearchFilters";
import { SearchResult } from "../src/SearchAlgorithm";
import * as vscode from 'vscode';

// Helper function to create SearchResult objects for testing
function createSearchResult(text: string, line: number, startChar: number, endChar: number): SearchResult {
    const startPos = new vscode.Position(line, startChar);
    const endPos = new vscode.Position(line, endChar);
    const range = new vscode.Range(startPos, endPos);
    return { text, range, line: text };
}

// Helper function to compare SearchResult objects
function expectSearchResultsToEqual(actual: SearchResult[], expected: SearchResult[]) {
    expect(actual.length).toBe(expected.length);

    for (let i = 0; i < actual.length; i++) {
        expect(actual[i].text).toBe(expected[i].text);
        expect(actual[i].range.start.line).toBe(expected[i].range.start.line);
        expect(actual[i].range.start.character).toBe(expected[i].range.start.character);
        expect(actual[i].range.end.line).toBe(expected[i].range.end.line);
        expect(actual[i].range.end.character).toBe(expected[i].range.end.character);
    }
}

test('BaseFilterText', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let expected = [
        createSearchResult("in", 0, 18, 20), // "in" in "string"
        createSearchResult("in", 0, 22, 24)  // "in" standalone word
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('BaseFilterResults', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let results = [createSearchResult(testString, 0, 0, testString.length)];
    let actual = filter.filterResults(results, key);
    expect(actual).toEqual(results);
});

test('WholeWordFilterText', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let expected = [
        createSearchResult("in", 0, 22, 24)  // Only the standalone "in", not the "in" in "string"
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('WholeWordFilterTextMultipleFindings', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test case in a test file";
    let key = "in";
    let expected = [
        createSearchResult("in", 0, 22, 24), // First standalone "in"
        createSearchResult("in", 0, 37, 39)  // Second standalone "in"
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('WholeWordFilterResults', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let results = [createSearchResult(testString, 0, 0, testString.length)];
    let expected = [
        createSearchResult("in", 0, 22, 24)  // Only the standalone "in"
    ];
    let actual = filter.filterResults(results, key);
    expectSearchResultsToEqual(actual, expected);
});

test('WholeWordFilterWordNotWhole', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test stringina test file";
    let key = "in";
    let results = [createSearchResult(testString, 0, 0, testString.length)];
    let expected: SearchResult[] = [];
    let actual = filter.filterResults(results, key);
    expectSearchResultsToEqual(actual, expected);
});

test('MatchCaseFilterTextLowerCase', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test string in a test case in a test file";
    let key = "in";
    let expected = [
        createSearchResult("in", 0, 18, 20), // "in" in "string"
        createSearchResult("in", 0, 22, 24), // First standalone "in"
        createSearchResult("in", 0, 37, 39)  // Second standalone "in"
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('MatchCaseFilterTextUpperCase', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test string In a test case in a test file";
    let key = "In";
    let expected = [
        createSearchResult("In", 0, 22, 24)  // Only the uppercase "In"
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('MatchCaseFilterResults', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test strIng In a test file";
    let key = "In";
    let results = [createSearchResult(testString, 0, 0, testString.length)];
    let expected = [
        createSearchResult("In", 0, 18, 20), // "In" in "strIng"
        createSearchResult("In", 0, 22, 24)  // Standalone "In"
    ];
    let actual = filter.filterResults(results, key);
    expectSearchResultsToEqual(actual, expected);
});

test('MultiLineSearch', () => {
    let filter = new BaseFilter();
    let testString = "this is line 1\nthis is line 2 with in\nthis is line 3";
    let key = "in";
    let expected = [
        createSearchResult(key, 0, 9, 11),  // "in" in "line" on line 1
        createSearchResult(key, 1, 9, 11), // "in" in "line" on line 2
        createSearchResult(key, 1, 20, 22), // "in" in "with in" on line 2
        createSearchResult(key, 2, 9, 11)  // "in" in "line" on line 3
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('WholeWordFilterMultiLine', () => {
    let filter = new WholeWordFilter();
    let testString = "this is line 1\nthis is line 2 with in\nthis is line 3";
    let key = "in";
    let expected = [
        createSearchResult("in", 1, 20, 22)  // Only the standalone "in" on line 2
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('EmptyKeyReturnsEmpty', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string";
    let key = "";
    expect(filter.filterText(testString, key)).toEqual([]);
});

test('NoMatchesReturnsEmpty', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string";
    let key = "xyz";
    expect(filter.filterText(testString, key)).toEqual([]);
});