import Ember from "ember";
import dsv from "d3-dsv";
import csvData from "d3-slides/data/template-stats";
export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
    this.set('selectedModuleTypes', this.get('moduleTypes').slice())
  },
  data: Ember.computed(function() {
    return this.createData();
  }),
  filteredData: Ember.computed('data', 'selectedModuleTypes.[]', function() {
    let selected = this.get('selectedModuleTypes');
    return this.get('data').filter((d) => {
      return selected.includes(d.moduleType);
    });
  }),
  createData() {
    return dsv.csvParse(csvData, (
      { moduleName, moduleType, inputs, outputs, lineCount }
    ) =>
      {
        return {
          moduleName,
          moduleType,
          inputs: 0.1 + +inputs,
          outputs: 0.1 + +outputs,
          lineCount: +lineCount
        };
      });
  },
  moduleTypes: Ember.computed('data', function() {
    return this.get('data').mapBy('moduleType').uniq();
  }),
  selectedModuleTypes: null,
  moduleCheckboxes: Ember.computed('moduleTypes', 'selectedModuleTypes.[]', function() {
    let s = this.get('selectedModuleTypes');
    return this.get("moduleTypes").map((m) => {
      return {type: m, selected: s.includes(m)}
    })
  }),
  actions: {
    refreshData() {
      this.set("data", this.createData());
    },
    toggleSelection(type) {
      let selected = this.get('selectedModuleTypes');
      if (selected.includes(type)) {
        selected.removeObject(type);
      } else {
        selected.addObject(type);
      }
    }
  }
});
