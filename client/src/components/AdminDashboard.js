import React, { Component } from "react";
import { connect } from "react-redux";

class AdminDashboard extends Component {
  renderContent() {
    return (
      <div>
        <div>Welcome Master</div>
        <section>
          <div>
            <input
              type="text"
              name="merchantId"
              className="form-control"
              placeholder="Merchant Id"
            />
          </div>
        </section>
      </div>
    );
  }
  render() {
    return <div>{this.renderContent()}</div>;
  }
}

function mapsStateToProps({ auth, shops }) {
  return { auth, shops };
}

export default connect(mapsStateToProps)(AdminDashboard);
