const express = require('express');
const route = express.Router();
const service = require('../services/service');
const controller = require('../controller/controller');

// Route to navigate pages
route.get('/' , service.loadDashboard);

route.get('/addBook' , service.loadDashboard);

route.get('/editBook' , controller.getBooks);

route.get('/deleteBook' , controller.getBooks);

route.post('/addBook' , controller.addBook);

route.get('/getSpecificData', controller.getBook);

route.post('/editBook' , controller.editBook);

route.post('/deleteBook' , controller.deleteBook);

route.get('/books', controller.listBooks);

route.get('/checkout', service.checkout);

route.get('/invoice', service.invoice);

route.post('/addCustomer', controller.addCustomer);

route.get('/getInvoice', controller.getInvoice);

route.get('/downloadInvoice', controller.downloadInvoice);

module.exports = route;