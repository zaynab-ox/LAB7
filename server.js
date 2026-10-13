
const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DATA_FILE = "books.json";

app.use(express.json());

let books = JSON.parse(
    fs.readFileSync(DATA_FILE, "utf8")
);

function saveBooks() {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(books, null, 2),
        "utf8"
    );
}

function validBook(title, author, price) {
    return (
        typeof title === "string" && title.trim() !== "" &&
        typeof author === "string" && author.trim() !== "" &&
        typeof price === "number" &&
        Number.isFinite(price) && price >= 0
    );
}

// GET: Show all books
app.get("/books", (req, res) => {
    res.status(200).json(books);
});

// GET: Find a book by ID
app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(item => item.id === id);

    if (!Number.isInteger(id) || !book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// POST: Add a book
app.post("/books", (req, res) => {
    const { title, author, price } = req.body;

    if (!validBook(title, author, price)) {
        return res.status(400).json({
            message: "Valid title, author and price are required"
        });
    }

    const newId = books.length
        ? Math.max(...books.map(item => item.id)) + 1
        : 1;

    const newBook = {
        id: newId,
        title: title.trim(),
        author: author.trim(),
        price: price
    };

    books.push(newBook);
    saveBooks();

    res.status(201).json(newBook);
});

// PUT: Update a book
app.put("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(item => item.id === id);

    if (!Number.isInteger(id) || !book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, price } = req.body;

    if (!validBook(title, author, price)) {
        return res.status(400).json({
            message: "Valid title, author and price are required"
        });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.price = price;

    saveBooks();

    res.status(200).json(book);
});

// DELETE: Remove a book
app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(item => item.id === id);

    if (!Number.isInteger(id) || index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    saveBooks();

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
