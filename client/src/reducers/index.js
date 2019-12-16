import {combineReducers} from 'redux';
import authReducer from './authReducer';
import userShopReducer from "./userShopReducer";
import contractDetailsReducer from "./contractDetailsReducer";

export default combineReducers({
  auth : authReducer,
  shops: userShopReducer,
  contractConfig: contractDetailsReducer
})
