import Ember from 'ember';
import selection from 'd3-selection';
import transition from 'd3-transition';
import { ParentMixin } from 'ember-composability-tools';

export default Ember.Component.extend(ParentMixin, {
  tagName: '',
  selector: '',
  data: [],
  createSelection() {
    let s = this.set(
      'selection',
      selection
        .select('svg')
        .selectAll(this.get('selector'))
        .data(this.get('data'), d => d.id)
    );
  },

  didInsertParent() {
    this._super(...arguments);
    this.createSelection();
  },

  didUpdateAttrs() {
    this.createSelection();
  }
});
