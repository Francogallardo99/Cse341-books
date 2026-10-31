    import { getDb } from '../db/connect.js';

    export const getAllBooks = async () => {
        const db = getDb();
        return await db.collection('books').find({}).toArray();
    };