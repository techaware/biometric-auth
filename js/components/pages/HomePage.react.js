/*
 * HomePage
 *
 * This is the first thing users see of the app
 * Route: /
 *
 */

import React, { Component } from 'react';
import { Link } from 'react-router';
import Nav from '../Nav.react';
import { connect } from 'react-redux';

class HomePage extends Component {
	render() {
    const dispatch = this.props.dispatch;
    const { loggedIn } = this.props.data;

    return (
			<article>
				<div>
					<section className="text-section">
						{/* Change the copy based on the authentication status */}
						{loggedIn ? (
							<h1>Welcome to typing pattern based authentication demo, you are logged in!</h1>
						) : (
							<h1>Welcome to typing pattern based authentication demo!</h1>
						)}
						<p>This application demonstrates typing pattern based authentication using machine learning alogorithms applied to keystroke biometrics.</p>
						<p>Back in 2003, I worked on this exact idea as part of my undergrad final year project. Those were initial days of Neural Network buzz and not many advanced tools of today's world were available. We concocted a solution based on C++ front end and Matlab based Neural Network(NN) Perceptron model with couple of hidden layers. Our approach was to train single NN model to identify typing patterns of multiple individuals. We were able to get 90% accuracy- good enough to graduate :-)  </p>
						<p>Fastforward a decade, and you have some pretty powerful open source tools and libraries that does the heavy lifting of capturing keystroke biometrics, create and train NN models. The field itself got whole new name - Machine Learning. My current shot to crack biometric authentication is based on <a href="https://keras.io">Keras</a> library which itself is based on <a href="">TensorFlow</a> library open sourced by Google. Frontend login screen is based on <a href="https://github.com/mxstbr/login-flow">login-flow</a> boilerplate by Max Stoiber based on React. It's enhanced to capture keystroke intervals using reactor pattern implementation via <a href="https://github.com/ReactiveX/rxjs">Rx.js</a> library. Backend is NodeJS server with MongoDB for storing user credentials. <a href="http://www.zerorpc.io/">ZeroRPC</a> is used to call python functions which are custom built to run NN algorithm. </p>
						<p>Click Register button to create a new user. You can create multiple user ids if you wish to try out passwords of various strengths. I suggest password to be atleast 8 characters long with as much variation in keys as possible. Remember, password acts like your handwritten signature. Even if someone knows it, it should be difficult to reproduce.</p>
						<code>Finally, by clicking Register or Login button, you agree to allow this website/demo to record your typing pattern. Please don't enter your real world passwords in this demo.</code>
						<p></p>
						{loggedIn ? (
							<Link to="/dashboard" className="btn btn--dash">Dashboard</Link>
						) : (
							<div>
								<Link to="/login" className="btn btn--login">Login</Link>
								<Link to="/register" className="btn btn--register">Register</Link>
							</div>
						)}
					</section>
					{/*<section className="text-section">*/}
						{/*<h2>Features</h2>*/}
						{/*<ul>*/}
							{/*<li>*/}
								{/*<p>Using <a href="https://github.com/gaearon/react-hot-loader"><strong>react-hot-loader</strong></a>, your changes in the CSS and JS get reflected in the app instantly without refreshing the page. That means that the <strong>current application state persists</strong> even when you change something in the underlying code! For a very good explanation and demo watch Dan Abramov himself <a href="https://www.youtube.com/watch?v=xsSnOQynTHs">talking about it at react-europe</a>.</p>*/}
							{/*</li>*/}
							{/*<li>*/}
								{/*<p><a href="https://github.com/gaearon/redux"><strong>Redux</strong></a> is a much better implementation of a flux–like, unidirectional data flow. Redux makes actions composable, reduces the boilerplate code and makes hot–reloading possible in the first place. For a good overview of redux check out the talk linked above or the <a href="https://gaearon.github.io/redux/">official documentation</a>!</p>*/}
							{/*</li>*/}
							{/*<li>*/}
								{/*<p><a href="https://github.com/postcss/postcss"><strong>PostCSS</strong></a> is like Sass, but modular and capable of much more. PostCSS is, in essence, just a wrapper for plugins which exposes an easy to use, but very powerful API. While it is possible to <a href="https://github.com/jonathantneal/precss">replicate Sass features</a> with PostCSS, PostCSS has an <a href="http://postcss.parts">ecosystem of amazing plugins</a> with functionalities Sass cannot even dream about having.</p>*/}
							{/*</li>*/}
							{/*<li>*/}
								{/*<p><a href="https://github.com/rackt/react-router"><strong>react-router</strong></a> is used for routing in this boilerplate. react-router makes routing really easy to do and takes care of a lot of the work.</p>*/}
							{/*</li>*/}
							{/*<li>*/}
								{/*<p><a href="http://www.html5rocks.com/en/tutorials/service-worker/introduction/"><strong>ServiceWorker</strong></a> and <a href="http://www.html5rocks.com/en/tutorials/appcache/beginner/"><strong>AppCache</strong></a> make it possible to use the application offline. As soon as the website has been opened once, it is cached and available without a network connection. <a href="https://developer.chrome.com/multidevice/android/installtohomescreen"><strong><code>manifest.json</code></strong></a> is specifically for Chrome on Android. Users can add the website to the homescreen and use it like a native app!</p>*/}
							{/*</li>*/}
						{/*</ul>*/}
					{/*</section>*/}
					{/*<section className="text-section">*/}
						{/*<h2>Authentication</h2>*/}
						{/*<p>Authentication happens in <code>js/utils/auth.js</code>, using <code>fakeRequest.js</code> and <code>fakeServer.js</code>. <code>fakeRequest</code> is a fake XMLHttpRequest wrapper with a similar syntax to <code>request.js</code> which simulates network latency. <code>fakeServer</code> responds to the fake HTTP requests and pretends to be a real server, storing the current users in localStorage with the passwords encrypted using <code>bcrypt</code>.*/}
						{/*</p>*/}
						{/*<p>To change it to real authentication, you’d only have to import <code>request.js</code> instead of <code>fakeRequest.js</code> and have a server running somewhere.</p>*/}
					{/*</section>*/}
				</div>
			</article>
		);
  }
}

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(HomePage);
