import * as mongodb from 'mongodb';

export type DbCollections = {
    categoriesPages: mongodb.Collection;
}

export interface TwitchCategoriesTick {
    date: string;
    categories: { [catName: string]: string | undefined };
}

export type AvgCatViewers = {
    [catName: string]: {
        ticks: string;
        avg: string;
        min: string;
        max: string;
    }
}

export interface TimeStatsResponseData {
    [date: string]: {
        [categoryName: string]: {
            mean: number;
            min: number;
            max: number;
            ticks: number;
        }
    }
}

export interface TimeStatsResponse {
    totalTicks: number;
    ticks: {[categoryName: string]: number};
    data: TimeStatsResponseData;
}