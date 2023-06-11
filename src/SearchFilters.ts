export class FilterResult {
    constructor(public text: string, public index: number) { }
}

export interface SearchFilter {
    filterText(text: string, key: string): FilterResult[];
    filterResults(results: FilterResult[], key: string): FilterResult[];
}

export class BaseFilter implements SearchFilter {
    public filterText(text: string, key: string): FilterResult[] {
        return [new FilterResult(text, 0)];
    }

    public filterResults(results: FilterResult[], key: string): FilterResult[] {
        return results;
    }
}

export class WholeWordFilter implements SearchFilter {
    public filterText(text: string, key: string): FilterResult[] {
        let regExp = new RegExp(new RegExp(`\\b${key}\\b`, 'gi'));
        return applyRegex(text, regExp);
    }

    public filterResults(results: FilterResult[], key: string): FilterResult[] {
        let regExp = new RegExp(`\\b${key}\\b`, 'gi');

        return filter(results, regExp);
    }
}

export class MatchCaseFilter implements SearchFilter {
    public filterText(text: string, key: string): FilterResult[] {
        let regExp = new RegExp(`${key}`, 'g');
        return applyRegex(text, regExp);
    }

    public filterResults(results: FilterResult[], key: string): FilterResult[] {
        let regExp = new RegExp(`${key}`, 'g');

        return filter(results, regExp);
    }
}

function applyRegex(text: string, regExp: RegExp): FilterResult[] {
    let filterResults: FilterResult[] = [];
    let matchResult = text.matchAll(regExp);

    if (matchResult) {
        for (let result of matchResult) {
            filterResults = filterResults.concat(new FilterResult(result[0], result.index!));
        }
    }

    return filterResults;
}

function filter(results: FilterResult[], regExp: RegExp): FilterResult[] {
    let filterResults: FilterResult[] = [];

    for (let result of results) {
        let matchResult = result.text.matchAll(regExp);
        if (matchResult) {
            for (let match of matchResult) {
                filterResults = filterResults.concat(new FilterResult(match[0], match.index! + result.index));
            }
        }
    }

    return filterResults;
}