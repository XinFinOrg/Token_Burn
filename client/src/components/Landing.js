import React, { Component } from "react";
import { connect } from "react-redux";
import { default as _ } from "lodash";

// Components & Containers imports
import Login from "./Login";
import MerchantDashboard from "./MerchantDashboard";
import AdminDashboard from "./AdminDashboard";

class Landing extends Component {
  renderContent() {
    if (this.props.auth == null) {
      return;
    }
    switch (this.props.auth.code) {
      case null:
        return;
      case -1: {
        return <Login />;
      }
      case 1: {
        return <AdminDashboard />;
      }
      case 0: {
        return <MerchantDashboard />;
      }
      default: {
        return <div>Who are you?</div>;
      }
    }
  }

  render() {
    return <div>{this.renderContent()}</div>;
  }
}

function mapsStateToProps({ auth, shops }) {
  return { auth, shops };
}

export default connect(mapsStateToProps)(Landing);
