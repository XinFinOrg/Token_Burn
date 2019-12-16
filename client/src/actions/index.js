import axios from "axios";
import { FETCH_USER } from "./types";
import {FETCH_USER_SHOP} from "./types";
import {FETCH_CONTRACT_DETAILS} from "./types";

export const fetchUser = () => async dispatch => {
  console.log("Called Fetch User");
  const res = await axios.get("/api/currentUser", { withCredentials: true });
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const fetchUserShop = () => async dispatch => {
  console.log("Called Fetch User Shop");
  const res = await axios.get("/api/getUserShop",{withCredentials: true});
  dispatch({type: FETCH_USER_SHOP, payload: res.data});
}

export const fetchContractDetails = () => async dispatch => {
  console.log("called fetch contract details");
  const res = await axios.get("/get/getContractDetails",{withCredentials:true});
  dispatch({type:FETCH_CONTRACT_DETAILS, payload: res.data});
}
