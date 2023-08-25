const mongoose = require("mongoose");
const Book = require("../model/book");
const BookInfo = require("../model/book_info");
const Customer = require("../model/customer");
const Purchase = require("../model/purchase");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const os = require("os");
const easyInvoice = require("easyinvoice");
const { error } = require("console");

// create a new drive test
exports.addBook = (req, res) => {
    if (!req.body) {
        res.status(400).send({ Message: " Data cannot be empty!" });
        return;
    }

    const bookInfo = new BookInfo({
        Quantity: req.body.quantity,
        Price: req.body.price,
        Description: req.body.desc,
    });

    let success = true;

    bookInfo
        .save(bookInfo)
        .then((data) => {
            const book = new Book({
                Isbn: req.body.isbn,
                Title: req.body.title,
                Author: req.body.author,
                BookInfo: data._id,
            });
            book.save(book)
                .then(() => {
                    res.render("addBook", { success });
                })
                .catch((error) => {
                    console.error(error);
                    success = false;
                    res.render("addBook", { success });
                });
        })
        .catch((error) => {
            console.error(error);
            success = false;
            res.render("addBook", { success });
        });
};

exports.getBooks = async (req, res) => {
    await Book.find({}).then((book) => {
        let Isbn = book.map((val) => val.Isbn);
        if (req.url === "/editBook") {
            res.render("editBook", { Isbn });
        } else {
            res.render("deleteBook", { Isbn });
        }
    });
};

exports.listBooks = (req, res) => {
    Book.find({})
        .populate("BookInfo")
        .then((book) => {
            res.render("listBooks", { data: book });
        });
};

exports.getBook = (req, res) => {
    const selectedIsbn = req.query.isbn;
    Book.find({ Isbn: selectedIsbn })
        .populate("BookInfo")
        .then((book) => {
            res.json(book);
        });
};

exports.editBook = async (req, res) => {
    if (!req.body) {
        res.status(400).send({ Message: " Data cannot be empty!" });
        return;
    }

    const myJson = {
        myobject: {
            _id: req.body._id,
            Isbn: req.body.isbn,
            Title: req.body.title,
            Author: req.body.author,
        },
    };

    const myJson2 = {
        myobject: {
            _id: req.body.i_id,
            Quantity: req.body.quantity,
            Price: req.body.price,
            Description: req.body.desc,
        },
    };

    let Isbn = await Book.find({}).then((data) => data.map((val) => val.Isbn));
    let success = true;

    Book.findByIdAndUpdate(req.body._id, myJson.myobject, {
        upsert: true,
    }).then(() => {
        BookInfo.findByIdAndUpdate(req.body.i_id, myJson2.myobject, {
            upsert: true,
        })
            .then(() => {
                res.render("editBook", { Isbn, success });
            })
            .catch((error) => {
                console.log(error);
                success = false;
                res.render("editBook", { Isbn, success });
            });
    });
};

exports.deleteBook = async (req, res) => {
    if (!req.body) {
        res.status(400).send({ Message: " Data cannot be empty!" });
        return;
    }

    let Isbn = await Book.find({}).then((data) => data.map((val) => val.Isbn));
    let success = true;

    Book.findOneAndDelete({ Isbn: req.body.isbn })
        .then(() => {
            res.render("deleteBook", { Isbn, success });
        })
        .catch((error) => {
            console.error(error);
            success = false;
            res.render("deleteBook", { Isbn, success });
        });
};

exports.addCustomer = async (req, res) => {
    if (!req.body) {
        res.status(400).send({ Message: " Data cannot be empty!" });
        return;
    }

    // storing data from request body to Schema
    const customer = new Customer({
        Name: req.body.name,
        Phone: req.body.phone,
        Email: req.body.email,
    });

    let selectedBooks = JSON.parse(req.body.selectedBooks);

    let data = await Book.find({}).populate("BookInfo").then(book => book);
    let success = true;

    Customer.find({ Email: req.body.email }).then(async (cus) => {
        if (cus.length != 0) {
            let books = [];
            let booksData = [];
            for (let i = 0; i < selectedBooks.length; i++) {
                books.push({
                    book: selectedBooks[i].book_id,
                    quantity: selectedBooks[i].selectedQuantity,
                });
                await Book.findById(selectedBooks[i].book_id)
                    .populate("BookInfo")
                    .then(async (Obj) => {
                        let quantity =
                            Number(selectedBooks[i].quantity) -
                            Number(selectedBooks[i].selectedQuantity);
                        const myJson = {
                            myobject: {
                                _id: selectedBooks[i].bookInfo_id,
                                Quantity: quantity,
                                Price: selectedBooks[i].price,
                                Description: selectedBooks[i].desc,
                            },
                        };

                        await BookInfo.findByIdAndUpdate(
                            selectedBooks[i].bookInfo_id,
                            myJson.myobject,
                            {
                                upsert: true,
                            }
                        );

                        booksData.push({
                            no: i + 1,
                            title: Obj.Title,
                            author: Obj.Author,
                            price: Obj.BookInfo.Price,
                            quantity: selectedBooks[i].selectedQuantity,
                        });
                    });
            }

            const purchase = new Purchase({
                Customer: cus[0]._id,
                Books: books,
            });

            await purchase.save(purchase).then(async (data1) => {
                await downloadInvoice(cus[0], data1, booksData);
                res.render("listBooks", { data, success });
            }).catch((error) => {
                console.log(error);
                success = false;
                res.render("listBooks", { data, success});
            });;
        } else {
            await customer
                .save(customer)
                .then(async (data) => {
                    let books = [];
                    let booksData = [];
                    for (let i = 0; i < selectedBooks.length; i++) {
                        books.push({
                            book: selectedBooks[i].book_id,
                            quantity: selectedBooks[i].selectedQuantity,
                        });
                        await Book.findById(selectedBooks[i].book_id)
                            .populate("BookInfo")
                            .then(async (Obj) => {
                                let quantity =
                                    Number(selectedBooks[i].quantity) -
                                    Number(selectedBooks[i].selectedQuantity);
                                const myJson = {
                                    myobject: {
                                        _id: selectedBooks[i].bookInfo_id,
                                        Quantity: quantity,
                                        Price: selectedBooks[i].price,
                                        Description: selectedBooks[i].desc,
                                    },
                                };

                                await BookInfo.findByIdAndUpdate(
                                    selectedBooks[i].bookInfo_id,
                                    myJson.myobject,
                                    {
                                        upsert: true,
                                    }
                                );

                                booksData.push({
                                    no: i + 1,
                                    title: Obj.Title,
                                    author: Obj.Author,
                                    price: Obj.BookInfo.Price,
                                    quantity: selectedBooks[i].selectedQuantity,
                                });
                            });
                    }

                    const purchase = new Purchase({
                        Customer: data._id,
                        Books: books,
                    });

                    await purchase.save(purchase).then(async (data1) => {
                        await downloadInvoice(data, data1, booksData);
                        res.render("listBooks", { data, success });
                    });
                })
                .catch((error) => {
                    console.log(error);
                    success = false;
                    res.render("listBooks", { data, success });
                });
        }
    });
};

exports.getInvoice = async (req, res) => {
    const targetDate = req.query.date;
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const query = {
        Date: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
    };

    await Purchase.find(query)
        .populate("Customer")
        .then(async (purchaseData) => {
            res.json(purchaseData);
        });
};

exports.downloadInvoice = async (req, res) => {
    await Purchase.findById(req.query.invoiceNumber).then(
        async (purchaseData) => {
            await Customer.findById(purchaseData.Customer).then(
                async (customerData) => {
                    for (let i = 0; i < purchaseData.Books.length; i++) {
                        let booksData = [];
                        await Book.findById(purchaseData.Books[i].book)
                            .populate("BookInfo")
                            .then((Obj) => {
                                booksData.push({
                                    no: i + 1,
                                    title: Obj.Title,
                                    author: Obj.Author,
                                    price: Obj.BookInfo.Price,
                                    quantity: purchaseData.Books[i].quantity,
                                });
                                if (
                                    booksData.length ===
                                    purchaseData.Books.length
                                ) {
                                    downloadInvoice(
                                        customerData,
                                        purchaseData,
                                        booksData
                                    );
                                }
                            });
                    }
                }
            );
        }
    );
};

function downloadInvoice(customerData, purchaseData, booksData) {
    let books = [];

    for (let i = 0; i < booksData.length; i++) {
        books.push({
            quantity: booksData[i].quantity,
            description: booksData[i].title,
            "tax-rate": 6,
            price: booksData[i].price,
        });
    }

    let data = {
        translate: {
            invoice: "Purchase receipt",
        },
        sender: {
            company: "The Book Store",
            address: "Xyz Circle 123",
            zip: "1A1 A1A",
            city: "Toronto, ON",
            country: "Canada",
        },
        client: {
            company: customerData.Name,
            zip: customerData.Email,
            address: customerData.Phone,
        },
        information: {
            number: purchaseData._id,
            date: new Date(purchaseData.Date).toISOString(),
        },
        products: books,
        "bottom-notice":
            "Book are eligible for return or refund within 30 days of purchase.",
        settings: {
            currency: "CAD",
        },
    };

    easyInvoice.createInvoice(data, async function (result) {
        try {
            const downloadsFolder = require("os").homedir() + "/Downloads";
            const pdfFilePath = path.join(downloadsFolder, "invoice.pdf");
            await fs.promises.writeFile(pdfFilePath, result.pdf, "base64");
            console.log("Invoice PDF saved at:", pdfFilePath);
        } catch (error) {
            console.error("Error:", error);
        }
    });
}
