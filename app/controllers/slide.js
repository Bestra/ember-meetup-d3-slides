import Ember from "ember";
import dsv from "d3-dsv";
import csvData from "d3-slides/data/liquid-recipes";
import scale from "d3-scale";
import { extent, max } from "d3-array";
import axis from "d3-axis";
export default Ember.Controller.extend({

  svgWidth: 2400,
  svgHeight: 800,
  chartWidth: null,
  chartHeight: null,

  init() {
    this._super(...arguments);
    this.set("selectedTypes", this.get("types").slice());
    let margin = { top: 20, right: 20, bottom: 60, left: 60 };
    this.set("chartWidth", this.get('svgWidth') - margin.left - margin.right);
    this.set("chartHeight", this.get('svgHeight') - margin.top - margin.bottom);

  },
  data: Ember.computed(function() {
    return this.createData();
  }),
  filteredData: Ember.computed("data", "selectedTypes.[]", function() {
    let selected = this.get("selectedTypes");
    return this.get("data").filter(d => {
      return selected.includes(d.type);
    });
  }),

  filteredValues: Ember.computed("filteredData.[]", function() {
    return this.get('filteredData').map((r) => {
      return [r.name, r.abv];
    })
  }),
  
  
  createData() {
    return dsv.csvParse(csvData, (
      { type, name, finishedVol, abv, sugar, acid }
    ) =>
      {
        return {
          type,
          name,
          vol: +finishedVol,
          abv: +abv,
          sugar: +sugar,
          acid: +acid
        };
      }).sortBy('abv');
  },
  types: Ember.computed("data", function() {
    return this.get("data").mapBy("type").uniq();
  }),
  selectedTypes: null,
  moduleCheckboxes: Ember.computed("types", "selectedTypes.[]", function() {
    let s = this.get("selectedTypes");
    return this.get("types").map(m => {
      return { type: m, selected: s.includes(m) };
    });
  }),
  xScale: Ember.computed("filteredData.[]", function() {
    return scale
      .scalePoint()
      .range([ 100, this.get("chartWidth") ])
      .domain(this.get('filteredData').mapBy('name'));
  }),
  yScale: Ember.computed("filteredData.[]", function() {
    return scale
      .scaleLinear()
      .range([ this.get("chartHeight"), 0 ])
      .domain([10, max(this.get("filteredData"), d => d.abv)]);
  }),
  yAxis: Ember.computed('yScale', function() {
    return axis.axisLeft(this.get('yScale'));
  }),
  colorScale: Ember.computed("filteredData.[]", function() {
    return scale
      .scaleOrdinal(scale.schemeCategory10)
      .domain(this.get("data").mapBy("type").uniq());
  }),
  sugarScale: Ember.computed("filteredData.[]", function() {
    return scale
      .scaleLinear()
      .range([ 1, 25 ])
      .domain([0, 10]);
  }),

  acidScale: Ember.computed("filteredData.[]", function() {
    return scale
      .scaleLinear()
      .range([ 1, 25 ])
      .domain([0, 1 ]);
  }),
  actions: {
    refreshData() {
      this.set("data", this.createData());
    },
    toggleSelection(type) {
      let selected = this.get("selectedTypes");
      if (selected.includes(type)) {
        selected.removeObject(type);
      } else {
        selected.addObject(type);
      }
    }
  }
});
