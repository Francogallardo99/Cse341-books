# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:
```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:
```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

---

## Feature 2: Author CRUD Operations

### Goal
Add an `authors` collection to the API and provide full CRUD operations (Create, Read, Update, Delete) for author documents. Maintain referential integrity between authors and books, and document every author route in Swagger so it can be tested from the browser.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`
- `name`: string, required, full name of the author
- `birthYear`: number (integer), required, the year the author was born (e.g., `1965`)

Authors will use custom string ids (e.g., `a1`, `a2`) instead of MongoDB `_id` values for route parameters and book references.

### Relationship to Books (Deletion Behavior)
Author documents are referenced by books via the `authorId` field in the `books` collection. 
If a client tries to delete an author who still has one or more books associated with their `id` in the `books` collection, the API must block the deletion and return a `400` status code explaining that the author cannot be deleted while they still have associated books.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by their custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:
```json
{
  "id": "a3",
  "name": "Ursula K. Le Guin",
  "birthYear": 1929
}
```

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if a required field (`id`, `name`, or `birthYear`) is missing or invalid
- `400` if the `id` already exists
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:
```json
{
  "name": "Ursula Kroeber Le Guin",
  "birthYear": 1929
}
```

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if a required field (`name` or `birthYear`) is missing or invalid
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `400` if the author still has books referencing their `id` in the `books` collection
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route, including request schemas and response codes.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

---

# Specification Evaluation (AI Review)

### 1. Are there any bugs or short-sighted decisions in this specification?
- **Immutable IDs on `PUT` requests:** In `PUT /books/:id` and `PUT /authors/:id`, the specification does not explicitly state what happens if the client includes a different `"id"` inside the JSON request body. If the backend blindly passes `req.body` into a MongoDB update call, a client could accidentally overwrite the custom `id` of an author, breaking all `authorId` references in existing books.
- **Data type validation:** `publicationDate` is just defined as a "string", and `birthYear` is a "number". Without strict format rules (e.g., ISO date `YYYY-MM-DD` for `publicationDate` and a valid integer range for `birthYear`), invalid data like `"publicationDate": "yesterday"` or `"birthYear": -99999` could be stored.
- **Semantic HTTP Status Codes:** Returning `400 Bad Request` for duplicate IDs or deleting an author with existing books works, but `409 Conflict` is often more descriptive, or at least the `400` error response needs a clear JSON message structure so the developer knows *why* it failed.

### 2. Are there any security considerations that are missing?
- **Mass Assignment / Over-posting:** If the API inserts or updates `req.body` directly into MongoDB without stripping unexpected fields, a malicious user could inject arbitrary fields into the database documents or attempt to overwrite the internal `_id` field.
- **NoSQL Operator Injection:** If route parameters or body fields (`id`, `authorId`) are not explicitly validated to be primitive strings/numbers, an attacker could send a JSON object like `{"authorId": {"$ne": null}}` in `POST /books`, bypassing the author existence check.
- **Payload Size and Input Length:** There are no maximum character limits on `title`, `name`, or `id`, leaving the API vulnerable to oversized string payloads.

### 3. Are there any efficiency concerns with the current endpoint design?
- **Missing Database Indexes:** Because we are querying by custom `id` (on both `books` and `authors`) and `authorId` (when checking if an author has books before deletion), MongoDB will perform slow full-collection scans (`COLLSCAN`) unless we create unique indexes on `books.id` and `authors.id`, and a standard index on `books.authorId`.
- **Unbounded `GET` Queries:** `GET /books` and `GET /authors` return all documents in the collection at once. For a class project this is fine, but in production, large collections require pagination or a default limit.
- **Exposing Internal MongoDB `_id`:** By default, MongoDB returns the internal `_id` field along with our custom `id`. Projecting out `_id: 0` (or mapping the response) keeps payloads cleaner and consistent with the Swagger schemas.

### 4. Are any response examples or error behaviors unclear?
- **Standardized Error Format:** Version 1 lists error status codes (`400`, `404`, `500`), but does not define the JSON structure of an error response (e.g., `{ "error": "Descriptive error message" }`).
- **Complete Success Response Examples:** Version 1 shows request bodies for `POST` and `PUT`, but does not show exact JSON examples of what `GET`, `POST`, and `PUT` return (specifically whether `_id` is excluded).

---

# Books API Week 02 Spec - Version 2 (Implementation Checklist)

## Global API Rules & Security Standards
1. **Response Format:** All responses returning data or errors must use `Content-Type: application/json` (except `204 No Content`, which returns an empty body).
2. **Standard Error Response Schema:** Every `400`, `404`, and `500` response must return a JSON object following this exact structure:
   ```json
   {
     "message": "Human-readable explanation of what went wrong"
   }
   ```
3. **Clean Document Projection:** Responses must exclude MongoDB's internal `_id` field (using projection `{ _id: 0 }`) so returned objects match the exact Swagger schemas.
4. **Input Sanitization & Mass Assignment Protection:** Only extract explicitly allowed fields from `req.body` (`id`, `authorId`, `title`, `publicationDate` for books; `id`, `name`, `birthYear` for authors). Ignore any extra fields. Ensure all inputs are primitive strings or integers (never objects/arrays) to prevent NoSQL injection.
5. **Database Indexes:**
   - `books` collection: unique index on `id`, standard index on `authorId`.
   - `authors` collection: unique index on `id`.

---

## Feature 1: Book CRUD Operations and Author References (Version 2)

### Goal
Update the Week 01 book API so book documents reference an existing author via `authorId` and support full CRUD operations, with strict validation and complete Swagger documentation.

### Data Model (`books` collection)
- `id`: string, required, non-empty, trimmed, max 20 chars (e.g., `"b1"`). Immutable after creation.
- `authorId`: string, required, non-empty, must match `authors.id`.
- `title`: string, required, non-empty, trimmed, max 200 chars.
- `publicationDate`: string, required, must match `YYYY-MM-DD` date format.

### Routes

#### GET /books
- **Purpose:** Return all books (excluding `_id`).
- **Success (`200`):**
  ```json
  [
    {
      "id": "b1",
      "authorId": "a1",
      "title": "A Wizard of Earthsea",
      "publicationDate": "1968-11-01"
    }
  ]
  ```
- **Errors:**
  - `500`: `{ "message": "Failed to fetch books" }`

#### GET /books/:id
- **Purpose:** Return a single book matching `req.params.id`.
- **Success (`200`):**
  ```json
  {
    "id": "b1",
    "authorId": "a1",
    "title": "A Wizard of Earthsea",
    "publicationDate": "1968-11-01"
  }
  ```
- **Errors:**
  - `404`: `{ "message": "Book not found" }`
  - `500`: `{ "message": "Failed to fetch book" }`

#### POST /books
- **Purpose:** Validate input, verify `authorId` exists, and create a new book.
- **Request Body:**
  ```json
  {
    "id": "b4",
    "authorId": "a1",
    "title": "The Left Hand of Darkness",
    "publicationDate": "1969-03-01"
  }
  ```
- **Validation Rules:**
  1. All four fields (`id`, `authorId`, `title`, `publicationDate`) must be present and non-empty strings.
  2. `publicationDate` must match `^\d{4}-\d{2}-\d{2}$`.
  3. No book in `books` can already have `id`.
  4. An author in `authors` must exist with `id === authorId`.
- **Success (`201`):** Returns the created book object (without `_id`).
- **Errors:**
  - `400`: `{ "message": "Missing or invalid required fields: id, authorId, title, publicationDate (YYYY-MM-DD)" }`
  - `400`: `{ "message": "A book with this id already exists" }`
  - `400`: `{ "message": "Referenced authorId does not exist" }`
  - `500`: `{ "message": "Failed to create book" }`

#### PUT /books/:id
- **Purpose:** Update `authorId`, `title`, and `publicationDate` for an existing book. The book's `id` cannot be changed (ignore `req.body.id` if sent).
- **Request Body:**
  ```json
  {
    "authorId": "b2",
    "title": "Updated Book Title",
    "publicationDate": "2026-02-20"
  }
  ```
- **Validation Rules:**
  1. `authorId`, `title`, and `publicationDate` must be non-empty strings, and `publicationDate` must match `YYYY-MM-DD`.
  2. An author in `authors` must exist with `id === authorId`.
  3. A book with `req.params.id` must exist.
- **Success (`200`):** Returns the updated book object (without `_id`).
- **Errors:**
  - `400`: `{ "message": "Missing or invalid required fields: authorId, title, publicationDate (YYYY-MM-DD)" }`
  - `400`: `{ "message": "Referenced authorId does not exist" }`
  - `404`: `{ "message": "Book not found" }`
  - `500`: `{ "message": "Failed to update book" }`

#### DELETE /books/:id
- **Purpose:** Delete a book by its custom `id`.
- **Success (`204`):** Empty response body.
- **Errors:**
  - `404`: `{ "message": "Book not found" }`
  - `500`: `{ "message": "Failed to delete book" }`

---

## Feature 2: Author CRUD Operations (Version 2)

### Goal
Provide full CRUD operations for the `authors` collection, prevent deletion of authors who still have books in the `books` collection, and document all endpoints in Swagger.

### Data Model (`authors` collection)
- `id`: string, required, non-empty, trimmed, max 20 chars (e.g., `"a1"`). Immutable after creation.
- `name`: string, required, non-empty, trimmed, max 150 chars.
- `birthYear`: integer, required, must be a valid integer between `-3000` and the current year (`2026`).

### Routes

#### GET /authors
- **Purpose:** Return all authors (excluding `_id`).
- **Success (`200`):**
  ```json
  [
    {
      "id": "b1",
      "name": "Ursula K. Le Guin",
      "birthYear": 1929
    }
  ]
  ```
- **Errors:**
  - `500`: `{ "message": "Failed to fetch authors" }`

#### GET /authors/:id
- **Purpose:** Return one author by custom `id`.
- **Success (`200`):**
  ```json
  {
    "id": "a1",
    "name": "Ursula K. Le Guin",
    "birthYear": 1929
  }
  ```
- **Errors:**
  - `404`: `{ "message": "Author not found" }`
  - `500`: `{ "message": "Failed to fetch author" }`

#### POST /authors
- **Purpose:** Create a new author.
- **Request Body:**
  ```json
  {
    "id": "a3",
    "name": "Octavia E. Butler",
    "birthYear": 1947
  }
  ```
- **Validation Rules:**
  1. `id` and `name` must be non-empty strings.
  2. `birthYear` must be an integer (`Number.isInteger(birthYear)`).
  3. No author in `authors` can already have `id`.
- **Success (`201`):** Returns the newly created author object (without `_id`).
- **Errors:**
  - `400`: `{ "message": "Missing or invalid required fields: id (string), name (string), birthYear (integer)" }`
  - `400`: `{ "message": "An author with this id already exists" }`
  - `500`: `{ "message": "Failed to create author" }`

#### PUT /authors/:id
- **Purpose:** Update `name` and `birthYear` for an existing author. The author's `id` cannot be changed (ignore `req.body.id` if sent).
- **Request Body:**
  ```json
  {
    "name": "Octavia Estelle Butler",
    "birthYear": 1947
  }
  ```
- **Validation Rules:**
  1. `name` must be a non-empty string and `birthYear` must be an integer.
  2. An author with `req.params.id` must exist.
- **Success (`200`):** Returns the updated author object (without `_id`).
- **Errors:**
  - `400`: `{ "message": "Missing or invalid required fields: name (string), birthYear (integer)" }`
  - `404`: `{ "message": "Author not found" }`
  - `500`: `{ "message": "Failed to update author" }`

#### DELETE /authors/:id
- **Purpose:** Delete an existing author only if they have no associated books.
- **Validation / Integrity Check:**
  1. Check if author with `req.params.id` exists in `authors`. If not, return `404`.
  2. Check `books` collection using `books.countDocuments({ authorId: req.params.id })`. If the count is greater than `0`, reject with `400`.
- **Success (`204`):** Empty response body.
- **Errors:**
  - `400`: `{ "message": "Cannot delete author with existing books. Delete or reassign their books first." }`
  - `404`: `{ "message": "Author not found" }`
  - `500`: `{ "message": "Failed to delete author" }`

### Swagger & Deployment Checklist
- [ ] Define `Book`, `NewBook`, `UpdateBook`, `Author`, `NewAuthor`, `UpdateAuthor`, and `Error` schemas in Swagger.
- [ ] Document all 5 `/books` routes and all 5 `/authors` routes with parameters, request bodies, and status codes (`200`, `201`, `204`, `400`, `404`, `500`).
- [ ] Verify `/api-docs` works both on `localhost` and on the deployed Render URL.