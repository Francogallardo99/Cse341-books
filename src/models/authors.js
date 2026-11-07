import { getDb } from '../db/connect.js';

export const getAllAuthors = async () => {
    const db = getDb();
    return await db.collection('authors').find({}, {projection:{_id:0}}).toArray();
};

export const getAuthorById = async (authorId) => {
    const db = getDb();
    return await db.collection('authors').findOne({ id: authorId }, {projection:{_id:0}});
};

export const postAuthor = async (author) => {
    const db = getDb();
    const result = await db.collection('authors').insertOne(author);
    return author;
}

export const updateAuthor = async (authorId, updatedAuthor) => {
    const db = getDb();
    const result = await db.collection('authors').updateOne({ id: authorId }, { $set: updatedAuthor });
    return result.modifiedCount > 0;
}

export const deleteAuthor = async (authorId) => {
    const db = getDb();
    const result = await db.collection('authors').deleteOne({ id: authorId });
    return result.deletedCount > 0;
}

export const authorHasBooks = async (authorId) => {
    const db = getDb();
    const book = await db.collection('books').findOne({ authorId: authorId });
    return book !== null;
}