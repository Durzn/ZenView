import { SearchAlgorithm } from "../src/SearchAlgorithm";
import { MatchCaseFilter, WholeWordFilter } from "../src/SearchFilters";

test('NoFilterSearch', () => {
    let algorithm = new SearchAlgorithm();
    let testString = "this is a test string in a test file";
    let key = "in";
    expect(algorithm.search(testString, key, [])).toEqual([18, 22]);
});

test('WholeWordSearch', () => {
    let algorithm = new SearchAlgorithm();
    let testString = "this is a test string in a test file";
    let key = "in";
    expect(algorithm.search(testString, key, [new WholeWordFilter()])).toEqual([22]);
});

test('AllFiltersSearch', () => {
    let algorithm = new SearchAlgorithm();
    let testString = "this is a test strIng In a test file";
    let key = "In";
    expect(algorithm.search(testString, key, [new WholeWordFilter(), new MatchCaseFilter()])).toEqual([22]);
});

test('AllFiltersSearchNoFinding', () => {
    let algorithm = new SearchAlgorithm();
    let testString = "this is a test strIng in a test file";
    let key = "In";
    expect(algorithm.search(testString, key, [new WholeWordFilter(), new MatchCaseFilter()])).toEqual([]);
});

test('AllFiltersSearchTwoWords', () => {
    let algorithm = new SearchAlgorithm();
    let testString = "this is a test strIng In a test file";
    let key = "In a";
    expect(algorithm.search(testString, key, [new WholeWordFilter(), new MatchCaseFilter()])).toEqual([22]);
});
