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
    
    var g = selection.select("g.chart");

    let x = scale.scaleLog().range([ 0, this.get("chartWidth") ]);
    let y = scale.scaleLog().range([ this.get("chartHeight"), 0 ]);
    let radii = scale.scaleLinear().range([10, 50])
    let color = scale.scaleOrdinal(scale.schemeCategory20);

    x.domain(extent(data, d => d.inputs));
    y.domain(extent(data, d => d.outputs));
    radii.domain(extent(data, d => d.lineCount));
    color.domain(data.mapBy('moduleType').uniq());

    let xAxis = axis.axisBottom(x).ticks(5, ".2");
    let yAxis = axis.axisLeft(y).ticks(5, ".2");
    let t = transition.transition().duration(500);

    g.select(".x-axis").transition(t).call(xAxis);
    g.select(".y-axis").transition(t).call(yAxis);

    let areas = g.selectAll("circle.shape").data(data, d => d.moduleName);
    areas
      .enter()
      .append("circle")
      .attr("class", "shape")
      .style("fill", d => color(d.moduleType))
      .style("fill-opacity", .5)
      .style("stroke", "black")
      .merge(areas)
      .transition(t)
      .attr("cx", d => x(d.inputs))
      .attr("cy", d => y(d.outputs))
      .attr("r", d => radii(d.lineCount));
    areas.exit().remove();
  }
});
