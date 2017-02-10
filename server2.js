// Gets called when running npm start

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config');

webpackDevMiddleware = require('webpack-dev-middleware');
webpackHotMiddleware = require('webpack-hot-middleware');

var express = require('express');
var bodyParser = require('body-parser');
var zerorpc = require("zerorpc");
var train = require('./train');
var app = express();

// app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// create RPC client
var client = new zerorpc.Client();
// client.connect("tcp://127.0.0.1:4242");

app.post('/login', function(req, res) {
  var user_name = req.body.username;
  var password = req.body.password;
  var keystrokes = req.body.keystrokes;

  console.log("User name = " + user_name + ", password is " + password);
  res.end("Success");
})

// app.post('/intervals', function(req, res) {
//   var intervals = req.body.intervals;
//   // var train_res = train.retrain(intervals);
//   client.invoke("train", intervals, function(error, zpcres, more) {
//     console.log(zpcres);
//     res.end(zpcres);
//   });
// })

app.use(webpackDevMiddleware(webpack(config), { // Start a server
  publicPath: config.output.publicPath,
  hot: true, // With hot reloading
  inline: false,
  historyApiFallback: true,
  quiet: true // Without logging
}))

// app.use(webpackHotMiddleware(webpack(config), {
//   log: console.log
// }))

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})

// app.listen(3000, 'localhost', function (err, result) {
//   if (err) {
//     console.log(err);
//   }
//
//   console.log('Listening at localhost:3000');
// });