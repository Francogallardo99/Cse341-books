    import { getAllBooks, getBookById, postBook, deleteBook, updateBook } from '../models/books.js';
    import { getAuthorById } from '../models/authors.js';

    export const getBooksHandler = async (req, res) => {
        try {
            const books = await getAllBooks();
            return res.status(200).json(books);
        } catch (error) {
            console.error('Internal server error:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    export const getBookByIdHandler = async (req, res) => {
        try {
            const book = await getBookById(req.params.id);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            return res.status(200).json(book);
        } catch (error) {
            console.error('Internal server error:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    export const postBookHandler = async (req, res) => {
        try {
            const { id, title, authorId, publicationDate } = req.body;
            const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
            const isValidDate = isoRegex.test(publicationDate);
            if (!title) return res.status(400).json({ message: 'Book title is required' });
            if (!id) return res.status(400).json({ message: 'Book ID is required' });
            if (!authorId) return res.status(400).json({ message: 'Author ID is required' });
            if (!isValidDate) return res.status(400).json({ message: 'Invalid publication date format. Please use YYYY-MM-DD.' });
            const authorExists = await getAuthorById(authorId);
            if (!authorExists) return res.status(400).json({ message: 'Author ID does not exist' });
            if (await getBookById(id)) return res.status(400).json({ message: 'Book ID already exists' });
            await postBook(req.body);
            const cleanBook = await getBookById(id);
            return res.status(201).json(cleanBook);
        } catch (error) {
            console.error('Internal server error:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };


    export const updateBookHandler = async (req, res) => {
        try {
            const { id } = req.params;
            const { title, authorId, publicationDate } = req.body;
            if (!title) return res.status(400).json({ message: 'Book title is required' });
            if (!authorId) return res.status(400).json({ message: 'Author ID is required' });
            if (!publicationDate) return res.status(400).json({ message: 'Publication date is required' });
            const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
            const isValidDate = isoRegex.test(publicationDate);
            if (!isValidDate) return res.status(400).json({ message: 'Invalid publication date format. Please use YYYY-MM-DD.' });
            const authorExists = await getAuthorById(authorId);
            if (!authorExists) return res.status(400).json({ message: 'Author ID does not exist' });
            const bookExists = await getBookById(id);
            if (!bookExists) {
                return res.status(404).json({ message: 'Book not found' });
            }
            const updatedBook = { title, authorId, publicationDate };
            const updateSuccess = await updateBook(id, updatedBook);
            if (updateSuccess) {
                const updatedBookData = await getBookById(id);
                return res.status(200).json(updatedBookData);
            }
            else {
                return res.status(500).json({ message: 'Failed to update book' });
            }
        } catch (error) {
            console.error('Internal server error:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    export const deleteBookHandler = async (req, res) => {
        try {
            const { id } = req.params;
            const bookExists = await getBookById(id);
            if (!bookExists) {
                return res.status(404).json({ message: 'Book not found' });
            }
            const deleteSuccess = await deleteBook(id);
            if (deleteSuccess) {
                return res.status(204).send();
            } else {
                return res.status(500).json({ message: 'Failed to delete book' });
            }
        } catch (error) {
            console.error('Internal server error:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };