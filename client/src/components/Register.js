import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

class Register extends Component {
  renderContent() {
    if (this.props.auth == null) {
      return;
    }
    switch (this.props.auth.code) {
      case null:
        return;
      case -1: {
        return (
          <div>
            <h3>Register!</h3>
            <form id="registerForm" action="/formRegister" method="post">
              <input
                type="text"
                name="email"
                className="form-control"
                placeholder="Email"
              />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="password"
              />
              <input
                type="password"
                name="cfm-password"
                className="form-control"
                placeholder="confirm-password"
              />
              <input type="submit" value="Submit" />
            </form>
          </div>
        );
      }
      default: {
        return <Redirect to="/" />;
      }
    }
  }

  render() {
    return <div>{this.renderContent()}</div>;
  }
}

function mapsStateToProps({ auth }) {
  return { auth };
}

export default connect(mapsStateToProps)(Register);
