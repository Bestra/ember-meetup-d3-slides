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
  didInsertElement() {
    this.drawFrame();
    this.drawGraph();
  },
  didUpdateAttrs() {
    this.drawGraph();
  },
  chartHeight: 0,
  chartWidth: 0,
  drawFrame() {
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let svg = selection.select("svg");
    this.set("chartWidth", svg.attr("width") - margin.left - margin.right);
    this.set("chartHeight", svg.attr("height") - margin.top - margin.bottom);

    let g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("class", "chart");

      g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${this.get("chartHeight")})`);
    g.append("g").attr("class", "y-axis");
  },
  drawGraph() {
    let data = this.get("data");
    let keys = [ "apples", "bananas", "cherries", "dates" ];
    var stack = shape
      .stack()
      .keys(keys)
      .order(shape.stackOrderNone)
      .offset(shape.stackOffsetNone);

    var series = stack(data);

    var g = selection.select("g.chart");

    let x = scale.scaleTime().range([ 0, this.get("chartWidth") ]);
    let y = scale.scaleLinear().range([ this.get("chartHeight"), 0 ]);
    let z = scale.scaleOrdinal(scale.schemeCategory10);

    x.domain(extent(data, d => d.month));
    let maxY = max(series[3].map(s => s[1]));
    y.domain([ 0, maxY ]);
    z.domain(keys);

    let xAxis = axis.axisBottom(x);
    let yAxis = axis.axisLeft(y);
    let t = transition.transition().duration(500);

    g.select(".x-axis").transition(t).call(xAxis);
    g.select(".y-axis").transition(t).call(yAxis);

    let area = shape
      .area()
      .curve(shape.curveCardinal)
      .x(d => x(d.data.month))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    let areas = g.selectAll("path.shape").data(series);
    areas
      .enter()
      .append("path")
      .attr("class", "shape")
      .style("fill", d => z(d.key))
      .merge(areas)
      .transition(t)
      .attr("d", area);
    areas.exit().remove();
  }
});
