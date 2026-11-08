import { getDb } from '../db/connect.js';

export const getAllBooks = async () => {
    const db = getDb();
    return await db.collection('books').find({}, { projection: { _id: 0 } }).toArray();
};

export const getBookById = async (bookId) => {
    const db = getDb();
    return await db.collection('books').findOne({ id: bookId }, { projection: { _id: 0 } });
};

export const postBook = async (book) => {
    const db = getDb();
    const result = await db.collection('books').insertOne(book);
    return book;
}

export const updateBook = async (bookId, updatedBook) => {
    const db = getDb();
    const result = await db.collection('books').updateOne({ id: bookId }, { $set: updatedBook });
    return result.modifiedCount > 0;
}

export const deleteBook = async (bookId) => {
    const db = getDb();
    const result = await db.collection('books').deleteOne({ id: bookId });
    return result.deletedCount > 0;
}