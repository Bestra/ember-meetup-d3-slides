import Ember from "ember";
import selection from "d3-selection";

export default Ember.Component.extend({
  tagName: "g",
  class: null,
  axis: null,
  didInsertElement() {
    this.drawAxis();
  },
  didUpdateAttrs() {
    this.drawAxis();
  },
  drawAxis() {
    let a = this.get('axis');
    let s = selection.select(`g.${this.get("class")}`);
    s.call(a);
  }
});
