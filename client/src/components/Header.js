import React, { Component } from "react";
import { connect } from "react-redux";

import "../css/Header.css";


const styleLogo = {
  paddingLeft:'10px',
  textDecoration:'none'
}

class Header extends Component {
  renderContent() {
    if (this.props.auth == null) {
      return;
    }
    switch (this.props.auth.status) {
      case null:
        return;

      case false: {
        return (
          <li>
            <a className="btn" href="/login">Login</a>
          </li>
        );
      }
      default: {
        return (
          <li>
            <a className="btn" href="api/logout">LOGOUT</a>
          </li>
        );
      }
    }
  }

  render() {
    return (
      <nav className="stylenav">
        <div className="nav-wrapper">
          <a className="left brand-logo" href="/" style={styleLogo}>Burning Service</a>
          <ul className="right">{this.renderContent()}</ul>
        </div>
      </nav>
    );
  }
}

function mapsStateToProps({ auth }) {
  return { auth };
}

export default connect(mapsStateToProps)(Header);
