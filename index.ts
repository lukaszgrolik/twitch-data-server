// import * as path from 'path';
// import * as fs from 'fs';
// import * as yargs from 'yargs';
// import * as fastGlob from 'fast-glob';
import * as express from 'express';
import * as cors from 'cors';
import * as mongodb from 'mongodb';

function sanitizeObj(obj: {[key: string]: any}): void {
    for (let key of Object.keys(obj)) {
        if (key.includes('.')) {
            // const newKey = key.replace('.', '[dot]');
            const newKey = key.replace(/\./g, '[dot]');
            obj[newKey] = obj[key];
            delete obj[key];
        }
    }
}

const app = express();
const port = 3000;
const mongo = mongodb.MongoClient;

(async () => {
    const client = await mongo.connect('mongodb://localhost:27017', {
        useUnifiedTopology: true,
    });
    const db = client.db('twitch-data');
    const categoriesPages = db.collection('categories-pages')

    app.use(cors({origin: '*'}));
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    // @todo body validation
    app.post('/categories', async (req, res) => {
        // console.log('body', req.body);

        sanitizeObj(req.body.categories);

        await categoriesPages.insertOne(req.body);

        res.json({success: true});
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
})();