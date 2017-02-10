'use strict';
var child = require('child_process');
var zerorpc = require("zerorpc");

module.exports = {
	retrain: function(t) {
		// var spawn = child.spawn;
		// var process = spawn('python', ['./testPy.py', 'Hi Py']);
		// process.stdout.on('data', function(data) {
		// 	console.log(data);
		var client = new zerorpc.Client();
		client.connect("tcp://127.0.0.1:4242");

		client.invoke("train", t, function(error, res, more) {
			console.log(res);
			return res;
		});
	}
}