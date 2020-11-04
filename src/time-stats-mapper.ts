import { TwitchCategoriesTick, TimeStatsResponse, TimeStatsResponseData } from "./interfaces";
import { DataInterval, ParamFilter, ParamFilterObject } from "./time-stats";

function parseNum(str: string): number {
    const match = str.match(/(\d+(\.\d+)?)(K|M)?/);
    if (!match) {
        // throw new Error(str);
        return NaN;
    }

    const m = match[3];

    let val = parseFloat(match[1]);
    if (m === 'K') val *= 1000;
    if (m === 'M') val *= 1_000_000;

    return val;
}

function formatNumber(val: number): string {
    const m = val.toString().match(/(-?)(\d*)((\.\d+)?)/);
    if (!m) {
        // throw new Error(`${val}`);
        return '';
    };
    const [_, sign, int, rest] = m;

    const formatted = int.split('').reverse().map((v, i) => {
        if (i !== 0 && i % 3 === 0) return `${v},`;
        return v;
    }).reverse().join('');

    return `${sign}${formatted}${rest}`;
}

export function mapData(records: TwitchCategoriesTick[], filter: ParamFilter, interval: DataInterval): TimeStatsResponse {
    const exps: {[key in keyof typeof DataInterval]: RegExp} = {
        month: /^\d{4}-\d{2}/,
        day: /^\d{4}-\d{2}-\d{2}/,
        hour: /^\d{4}-\d{2}-\d{2}T\d{2}/,
    };

    const getDateKey = (date: string): string => {
        const m = date.match(exps[interval]);
        if (!m) throw new Error(`match is ${m}`);

        return m[0];
    };
    const matchesCategoryFilter = (catName: string): boolean => {
        const matches = (val: string | ParamFilterObject) => {
            if (typeof val === 'string')
                return catName.toLowerCase().includes(val.toLowerCase());
            else
                return catName.toLowerCase() === val.exact.toLowerCase();
        };

        if (filter instanceof Array)
            return filter.some(matches);
        else
            return matches(filter);
    };

    let totalTicks = 0;
    const sumData = new Map<string, {[categoryName: string]: number[]}>();
    const matchedCatNames = new Set<string>();
    for (const record of records) {
        const catNames = Object.keys(record.categories);
        const filteredCatNames = !filter ? catNames : catNames.filter(matchesCategoryFilter);
        if (filteredCatNames.length === 0) continue;

        totalTicks += 1;

        const dateKey = getDateKey(record.date);
        if (!sumData.has(dateKey)) sumData.set(dateKey, {});

        const catObj = sumData.get(dateKey);
        if (!catObj) continue;

        for (const catName of filteredCatNames) {
            matchedCatNames.add(catName);

            const catViewers = record.categories[catName];
            if (!catViewers) continue;

            if (!catObj[catName]) catObj[catName] = [];
            catObj[catName].push(parseNum(catViewers));
        }
    }

    const ticks = Array.from(matchedCatNames).reduce((memo: {[catName: string]: number}, catName) => {
        memo[catName] = 0;
        return memo;
    }, {});
    const data: TimeStatsResponseData = {};
    for (const [date, obj] of sumData.entries()) {
        data[date] = {};

        for (const catName in obj) {
            const values = obj[catName];
            let min = Infinity;
            let max = -Infinity;
            let sum = 0;

            for (const val of values) {
                sum += val;
                if (val < min) min = val;
                if (val > max) max = val;
            }

            ticks[catName] += values.length;
            data[date][catName] = {
                mean: Math.round(sum / values.length),
                min,
                max,
                ticks: values.length,
            };
        }
    }

    return {
        totalTicks,
        ticks,
        data,
    };
}