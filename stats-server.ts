import { performance } from 'perf_hooks';
// import * as path from 'path';
// import * as fs from 'fs';
// import * as yargs from 'yargs';
// import * as fastGlob from 'fast-glob';
import * as express from 'express';
import * as cors from 'cors';
import {MongoClient} from 'mongodb';

import { DbCollections, TimeStatsResponse } from './src/interfaces';
import { DataInterval, fetchTimeStats, ParamFilter } from './src/time-stats';

// @todo try json string, calc memory taken
// @todo try redis
const cached: {[params: string]: TimeStatsResponse} = {};
const stringifyParams = (...params: any[]): string => {
    return JSON.stringify(params);
};

const app = express();
const port = 3002;

(async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017', {
        useUnifiedTopology: true,
    });
    const db = client.db('twitch-data');
    const dbCollections: DbCollections = {
        categoriesPages: db.collection('categories-pages'),
    };

    app.use(cors({origin: '*'}));
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    // @todo use validation lib
    app.post('/stats', async (req, res) => {
        const {from, to, interval, filter} = req.body;
        const queryStr = stringifyParams(from, to, interval, filter);

        if (cached[queryStr]) {
            res.json(cached[queryStr]);
            return;
        }

        let time = performance.now();
        const validateDate = (str: unknown): str is string => {
            if (typeof str !== 'string') return false;

            return !!str.match(/^\d{4}-\d{2}-\d{2}$/);
        };

        const validateInterval = (str: unknown): str is DataInterval => {
            if (typeof str !== 'string') return false;

            return ['month', 'day', 'hour'].includes(str);
        };
        const validateFilter = (filter: unknown): filter is ParamFilter => {
            const isValidValue = (val: unknown): boolean => {
                return typeof val === 'string' || (typeof val === 'object' && val !== null && val.hasOwnProperty('exact'));
            };

            if (filter instanceof Array)
                return filter.every(isValidValue)
            else
                return isValidValue(filter);
        }

        const errors: {[key: string]: string} = {};
        if (!validateDate(from)) errors.from = 'invalid date';
        if (!validateDate(to)) errors.to = 'invalid date';
        else if (validateDate(from) && to <= from) errors.to = 'end date must be greater than start date';
        if (!validateInterval(interval)) errors.interval = 'invalid value';
        if (!validateFilter(filter)) errors.filter = 'invalid filter';

        if (Object.keys(errors).length) {
            res.status(422).json({
                success: false,
                errors,
            });

            return;
        }

        // const data = await fetchTimeStats(dbCollections, {
        //     from: '2020-10-24',
        //     to: '2020-10-31',
        //     interval: DataInterval.day,
        //     filter: 'diablo',
        // });
        if (
            validateDate(from) &&
            validateDate(to) &&
            validateInterval(interval) &&
            validateFilter(filter)
        ) {
            const validationTime = performance.now() - time;
            const [data, perf] = await fetchTimeStats(dbCollections, {
                from,
                to,
                interval,
                filter,
            });
            const totalTime = performance.now() - time;

            // const jsonStr = JSON.stringify(data);
            cached[queryStr] = data;

            res.json({
                performance: {
                    validationTime,
                    ...perf,
                    totalTime
                },
                ...data,
            });
        }
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
})();