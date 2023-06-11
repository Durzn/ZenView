import { BaseFilter, FilterResult, MatchCaseFilter, WholeWordFilter } from "../src/SearchFilters";

test('BaseFilterText', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    expect(filter.filterText(testString, key)).toEqual([new FilterResult(testString, 0)]);
});

test('BaseFilterResults', () => {
    let filter = new BaseFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let results = [new FilterResult(testString, 0)];
    expect(filter.filterResults(results, key)).toEqual([new FilterResult(testString, 0)]);
});


test('WholeWordFilterText', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    expect(filter.filterText(testString, key)).toEqual([new FilterResult(key, 22)]);
});

test('WholeWordFilterTextMultipleFindings', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test case in a test file";
    let key = "in";
    expect(filter.filterText(testString, key)).toEqual([new FilterResult(key, 22), new FilterResult(key, 37)]);
});

test('WholeWordFilterResults', () => {
    let filter = new WholeWordFilter();
    let testString = "this is a test string in a test file";
    let key = "in";
    let results = [new FilterResult(testString, 0)];
    expect(filter.filterResults(results, key)).toEqual([new FilterResult(key, 22)]);
});

test('MatchCaseFilterTextLowerCase', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test string in a test case in a test file";
    let key = "in";
    expect(filter.filterText(testString, key)).toEqual([new FilterResult(key, 18), new FilterResult(key, 22), new FilterResult(key, 37)]);
});

test('MatchCaseFilterTextUpperCase', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test string In a test case in a test file";
    let key = "In";
    expect(filter.filterText(testString, key)).toEqual([new FilterResult(key, 22)]);
});

test('MatchCaseFilterResults', () => {
    let filter = new MatchCaseFilter();
    let testString = "this is a test strIng In a test file";
    let key = "In";
    let results = [new FilterResult(testString, 0)];
    expect(filter.filterResults(results, key)).toEqual([new FilterResult(key, 18), new FilterResult(key, 22)]);
});