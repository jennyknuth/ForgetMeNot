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
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var birthday = qs.parse(data)
      birthdays.insert(birthday, function (err, doc) {
        if (err) res.end('boop')
        res.writeHead(302, {'Location': '/birthdays'})
        res.end()
      })
    })
  }
})
routes.addRoute('/birthdays/new', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var template = view.render('new', {})
    res.end(template)
  }
})
routes.addRoute('/birthdays/:id', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    birthdays.findOne({_id: url.params.id}, function (err, doc) {
        if (err) res.end('It broke')
        var template = view.render('show', doc)
        res.end(template)
    })
  }
})
routes.addRoute('/birthdays/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    birthdays.remove({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      res.writeHead(302, {'Location': '/birthdays'})
      res.end()
    })
  }
})
routes.addRoute('/birthdays/:id/edit', function (req, res, url) {
  if (req.method === 'GET') {
    birthdays.findOne({_id: url.params.id}, function (err, doc) {
      var template = view.render('edit', doc)
      res.end(template)
    })
  }
})
routes.addRoute('/birthdays/:id/update', function (req, res, url) {
  if (req.method === 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      var birthday = qs.parse(data)
      birthdays.update({_id: url.params.id}, birthday, function (err, doc) {
        if (err) throw err
        res.writeHead(302, {'Location': '/birthdays'})
        res.end()
      })
    })
  }
})
module.exports = routes
