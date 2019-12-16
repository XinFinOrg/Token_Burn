import React, { Component } from "react";
import { connect } from "react-redux";
import $ from "jquery";

import * as actions from "../actions/index";
import "../css/login.css";
import staryImage from "../assets/images/stary_image.jpeg";
import mesh from "../assets/images/mesh.png";
import { store } from "react-notifications-component";
import { default as _ } from "lodash";

let sectionStyle = {
  backgroundImage: `url(${mesh})`
};

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginActive: true,
      registerActive: false
    };
  }

  submitLoginForm = () => {
    const email = $("#lf-email").val();
    const pwd = $("#lf-password").val();

    if (_.isEmpty(email) || _.isEmpty(pwd)) {
      // empty input values
      store.addNotification({
        title: "Invalid Input",
        message: "Empty input not allowed",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
      return;
    }

    if (!validateEmail(email)){
      store.addNotification({
        title: "Invalid Email",
        message: "Email is not valid",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
      return;
    }

    $.ajax({
      method: "post",
      url: "/formLogin",
      data: { username: email, password: pwd },
      success: res => {
        console.log(res);
        if (res.status) {
          // status is ok
          store.addNotification({
            title: "Success!",
            message: "Login Success",
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 1000,
              onScreen: true
            }
          });
          this.props.fetchUser();
          this.props.fetchUserShop();
        } else {
          // show error
          store.addNotification({
            title: "Login Failed!",
            message: "The login credentials are not correct",
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 3000,
              onScreen: true
            }
          });
        }
      }
    });
  };

  submitRegisterForm = () => {
    console.log("called");
    const email = $("#rf-email").val();
    const pwd = $("#rf-password").val();
    const cfm_pwd = $("#rf-cfm-pwd").val();

    if (_.isEmpty(email) || _.isEmpty(pwd) || _.isEmpty(cfm_pwd)) {
      store.addNotification({
        title: "Invalid Input",
        message: "Empty input not allowed",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
      return;
    }
    if (pwd !== cfm_pwd) {
      store.addNotification({
        title: "Invalid Password",
        message: "Password - Confirm Password does not match.",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
      return;      
    }

    if (!validateEmail(email)){
      store.addNotification({
        title: "Invalid Email",
        message: "Email is not valid",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
      return;
    }

    $.ajax({
      method: "post",
      url: "/formRegister",
      data: { email: email, password: pwd },
      success: res => {
        console.log(res);
        if (res.status) {
          // status is ok
          store.addNotification({
            title: "Success!",
            message: "Registration completed, please login.",
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 1000,
              onScreen: true
            }
          });
          this.props.fetchUser();
          this.props.fetchUserShop();
        } else {
          // show error
          store.addNotification({
            title: "Login Failed!",
            message: "The login credentials are not correct",
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 3000,
              onScreen: true
            }
          });
        }
      }
    });

  };

  handleLayoutSwitch = () => {
    if (this.state.loginActive)
      this.setState({ loginActive: false, registerActive: true });
    else this.setState({ loginActive: true, registerActive: false });
  };

  renderContent() {
    return (
      <div>
        <div className="section-left">
          <img
            src={staryImage}
            className="section-back-img"
            alt="XinFin Logo"
          />

          <div className="section-head">Burning Service</div>
          <div className="section-info">
            This is some useful information about the application.
          </div>
        </div>
        <div className="section-right" style={sectionStyle}>
          <div className="wrapper">
            <div className="head">Burning Service</div>
            <div
              className={`login-form ${
                this.state.loginActive ? "" : "login-form-hide"
              }`}
            >
              <div className="subsection-header"> Login </div>
              <div className="floating-label">
                <input
                  className="floating-input"
                  type="text"
                  id="lf-email"
                  placeholder=" "
                  autoComplete="off"
                />
                <label>Email</label>
              </div>
              <div className="floating-label">
                <input
                  className="floating-input"
                  type="password"
                  id="lf-password"
                  placeholder=" "
                  autoComplete="off"
                />
                <label>Password</label>
              </div>
              <button
                onClick={this.submitLoginForm}
                className="btn subsection-submit float-right"
              >
                Login
              </button>
            </div>
            <div
              className={`register-form ${
                this.state.registerActive ? "" : "register-form-hide"
              }`}
            >
              <div className="subsection-header"> Register </div>
              <div className="floating-label">
                <input
                  className="floating-input"
                  type="text"
                  id="rf-email"
                  placeholder=" "
                  autoComplete="off"
                />
                <label>Email</label>
              </div>
              <div className="floating-label">
                <input
                  className="floating-input"
                  type="password"
                  id="rf-password"
                  placeholder=" "
                  autoComplete="off"
                />
                <label>Password</label>
              </div>
              <div className="floating-label">
                <input
                  className="floating-input"
                  type="password"
                  id="rf-cfm-pwd"
                  placeholder=" "
                  autoComplete="off"
                />
                <label>Confirm Password</label>
              </div>
              <button
                onClick={this.submitRegisterForm}
                className="btn subsection-submit float-right"
              >
                Register
              </button>
            </div>

            <div className="switch-layout-btn">
              {this.state.loginActive ? "New User ? " : "Already Registered ? "}
              &nbsp;&nbsp;
              <span
                className="switch-layout-btn-span"
                onClick={this.handleLayoutSwitch}
              >
                {this.state.loginActive ? "Register" : "Login"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <div>{this.renderContent()}</div>;
  }
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export default connect(null, actions)(Login);
