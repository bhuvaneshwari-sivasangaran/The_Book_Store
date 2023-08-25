exports.loadDashboard = (req, res)=>{
    res.render('addBook');
} 

exports.editBook = (req, res)=>{
    res.render('editBook');
} 

exports.deleteBook = (req, res)=>{
    res.render('deleteBook');
}

exports.listBooks = (req, res)=>{
    res.render('listBooks');
} 

exports.checkout = (req, res)=>{
    res.render('checkout');
} 

exports.invoice = (req, res)=>{
    res.render('Invoice');
} 