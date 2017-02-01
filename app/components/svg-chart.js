import Ember from 'ember';
import shape from 'd3-shape';
import selection from 'd3-selection';
import transition from 'd3-transition';
export default Ember.Component.extend({
  tagName: 'svg',

  didInsertElement() {
    selection.select("body").append("h1")
      .text("Hello, world!")
      .style("text-align", "center")
      .style("line-height", "320px")
      .style("font-size", "100px")
      .style("transform", "rotate(-180deg) scale(0.001, 0.001)")
      .transition()
      .duration(1500)
      .style("transform", null);
  }
});
