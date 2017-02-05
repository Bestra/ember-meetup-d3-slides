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
    // this.drawLegend();
  },
  didUpdateAttrs() {
    this.drawGraph();
    // this.drawLegend();
  },
  chartHeight: 0,
  chartWidth: 0,
  drawLegend() {
    let legendHeight = 20;
    let color = this.get("colorScale");
    let legendItems = selection
      .select("svg")
      .selectAll("g.legend-item")
      .data(this.get("legendItems"), d => d);

    let newGroups = legendItems
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        (d, i) =>
          `translate(${this.get("chartWidth") - 100}, ${i *
            (legendHeight + 5)})`
      );

    newGroups
      .merge(legendItems)
      .transition()
      .attr(
        "transform",
        (d, i) =>
          `translate(${this.get("chartWidth") - 100}, ${i *
            (legendHeight + 5)})`
      );

    newGroups
      .append("rect")
      .attr("height", legendHeight)
      .attr("width", 25)
      .style("fill", d => color(d));
    newGroups.append("text").text(d => d).attr("x", 30).attr("y", 15);
    legendItems.select("rect").transition().style("fill", d => color(d));
    legendItems.exit().remove();
  },
  drawFrame() {
    let margin = { top: 20, right: 20, bottom: 60, left: 60 };
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
  legendItems: Ember.computed("data.[]", function() {
    return this.get("data").mapBy("type").uniq();
  }),
  xScale: Ember.computed("data.[]", function() {
    return scale
      .scalePoint()
      .range([ 100, this.get("chartWidth") ])
      .domain(this.get('data').mapBy('name'));
  }),
  yScale: Ember.computed("data.[]", function() {
    return scale
      .scaleLinear()
      .range([ this.get("chartHeight"), 0 ])
      .domain([10, max(this.get("data"), d => d.abv)]);
  }),
  colorScale: Ember.computed("data.[]", function() {
    return scale
      .scaleOrdinal(scale.schemeCategory10)
      .domain(this.get("data").mapBy("type").uniq());
  }),
  radiusScale: Ember.computed("data.[]", function() {
    return scale
      .scaleLinear()
      .range([ 1, 25 ])
      .domain([0, 10]);
  }),

  acidScale: Ember.computed("data.[]", function() {
    return scale
      .scaleLinear()
      .range([ 1, 25 ])
      .domain([0, 1 ]);
  }),
  drawGraph() {
    let data = this.get("data");

    var g = selection.select("g.chart");

    let x = this.get("xScale");
    let y = this.get("yScale");
    let radii = this.get("radiusScale");
    let color = this.get("colorScale");
    let acid = this.get("acidScale");

    let xAxis = axis.axisBottom(x);
    let yAxis = axis.axisLeft(y);
    let t = transition.transition().duration(500);

    g.select(".x-axis").transition(t).call(xAxis);
    g.select(".y-axis").transition(t).call(yAxis);

    let sugarCircles = g.selectAll("circle.sugar").data(data, d => d.name);
    sugarCircles
      .enter()
      .append("circle")
      .attr("class", "sugar")
      .attr("cx", (d) => x(d.name))
      .attr("cy", d => y(d.abv))
      .merge(sugarCircles)
      .transition(t)
      .style("fill", d => color(d.type))
      .style("fill-opacity", .5)
      .attr("cx", (d) => x(d.name))
      .attr("cy", d => y(d.abv))
      .attr("r", d => radii(d.sugar));
    sugarCircles.exit().transition(t).attr("r", 0).remove();

    let acidCircles = g.selectAll("circle.acid").data(data, d => d.name);
    acidCircles
      .enter()
      .append("circle")
      .attr("class", "acid")
      .attr("cx", (d) => x(d.name))
      .attr("cy", d => y(d.abv))
      .merge(acidCircles)
      .transition(t)
      .style("stroke", "black")
      .style("fill", "white")
      .style("fill-opacity", 0)
      .style("stroke-width", "1")
      .attr("cx", (d) => x(d.name))
      .attr("cy", d => y(d.abv))
      .attr("r", d => acid(d.acid));
    acidCircles.exit().transition(t).attr("r", 0).remove();

    let labels = g.selectAll("text.label").data(data, d => d.name);
    labels.exit().remove();
    labels.enter()
    .append("text")
    .attr("class", "label")
    .text(d => d.name)
    .merge(labels)
    .attr("transform", d => `translate(${x(d.name) + 5}, ${y(d.abv) - radii(d.sugar) - 5 })rotate(-90)`)
  }
});
