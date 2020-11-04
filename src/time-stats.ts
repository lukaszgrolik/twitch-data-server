import {performance} from 'perf_hooks';
import { DbCollections, TwitchCategoriesTick, TimeStatsResponse } from './interfaces';
import * as TimeStatsMapper from './time-stats-mapper';

// export type DataInterval = 'month' | 'day' | 'hour' | '5min';
export enum DataInterval {
    month ='month',
    day = 'day',
    hour = 'hour',
}

export interface ParamFilterObject {
    exact: string
}
export type ParamFilter = string | string[] | ParamFilterObject | (string | ParamFilterObject)[];

interface Opts {
    from: string;
    to: string;
    interval: DataInterval;
    filter: ParamFilter;
    // limit?: number;
}

export async function fetchTimeStats(dbCollections: DbCollections, opts: Opts): Promise<[TimeStatsResponse, {}]> {
    // @todo validate opts - interval cant be less than period

    let time = performance.now();
    const res = dbCollections.categoriesPages.find({
        date: { $gte: opts.from, $lt: opts.to },
        // @todo fetch only with key present?
        // [categories[opts.filter]]: {$exists: true},
    });
    const data: TwitchCategoriesTick[] = await res.toArray();
    const mongoTime = performance.now() - time;

    // console.log('total ticks:', data.length);

    time = performance.now();
    const mappedData = TimeStatsMapper.mapData(data, opts.filter, opts.interval);
    const mapperTime = performance.now() - time;

    return [mappedData, {mongoTime, mapperTime}];
}