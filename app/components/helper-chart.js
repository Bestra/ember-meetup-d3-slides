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
  xScale: Ember.computed("data.[]", "chartWidth", function() {
    return scale
      .scaleLog()
      .range([ 0, this.get("chartWidth") ])
      .domain(extent(this.get("data"), d => d.inputs));
  }),
  yScale: Ember.computed("data.[]", "chartHeight", function() {
    return scale
      .scaleLog()
      .range([ this.get("chartHeight"), 0 ])
      .domain(extent(this.get("data"), d => d.outputs));
  }),
  colorScale: Ember.computed("data.[]", function() {
    return scale
      .scaleOrdinal(scale.schemeCategory10)
      .domain(this.get("data").mapBy("moduleType").uniq());
  }),
  radiusScale: Ember.computed("data.[]", function() {
    return scale
      .scaleLinear()
      .range([ 5, 50 ])
      .domain(extent(this.get("data"), d => d.lineCount));
  }),

  didInsertElement() {
      this._super(...arguments);
      let margin = { top: 20, right: 20, bottom: 60, left: 60 };
    let svg = selection.select("svg");
    this.set("chartWidth", svg.attr("width") - margin.left - margin.right);
    this.set("chartHeight", svg.attr("height") - margin.top - margin.bottom);
  }
});
