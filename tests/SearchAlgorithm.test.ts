import { RegexpSearch } from "../src/SearchAlgorithms";

test('asd', () => {
    let algorithm = new RegexpSearch();
    let testString = "this is a test string in a test file";
    let key = "in";
    expect(algorithm.search(testString, key)).toEqual([18, 22]);
});