/**
 * Form.react.js
 *
 * The form with a username and a password input field, both of which are
 * controlled via the application state.
 *
 */

import React, {Component} from 'react';
import {changeForm} from '../actions/AppActions';
import {History} from 'react-router';
import LoadingButton from './LoadingButton.react';
var Rx = require('rx');
var ReactDOM = require('react-dom');
// Object.assign is not yet fully supported in all browsers, so we fallback to
// a polyfill
const assign = Object.assign || require('object.assign');

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.row = [];
        this.getPasswordDOM = this.getPasswordDOM.bind(this);
        this.getButtonDOM = this.getButtonDOM.bind(this);
    }

    getPasswordDOM(input) {
        this.passwordInput = input;
    }

    getButtonDOM(button) {
        this.submitButton = button;
    }

    render() {
        return (
            <form className="form" onSubmit={this._onSubmit.bind(this)}>
                <div className="form__error-wrapper">
                    <p className="form__error form__error--username-taken">Sorry, but this username is already
                        taken.</p>
                    <p className="form__error form__error--username-not-registered">This username does not exist.</p>
                    <p className="form__error form__error--wrong-password">Wrong password.</p>
                    <p className="form__error form__error--field-missing">Please fill out the entire form.</p>
                    <p className="form__error form__error--failed">Something went wrong, please try again!</p>
                    <p className="form__error form__error--user-temp-failed">ERROR: creating temp user FAILED</p>
                    <p className="form__error form__error--user-already-exist">You have already signed up and confirmed your account. Did you forget your password?</p>
                    <p className="form__error form__error--user-verify_failed">ERROR: sending verification email FAILED</p>
                    <p className="form__error form__error--user-already-signedup">You have already signed up. Please check your email to verify your account.</p>
                </div>
                <div className="form__message-wrapper">
                    <p className="form__message form__message--user-verify_email">Verification email sent. Please confirm your account by clicking the link in the email</p>
                    <p className="form__message form__message--user-reset_email">Password reset email sent. Please click the link in the email to confirm.</p>
                    {/*<p className="form__message form__message--username-not-registered">This username does not exist.</p>*/}
                    {/*<p className="form__message form__message--wrong-password">Wrong password.</p>*/}
                    {/*<p className="form__message form__message--field-missing">Please fill out the entire form.</p>*/}
                    {/*<p className="form__message form__message--failed">Something went wrong, please try again!</p>*/}
                </div>
                <div className="form__field-wrapper">
                    <input className="form__field-input"
                           type="text" id="username"
                           value={this.props.data.username}
                           placeholder="valid@email.com"
                           onChange={this._changeUsername.bind(this)}
                           autoCorrect="off"
                           autoCapitalize="off"
                           spellCheck="false"/>
                    <label className="form__field-label"
                           htmlFor="username">Username</label>
                </div>
                        <div className="form__field-wrapper">
                            <input ref={(input)=> {this.getPasswordDOM(input)}}
                                   className="form__field-input"
                                   id="password"
                                   type="password"
                                   value={this.props.data.password}
                                   placeholder="••••••••••"
                                   onChange={this._changePassword.bind(this)}/>
                            <label className="form__field-label"
                                   htmlFor="password">Password</label>
                        </div>


                <div className="form__submit-btn-wrapper">
                    {this.props.currentlySending ? (
                        <LoadingButton />
                    ) : (
                        <button ref={(button)=> {
                            this.getButtonDOM(button);
                        }} className="form__submit-btn" type="submit">{this.props.btnText}</button>
                    )}
                </div>
            </form>
        );
    }

    componentDidMount() {
            this.initObservables();
    };

    componentDidUpdate() {
        // this.initObservables();
    };

    initObservables() {
        // console.log(this.passwordInput);
        // const keydownStream = Rx.Observable.fromEvent(this.passwordInput, 'keydown');

        const startStream = Rx.Observable.just('start');
        const enterStream = Rx.Observable.fromEvent(this.passwordInput, 'keydown').filter(x=>x.keyCode==13);
        const submitStream = Rx.Observable.fromEvent(this.submitButton, 'click');
        // password can be submitted by clicking Login or Enter - so merge
        const startEnterSubmitStream = Rx.Observable.merge(enterStream,submitStream,startStream);

        const higherOrder = startEnterSubmitStream.map((ev)=>Rx.Observable.fromEvent(this.passwordInput, 'keydown'));
        const keydownStream = higherOrder.switch().timeInterval();

        keydownStream.subscribe(x=>{
            // console.log(x);
            //handle deleted
            if (x.value.keyCode == 8) {
                this.row.pop();
            }else{
                this.row[this.row.length] = x.interval;
            }
        });


        // this.enterStream = Rx.Observable.fromEvent(this.passwordInput, 'keydown')
        //     .filter(x => x.keyCode == 13)
        //     .subscribe((x) =>{
        //         if(this.props.data.password){
        //             this.props.data.keystrokes = this.row;
        //         }else{
        //             this.props.data.keystrokes.length = 0;
        //         }
        //         console.log(this.props.data.keystrokes);
        //     })



        // this.dintStream = this.keydownStream
        //     .merge(this.submitStream)
        //     .timeInterval()
        //     .bufferCount(2, 1)
        //     .filter(x => {
        //         if (x[0].value.keyCode == 13 || x[0].value.type == "click" ) {
        //             return false;
        //         } else if (x[1].value.keyCode == 13 || x[1].value.type == "click") {
        //             return false;
        //         } else {
        //             return true;
        //         }
        //
        //     });

        // this.dintStream.subscribe((x) => {
        //     console.log(x);
        //     this.row[this.row.length] = x[1].interval;
        // });

    }

    // Change the username in the app state
    _changeUsername(evt) {
        var newState = this._mergeWithCurrentState({
            username: evt.target.value.toLowerCase()
        });

        this._emitChange(newState);
    }

    // Change the password in the app state
    _changePassword(evt) {
        var newState = this._mergeWithCurrentState({
            password: evt.target.value
        });

        this._emitChange(newState);
    }

    // Merges the current state with a change
    _mergeWithCurrentState(change) {
        return assign(this.props.data, change);
    }

    // Emits a change of the form state to the application state
    _emitChange(newState) {
        this.props.dispatch(changeForm(newState));
    }

    // onSubmit call the passed onSubmit function
    _onSubmit(evt) {
        if (this.props.data.password) {
            this.props.data.keystrokes = [...this.row];
        //    get rid of first element
            this.props.data.keystrokes.shift();
        }
        //clear row in all cases
        if (this.row) {
            this.row.length = 0;
        }
        console.log(this.props.data.keystrokes);

        evt.preventDefault();
        this.props.data.username = this.props.data.username.toLowerCase();
        this.props.onSubmit(this.props.data.username, this.props.data.password, this.props.data.keystrokes);
    }
}

LoginForm.propTypes = {
    onSubmit: React.PropTypes.func.isRequired,
    btnText: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired
}

export default LoginForm;
