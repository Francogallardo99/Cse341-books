import { getAllAuthors, getAuthorById , postAuthor , updateAuthor , deleteAuthor } from '../models/authors.js';

export const getAuthorsHandler = async (req, res) => {
    try {
        const authors = await getAllAuthors();
        return res.status(200).json(authors);
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAuthorsByIdHandler = async (req, res) => {
    try {
        const author = await getAuthorById(req.params.id);
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }
        return res.status(200).json(author);
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const postAuthorHandler = async (req, res) => {
    try {
        const { id, name, birthYear } = req.body;
        if (!name) return res.status(400).json({ message: 'Author name is required' });
        if (!id) return res.status(400).json({ message: 'Author ID is required' });
        if (!Number.isInteger(birthYear)) return res.status(400).json({ message: 'Author Birth Year must be an integer' });
        if (await getAuthorById(id)) return res.status(400).json({ message: 'Author ID already exists' });
        await postAuthor(req.body);
        const cleanAuthor = await getAuthorById(id);
        return res.status(201).json(cleanAuthor);

    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateAuthorHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, birthYear } = req.body;
        if (!name) return res.status(400).json({ message: 'Author name is required' });
        if (!Number.isInteger(birthYear)) return res.status(400).json({ message: 'Author Birth Year must be an integer' });
        const authorExists = await getAuthorById(id);
        if (!authorExists) {
            return res.status(404).json({ message: 'Author not found' });
        }
        const updatedAuthor = { name, birthYear };
        const updateSuccess = await updateAuthor(id, updatedAuthor);
        if (updateSuccess) {
            const updatedAuthorData = await getAuthorById(id);
            return res.status(200).json(updatedAuthorData);
        } else {
            return res.status(500).json({ message: 'Failed to update author' });
        }
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteAuthorHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const authorExists = await getAuthorById(id);
        if (!authorExists) {
            return res.status(404).json({ message: 'Author not found' });
        }
        const deleteSuccess = await deleteAuthor(id);
        if (deleteSuccess) {
            return res.status(200).json({ message: 'Author deleted successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to delete author' });
        }
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};