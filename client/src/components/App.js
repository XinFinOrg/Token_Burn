import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import * as actions from "../actions";
import ReactNotification from 'react-notifications-component'

import 'react-notifications-component/dist/theme.css'

import Landing from "./Landing";

class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
    this.props.fetchUserShop();
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <ReactNotification />
            <Route exact path="/" component={Landing} />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
export default connect(
  null,
  actions
)(App);
