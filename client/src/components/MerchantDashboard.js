import React, { Component } from "react";
import { connect } from "react-redux";
import $ from "jquery";
import { apothem } from "../config/contractConfig";
import { Dropdown } from "react-bootstrap";
import { store } from "react-notifications-component";
import { default as _ } from "lodash";
import axios from "axios";
import * as actions from "../actions";
import Header from "./Header";
import Web3 from "web3";

import "../css/MerchantDashboard.css";
import "../css/login.css";

let contractInst = null;
let web3 = null;

class MerchantDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentShopName: "select a shop",
      currentShopId: "select a shop",
      currentShopOwner: "select a shop",
      currShop: null,
      currShopState: [],
      currLogs: null
    };
  }

  registerMerchant = () => {
    let owner = $("#owner").val();
    const burnPercent = $("#burnPercent").val();
    const merchantName = $("#merchantName").val();
    if (_.isEmpty(owner) || _.isEmpty(burnPercent) || _.isEmpty(merchantName)) {
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
    owner = filterAddress(owner);
    if (web3 == null) {
      return store.addNotification({
        title: "Error!",
        message: "Window has no web3 provider, cannot make request",
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
    if (!web3.utils.isAddress(owner)) {
      store.addNotification({
        title: "Invalid Input",
        message: "OwnerAddress is not valid",
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
      url: "/api/registerMerchant",
      data: {
        owner: owner,
        burnPercent: burnPercent,
        merchantName: merchantName
      },
      success: res => {
        if (!res.status) {
          //  error
          store.addNotification({
            title: "Error!",
            message: res.message || res.error,
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
        } else {
          store.addNotification({
            title: "New Merchant Added",
            message: "New Merchant has been successfully added",
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 3000,
              onScreen: true
            }
          });
          this.props.fetchUserShop();
        }
      }
    });
  };

  getDropDownOptions() {
    let props = this.props;
    console.log(
      "Called GetDropDown, value of props: ",
      props.shops.shops.length
    );
    if (props == null || props.shops == null) {
      return "";
    } else {
      let retOpts = [];
      props.shops.shops.forEach(shop => {
        retOpts.push(
          <Dropdown.Item
            id={shop.merchantId}
            key={shop.merchantId}
            onClick={evnt =>
              this.changeShop(
                shop.merchantName,
                shop.merchantId,
                shop.owner,
                shop
              )
            }
          >
            {shop.merchantName}
          </Dropdown.Item>
        );
      });
      return retOpts;
    }
  }

  changeShop(newShopName, newShopId, newShopOwner, shop) {
    console.log("Called Change Shop: ", newShopName);
    this.setState({
      currentShopName: newShopName,
      currentShopId: newShopId,
      currentShopOwner: newShopOwner,
      currShop: shop
    });
    this.getMerchantData(newShopId);
    this.renderExplorerTable(newShopId);
  }
  /*

    Arrow functions are required to access the parent scope.

  */

  enableBurning = async () => {
    if (this.state.currShopState[4]) {
      // not ok
      store.addNotification({
        title: "Warning!",
        message: "Burning is already enabled",
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
    } else {
      if (contractInst == null) {
        return store.addNotification({
          title: "Error!",
          message: "Window has no web3 provider, cannot make request",
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
      const encodedData = contractInst.methods
        .enableBurning(this.state.currentShopId)
        .encodeABI();
      if (await this.checkOwner()) {
        this.makeContractTx(encodedData);
        this.getMerchantData(this.state.currentShopId);
      }
    }
  };

  disableBurning = async () => {
    if (!this.state.currShopState[4]) {
      // not ok
      store.addNotification({
        title: "Warning!",
        message: "Burning is already disabled",
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true
        }
      });
    } else {
      if (contractInst == null) {
        return store.addNotification({
          title: "Error!",
          message: "Window has no web3 provider, cannot make request",
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
      const encodedData = contractInst.methods
        .disableBurning(this.state.currentShopId)
        .encodeABI();
      if (await this.checkOwner()) {
        this.makeContractTx(encodedData);
        this.getMerchantData(this.state.currentShopId);
      }
    }
  };

  setBurnPercent = async () => {
    if (contractInst == null) {
      return store.addNotification({
        title: "Error!",
        message: "Window has no web3 provider, cannot make request",
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
    const burnPercentStr = $("#ub_burnPercent")
      .val()
      .toString();
    const retObj = getPercentDecimals(burnPercentStr);
    console.log("Burn percent: ", burnPercentStr, retObj[0], retObj[1]);
    const encodedData = contractInst.methods
      .setBurnPercent(this.state.currentShopId, retObj[0], retObj[1])
      .encodeABI();
    if (await this.checkOwner()) this.makeContractTx(encodedData);
  };

  changeOwner = () => {};

  checkOwner = async () => {
    if (web3 == null) {
      //ask to install teh web extn
      return store.addNotification({
        title: "Error!",
        message: "Window has no web3 provider, cannot make request",
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
    const acnts = await web3.eth.getAccounts();
    if (_.isEmpty(acnts)) {
      // the user has not logged in
      store.addNotification({
        title: "Warning!",
        message: "Please login in your metamask to continue.",
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true
        }
      });
      return;
    }
    const defAcnt = acnts[0];
    console.log(defAcnt, this.state.currentShopOwner);
    if (filterAddress(defAcnt).toLowerCase() !== this.state.currentShopOwner) {
      // warn the user TX will fail
      store.addNotification({
        title: "Warning!",
        message:
          "The detected account is not the owner of the current shop, all TX will likely fail. Please switch to the Owner account in your metamask provider.",
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true
        }
      });
      return false;
    } else {
      return true;
    }
  };

  getMerchantData = id => {
    console.log("called getMerchantData, id: ", id);
    if (contractInst == null) {
      return store.addNotification({
        title: "Error!",
        message: "Window has no web3 provider, cannot make request",
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
    contractInst.methods.getMerchantData(id).call((err, result) => {
      if (err) throw err;
      let resArr = [];
      Object.keys(result).forEach(k => {
        resArr.push(result[k]);
      });
      if (!err) this.setState({ currShopState: resArr });
    });
  };

  makeContractTx = async encodedData => {
    console.log("Called make TX");
    console.log("Encoded data: ", encodedData);
    if (web3 == null) {
      // how ?
      return;
    }
    web3.eth.getAccounts().then(async accounts => {
      console.log("Accounts: ", accounts);
      const tx = {
        to: filterAddress(apothem.acceptToken_addr),
        from: filterAddress(accounts[0]),
        chainId: apothem.networkId,
        data: encodedData,
        gas: 2000000,
        gasPrice: await web3.eth.getGasPrice()
      };
      console.log("RAW TX: ", tx);
      web3.eth.sendTransaction(tx, (err, result) => {
        if (err) {
          // handle error
        } else {
          console.log("Hash: ", result);
        }
      });
    });
  };

  componentDidMount() {
    console.log("Called componentDidMount");
    if (window.web3 == undefined || window.web3 == null) {
      if (web3 == null) {
        //ask to install teh web extn
        return store.addNotification({
          title: "Error!",
          message: "Window has no web3 provider, cannot make request",
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

    web3 = new Web3(window.web3.currentProvider);
    contractInst = new web3.eth.Contract(
      apothem.acceptToken_abi,
      "0x" + apothem.acceptToken_addr.slice(3)
    );
    contractInst.methods.owner.call((err, result) => {
      console.log(err, result);
    });

    // web3.eth.getAccounts().then(result => {
    //   web3.eth.sendTransaction(
    //     { from: result[0], to: result[0], value: 1000000 },
    //     (err, res) => {
    //       console.log(err, res);
    //     }
    //   );
    // });
    // web3.eth.getAccounts().then(res => {
    //   console.log(res);
    //   // web3.eth.sendTransaction({from:})
    // })

    // web3.eth.getChainId().then(chainId => {
    //   console.log("ChainID: ", chainId);
    //   if (chainId == apothem.networkId) {
    //     // ok
    //   } else {
    //     store.addNotification({
    //       title: "Warning!",
    //       message: "Your web3 provider is connected to wrong network",
    //       type: "warning",
    //       insert: "top",
    //       container: "top-right",
    //       animationIn: ["animated", "fadeIn"],
    //       animationOut: ["animated", "fadeOut"],
    //       dismiss: {
    //         duration: 5000,
    //         onScreen: true
    //       }
    //     });
    //   }
    // });
  }

  renderScripts() {
    return (
      <div>
        <section>
          <div>
            Simply copy the following code snippet into your Front-end & you're
            good to go!. <br />
            Assuming your user has installed XinPay extension.
            <br />
            <strong>Note: </strong> This snippet is only for making payments,
            please perform checks for ensuring proper Web3 instance. Code shown
            below is for <strong>Web3 version 0.20.7</strong>
          </div>
          <br />
          <div>Make Payment Code snippet</div>
          <div className="script-container">
            const contractABI = /*--------- Contract ABI ----------*/;
            <br />
            const contractAddr = /*--------- Contract Address ( in Hex )
            ----------*/;
            <br />
            let contractAbiInst = web3.eth.contract(contractABI);
            <br />
            let contractInst = contractAbiInst.at(contractAddr);
            <br />
            const tx = {`{`}
            <br />
            &nbsp;&nbsp;&nbsp;{`from: web3.eth.accounts[0], `}
            <br />
            &nbsp;&nbsp;&nbsp;
            {`to: "0x${apothem.acceptToken_addr.slice(3)}" , `}
            <br />
            &nbsp;&nbsp;&nbsp;{`gas: /*--- gas value ---*/, `}
            <br />
            &nbsp;&nbsp;&nbsp;{`gasPrice: /*--- gas price ---*/, `}
            <br />
            &nbsp;&nbsp;&nbsp;{`value : /*--- Value of Object in Wei ---*/`}
            <br />
            {` };`}
            <br />
            contractInst.makePayment.sendTransaction("{this.state.currentShopId}
            "," /*--- purpose of tx ---*/ ",tx,(err, result) =>{" "}
            {"{ /*---- handle error / result ----*/ }"});
            <br />
          </div>
          <div>Contract Address</div>
          <div className="script-container">
            {"0x" + apothem.acceptToken_addr.slice(3)}
          </div>
          <div>Contract ABI</div>
          <div className="script-container">
            {JSON.stringify(apothem.acceptToken_abi)}
          </div>
        </section>
      </div>
    );
  }

  renderExplorerTable = id => {
    getMerchantLogs(id).then(logs => {
      this.setState({ currLogs: logs });
    });
  };

  renderFuncs() {
    return (
      <div>
        <section>
          <h4>Enable Burning</h4>
          <p>Enable Automatic Burning of tokens upon reception of payments.</p>
          <button className="btn btn-primary " onClick={this.enableBurning}>
            Enable Burning
          </button>
        </section>

        <section>
          <h4>Disable Burning</h4>
          <p>Disable Automatic Burning of tokens upon reception of payments.</p>
          <button className="btn btn-primary " onClick={this.disableBurning}>
            Disable Burning
          </button>
        </section>
        <section>
          <h4>Update Burn Percent</h4>
          <p>
            {" "}
            Update the percentage of token to be burned on receiving every
            payment.
          </p>

          <div className="floating-label">
            <input
              type="number"
              step="0.01"
              id="ub_burnPercent"
              className="floating-input"
              placeholder=" "
            />
            <label>Burn Percent</label>
          </div>

          <button
            type="button"
            className="btn btn-primary "
            onClick={this.setBurnPercent}
          >
            Update
          </button>

          {/* <div>
            <button
              onClick={evnt => this.getMerchantData(this.state.currentShopId)}
            >
              Get Merchant Data
            </button>
            <div>{}</div>
          </div> */}
        </section>
      </div>
    );
  }

  renderContent() {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="tab">
            <button
              id="btn-admins"
              className="tablinks"
              onClick={event => openTab(event, "newShop")}
            >
              New Merchant
            </button>
            <button
              id="btn-admins"
              className="tablinks"
              onClick={event => openTab(event, "funcs")}
            >
              Functionalities
            </button>
            <button
              id="btn-admins"
              className="tablinks"
              onClick={event => openTab(event, "scripts")}
            >
              Script
            </button>
            <button
              id="btn-allApps"
              className="tablinks"
              onClick={event => openTab(event, "explorer")}
            >
              Explorer
            </button>
          </div>
          <div id="newShop" className="tabcontent">
            <section>
              <h4>Register New Shop</h4>
              <div className="floating-label">
                <input
                  type="text"
                  id="owner"
                  className="floating-input"
                  placeholder=" "
                />
                <label>Owner Address</label>
              </div>

              <div className="floating-label">
                <input
                  type="text"
                  id="merchantName"
                  className="floating-input"
                  placeholder=" "
                />
                <label>Merchant Name</label>
              </div>

              <div className="floating-label">
                <input
                  type="number"
                  id="burnPercent"
                  step="0.01"
                  className="floating-input"
                  placeholder=" "
                />
                <label>Burn Percent</label>
              </div>

              <button
                onClick={this.registerMerchant}
                className="btn btn-primary "
              >
                Submit
              </button>
            </section>
          </div>
          <div id="funcs" className="tabcontent">
            <div className="head-wrapper">
              <div>
                {this.props.shops ? (
                  <div className="dropdown-wrapper">
                    <Dropdown>
                      <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {this.state.currentShopName}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {this.getDropDownOptions(this.props)}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="dropdown-message">
                {this.state.currentShopName == "select a shop"
                  ? "Welcome Merchant, Please select your shop"
                  : `Your Merchant ID is ${this.state.currentShopId}`}
              </div>
            </div>
            <div>
              {this.props.shops && this.props.shops.shops.length > 0 ? (
                this.state.currentShopId == "select a shop" ? (
                  ""
                ) : (
                  this.renderFuncs()
                )
              ) : (
                <div className="pageMessage">Please register a Shop</div>
              )}
            </div>
          </div>
          <div id="explorer" className="tabcontent">
            <div className="head-wrapper">
              <div>
                {this.props.shops ? (
                  <div className="dropdown-wrapper">
                    <Dropdown>
                      <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {this.state.currentShopName}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {this.getDropDownOptions(this.props)}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="dropdown-message">
                {this.state.currentShopName == "select a shop"
                  ? "Welcome Merchant, Please select your shop"
                  : `Your Merchant ID is ${this.state.currentShopId}`}
              </div>
            </div>
            <h3>Explorer</h3>
            <p>
              Via this explorer the merchant can view payment logs for the
              selected application.
            </p>
            {/* <button onClick={this.getMerchantLogs}>Get the Merchant Logs</button> */}
            <div>
              {this.props.shops && this.props.shops.shops.length > 0 ? (
                this.state.currentShopId === "select a shop" ? (
                  <div>Please select a shop to continue</div>
                ) : (
                  <div className="tableWrapper">
                    <table className="paymentLogTable">
                      <tbody>
                        <tr>
                          <th>From</th>
                          <th>TxHash</th>
                          <th>Total Tokens</th>
                          <th>Token Burnt</th>
                          <th>Tokens transfered</th>
                          <th>Date</th>
                        </tr>
                        {this.state.currLogs != null ? (
                          this.state.currLogs.map((log, index) => {
                            return (
                              <tr key={log._id}>
                                <td>{log.returnArgs.sender}</td>
                                <td>{log.txHash}</td>
                                <td>{log.returnArgs.totalValue}</td>
                                <td>{log.returnArgs.tokenBurnt}</td>
                                <td>{log.returnArgs.tokenTransfered}</td>
                                <td>
                                  {new Date(parseFloat(log.logTime)).toString()}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td>No Logs to show</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div>Please register a shop</div>
              )}
            </div>
          </div>

          <div id="scripts" className="tabcontent">
            <div className="head-wrapper">
              <div>
                {this.props.shops ? (
                  <div className="dropdown-wrapper">
                    <Dropdown>
                      <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {this.state.currentShopName}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {this.getDropDownOptions(this.props)}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="dropdown-message">
                {this.state.currentShopName == "select a shop"
                  ? "Welcome Merchant, Please select your shop"
                  : `Your Merchant ID is ${this.state.currentShopId}`}
              </div>
            </div>
            <div>
              {this.props.shops && this.props.shops.shops.length > 0 ? (
                this.state.currentShopId == "select a shop" ? (
                  ""
                ) : (
                  this.renderScripts()
                )
              ) : (
                <div className="pageMessage">Please register a Shop</div>
              )}
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

function mapsStateToProps({ auth, shops }) {
  return { auth, shops };
}

function openTab(evt, cityName) {
  let i = 0,
    tabcontent,
    tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

function filterAddress(address) {
  if (typeof address !== "string") {
    // invalid request
    return new Error("invalid input");
  }
  if (address.startsWith("xdc")) {
    // change
    return "0x" + address.slice(3);
  }
  if (address.startsWith("0x")) {
    return address;
  }
}

function getPercentDecimals(str) {
  try {
    const burnPercent = parseFloat(str.toString());
    const burnDecimals = str.includes(".") ? str.split(".")[1].length : 0;
    const intBurnPercent = parseInt(burnPercent * Math.pow(10, burnDecimals));
    return [intBurnPercent, burnDecimals];
  } catch (e) {
    console.log("something went wrong: ", e);
  }
}

async function getMerchantLogs(id) {
  console.log("called getMerchantLogs: ", id);
  try {
    const resLogs = await axios.post("/logger/getMerchantPaymentLogs", {
      merchantId: id
    });
    console.log(resLogs);
    return resLogs.data.logs;
  } catch (e) {
    console.log("Error at merchant: ", e);
    store.addNotification({
      title: "Error!",
      message: "Error while making request to the listener",
      type: "danger",
      insert: "top",
      container: "top-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 5000,
        onScreen: true
      }
    });
    return;
  }
}

export default connect(mapsStateToProps, actions)(MerchantDashboard);
