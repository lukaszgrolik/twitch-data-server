import * as mongodb from 'mongodb';

import {DbCollections} from './src/interfaces';
import {DataInterval, fetchTimeStats} from './src/time-stats';

const mongo = mongodb.MongoClient;

(async () => {
    const client = await mongo.connect('mongodb://localhost:27017', {
        useUnifiedTopology: true,
    });
    const db = client.db('twitch-data');
    const dbCollections: DbCollections = {
        categoriesPages: db.collection('categories-pages'),
    };

    await fetchTimeStats(dbCollections, {
        from: '2020-10-24',
        to: '2020-10-31',
        interval: DataInterval.day,
        filter: 'diablo',
        // filter: ['diablo', 'magic iii', 'pharaoh'],
        // limit: 20,
    });
    await fetchTimeStats(dbCollections, {
        from: '2020-10-27',
        to: '2020-10-28',
        interval: DataInterval.hour,
        filter: '',
    });
    // await fetchTimeStats(dbCollections, {
    //     from: '2020-10-27 10:00',
    //     to: '2020-10-27 15:00',
    //     // interval: '5min',
    // });

    // @todo count viewers sum + non games
    // @todo avg views in a day per category + non games

    //

    // @todo avg number of entries per day

    process.exit();
})();