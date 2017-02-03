import Ember from 'ember';
import scale from "d3-scale";
import { extent, max } from "d3-array";

export default Ember.Component.extend({
    data: null,
     xScale: Ember.computed("data.[]", function() {
    return scale
      .scaleLog()
      .range([ 0, this.get("chartWidth") ])
      .domain(extent(this.get("data"), d => d.inputs));
  }),
  yScale: Ember.computed("data.[]", function() {
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
});
