import { getDb } from '../db/connect.js';

export const getAllBooks = async () => {
    const db = getDb();
    return await db.collection('books').find({}).toArray();
};

export const getBookById = async (bookId) => {
    const db = getDb();
    return await db.collection('books').findOne({ id: bookId });
};