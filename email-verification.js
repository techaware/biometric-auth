/**
 * Created by Rahul Aware on 2/26/17.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var nev = require('email-verification')(mongoose);
var User = require('./model/user');

module.exports = function(){

// sync version of hashing function
//     var myHasher = function(password, tempUserData, insertTempUser, callback) {
//         // var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
//         //password is already hashed
//         return insertTempUser(password, tempUserData, callback);
//     };

// // async version of hashing function
// myHasher = function(password, tempUserData, insertTempUser, callback) {
//     bcrypt.genSalt(8, function(err, salt) {
//         bcrypt.hash(password, salt, function(err, hash) {
//             return insertTempUser(hash, tempUserData, callback);
//         });
//     });
// };

    var config = function(){

// NEV configuration =====================
        nev.configure({
            persistentUserModel: User,
            expirationTime: 600, // 10 minutes

            verificationURL: 'http://auth.ecotaru.com/email-verification/${URL}',
            resetURL: 'http://auth.ecotaru.com/email-reset/${URL}',
            transportOptions: {
                service: 'Gmail',
                auth: {
                    user: 'noreply@ecotaru.com',
                    pass: 'Rahul@81'
                }
            },

            // hashingFunction: myHasher,
            passwordFieldName: 'password',
            emailFieldName: 'username',
        }, function(err, options) {
            if (err) {
                console.log(err);
                return;
            }

            console.log('configured: ' + (typeof options === 'object'));
        });

        nev.generateTempUserModel(User, function(err, tempUserModel) {
            if (err) {
                console.log(err);
                return;
            }

            console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
        });
    };

    var createTempUser = function(newUser,res){
        nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
            if (err) {
                return res.send({
                    registered: false,
                    msg:{
                        type: 'user-temp-failed',
                        msg: 'ERROR: creating temp user FAILED'
                    }
                });
            }

            // user already exists in persistent collection
            if (existingPersistentUser) {
                return res.send({
                    registered: false,
                    msg:{
                        type: 'user-already-exist',
                        msg: 'You have already signed up and confirmed your account. Did you forget your password?'
                    }
                }) ;
            }

            // new user created
            if (newTempUser) {
                var URL = newTempUser[nev.options.URLFieldName];

                nev.sendVerificationEmail(newTempUser[nev.options.emailFieldName], URL, function(err, info) {
                });
                res.send({
                    registered: true,
                    msg:{
                        type: 'user-verify_email',
                        msg: 'An email has been sent to you. Please check it to verify your account.'
                    }
                });

                // user already exists in temporary collection!
            } else {
                res.send({
                    registered: false,
                    msg:{
                        type: 'user-already-signedup',
                        msg: 'You have already signed up. Please check your email to verify your account.'
                    }
                }) ;
            }
        });

    };


    var resetTempUser = function(newUser,res){
        nev.resetTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
            if (err) {
                return res.send({
                    registered: false,
                    msg:{
                        type: 'user-temp-failed',
                        msg: 'ERROR: resetting temp user FAILED'
                    }
                });
            }

            // user already exists in persistent collection
            if (existingPersistentUser) {
                return res.send({
                    registered: false,
                    msg:{
                        type: 'user-already-exist',
                        msg: 'You have already signed up and confirmed your account. Did you forget your password?'
                    }
                }) ;
            }

            // new user created
            if (newTempUser) {
                var URL = newTempUser[nev.options.URLFieldName];

                nev.sendResetEmail(newTempUser[nev.options.emailFieldName], URL, function(err, info) {
                });
                res.send({
                    registered: true,
                    msg:{
                        type: 'user-reset_email',
                        msg: 'An email has been sent to you. Please check it to verify your account.'
                    }
                });

                // user already exists in temporary collection!
            } else {
                res.send({
                    registered: false,
                    msg:{
                        type: 'user-already-signedup',
                        msg: 'You have already signed up. Please check your email to verify your account.'
                    }
                }) ;
            }
        });

    };

    var confirmTempUser = function(url,callback){
        nev.confirmTempUser(url,false, callback);
    }

    var confirmResetTempUser = function(url,callback){
        nev.confirmTempUser(url,true, callback);
    }

    return {
        config: config,
        createTempUser: createTempUser,
        confirmTempUser: confirmTempUser,
        resetTempUser: resetTempUser,
        confirmResetTempUser:confirmResetTempUser
    };
};
