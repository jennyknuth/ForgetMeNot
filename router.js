var routes = require('routes')(),
    fs = require('fs'),
    qs = require('qs'),
    db = require('monk')('localhost/birthdays'), // Syncs up with mongo
    birthdays = db.get('birthdays'), // grabs a collection from the music database
    view = require('./view'),
    mime = require('mime')

routes.addRoute('/birthdays', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    birthdays.find({}, function (err, docs) {
      if (err) throw err
      var template = view.render('index', {birthdays: docs})
      res.end(template)
    })
  }
})

module.exports = routes
