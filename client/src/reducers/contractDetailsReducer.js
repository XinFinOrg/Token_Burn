import { FETCH_CONTRACT_DETAILS } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_CONTRACT_DETAILS: {
      return action.payload;
    }
    default:
      return state;
  }
}
