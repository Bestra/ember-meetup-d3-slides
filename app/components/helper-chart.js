import Ember from "ember";
import shape from "d3-shape";
import selection from "d3-selection";
import transition from "d3-transition";
import scale from "d3-scale";
import { extent, max } from "d3-array";
import axis from "d3-axis";

export default Ember.Component.extend({
  tagName: "svg",
  attributeBindings: [ "width", "height" ],
  data: null,
   chartHeight: 0,
  chartWidth: 0,


  didInsertElement() {
      this._super(...arguments);
      let margin = { top: 20, right: 20, bottom: 60, left: 60 };
    let svg = selection.select("svg");
    this.set("chartWidth", svg.attr("width") - margin.left - margin.right);
    this.set("chartHeight", svg.attr("height") - margin.top - margin.bottom);
  }
});
