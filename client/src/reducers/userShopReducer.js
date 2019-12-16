import { FETCH_USER_SHOP } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_USER_SHOP: {
      return action.payload;
    }
    default:
      return state;
  }
}
