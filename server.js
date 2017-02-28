var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var httpProxy = require('http-proxy');
var mongoose = require('mongoose');
var hash = require('./pass').hash;
var zerorpc = require("zerorpc");
var train = require('./train');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
    changeOrigin: true
});

var app = express();

// create RPC client
var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");

/*
 Database and Models
 */
mongoose.connect("mongodb://localhost/myapp");

var User = require('./model/user');
var verification = require('./email-verification');
verification().config();


// var UserSchema = new mongoose.Schema({
//     username: String,
//     password: String,
//     salt: String,
//     hash: String
// });
// var User = mongoose.model('users', UserSchema);


var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');

// We point to our static assets
app.use(express.static(publicPath));

// // Always return the main index.html, so react-router render the route in the client
// app.get('*', (req, res) => {
//     // res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
//     res.redirect('/');
// });

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(session({secret: 'oinkoink'}));

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

// We only want to run the workflow when not in production
if (!isProduction) {

    // We require the bundler inside the if block because
    // it is only needed in a development environment. Later
    // you will see why this is a good idea
    var bundle = require('./server/bundle.js');
    bundle();

    // Any requests to localhost:3000/build is proxied
    // to webpack-dev-server
    app.all('/build/*', function (req, res) {
        proxy.web(req, res, {
            target: 'http://localhost:8080'
        });
    });

}
// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function (e) {
    console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
    console.log('Server running on port ' + port);
});
/*
 Helper Functions
 */
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    User.findOne({
            username: name
        },

        function (err, user) {
            if (user) {
                if (err) return fn({
                    type: "user-doesnt-exist"
                });
                hash(pass, user.salt, function (err, hash) {
                    if (err) return fn(err);
                    if (hash == user.hash) return fn(null, user, user.salt);
                    fn({
                        type: "password-wrong"
                    });
                });
            } else {
                return fn({
                    type: "user-doesnt-exist"
                });
            }
        });

}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExist(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/signup");
        }
    });
}

app.post('/register', function (req, res, callback) {
    var password = req.body.password;
    var username = req.body.username;
    var keystrokes = req.body.keystrokes;
    console.log(username);

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            password: password,
            salt: salt,
            hash: hash,
            keystrokes: keystrokes
        });
        verification().createTempUser(user, res);
    });
});

app.post('/reset', function (req, res, callback) {
    var password = req.body.password;
    var username = req.body.username;
    var keystrokes = req.body.keystrokes;
    console.log(username);

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            password: password,
            salt: salt,
            hash: hash,
            keystrokes: keystrokes
        });
        verification().resetTempUser(user, res);
    });
});

app.post("/userLogin", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user, token) {
        if (user) {

            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                // res.redirect('/');
                var rpcMessage = JSON.stringify({
                    keystrokes: req.body.keystrokes,
                    user: user.username,
                    newUser: false
                });
                client.invoke("train", rpcMessage, function (error, zpcres, more) {
                    // console.log(zpcres);
                    var ResObj = {};
                    if (error) {
                        ResObj = {
                            authenticated: true,
                            token: token,
                            stat: null,
                            status: 'Failed'
                        }
                    } else {
                        ResObj = {
                            authenticated: true,
                            token: token,
                            stat: zpcres.stat,
                            status: zpcres.message
                        }
                    }
                    ;
                    res.send(ResObj);

                });

                // res.send({authenticated: true,
                // token: token });
            });
        } else {

            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            // res.redirect('/login');
            res.send({
                authenticated: false,
                error: err
            });
        }
    });
});

app.post("/logout", function (req, res) {
    req.session.destroy(function () {
        // res.redirect('/');
    });
    res.send({logout: true});
});


// user accesses the link that is sent
app.get('/email-verification/:URL', function (req, res) {
    var url = req.params.URL;
    verification().confirmTempUser(url, function (err, user) {
        if (err) {
            res.status(404).send('ERROR: user confirmation FAILED');
        } else if(user == null){
            res.status(404).send('ERROR: user not found');
        } else {
            res.status(200).send('User Confirmed!');
            //  train
            var rpcMessage = JSON.stringify({
                keystrokes: user.keystrokes,
                user: user.username,
                newUser: true
            });
            client.invoke("train", rpcMessage, function (error, zpcres, more) {
                console.log(zpcres);
            });
        }
    });

});

// user accesses the link that is sent
app.get('/email-reset/:URL', function (req, res) {
    var url = req.params.URL;
    verification().confirmResetTempUser(url, function (err, user) {
        if (err) {
            res.status(404).send('ERROR: user reset FAILED');
        } else if(user == null){
            res.status(404).send('ERROR: user not found');
        } else {
            res.status(200).send('Password reset Confirmed!');
            //  train
            var rpcMessage = JSON.stringify({
                keystrokes: user.keystrokes,
                user: user.username,
                newUser: true
            });
            client.invoke("train", rpcMessage, function (error, zpcres, more) {
                console.log(zpcres);
            });
        }
    });

});
