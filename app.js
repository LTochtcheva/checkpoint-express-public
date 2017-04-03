var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser');

var Book = require('./models/book');

module.exports = app;
//need body parser to get info from req.body!!
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));

//serving static on '/files route' - first argument
app.use('/files', express.static(path.join(__dirname, './public/static')));

app.get('/api/books', function (req, res, next) {
  //if there are query strings, find these books
  var title = req.query.title;
  if (title) {
    console.log('TITLE: ', title)
    Book.findAll({
      where: {
        title: title
      }
    })
    .then (function(booksWithTheseTitles) {
      res.send(booksWithTheseTitles);
    })
    .catch(next);
  }
  //no query string - bring all the books
  else {
    Book.findAll({})
  .then(function (foundBooks) {
    res.send(foundBooks);
  } )
  .catch(next)
  }
})
//post a book, then send status and the new book
app.post('/api/books', function (req, res, next) {
  Book.create(req.body)
  .then(function(newBook) {
  res.status(201).send(newBook);
  })
  .catch(next)
})
//find a book with a given id
app.get('/api/books/:id', function (req, res, next) {
  Book.findOne({
    where: {
      id: req.params.id
    }
  })
  .then(function(theBook) {
    //if there is no book with such id, send an error to handler
    if (!theBook) res.sendStatus(404);
    else res.send(theBook);
  })
  .catch(next)
})
//update a specified book with info from req.body
app.put('/api/books/:id', function (req, res, next) {
  Book.update(req.body, {
    where: {
      id: req.params.id
    },
    returning: true
  })
  .then(function (updatedBookArr) {
    //update returns an array, updated book is in [1]
     if (!updatedBookArr[1][0]) res.sendStatus(404);
     else res.send(updatedBookArr[1][0])
  }).catch(next);
})
//to delete a book first find it
app.delete('/api/books/:id', function (req, res, next) {
  Book.findOne({
    where: {
      id: req.params.id
    }
  })
  //make sure this book exists
  .then(function(bookToDelete) {
    if (!bookToDelete) res.sendStatus(404);
    else {
      Book.destroy({
        where: {
          id: req.params.id
        }
      })
      res.sendStatus(204);
    }
  })
  .catch(next);
})

//error-handler should be the last, after all the routes
//don't like this part!!
app.get('/forbidden', function(req, res, next) {
  var err = new Error();
  err.status = 403;
  next(err);
})
app.get('*', function (req, res, next) {
  var error = new Error();
  next(error);
})

app.use(function(err, req, res, next) {
  res.sendStatus(err.status || 500);

});
