import Ember from "ember";

export function applyD3Scale(params /*, hash*/) {
  let [ helper, value ] = params;
  return helper(value);
}

export default Ember.Helper.helper(applyD3Scale);
