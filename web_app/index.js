// index.js
const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars')
const app = express()  
const port = 3300

app.get('/', (request, response) => {  
  response.render('home', {
    name: 'Mudgett'
  })
})

// app.use(express.static('style.css'));
app.use(express.static('public'));

app.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views'))  

