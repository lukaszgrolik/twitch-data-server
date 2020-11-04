import * as assert from 'assert';

import { TimeStatsResponse, TwitchCategoriesTick } from "../src/interfaces";
import { DataInterval, ParamFilter } from "../src/time-stats";
import * as TimeStatsMapper from '../src/time-stats-mapper';

const dataset1: TwitchCategoriesTick[] = [
    {
        date: '2020-10-30T12:00:00.000Z',
        categories: { 'Just Chatting': '100K', 'Diablo III': '10K', 'Diablo II': '5K', 'Diablo': '3K' },
    },
    {
        date: '2020-10-30T13:00:00.000Z',
        categories: { 'Just Chatting': '100K', 'Diablo III': '12K', 'Diablo II': '7K', 'Diablo': '4K' },
    },
    {
        date: '2020-10-30T13:30:00.000Z',
        categories: { 'Just Chatting': '100K', 'Diablo III': '11K', 'Diablo II': '6K', 'Diablo': '3.5K' },
    },
    {
        date: '2020-10-31T12:00:00.000Z',
        categories: { 'Just Chatting': '100K', 'Diablo III': '20K', 'Diablo II': '10K', 'Diablo': '6K' },
    },
    {
        date: '2020-10-31T13:00:00.000Z',
        categories: { 'Just Chatting': '100K', 'Diablo III': '10K', 'Diablo II': '8K'},
    },
    {
        date: '2020-10-31T14:00:00.000Z',
        categories: { 'Just Chatting': '100K' },
    },
];

interface Input { data: TwitchCategoriesTick[], filter: ParamFilter; interval: DataInterval }



describe('test suite', () => {
    const tests: { label: string; input: Input; expected: TimeStatsResponse }[] = [
        {
            label: 'no filter; interval=month',
            input: { data: dataset1, filter: '', interval: DataInterval.month },
            expected: {
                totalTicks: 6,
                ticks: {
                    'Diablo III': 5,
                    'Diablo II': 5,
                    'Diablo': 4,
                    'Just Chatting': 6,
                },
                data: {
                    '2020-10': {
                        'Diablo III': { mean: 12_600, min: 10_000, max: 20_000, ticks: 5 },
                        'Diablo II': { mean: 7200, min: 5000, max: 10_000, ticks: 5 },
                        'Diablo': { mean: 4125, min: 3000, max: 6000, ticks: 4 },
                        'Just Chatting': { mean: 100_000, min: 100_000, max: 100_000, ticks: 6 },
                    }
                },
            },
        },
        {
            label: 'dummy filter; zero results',
            input: { data: dataset1, filter: 'afsfasf', interval: DataInterval.month },
            expected: {
                totalTicks: 0,
                ticks: {},
                data: {},
            },
        },
        {
            label: 'filter; interval=month',
            input: { data: dataset1, filter: 'diablo', interval: DataInterval.month },
            expected: {
                totalTicks: 5,
                ticks: {
                    'Diablo III': 5,
                    'Diablo II': 5,
                    'Diablo': 4,
                },
                data: {
                    '2020-10': {
                        'Diablo III': { mean: 12_600, min: 10_000, max: 20_000, ticks: 5 },
                        'Diablo II': { mean: 7200, min: 5000, max: 10_000, ticks: 5 },
                        'Diablo': { mean: 4125, min: 3000, max: 6000, ticks: 4 },
                    }
                },
            },
        },
        {
            label: 'filter; interval=day',
            input: { data: dataset1, filter: 'diablo', interval: DataInterval.day },
            expected: {
                totalTicks: 5,
                ticks: {
                    'Diablo III': 5,
                    'Diablo II': 5,
                    'Diablo': 4,
                },
                data: {
                    '2020-10-30': {
                        'Diablo III': { mean: 11_000, min: 10_000, max: 12_000, ticks: 3 },
                        'Diablo II': { mean: 6000, min: 5000, max: 7000, ticks: 3 },
                        'Diablo': { mean: 3500, min: 3000, max: 4000, ticks: 3 },
                    },
                    '2020-10-31': {
                        'Diablo III': { mean: 15_000, min: 10_000, max: 20_000, ticks: 2 },
                        'Diablo II': { mean: 9000, min: 8000, max: 10_000, ticks: 2 },
                        'Diablo': { mean: 6000, min: 6000, max: 6000, ticks: 1 },
                    },
                },
            },
        },
        {
            label: 'filter; interval=hour',
            input: { data: dataset1, filter: 'diablo', interval: DataInterval.hour },
            expected: {
                totalTicks: 5,
                ticks: {
                    'Diablo III': 5,
                    'Diablo II': 5,
                    'Diablo': 4,
                },
                data: {
                    '2020-10-30T12': {
                        'Diablo III': { mean: 10_000, min: 10_000, max: 10_000, ticks: 1 },
                        'Diablo II': { mean: 5000, min: 5000, max: 5000, ticks: 1 },
                        'Diablo': { mean: 3000, min: 3000, max: 3000, ticks: 1 },
                    },
                    '2020-10-30T13': {
                        'Diablo III': { mean: 11_500, min: 11_000, max: 12_000, ticks: 2 },
                        'Diablo II': { mean: 6500, min: 6000, max: 7000, ticks: 2 },
                        'Diablo': { mean: 3750, min: 3500, max: 4000, ticks: 2 },
                    },
                    '2020-10-31T12': {
                        'Diablo III': { mean: 20_000, min: 20_000, max: 20_000, ticks: 1 },
                        'Diablo II': { mean: 10_000, min: 10_000, max: 10_000, ticks: 1 },
                        'Diablo': { mean: 6000, min: 6000, max: 6000, ticks: 1 },
                    },
                    '2020-10-31T13': {
                        'Diablo III': { mean: 10_000, min: 10_000, max: 10_000, ticks: 1 },
                        'Diablo II': { mean: 8000, min: 8000, max: 8000, ticks: 1 },
                    },
                },
            },
        },
    ];

    for (const test of tests) {
        it(test.label, () => {

            const {data, filter, interval} = test.input;

            assert.deepStrictEqual(TimeStatsMapper.mapData(data, filter, interval), test.expected);
            // console.log('test', test.label, 'passed');
        });
    }

    // console.log('all tests passed');
});

describe('filters', () => {
    const tests: { label: string; input: Input; expected: TimeStatsResponse }[] = [
        {
            label: 'filter: {exact: "diablo"}',
            input: { data: dataset1, filter: {exact: 'diablo'}, interval: DataInterval.month },
            expected: {
                totalTicks: 4,
                ticks: {
                    'Diablo': 4,
                },
                data: {
                    '2020-10': {
                        'Diablo': { mean: 4125, min: 3000, max: 6000, ticks: 4 },
                    }
                },
            },
        },
        {
            label: 'filter: ["diablo ii", "just"]',
            input: { data: dataset1, filter: ['diablo ii', 'just'], interval: DataInterval.month },
            expected: {
                totalTicks: 6,
                ticks: {
                    'Diablo III': 5,
                    'Diablo II': 5,
                    'Just Chatting': 6,
                },
                data: {
                    '2020-10': {
                        'Diablo III': { mean: 12_600, min: 10_000, max: 20_000, ticks: 5 },
                        'Diablo II': { mean: 7200, min: 5000, max: 10_000, ticks: 5 },
                        'Just Chatting': { mean: 100_000, min: 100_000, max: 100_000, ticks: 6 },
                    }
                },
            },
        },
        {
            label: 'filter: [{exact: "diablo ii"}, {exact: "just chatting"}]',
            input: { data: dataset1, filter: [{exact: 'diablo ii'}, {exact: 'just chatting'}], interval: DataInterval.month },
            expected: {
                totalTicks: 6,
                ticks: {
                    'Diablo II': 5,
                    'Just Chatting': 6,
                },
                data: {
                    '2020-10': {
                        'Diablo II': { mean: 7200, min: 5000, max: 10_000, ticks: 5 },
                        'Just Chatting': { mean: 100_000, min: 100_000, max: 100_000, ticks: 6 },
                    }
                },
            },
        },
    ];

    for (const test of tests) {
        it(test.label, () => {

            const {data, filter, interval} = test.input;

            assert.deepStrictEqual(TimeStatsMapper.mapData(data, filter, interval), test.expected);
            // console.log('test', test.label, 'passed');
        });
    }

    // console.log('all tests passed');
});