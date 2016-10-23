// index.js
const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars')
const Translate = require('@google-cloud/translate');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var app = require('express')();
const port = 3300
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Your Translate API key
const apiKey = 'AIzaSyCP-TFmvNTa7JuoQCNt0q5f8WjzT_IVkIc';

// Instantiates a client
const translateClient = Translate({
  key: apiKey
});


// io.on('connection', function(socket){
//   console.log('a user connected');
// });


app.get('/', (request, response) => {  
  response.render('home', {
    name: 'Mudgett'
  })
})

app.post('/translate', (request, response) => {
  var text = request.body.data_message,
        target = request.body.data_country;

  var local_translation = '';
  // The text to translate
  console.log(request.body);

  // const text = ('request.data_message');
  // // The target language
  // const target = ('request.data_country');

  // Translates some text into Russian
  translateClient.translate(text, target, (err, translation) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);
    local_translation = translation;
  });
  return local_translation;
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




