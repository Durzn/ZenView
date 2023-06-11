import { BaseFilter, FilterResult, SearchFilter } from "./SearchFilters";

export class SearchAlgorithm {
    public search(text: string, key: string, filters: SearchFilter[]): number[] {
        let indices: number[] = [];

        if (key === '') {
            return [];
        }

        if (filters.length > 0) {
            indices = this.searchWithFilters(text, key, filters);
        }
        else {
            indices = this.searchWithoutFilters(text, key);
        }

        return indices;
    }

    private searchWithoutFilters(text: string, key: string) {
        let matches = [...text.matchAll(new RegExp(key, "gm"))];
        matches = matches.filter(match => match.index !== undefined);
        return matches.map(match => match.index!);
    }

    private searchWithFilters(text: string, key: string, filters: SearchFilter[]) {
        let indices: number[] = [];
        let filterResults: FilterResult[] = new BaseFilter().filterText(text, key);

        for (let filter of filters) {
            filterResults = filter.filterResults(filterResults, key);
        }
        for (let result of filterResults) {
            indices = indices.concat(result.index);
        }

        return indices;
    }
}