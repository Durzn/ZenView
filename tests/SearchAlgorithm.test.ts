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

// Remove the complex jest.mock and use simple import
import { BaseFilter, MatchCaseFilter, WholeWordFilter } from "../src/SearchFilters";
import { SearchResult, SearchAlgorithm } from "../src/SearchAlgorithm";
import { Position, Range } from 'vscode';

// Helper function to create SearchResult objects for testing
function createSearchResult(text: string, line: number, startChar: number, endChar: number): SearchResult {
    const startPos = new Position(line, startChar);
    const endPos = new Position(line, endChar);
    const range = new Range(startPos, endPos);
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

test('WholeWordFilterWordNotWhole', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test stringina test file";
    let key = "in";
    let expected: SearchResult[] = [];
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

    // Get actual results first
    let actual = filter.filterText(testString, key);
    console.log('Actual results from BaseFilter:');
    actual.forEach((result, index) => {
        console.log(`  [${index}] text: "${result.text}", line: ${result.range.start.line}, start: ${result.range.start.character}, end: ${result.range.end.character}`);
    });

    // Let's manually verify the positions in each line:
    // Line 0: "this is line 1"  ->  "in" at position 9-11
    // Line 1: "this is line 2 with in"  ->  "in" at position 9-11 and 20-22  
    // Line 2: "this is line 3"  ->  "in" at position 9-11

    let expected = [
        createSearchResult("in", 0, 9, 11),  // "in" in "line" on line 0
        createSearchResult("in", 1, 9, 11),  // "in" in "line" on line 1
        createSearchResult("in", 1, 20, 22), // "in" standalone on line 1
        createSearchResult("in", 2, 9, 11)   // "in" in "line" on line 2
    ];

    console.log('Expected results:');
    expected.forEach((result, index) => {
        console.log(`  [${index}] text: "${result.text}", line: ${result.range.start.line}, start: ${result.range.start.character}, end: ${result.range.end.character}`);
    });

    expectSearchResultsToEqual(actual, expected);
});

test('WholeWordFilterMultiLine', () => {
    let filter = new WholeWordFilter();
    let testString = "this is line 1\nthis is line 2 with in\nthis is line 3";
    let key = "in";
    let expected = [
        createSearchResult(key, 1, 20, 22)  // Only the standalone "in" on line 2
    ];
    let actual = filter.filterText(testString, key);
    expectSearchResultsToEqual(actual, expected);
});

test('SearchAlgorithmVsBaseFilter', () => {
    let testString = "this is line 1\nthis is line 2 with in\nthis is line 3";
    let key = "in";

    // Test SearchAlgorithm without filters (should behave like BaseFilter)
    let algorithm = new SearchAlgorithm();
    let algorithmResults = algorithm.search(testString, key, []);

    // Test BaseFilter directly
    let filter = new BaseFilter();
    let filterResults = filter.filterText(testString, key);

    console.log('SearchAlgorithm results:');
    algorithmResults.forEach((result, index) => {
        console.log(`  [${index}] text: "${result.text}", line: ${result.range.start.line}, start: ${result.range.start.character}, end: ${result.range.end.character}`);
    });

    console.log('\nBaseFilter results:');
    filterResults.forEach((result, index) => {
        console.log(`  [${index}] text: "${result.text}", line: ${result.range.start.line}, start: ${result.range.start.character}, end: ${result.range.end.character}`);
    });

    // They should produce the same results
    expectSearchResultsToEqual(algorithmResults, filterResults);
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