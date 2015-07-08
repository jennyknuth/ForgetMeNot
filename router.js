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
      if (err) res.end('could not access database or collection')
      var template = view.render('index', { birthdays: docs})
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
      // if (birthday.photo) {
      //   birthday.photo = [birthday.photo]
      // } else {
      //   birthday.photo = []
      // }
      if (birthday.memory) {
        birthday.memory = [birthday.memory]
      } else {
        birthday.memory = []
      }
      if (birthday.gifts) {
        birthday.gifts = [birthday.gifts]
      } else {
        birthday.gifts = []
      }
      console.log('birthday', birthday)
      birthdays.insert(birthday, function (err, doc) {
        if (err) res.end('could not insert into database')
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
        if (err) res.end('could not find id')
        var template = view.render('show', doc)
        res.end(template)
    })
  }
})
routes.addRoute('/birthdays/:id/delete', function (req, res, url) {
  if (req.method === 'POST') {
    birthdays.remove({_id: url.params.id}, function (err, doc) {
      if (err) res.end('could not delete')
      res.writeHead(302, {'Location': '/birthdays'})
      res.end()
    })
  }
})
routes.addRoute('/birthdays/:id/edit', function (req, res, url) {
  console.log(url.params.id)
  if (req.method === 'GET') {
    birthdays.findOne({_id: url.params.id}, function (err, doc) {
      if (err) res.end('could not find ID')
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
      console.log('birthday', birthday)
      if (birthday.memory) {
        birthdays.update({_id: url.params.id}, {"$push": { memory: birthday.memory}}, function (err, doc) {
          if (err) res.end('could not update memories')
        })
      }
      if (birthday.gifts) {
        birthdays.update({_id: url.params.id}, {"$push": { gifts: birthday.gifts}}, function (err, doc) {
          if (err) res.end('could not update gift ideas')

        })
      }
      res.writeHead(302, {'Location': '/birthdays'})
      res.end()
    })
  }
})
routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('file not found: 404')
    }
    res.end(file)
  })
})
routes.addRoute('/', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  fs.readFile('templates/home.html', function (err, file) {
    if (err) res.end('404')
    res.end(file)
  })
})
module.exports = routes
