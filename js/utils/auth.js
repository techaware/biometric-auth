// import request from './Request';

import request from 'request';
// import $ from "jquery";
/**
 * Authentication lib
 * @type {Object}
 */
var auth = {
    /**
     * Logs a user in
     * @param  {string}   username The username of the user
     * @param  {string}   password The password of the user
     * @param  {Function} callback Called after a user was logged in on the remote server
     */
    login(username, password, keystrokes, callback) {
        // If there is a token in the localStorage, the user already is
        // authenticated
        if (this.loggedIn()) {
            callback(true);
            return;
        }
        // Post a fake request (see below)
        request.post({
                url: '/userlogin',
                form: {username: username, password: password, keystrokes: JSON.stringify(keystrokes)},
                headers: {'content-type': 'application/x-www-form-urlencoded'}
            },
            // function(error, response, body){
            //     console.log(body);
            // });
            (error, response, body) => {
                // If the user was authenticated successfully, save a random token to the
                // localStorage
                body = JSON.parse(body);
                if (body.authenticated) {
                    localStorage.token = body.token;
                    callback(true,body.stat,body.status);
                } else {
                    // If there was a problem authenticating the user, show an error on the
                    // form
                    callback(false,null,null,body.error);
                }
            });
    },
    /**
     * Logs the current user out
     */
    logout(callback) {
        request.post('/logout', {}, () => {
            callback(true);
        });
    },
    /**
     * Checks if anybody is logged in
     * @return {boolean} True if there is a logged in user, false if there isn't
     */
    loggedIn() {
         // return !!localStorage.token;
        return false;
    },
    /**
     * Registers a user in the system
     * @param  {string}   username The username of the user
     * @param  {string}   password The password of the user
     * @param  {Function} callback Called after a user was registered on the remote server
     */
    register(username, password, keystrokes, callback) {
        // Post a fake request
        request.post('/register',{
                // url: '/register',
                form: {username: username, password: password, keystrokes: JSON.stringify(keystrokes)},
                headers: {'content-type': 'application/x-www-form-urlencoded'}
            },
            (error, response, body) => {
            // If the user was successfully registered, log them in
                body = JSON.parse(body);
            if (body.registered === true) {
                this.login(username, password, keystrokes, callback);
            } else {
                // If there was a problem registering, show the error
                callback(false, body.error);
            }
        });
    },
    onChange() {
    }
}

module.exports = auth;
