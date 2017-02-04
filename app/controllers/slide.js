import Ember from "ember";
import dsv from "d3-dsv";
import csvData from "d3-slides/data/liquid-recipes";
export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
    this.set("selectedTypes", this.get("types").slice());
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
